import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Truck } from "lucide-react";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty, StatusBadge } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { STATUS_LABEL, canTransition } from "@/lib/domain/order-status";
import { mockTracking } from "@/lib/integrations/shipping";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/pesanan/$id")({
  head: () => ({ meta: [{ title: "Detail Pesanan — Pasarku" }, { name: "description", content: "Detail, pelacakan, dan ulasan pesanan." }, { property: "og:title", content: "Detail Pesanan — Pasarku" }, { property: "og:description", content: "Lacak pesanan Anda." }] }),
  component: () => <SiteShell><RequireLogin><Detail /></RequireLogin></SiteShell>,
});

function Confirm({ label, title, onOk, variant = "outline" }: { label: string; title: string; onOk: () => void; variant?: "outline" | "default" | "destructive" }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant={variant}>{label}</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={onOk}>Ya, lanjutkan</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const o = useDB((d) => d.orders.find((x) => x.id === id && x.buyerId === d.currentUserId));
  const store = useDB((d) => d.stores.find((s) => s.id === o?.storeId));
  const reviews = useDB((d) => d.reviews.filter((r) => r.orderId === id));
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  if (!o) return <Empty title="Pesanan tidak ditemukan" />;
  const track = mockTracking(o.status, o.resi);
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <nav className="text-sm text-muted-foreground"><Link to="/pesanan" className="hover:text-primary">Pesanan</Link> / {o.id}</nav>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-5">
        <div><p className="text-sm text-muted-foreground">{store?.name}</p><h1 className="font-display text-xl font-bold">{o.id}</h1></div>
        <StatusBadge status={o.status} />
      </div>
      <section className="rounded-xl border bg-card p-5">
        <p className="mb-3 font-semibold">Riwayat Status</p>
        <ol className="space-y-2 border-l-2 border-primary/30 pl-4 text-sm">
          {o.history.map((h, i) => <li key={i}><span className="font-medium">{STATUS_LABEL[h.status]}</span> <span className="text-muted-foreground">· {new Date(h.at).toLocaleString("id-ID")}{h.note ? ` · ${h.note}` : ""}</span></li>)}
        </ol>
      </section>
      {o.resi && (
        <section className="rounded-xl border bg-card p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold"><Truck className="size-4 text-primary" />{o.shippingService} · Resi {o.resi}</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">{track.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      )}
      <section className="rounded-xl border bg-card p-5 text-sm">
        {o.items.map((i) => <div key={i.variantId} className="flex justify-between py-1"><span>{i.name} ({i.variantName}) ×{i.qty}</span><span>{formatRupiah(i.price * i.qty)}</span></div>)}
        <div className="mt-2 space-y-1 border-t pt-2 text-muted-foreground">
          <div className="flex justify-between"><span>Diskon</span><span>-{formatRupiah(o.discount)}</span></div>
          <div className="flex justify-between"><span>Ongkir</span><span>{formatRupiah(o.shipping)}</span></div>
          <div className="flex justify-between font-bold text-foreground"><span>Total toko ini</span><span>{formatRupiah(o.subtotal - o.discount + o.shipping)}</span></div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Dikirim ke: {o.addressText}</p>
      </section>
      <div className="flex flex-wrap gap-2">
        {o.status === "awaiting_payment" && <Button asChild><Link to="/bayar/$id" params={{ id: o.groupId }}>Bayar Sekarang</Link></Button>}
        {canTransition(o.status, "cancelled", "buyer") && <Confirm label="Batalkan Pesanan" title="Batalkan pesanan ini?" onOk={() => run(() => actions.updateOrderStatus(o.id, "cancelled", "buyer", { note: "Dibatalkan pembeli" }), "Pesanan dibatalkan")} />}
        {canTransition(o.status, "completed", "buyer") && <Confirm variant="default" label="Pesanan Diterima" title="Konfirmasi pesanan sudah diterima?" onOk={() => run(() => actions.updateOrderStatus(o.id, "completed", "buyer"), "Terima kasih!")} />}
        {canTransition(o.status, "return_requested", "buyer") && <Confirm label="Ajukan Pengembalian" title="Ajukan pengembalian dana?" onOk={() => run(() => actions.updateOrderStatus(o.id, "return_requested", "buyer", { note: "Barang tidak sesuai" }), "Pengajuan dikirim")} />}
      </div>
      {o.status === "completed" && (
        <section className="rounded-xl border bg-card p-5">
          <p className="font-semibold">Ulasan</p>
          {o.items.map((i) => {
            const r = reviews.find((x) => x.productId === i.productId);
            return r ? <p key={i.productId} className="mt-2 text-sm">{i.name}: <span className="text-warning">{"★".repeat(r.rating)}</span> {r.text}</p> : (
              <div key={i.productId} className="mt-3 space-y-2">
                <p className="text-sm">{i.name}</p>
                <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-warning" : "text-muted"}`} aria-label={`${n} bintang`}>★</button>)}</div>
                <Textarea placeholder="Ceritakan pengalamanmu" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} />
                <Button size="sm" onClick={() => { if (run(() => actions.addReview(o.id, i.productId, rating, text.trim()), "Ulasan terkirim")) setText(""); }}>Kirim Ulasan</Button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
