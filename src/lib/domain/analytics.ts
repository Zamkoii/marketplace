import type { Order } from "@/lib/data/types";
import { isPaid } from "./order-status";

const DAY = 86400000;

export function inRange(orders: Order[], from: number, to: number) {
  return orders.filter((o) => { const t = new Date(o.createdAt).getTime(); return t >= from && t < to; });
}

/** Revenue (paid, non-refunded product value) and order count bucketed by day/week/month. */
export function salesSeries(orders: Order[], from: number, to: number, bucket: "day" | "week" | "month") {
  const out = new Map<string, { label: string; omzet: number; pesanan: number }>();
  const keyOf = (t: number) => {
    const d = new Date(t);
    if (bucket === "month") return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    if (bucket === "week") { const w = new Date(t - ((d.getDay() + 6) % 7) * DAY); return "Mg " + w.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }); }
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  };
  for (let t = from; t < to; t += DAY) { const k = keyOf(t); if (!out.has(k)) out.set(k, { label: k, omzet: 0, pesanan: 0 }); }
  for (const o of inRange(orders, from, to)) {
    const k = keyOf(new Date(o.createdAt).getTime());
    const row = out.get(k); if (!row) continue;
    row.pesanan++;
    if (isPaid(o.status) && o.status !== "refunded") row.omzet += o.subtotal - o.discount;
  }
  return [...out.values()];
}

export function topProducts(orders: Order[], n = 5) {
  const m = new Map<string, { name: string; qty: number; omzet: number }>();
  for (const o of orders) {
    if (!isPaid(o.status) || o.status === "refunded") continue;
    for (const i of o.items) {
      const r = m.get(i.productId) ?? { name: i.name, qty: 0, omzet: 0 };
      r.qty += i.qty; r.omzet += i.price * i.qty; m.set(i.productId, r);
    }
  }
  return [...m.values()].sort((a, b) => b.omzet - a.omzet).slice(0, n);
}
