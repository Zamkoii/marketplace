import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { PageTitle, useMyStore } from "@/components/seller/SellerShell";
import { Empty, ProductArt } from "@/components/shop/ui-bits";
import { actions, effectivePrice, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/seller/produk/")({ component: Products });
const PER = 8;

function Products() {
  const store = useMyStore()!;
  const all = useDB((d) => d.products.filter((p) => p.storeId === store.id));
  const cats = useDB((d) => d.categories);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "out">("all");
  const [page, setPage] = useState(1);
  const stock = (p: (typeof all)[0]) => p.variants.reduce((a, v) => a + v.stock, 0);
  let list = all.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.variants.some((v) => v.sku.toLowerCase().includes(q.toLowerCase())));
  if (filter === "active") list = list.filter((p) => p.active);
  if (filter === "inactive") list = list.filter((p) => !p.active);
  if (filter === "out") list = list.filter((p) => stock(p) === 0);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const shown = list.slice((page - 1) * PER, page * PER);
  return (
    <div>
      <PageTitle title="Produk Saya"><Button asChild><Link to="/seller/produk/baru">+ Tambah Produk</Link></Button></PageTitle>
      <div className="mb-3 flex flex-wrap gap-2">
        <Input placeholder="Cari nama atau SKU" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="max-w-xs bg-card" />
        {(["all", "active", "inactive", "out"] as const).map((f) => <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => { setFilter(f); setPage(1); }}>{{ all: "Semua", active: "Aktif", inactive: "Nonaktif", out: "Habis" }[f]}</Button>)}
      </div>
      {shown.length === 0 ? <Empty title="Tidak ada produk" /> : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">Produk</th><th>SKU</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Terjual</th><th>Dibuat</th><th>Aktif</th><th className="text-right pr-3">Aksi</th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="flex items-center gap-3 p-3"><ProductArt product={p} className="size-10 shrink-0 rounded" /><span className="line-clamp-2 max-w-56">{p.name}</span></td>
                  <td className="text-xs">{p.variants[0]?.sku}{p.variants.length > 1 && ` +${p.variants.length - 1}`}</td>
                  <td>{cats.find((c) => c.id === p.categoryId)?.name}</td>
                  <td>{formatRupiah(effectivePrice(p))}</td>
                  <td className={stock(p) === 0 ? "text-destructive font-semibold" : stock(p) <= 10 ? "text-warning font-semibold" : ""}>{stock(p)}</td>
                  <td>{p.sold}</td>
                  <td className="text-xs">{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                  <td><Switch checked={p.active} onCheckedChange={() => run(() => actions.toggleProduct(p.id))} aria-label="Aktif" /></td>
                  <td className="pr-3 text-right">
                    <Button asChild variant="ghost" size="icon"><Link to="/produk/$id" params={{ id: p.id }} aria-label="Lihat"><Eye /></Link></Button>
                    <Button asChild variant="ghost" size="icon"><Link to="/seller/produk/$id" params={{ id: p.id }} aria-label="Edit"><Pencil /></Link></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Hapus"><Trash2 className="text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus “{p.name}”?</AlertDialogTitle><AlertDialogDescription>Produk akan dihapus permanen dari toko.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => run(() => actions.deleteProduct(p.id), "Produk dihapus")}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground"><span>{list.length} produk</span>
        <div className="flex gap-1">{Array.from({ length: pages }, (_, i) => <Button key={i} size="sm" variant={page === i + 1 ? "default" : "outline"} onClick={() => setPage(i + 1)}>{i + 1}</Button>)}</div>
      </div>
    </div>
  );
}
