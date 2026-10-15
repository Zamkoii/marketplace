export type OrderStatus =
  | "awaiting_payment"
  | "to_process"
  | "packing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "return_requested"
  | "refunded";

export type Actor = "buyer" | "seller" | "admin" | "system";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: "Menunggu Pembayaran",
  to_process: "Perlu Diproses",
  packing: "Sedang Dikemas",
  shipped: "Dalam Pengiriman",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  return_requested: "Pengembalian Diajukan",
  refunded: "Dana Dikembalikan",
};

const RULES: Record<OrderStatus, Partial<Record<OrderStatus, Actor[]>>> = {
  awaiting_payment: { to_process: ["system"], cancelled: ["buyer", "system", "admin"] },
  to_process: { packing: ["seller"], cancelled: ["buyer", "seller", "admin"] },
  packing: { shipped: ["seller"], cancelled: ["seller", "admin"] },
  shipped: { delivered: ["system", "seller", "admin"] },
  delivered: { completed: ["buyer", "system"], return_requested: ["buyer"] },
  return_requested: { refunded: ["seller", "admin"], completed: ["admin"] },
  completed: {},
  cancelled: {},
  refunded: {},
};

export function canTransition(from: OrderStatus, to: OrderStatus, actor: Actor): boolean {
  return RULES[from][to]?.includes(actor) ?? false;
}

export function nextActions(from: OrderStatus, actor: Actor): OrderStatus[] {
  return (Object.keys(RULES[from]) as OrderStatus[]).filter((to) => canTransition(from, to, actor));
}

/** Orders whose money was actually captured by the payment gateway. */
export function isPaid(s: OrderStatus) {
  return s !== "awaiting_payment" && s !== "cancelled";
}
