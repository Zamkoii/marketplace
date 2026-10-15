import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SiteShell } from "@/components/shop/SiteShell";
import { Empty, ProductCard } from "@/components/shop/ui-bits";
import { useDB, effectivePrice } from "@/lib/data/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const schema = z.object({
  q: z.string().optional(),
  kategori: z.string().optional(),
  toko: z.string().optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  sort: z.enum(["relevan", "populer", "terbaru", "termurah", "termahal"]).optional(),
  page: z.coerce.number().optional(),
});

export const Route = createFileRoute("/cari")({
  validateSearch: schema,
  head: () => ({ meta: [{ title: "Cari Produk — Pasarku" }, { name: "description", content: "Cari dan filter produk dari semua toko di Pasarku." }, { property: "og:title", content: "Cari Produk — Pasarku" }, { property: "og:description", content: "Filter berdasarkan kategori, harga, rating, dan toko." }] }),
  component: SearchPage,
});

const PER = 12;

function SearchPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/cari" });
  const cats = useDB((d) => d.categories);
  const stores = useDB((d) => d.stores.filter((x) => x.status === "active"));
  const all = useDB((d) => d.products);
  const [min, setMin] = useState(s.min?.toString() ?? "");
  const [max, setMax] = useState(s.max?.toString() ?? "");
  const cat = cats.find((c) => c.slug === s.kategori);
  const activeStoreIds = new Set(stores.map((x) => x.id));

  let list = all.filter((p) => p.active && activeStoreIds.has(p.storeId));
  if (s.q) { const q = s.q.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)); }
  if (cat) list = list.filter((p) => p.categoryId === cat.id);
  if (s.toko) list = list.filter((p) => p.storeId === s.toko);
  if (s.min) list = list.filter((p) => effectivePrice(p) >= s.min!);
  if (s.max) list = list.filter((p) => effectivePrice(p) <= s.max!);
  if (s.rating) list = list.filter((p) => p.rating >= s.rating!);
  const sorters: Record<string, (a: typeof list[0], b: typeof list[0]) => number> = {
    populer: (a, b) => b.sold - a.sold,
    terbaru: (a, b) => b.createdAt.localeCompare(a.createdAt),
    termurah: (a, b) => effectivePrice(a) - effectivePrice(b),
    termahal: (a, b) => effectivePrice(b) - effectivePrice(a),
  };
  if (s.sort && sorters[s.sort]) list = [...list].sort(sorters[s.sort]);
  const page = s.page ?? 1;
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const shown = list.slice((page - 1) * PER, page * PER);
  const set = (patch: Partial<z.infer<typeof schema>>) => navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) });

  return (
    <SiteShell>
      <nav className="mb-4 text-sm text-muted-foreground"><Link to="/" className="hover:text-primary">Beranda</Link> / {cat ? cat.name : "Pencarian"}</nav>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="space-y-5 rounded-xl border bg-card p-4 text-sm md:self-start">
          <div>
            <p className="mb-2 font-semibold">Kategori</p>
            <button onClick={() => set({ kategori: undefined })} className={`block py-1 ${!cat ? "font-semibold text-primary" : ""}`}>Semua</button>
            {cats.map((c) => <button key={c.id} onClick={() => set({ kategori: c.slug })} className={`block py-1 text-left ${cat?.id === c.id ? "font-semibold text-primary" : ""}`}>{c.name}</button>)}
          </div>
          <div>
            <p className="mb-2 font-semibold">Harga</p>
            <div className="flex gap-2"><Input placeholder="Min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} /><Input placeholder="Maks" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} /></div>
            <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => set({ min: min ? Number(min) : undefined, max: max ? Number(max) : undefined })}>Terapkan</Button>
          </div>
          <div>
            <p className="mb-2 font-semibold">Rating</p>
            {[4, 3].map((r) => <button key={r} onClick={() => set({ rating: s.rating === r ? undefined : r })} className={`block py-1 ${s.rating === r ? "font-semibold text-primary" : ""}`}>★ {r} ke atas</button>)}
          </div>
          <div>
            <p className="mb-2 font-semibold">Toko</p>
            <select className="w-full rounded-md border bg-card p-2" value={s.toko ?? ""} onChange={(e) => set({ toko: e.target.value || undefined })}>
              <option value="">Semua toko</option>
              {stores.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
        </aside>
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{s.q ? <>Hasil untuk “<b className="text-foreground">{s.q}</b>” · </> : null}{list.length} produk</p>
            <div className="flex flex-wrap gap-1">
              {(["populer", "terbaru", "termurah", "termahal"] as const).map((k) => (
                <Button key={k} size="sm" variant={s.sort === k ? "default" : "outline"} onClick={() => set({ sort: k })} className="capitalize">{k}</Button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? <Empty title="Produk tidak ditemukan">Coba kata kunci atau filter lain.</Empty> : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}
          {pages > 1 && (
            <div className="mt-6 flex justify-center gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Button key={n} size="sm" variant={n === page ? "default" : "outline"} onClick={() => navigate({ search: (prev) => ({ ...prev, page: n }) })}>{n}</Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
