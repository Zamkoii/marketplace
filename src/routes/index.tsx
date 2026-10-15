import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, BadgeCheck, Truck, ShieldCheck } from "lucide-react";
import hero from "@/assets/hero-banner.jpg";
import { SiteShell } from "@/components/shop/SiteShell";
import { CategoryIcon, ProductCard } from "@/components/shop/ui-bits";
import { useDB } from "@/lib/data/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pasarku — Belanja Produk Lokal dari Banyak Toko" },
      { name: "description", content: "Temukan batik, kopi, gadget, dan produk UMKM. Satu checkout untuk banyak toko." },
      { property: "og:title", content: "Pasarku — Belanja Produk Lokal" },
      { property: "og:description", content: "Satu checkout untuk banyak toko lokal Indonesia." },
    ],
  }),
  component: Home,
});

function Section({ title, link, children }: { title: string; link?: { search: Record<string, string> }; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        {link && <Link to="/cari" search={link.search} className="text-sm font-medium text-primary">Lihat semua →</Link>}
      </div>
      {children}
    </section>
  );
}

function Home() {
  const products = useDB((d) => d.products.filter((p) => p.active && d.stores.find((s) => s.id === p.storeId)?.status === "active"));
  const cats = useDB((d) => d.categories);
  const stores = useDB((d) => d.stores.filter((s) => s.featured && s.status === "active"));
  const flashOn = useDB((d) => d.settings.flashSaleEnabled);
  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 6);
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const recommended = [...products].sort((a, b) => b.rating - a.rating).slice(0, 12);
  const flash = products.filter((p) => p.flashSale);

  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-2xl bg-secondary">
        <img src={hero} alt="Aneka produk lokal: batik, kopi, sepatu, dan skincare" width={1600} height={640} className="h-56 w-full object-cover object-right sm:h-80" />
        <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-foreground">Bangga buatan lokal</p>
          <h1 className="mt-2 max-w-md font-display text-3xl font-extrabold leading-tight sm:text-5xl">Belanja dari banyak toko, bayar sekali.</h1>
          <div className="mt-5 flex gap-2">
            <Button asChild size="lg"><Link to="/cari">Mulai Belanja</Link></Button>
            <Button asChild size="lg" variant="outline" className="hidden sm:inline-flex"><Link to="/buka-toko">Buka Toko</Link></Button>
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[[BadgeCheck, "Toko terverifikasi"], [ShieldCheck, "Dana aman sampai diterima"], [Truck, "Lacak pengiriman"], [Zap, "Checkout multi-toko"]].map(([I, t]) => {
          const Icon = I as typeof Zap;
          return <div key={t as string} className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5"><Icon className="size-4 text-primary" />{t as string}</div>;
        })}
      </div>

      <Section title="Kategori Populer">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {cats.map((c) => (
            <Link key={c.id} to="/cari" search={{ kategori: c.slug }} className="flex flex-col items-center gap-2 rounded-xl p-2 text-center text-xs hover:bg-card">
              <span className={`art art-${c.art} grid size-14 place-items-center rounded-2xl`}><CategoryIcon name={c.icon} className="size-6" /></span>
              {c.name}
            </Link>
          ))}
        </div>
      </Section>

      {flashOn && flash.length > 0 && (
        <section className="mt-10 rounded-2xl bg-hero p-5 text-primary-foreground">
          <div className="mb-4 flex items-center gap-2"><Zap className="size-6 fill-current" /><h2 className="font-display text-2xl font-extrabold">Flash Sale</h2></div>
          <div className="grid grid-cols-2 gap-3 text-foreground sm:grid-cols-3 lg:grid-cols-6">{flash.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      <Section title="Terlaris" link={{ search: { sort: "populer" } }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{best.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </Section>

      <Section title="Toko Unggulan">
        <div className="grid gap-3 sm:grid-cols-3">
          {stores.map((s) => (
            <Link key={s.id} to="/toko/$slug" params={{ slug: s.slug }} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card hover:border-primary/40">
              <span className="grid size-14 place-items-center rounded-full bg-primary-soft font-display text-xl font-bold text-accent-foreground">{s.name[0]}</span>
              <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.city} · ★ {s.rating}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{s.description}</p></div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Produk Terbaru" link={{ search: { sort: "terbaru" } }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{newest.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </Section>

      <Section title="Rekomendasi Untukmu">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{recommended.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </Section>
    </SiteShell>
  );
}
