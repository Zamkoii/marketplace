import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty, ProductCard } from "@/components/shop/ui-bits";
import { useDB } from "@/lib/data/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Pasarku" }, { name: "description", content: "Produk favorit dan toko yang Anda ikuti." }, { property: "og:title", content: "Wishlist — Pasarku" }, { property: "og:description", content: "Produk favorit Anda." }] }),
  component: () => <SiteShell><RequireLogin><Wish /></RequireLogin></SiteShell>,
});

function Wish() {
  const ids = useDB((d) => d.wishlist[d.currentUserId!] ?? []);
  const products = useDB((d) => d.products.filter((p) => ids.includes(p.id)));
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">Wishlist</h1>
      {products.length === 0 ? <Empty icon={Heart} title="Belum ada produk favorit">Tekan ikon hati di halaman produk.</Empty> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  );
}
