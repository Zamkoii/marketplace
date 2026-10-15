import type { Rupiah } from "./money";
import { isPaid, type OrderStatus } from "./order-status";

export interface FinanceOrder {
  status: OrderStatus;
  subtotal: Rupiah;
  discount: Rupiah;
  commission: Rupiah;
}
export interface FinancePayout {
  amount: Rupiah;
  status: "requested" | "approved" | "paid" | "rejected";
}

export interface StoreFinance {
  gross: Rupiah; // omzet: nilai produk dari pesanan terbayar
  commission: Rupiah;
  refunds: Rupiah;
  net: Rupiah; // pendapatan bersih (tidak termasuk refund)
  held: Rupiah; // saldo tertahan: pesanan terbayar yang belum selesai
  released: Rupiah; // dari pesanan selesai
  payoutsPending: Rupiah;
  payoutsPaid: Rupiah;
  available: Rupiah; // dapat dicairkan
}

export function computeStoreFinance(orders: FinanceOrder[], payouts: FinancePayout[]): StoreFinance {
  let gross = 0, commission = 0, refunds = 0, held = 0, released = 0;
  for (const o of orders) {
    if (!isPaid(o.status)) continue;
    const value = o.subtotal - o.discount;
    if (o.status === "refunded") {
      refunds += value;
      continue;
    }
    gross += value;
    commission += o.commission;
    const net = value - o.commission;
    if (o.status === "completed") released += net;
    else held += net;
  }
  const payoutsPending = payouts.filter((p) => p.status === "requested" || p.status === "approved").reduce((a, p) => a + p.amount, 0);
  const payoutsPaid = payouts.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
  return {
    gross, commission, refunds, net: gross - commission, held, released,
    payoutsPending, payoutsPaid,
    available: Math.max(0, released - payoutsPending - payoutsPaid),
  };
}

export function validatePayout(amount: Rupiah, available: Rupiah, min = 50000): string | null {
  if (!Number.isInteger(amount) || amount <= 0) return "Nominal tidak valid";
  if (amount < min) return `Minimal pencairan Rp${min.toLocaleString("id-ID")}`;
  if (amount > available) return "Nominal melebihi saldo yang dapat dicairkan";
  return null;
}
