import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty, ProductArt } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { quoteCheckout } from "@/lib/domain/pricing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/keranjang")({
  head: () => ({ meta: [{ title: "Keranjang — Pasarku" }, { name: "description", content: "Keranjang belanja multi-toko Anda." }, { property: "og:title", content: "Keranjang — Pasarku" }, { property: "og:description", content: "Keranjang belanja multi-toko." }] }),
  component: () => <SiteShell><RequireLogin><Cart /></RequireLogin></SiteShell>,
});

function Cart() {
  const navigate = useNavigate();
  const lines = useDB((d) => d.carts[d.currentUserId!] ?? []);
  const products = useDB((d) => d.products);
  const stores = useDB((d) => d.stores);
  const fee = useDB((d) => d.settings.serviceFee);
  if (!lines.length) return <Empty icon={ShoppingCart} title="Keranjang masih kosong"><Button asChild className="mt-3"><Link to="/cari">Mulai belanja</Link></Button></Empty>;

  const rows = lines.map((l) => { const p = products.find((x) => x.id === l.productId)!; return { l, p, v: p.variants.find((v) => v.id === l.variantId)! }; }).filter((r) => r.p && r.v);
  const byStore = [...new Set(rows.map((r) => r.p.storeId))];
  const sel = rows.filter((r) => r.l.selected);
  const q = quoteCheckout({ lines: sel.map((r) => ({ storeId: r.p.storeId, unitPrice: r.v.price, qty: r.l.qty })), shippingByStore: {}, storeDiscountBps: Object.fromEntries(stores.map((s) => [s.id, s.voucherBps])), serviceFee: fee });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">Keranjang</h1>
        {byStore.map((sid) => {
          const st = stores.find((s) => s.id === sid)!;
          return (
            <div key={sid} className="rounded-xl border bg-card">
              <p className="border-b px-4 py-3 font-semibold">{st.name} <span className="text-xs font-normal text-muted-foreground">· {st.city}</span></p>
              {rows.filter((r) => r.p.storeId === sid).map(({ l, p, v }) => (
                <div key={v.id} className="flex items-center gap-3 border-b p-4 last:border-0">
                  <Checkbox checked={l.selected} onCheckedChange={(c) => run(() => actions.toggleCartLine(v.id, !!c))} aria-label="Pilih" />
                  <ProductArt product={p} className="size-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <Link to="/produk/$id" params={{ id: p.id }} className="line-clamp-1 text-sm font-medium">{p.name}</Link>
                    <p className="text-xs text-muted-foreground">{v.name} · stok {v.stock}</p>
                    <p className="text-sm font-semibold text-primary">{formatRupiah(v.price)}</p>
                  </div>
                  <div className="flex items-center rounded-lg border">
                    <button className="p-1.5" onClick={() => run(() => actions.setCartQty(v.id, l.qty - 1))} aria-label="Kurangi"><Minus className="size-3" /></button>
                    <span className="w-8 text-center text-sm">{l.qty}</span>
                    <button className="p-1.5" onClick={() => run(() => actions.setCartQty(v.id, l.qty + 1))} aria-label="Tambah"><Plus className="size-3" /></button>
                  </div>
                  <button onClick={() => run(() => actions.removeCartLine(v.id))} aria-label="Hapus" className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <aside className="h-fit space-y-2 rounded-xl border bg-card p-5 text-sm lg:sticky lg:top-36">
        <p className="font-display text-lg font-bold">Ringkasan</p>
        <div className="flex justify-between"><span>Subtotal ({sel.length} produk)</span><span>{formatRupiah(q.subtotal)}</span></div>
        <div className="flex justify-between text-success"><span>Voucher toko</span><span>-{formatRupiah(q.discount)}</span></div>
        <div className="flex justify-between"><span>Biaya layanan</span><span>{formatRupiah(q.serviceFee)}</span></div>
        <p className="text-xs text-muted-foreground">Ongkir dihitung saat checkout.</p>
        <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="text-primary">{formatRupiah(q.total)}</span></div>
        <Button className="w-full" size="lg" disabled={!sel.length} onClick={() => navigate({ to: "/checkout" })}>Checkout</Button>
      </aside>
    </div>
  );
}
