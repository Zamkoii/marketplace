import { describe, expect, it } from "vitest";
import { quoteCheckout, commissionFor } from "./pricing";
import { canTransition } from "./order-status";
import { computeStoreFinance, validatePayout } from "./finance";
import { percentOf } from "./money";

describe("commission", () => {
  it("5% of Rp100.000 is Rp5.000", () => {
    expect(commissionFor(100000, 0, 500)).toBe(5000);
  });
  it("is charged after store discount", () => {
    expect(commissionFor(100000, 10000, 500)).toBe(4500);
  });
  it("rounds to whole rupiah", () => {
    expect(percentOf(333, 500)).toBe(17);
  });
});

describe("multi-store checkout", () => {
  it("splits per store and sums totals", () => {
    const q = quoteCheckout({
      lines: [
        { storeId: "A", unitPrice: 50000, qty: 2 },
        { storeId: "B", unitPrice: 30000, qty: 1 },
      ],
      shippingByStore: { A: 10000, B: 9000 },
      storeDiscountBps: { A: 1000 },
      serviceFee: 1000,
    });
    expect(q.stores).toHaveLength(2);
    expect(q.stores[0]).toMatchObject({ subtotal: 100000, discount: 10000, total: 100000 });
    expect(q.total).toBe(100000 + 39000 + 1000);
  });
  it("rejects invalid quantity", () => {
    expect(() => quoteCheckout({ lines: [{ storeId: "A", unitPrice: 1, qty: 0 }], shippingByStore: {}, serviceFee: 0 })).toThrow();
  });
});

describe("order status rules", () => {
  it("seller cannot skip packing", () => {
    expect(canTransition("to_process", "shipped", "seller")).toBe(false);
  });
  it("buyer cannot mark as paid", () => {
    expect(canTransition("awaiting_payment", "to_process", "buyer")).toBe(false);
  });
  it("buyer completes delivered order", () => {
    expect(canTransition("delivered", "completed", "buyer")).toBe(true);
  });
  it("shipped order cannot be cancelled", () => {
    expect(canTransition("shipped", "cancelled", "buyer")).toBe(false);
  });
});

describe("seller balance", () => {
  const orders = [
    { status: "completed" as const, subtotal: 100000, discount: 0, commission: 5000 },
    { status: "shipped" as const, subtotal: 200000, discount: 0, commission: 10000 },
    { status: "awaiting_payment" as const, subtotal: 999999, discount: 0, commission: 0 },
    { status: "refunded" as const, subtotal: 50000, discount: 0, commission: 2500 },
  ];
  it("separates held and available", () => {
    const f = computeStoreFinance(orders, [{ amount: 20000, status: "paid" }]);
    expect(f.gross).toBe(300000);
    expect(f.held).toBe(190000);
    expect(f.released).toBe(95000);
    expect(f.available).toBe(75000);
    expect(f.refunds).toBe(50000);
  });
  it("payout cannot exceed available", () => {
    expect(validatePayout(80000, 75000)).not.toBeNull();
    expect(validatePayout(60000, 75000)).toBeNull();
  });
});
