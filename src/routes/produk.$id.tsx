import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, Star, Store as StoreIcon } from "lucide-react";
import { SiteShell } from "@/components/shop/SiteShell";
import { Empty, ProductArt, ProductCard } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { Button } from "@/components/ui/button";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/produk/$id")({
  head: () => ({ meta: [{ title: "Detail Produk — Pasarku" }, { name: "description", content: "Foto, variasi, stok, dan ulasan produk di Pasarku." }, { property: "og:title", content: "Detail Produk — Pasarku" }, { property: "og:description", content: "Lihat detail produk dan ulasan pembeli." }] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const product = useDB((d) => d.products.find((p) => p.id === id));
  const store = useDB((d) => d.stores.find((s) => s.id === product?.storeId));
  const cat = useDB((d) => d.categories.find((c) => c.id === product?.categoryId));
  const reviews = useDB((d) => d.reviews.filter((r) => r.productId === id));
  const related = useDB((d) => d.products.filter((p) => p.categoryId === product?.categoryId && p.id !== id && p.active).slice(0, 6));
  const uid = useDB((d) => d.currentUserId);
  const wished = useDB((d) => (d.currentUserId ? !!d.wishlist[d.currentUserId]?.includes(id) : false));
  const [vid, setVid] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  if (!product || !store) return <SiteShell><Empty title="Produk tidak ditemukan" /></SiteShell>;
  const variant = product.variants.find((v) => v.id === vid) ?? product.variants.find((v) => v.stock > 0) ?? product.variants[0]!;
  const off = product.discountPrice ? Math.round((1 - product.discountPrice / product.basePrice) * 100) : 0;
  const unavailable = !product.active || store.status !== "active";

  const add = (buy: boolean) => {
    if (!uid) { navigate({ to: "/masuk" }); return; }
    if (run(() => actions.addToCart(product.id, variant.id, qty), buy ? undefined : "Ditambahkan ke keranjang") && buy) navigate({ to: "/keranjang" });
  };

  return (
    <SiteShell>
      <nav className="mb-4 text-sm text-muted-foreground"><Link to="/" className="hover:text-primary">Beranda</Link> / <Link to="/cari" search={{ kategori: cat?.slug }} className="hover:text-primary">{cat?.name}</Link> / <span className="text-foreground">{product.name}</span></nav>
      <div className="grid gap-8 rounded-2xl border bg-card p-4 sm:p-6 md:grid-cols-2">
        <div className="space-y-3">
          <ProductArt product={product} big className="aspect-square rounded-xl" />
          <div className="grid grid-cols-4 gap-2">{product.variants.slice(0, 4).map((v) => <ProductArt key={v.id} product={product} className="aspect-square rounded-lg opacity-70" />)}</div>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Star className="size-4 fill-warning text-warning" />{product.rating || "Belum ada rating"} · {product.reviewCount} ulasan · {product.sold} terjual</p>
          <div className="mt-4 rounded-xl bg-primary-soft p-4">
            <span className="font-display text-3xl font-extrabold text-primary">{formatRupiah(variant.price)}</span>
            {off > 0 && <><span className="ml-3 text-muted-foreground line-through">{formatRupiah(product.basePrice)}</span><span className="ml-2 rounded bg-primary px-1.5 text-xs font-bold text-primary-foreground">-{off}%</span></>}
          </div>
          {store.voucherBps > 0 && <p className="mt-2 text-sm text-accent-foreground">Voucher toko: diskon {store.voucherBps / 100}% otomatis saat checkout</p>}
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Variasi</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button key={v.id} disabled={v.stock === 0} onClick={() => { setVid(v.id); setQty(1); }} className={`rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 ${v.id === variant.id ? "border-primary bg-primary-soft text-accent-foreground" : ""}`}>
                  {v.name}{v.stock === 0 && " (habis)"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <p className="text-sm font-semibold">Jumlah</p>
            <div className="flex items-center rounded-lg border">
              <button className="p-2" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Kurangi"><Minus className="size-4" /></button>
              <span className="w-10 text-center">{qty}</span>
              <button className="p-2" onClick={() => setQty(Math.min(variant.stock, qty + 1))} aria-label="Tambah"><Plus className="size-4" /></button>
            </div>
            <span className="text-sm text-muted-foreground">Stok {variant.stock} · SKU {variant.sku}</span>
          </div>
          {unavailable ? <p className="mt-6 rounded-lg bg-muted p-3 text-sm">Produk sedang tidak tersedia.</p> : (
            <div className="mt-6 flex gap-2">
              <Button size="lg" variant="outline" className="flex-1 border-primary text-primary" disabled={variant.stock === 0} onClick={() => add(false)}>Masukkan Keranjang</Button>
              <Button size="lg" className="flex-1" disabled={variant.stock === 0} onClick={() => add(true)}>Beli Sekarang</Button>
              <Button size="lg" variant="outline" aria-label="Wishlist" onClick={() => (uid ? run(() => actions.toggleWishlist(product.id)) : navigate({ to: "/masuk" }))}>
                <Heart className={wished ? "fill-primary text-primary" : ""} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Link to="/toko/$slug" params={{ slug: store.slug }} className="mt-4 flex items-center gap-4 rounded-2xl border bg-card p-4 hover:border-primary/40">
        <span className="grid size-12 place-items-center rounded-full bg-primary-soft font-display font-bold text-accent-foreground">{store.name[0]}</span>
        <div className="flex-1"><p className="font-semibold">{store.name}</p><p className="text-xs text-muted-foreground">{store.city} · ★ {store.rating}</p></div>
        <span className="flex items-center gap-1 text-sm text-primary"><StoreIcon className="size-4" />Kunjungi toko</span>
      </Link>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border bg-card p-5"><h2 className="font-display text-lg font-bold">Deskripsi</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{product.description}</p></section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Ulasan ({reviews.length})</h2>
          {reviews.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Belum ada ulasan.</p> : (
            <ul className="mt-3 max-h-96 space-y-3 overflow-auto">
              {reviews.map((r) => (
                <li key={r.id} className="border-b pb-3 text-sm last:border-0">
                  <p className="font-medium">{r.userName} <span className="text-warning">{"★".repeat(r.rating)}</span></p>
                  <p className="text-muted-foreground">{r.text}</p>
                  {r.reply && <p className="mt-1 rounded bg-muted p-2 text-xs">Balasan penjual: {r.reply}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-8"><h2 className="mb-4 font-display text-xl font-bold">Produk Serupa</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      )}
    </SiteShell>
  );
}
