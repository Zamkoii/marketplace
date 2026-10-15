import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty, ProductArt } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { quoteCheckout } from "@/lib/domain/pricing";
import { quoteShipping } from "@/lib/integrations/shipping";
import { PAYMENT_METHODS } from "@/lib/integrations/payment";
import { Button } from "@/components/ui/button";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Pasarku" }, { name: "description", content: "Selesaikan pesanan dari beberapa toko sekaligus." }, { property: "og:title", content: "Checkout — Pasarku" }, { property: "og:description", content: "Checkout multi-toko." }] }),
  component: () => <SiteShell><RequireLogin><Checkout /></RequireLogin></SiteShell>,
});

function Checkout() {
  const navigate = useNavigate();
  const uid = useDB((d) => d.currentUserId!);
  const lines = useDB((d) => (d.carts[uid] ?? []).filter((l) => l.selected));
  const products = useDB((d) => d.products);
  const stores = useDB((d) => d.stores);
  const addresses = useDB((d) => d.addresses.filter((a) => a.userId === uid));
  const fee = useDB((d) => d.settings.serviceFee);
  const [addrId, setAddrId] = useState<string | undefined>(undefined);
  const [ship, setShip] = useState<Record<string, string>>({});
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);

  if (!lines.length) return <Empty title="Tidak ada produk dipilih"><Link to="/keranjang" className="text-primary">Kembali ke keranjang</Link></Empty>;
  const addr = addresses.find((a) => a.id === addrId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const rows = lines.map((l) => { const p = products.find((x) => x.id === l.productId)!; return { l, p, v: p.variants.find((v) => v.id === l.variantId)! }; });
  const storeIds = [...new Set(rows.map((r) => r.p.storeId))];
  const opts = Object.fromEntries(storeIds.map((sid) => [sid, quoteShipping(stores.find((s) => s.id === sid)!.city, addr?.city ?? "")]));
  const shipChoice = (sid: string) => ship[sid] ?? "reg";
  const q = quoteCheckout({
    lines: rows.map((r) => ({ storeId: r.p.storeId, unitPrice: r.v.price, qty: r.l.qty })),
    shippingByStore: Object.fromEntries(storeIds.map((sid) => [sid, opts[sid].find((o) => o.id === shipChoice(sid))!.price])),
    storeDiscountBps: Object.fromEntries(stores.map((s) => [s.id, s.voucherBps])),
    serviceFee: fee,
  });

  const place = () => {
    let gid = "";
    if (run(() => { gid = actions.placeOrder({ addressId: addr!.id, method, shippingByStore: Object.fromEntries(storeIds.map((s) => [s, shipChoice(s)])) }); }, "Pesanan dibuat")) {
      navigate({ to: "/bayar/$id", params: { id: gid } });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">Checkout</h1>
        <section className="rounded-xl border bg-card p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="size-4 text-primary" />Alamat Pengiriman</p>
          {addresses.length === 0 ? <p className="text-sm">Belum ada alamat. <Link to="/akun" className="text-primary">Tambah alamat</Link></p> : (
            <div className="grid gap-2 sm:grid-cols-2">
              {addresses.map((a) => (
                <button key={a.id} onClick={() => setAddrId(a.id)} className={`rounded-lg border p-3 text-left text-sm ${addr?.id === a.id ? "border-primary bg-primary-soft" : ""}`}>
                  <p className="font-semibold">{a.label} · {a.recipient}</p><p className="text-muted-foreground">{a.line}, {a.city} {a.postal}</p>
                </button>
              ))}
            </div>
          )}
        </section>
        {storeIds.map((sid) => {
          const st = stores.find((s) => s.id === sid)!;
          const sq = q.stores.find((x) => x.storeId === sid)!;
          return (
            <section key={sid} className="rounded-xl border bg-card">
              <p className="border-b px-4 py-3 font-semibold">{st.name}</p>
              {rows.filter((r) => r.p.storeId === sid).map(({ p, v, l }) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <ProductArt product={p} className="size-12 rounded-lg" />
                  <div className="flex-1"><p className="line-clamp-1">{p.name}</p><p className="text-xs text-muted-foreground">{v.name} × {l.qty}</p></div>
                  <span className="font-medium">{formatRupiah(v.price * l.qty)}</span>
                </div>
              ))}
              <div className="border-t p-4">
                <p className="mb-2 text-sm font-semibold">Pengiriman <span className="font-normal text-muted-foreground">(tarif simulasi, belum terhubung kurir)</span></p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {opts[sid].map((o) => (
                    <button key={o.id} onClick={() => setShip({ ...ship, [sid]: o.id })} className={`rounded-lg border p-2 text-left text-xs ${shipChoice(sid) === o.id ? "border-primary bg-primary-soft" : ""}`}>
                      <p className="font-semibold">{o.name}</p><p>{formatRupiah(o.price)} · {o.eta}</p>
                    </button>
                  ))}
                </div>
                {sq.discount > 0 && <p className="mt-2 text-xs text-success">Voucher toko -{formatRupiah(sq.discount)}</p>}
              </div>
            </section>
          );
        })}
        <section className="rounded-xl border bg-card p-4">
          <p className="mb-2 font-semibold">Metode Pembayaran</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => <button key={m} onClick={() => setMethod(m)} className={`rounded-lg border p-3 text-left text-sm ${method === m ? "border-primary bg-primary-soft" : ""}`}>{m}</button>)}
          </div>
        </section>
      </div>
      <aside className="h-fit space-y-2 rounded-xl border bg-card p-5 text-sm lg:sticky lg:top-36">
        <p className="font-display text-lg font-bold">Ringkasan Pembayaran</p>
        <Row k="Subtotal produk" v={formatRupiah(q.subtotal)} />
        <Row k="Ongkos kirim" v={formatRupiah(q.shipping)} />
        <Row k="Diskon voucher" v={`-${formatRupiah(q.discount)}`} />
        <Row k="Biaya layanan" v={formatRupiah(q.serviceFee)} />
        <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="text-primary">{formatRupiah(q.total)}</span></div>
        <p className="text-xs text-muted-foreground">Akan dibuat {storeIds.length} pesanan terpisah (satu per toko) dalam satu pembayaran.</p>
        <Button className="w-full" size="lg" disabled={!addr} onClick={place}>Buat Pesanan</Button>
      </aside>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>; }
