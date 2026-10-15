import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty, StatusBadge } from "@/components/shop/ui-bits";
import { useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import type { OrderStatus } from "@/lib/domain/order-status";

export const Route = createFileRoute("/pesanan/")({
  head: () => ({ meta: [{ title: "Pesanan Saya — Pasarku" }, { name: "description", content: "Riwayat dan status pesanan Anda." }, { property: "og:title", content: "Pesanan Saya — Pasarku" }, { property: "og:description", content: "Riwayat pesanan." }] }),
  component: () => <SiteShell><RequireLogin><Orders /></RequireLogin></SiteShell>,
});

const TABS: [string, OrderStatus[] | null][] = [
  ["Semua", null], ["Belum Bayar", ["awaiting_payment"]], ["Diproses", ["to_process", "packing"]], ["Dikirim", ["shipped", "delivered"]], ["Selesai", ["completed"]], ["Batal/Retur", ["cancelled", "return_requested", "refunded"]],
];

function Orders() {
  const [tab, setTab] = useState(0);
  const orders = useDB((d) => d.orders.filter((o) => o.buyerId === d.currentUserId));
  const stores = useDB((d) => d.stores);
  const f = TABS[tab][1];
  const list = f ? orders.filter((o) => f.includes(o.status)) : orders;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Pesanan Saya</h1>
      <div className="my-4 flex gap-1 overflow-x-auto">{TABS.map(([l], i) => <button key={l} onClick={() => setTab(i)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${tab === i ? "bg-primary text-primary-foreground" : "bg-card border"}`}>{l}</button>)}</div>
      {list.length === 0 ? <Empty icon={ReceiptText} title="Belum ada pesanan" /> : (
        <div className="space-y-3">
          {list.map((o) => (
            <Link key={o.id} to="/pesanan/$id" params={{ id: o.id }} className="block rounded-xl border bg-card p-4 hover:border-primary/40">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{stores.find((s) => s.id === o.storeId)?.name}</p><StatusBadge status={o.status} /></div>
              <p className="mt-2 text-sm">{o.items.map((i) => `${i.name} (${i.variantName}) ×${i.qty}`).join(", ")}</p>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{o.id} · {new Date(o.createdAt).toLocaleDateString("id-ID")}</span><span className="text-sm font-bold text-foreground">{formatRupiah(o.subtotal - o.discount + o.shipping)}</span></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
