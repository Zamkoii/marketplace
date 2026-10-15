import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/shop/SiteShell";
import { Empty, ProductCard } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/toko/$slug")({
  head: () => ({ meta: [{ title: "Toko — Pasarku" }, { name: "description", content: "Profil toko dan semua produknya di Pasarku." }, { property: "og:title", content: "Toko — Pasarku" }, { property: "og:description", content: "Lihat produk dan rating toko." }] }),
  component: StorePage,
});

function StorePage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const store = useDB((d) => d.stores.find((s) => s.slug === slug));
  const products = useDB((d) => d.products.filter((p) => p.storeId === store?.id && p.active));
  const following = useDB((d) => (d.currentUserId && store ? !!d.follows[d.currentUserId]?.includes(store.id) : false));
  const uid = useDB((d) => d.currentUserId);
  if (!store || store.status !== "active") return <SiteShell><Empty title="Toko tidak ditemukan atau belum aktif" /></SiteShell>;
  const sold = products.reduce((a, p) => a + p.sold, 0);
  return (
    <SiteShell>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="h-28 bg-hero" />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
          <span className="-mt-10 grid size-20 place-items-center rounded-2xl border-4 border-card bg-primary-soft font-display text-3xl font-extrabold text-accent-foreground">{store.name[0]}</span>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{store.name}</h1>
            <p className="text-sm text-muted-foreground">{store.city} · ★ {store.rating} · {products.length} produk · {sold} terjual</p>
          </div>
          <Button variant={following ? "outline" : "default"} onClick={() => (uid ? run(() => actions.toggleFollow(store.id)) : navigate({ to: "/masuk" }))}>{following ? "Mengikuti" : "+ Ikuti"}</Button>
        </div>
        <p className="px-6 pb-5 text-sm text-muted-foreground">{store.description}</p>
      </div>
      <h2 className="mb-4 mt-8 font-display text-xl font-bold">Semua Produk</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </SiteShell>
  );
}
