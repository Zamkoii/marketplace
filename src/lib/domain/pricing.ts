import { percentOf, type Rupiah } from "./money";

export interface PriceLine {
  storeId: string;
  unitPrice: Rupiah;
  qty: number;
}

export interface StoreQuote {
  storeId: string;
  subtotal: Rupiah;
  discount: Rupiah;
  shipping: Rupiah;
  total: Rupiah;
}

export interface CheckoutQuote {
  stores: StoreQuote[];
  subtotal: Rupiah;
  discount: Rupiah;
  shipping: Rupiah;
  serviceFee: Rupiah;
  total: Rupiah;
}

export interface QuoteInput {
  lines: PriceLine[];
  shippingByStore: Record<string, Rupiah>;
  /** store voucher in basis points per store, capped at the store subtotal */
  storeDiscountBps?: Record<string, number>;
  serviceFee: Rupiah;
}

export function quoteCheckout(input: QuoteInput): CheckoutQuote {
  const byStore = new Map<string, Rupiah>();
  for (const l of input.lines) {
    if (l.qty <= 0 || !Number.isInteger(l.qty)) throw new Error("Jumlah tidak valid");
    if (l.unitPrice < 0) throw new Error("Harga tidak valid");
    byStore.set(l.storeId, (byStore.get(l.storeId) ?? 0) + l.unitPrice * l.qty);
  }
  const stores: StoreQuote[] = [...byStore.entries()].map(([storeId, subtotal]) => {
    const discount = Math.min(subtotal, percentOf(subtotal, input.storeDiscountBps?.[storeId] ?? 0));
    const shipping = input.shippingByStore[storeId] ?? 0;
    return { storeId, subtotal, discount, shipping, total: subtotal - discount + shipping };
  });
  const sum = (k: keyof StoreQuote) => stores.reduce((a, s) => a + (s[k] as number), 0);
  const serviceFee = stores.length ? input.serviceFee : 0;
  return {
    stores,
    subtotal: sum("subtotal"),
    discount: sum("discount"),
    shipping: sum("shipping"),
    serviceFee,
    total: sum("total") + serviceFee,
  };
}

/** Commission is charged on the product value after store discount (shipping excluded). */
export function commissionFor(subtotal: Rupiah, discount: Rupiah, bps: number): Rupiah {
  return percentOf(subtotal - discount, bps);
}
