import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { Button } from "@/components/ui/button";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/bayar/$id")({
  head: () => ({ meta: [{ title: "Pembayaran — Pasarku" }, { name: "description", content: "Status pembayaran pesanan Anda." }, { property: "og:title", content: "Pembayaran — Pasarku" }, { property: "og:description", content: "Status pembayaran." }] }),
  component: () => <SiteShell><RequireLogin><Pay /></RequireLogin></SiteShell>,
});

function Pay() {
  const { id } = Route.useParams();
  const g = useDB((d) => d.groups.find((x) => x.id === id && x.buyerId === d.currentUserId));
  if (!g) return <Empty title="Transaksi tidak ditemukan" />;
  const st = g.payment.status;
  const hook = (r: "paid" | "failed" | "expired") => run(() => actions.paymentWebhook(g.id, `evt-${g.id}-${r}`, r), r === "paid" ? "Pembayaran berhasil" : undefined);
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="rounded-2xl border bg-card p-6 text-center">
        {st === "pending" && <Clock className="mx-auto size-12 text-warning" />}
        {st === "paid" && <CheckCircle2 className="mx-auto size-12 text-success" />}
        {(st === "failed" || st === "expired") && <XCircle className="mx-auto size-12 text-destructive" />}
        <h1 className="mt-3 font-display text-2xl font-bold">{{ pending: "Menunggu Pembayaran", paid: "Pembayaran Berhasil", failed: "Pembayaran Gagal", expired: "Pembayaran Kedaluwarsa" }[st]}</h1>
        <p className="mt-1 font-display text-3xl font-extrabold text-primary">{formatRupiah(g.total)}</p>
        <p className="mt-2 text-sm text-muted-foreground">{g.payment.method}</p>
        {st === "pending" && (
          <>
            <div className="mt-4 rounded-lg bg-muted p-3 font-mono text-lg tracking-widest">8808 {g.payment.ref.slice(-8)}</div>
            <p className="mt-2 text-xs text-muted-foreground">Bayar sebelum {new Date(g.payment.expiresAt).toLocaleString("id-ID")}</p>
          </>
        )}
      </div>
      {st === "pending" && (
        <div className="rounded-2xl border border-dashed bg-card p-5 text-sm">
          <p className="font-semibold">Simulator payment gateway</p>
          <p className="mt-1 text-muted-foreground">Belum terhubung ke Midtrans/Xendit. Tombol ini meniru notifikasi webhook dari gateway (diproses sekali per event).</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => hook("paid")}>Simulasikan Berhasil</Button>
            <Button variant="outline" onClick={() => hook("failed")}>Gagal</Button>
            <Button variant="outline" onClick={() => hook("expired")}>Kedaluwarsa</Button>
          </div>
        </div>
      )}
      <Button asChild variant="outline" className="w-full"><Link to="/pesanan">Lihat Pesanan Saya</Link></Button>
    </div>
  );
}
