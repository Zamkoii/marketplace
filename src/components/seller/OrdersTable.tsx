import { useState } from "react";
import { StatusBadge, Empty } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { STATUS_LABEL, nextActions, type OrderStatus } from "@/lib/domain/order-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { run } from "@/lib/use-action";
import type { Order } from "@/lib/data/types";

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = { packing: "Proses & Kemas", shipped: "Kirim (input resi)", delivered: "Tandai Terkirim", cancelled: "Tolak/Batalkan", refunded: "Setujui Refund" };

export function OrdersTable({ storeId, tabs }: { storeId?: string; tabs: [string, OrderStatus[] | null][] }) {
  const orders = useDB((d) => d.orders.filter((o) => !storeId || o.storeId === storeId));
  const users = useDB((d) => d.users);
  const stores = useDB((d) => d.stores);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [resiFor, setResiFor] = useState<Order | null>(null);
  const [resi, setResi] = useState("");
  const actor = storeId ? "seller" : "admin";
  const f = tabs[tab][1];
  const list = f ? orders.filter((o) => f.includes(o.status)) : orders;
  const PER = 10;
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const act = (o: Order, to: OrderStatus) => (to === "shipped" ? (setResiFor(o), setResi("")) : run(() => actions.updateOrderStatus(o.id, to, actor), `Status: ${STATUS_LABEL[to]}`));
  return (
    <div>
      <div className="mb-3 flex gap-1 overflow-x-auto">
        {tabs.map(([l, s], i) => <button key={l} onClick={() => { setTab(i); setPage(1); }} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${tab === i ? "bg-primary text-primary-foreground" : "border bg-card"}`}>{l} <span className="opacity-70">({s ? orders.filter((o) => s.includes(o.status)).length : orders.length})</span></button>)}
      </div>
      {list.length === 0 ? <Empty title="Tidak ada pesanan" /> : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">No. Pesanan</th><th>Tanggal</th>{!storeId && <th>Toko</th>}<th>Pembeli</th><th>Produk</th><th>Total</th><th>Pengiriman</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {list.slice((page - 1) * PER, page * PER).map((o) => (
                <tr key={o.id} className="border-t align-top">
                  <td className="p-3 font-mono text-xs">{o.id}</td>
                  <td className="py-3 text-xs">{new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</td>
                  {!storeId && <td className="py-3">{stores.find((s) => s.id === o.storeId)?.name}</td>}
                  <td className="py-3">{users.find((u) => u.id === o.buyerId)?.name}</td>
                  <td className="max-w-56 py-3">{o.items.map((i) => <p key={i.variantId} className="line-clamp-1">{i.name} · {i.variantName} ×{i.qty}</p>)}</td>
                  <td className="py-3 font-medium">{formatRupiah(o.subtotal - o.discount + o.shipping)}</td>
                  <td className="py-3 text-xs">{o.shippingService}{o.resi && <p className="font-mono">{o.resi}</p>}</td>
                  <td className="py-3"><StatusBadge status={o.status} /></td>
                  <td className="space-y-1 py-3 pr-3">{nextActions(o.status, actor).map((to) => <Button key={to} size="sm" variant={to === "cancelled" ? "outline" : "default"} className="w-full" onClick={() => act(o, to)}>{ACTION_LABEL[to] ?? STATUS_LABEL[to]}</Button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex justify-end gap-1">{Array.from({ length: pages }, (_, i) => <Button key={i} size="sm" variant={page === i + 1 ? "default" : "outline"} onClick={() => setPage(i + 1)}>{i + 1}</Button>)}</div>
      <Dialog open={!!resiFor} onOpenChange={(o) => !o && setResiFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Input nomor resi — {resiFor?.id}</DialogTitle></DialogHeader>
          <Input placeholder="Contoh: JNE1234567890" value={resi} onChange={(e) => setResi(e.target.value)} maxLength={40} />
          <DialogFooter><Button onClick={() => { if (resiFor && run(() => actions.updateOrderStatus(resiFor.id, "shipped", actor, { resi }), "Pesanan dikirim")) setResiFor(null); }}>Simpan & Kirim</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
