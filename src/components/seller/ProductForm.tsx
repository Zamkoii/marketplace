import { useNavigate } from "@tanstack/react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { actions, useDB } from "@/lib/data/store";
import type { Product } from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { run } from "@/lib/use-action";

const schema = z.object({
  name: z.string().trim().min(5, "Minimal 5 huruf").max(120),
  description: z.string().trim().min(10, "Minimal 10 huruf").max(3000),
  categoryId: z.string().min(1, "Pilih kategori"),
  basePrice: z.coerce.number().int("Bilangan bulat").min(1000, "Minimal Rp1.000"),
  discountPrice: z.union([z.literal(""), z.coerce.number().int().min(100)]).optional(),
  active: z.boolean(),
  variants: z.array(z.object({ id: z.string(), name: z.string().trim().min(1, "Wajib"), sku: z.string().trim().min(2, "Wajib").max(40), stock: z.coerce.number().int().min(0, "Tidak boleh negatif") })).min(1, "Minimal satu variasi"),
}).refine((v) => !v.discountPrice || v.discountPrice < v.basePrice, { path: ["discountPrice"], message: "Harus lebih kecil dari harga jual" });

type F = z.input<typeof schema>;

export function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate();
  const cats = useDB((d) => d.categories);
  const form = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? { ...product, discountPrice: product.discountPrice ?? "", variants: product.variants.map(({ id, name, sku, stock }) => ({ id, name, sku, stock })) }
      : { name: "", description: "", categoryId: "", basePrice: 0, discountPrice: "", active: true, variants: [{ id: `v${Date.now()}`, name: "Standar", sku: "", stock: 0 }] },
  });
  const vars = useFieldArray({ control: form.control, name: "variants" });
  const e = form.formState.errors;
  const submit = form.handleSubmit((raw) => {
    const v = schema.parse(raw);
    const ok = run(() => actions.saveProduct({
      id: product?.id, name: v.name, description: v.description, categoryId: v.categoryId, basePrice: v.basePrice,
      discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined, active: v.active, flashSale: product?.flashSale,
      variants: v.variants.map((x) => ({ ...x, price: 0 })),
    }), "Produk disimpan");
    if (ok) navigate({ to: "/seller/produk" });
  });
  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <div><Label>Nama produk</Label><Input {...form.register("name")} />{e.name && <p className="text-xs text-destructive">{e.name.message}</p>}</div>
        <div><Label>Deskripsi</Label><Textarea rows={5} {...form.register("description")} />{e.description && <p className="text-xs text-destructive">{e.description.message}</p>}</div>
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Unggah foto akan aktif setelah penyimpanan file terhubung. Saat ini produk memakai ilustrasi kategori.</div>
        <div>
          <div className="mb-2 flex items-center justify-between"><Label>Variasi, SKU & stok</Label><Button type="button" size="sm" variant="outline" onClick={() => vars.append({ id: `v${Date.now()}`, name: "", sku: "", stock: 0 })}><Plus />Variasi</Button></div>
          {vars.fields.map((f, i) => (
            <div key={f.id} className="mb-2 grid grid-cols-[1fr_1fr_90px_auto] gap-2">
              <Input placeholder="Ukuran / warna" {...form.register(`variants.${i}.name`)} />
              <Input placeholder="SKU" {...form.register(`variants.${i}.sku`)} />
              <Input type="number" placeholder="Stok" {...form.register(`variants.${i}.stock`)} />
              <Button type="button" variant="ghost" size="icon" disabled={vars.fields.length === 1} onClick={() => vars.remove(i)} aria-label="Hapus variasi"><Trash2 /></Button>
              {e.variants?.[i] && <p className="col-span-4 text-xs text-destructive">{Object.values(e.variants[i]!).map((x) => (x as { message?: string })?.message).filter(Boolean).join(" · ")}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="h-fit space-y-4 rounded-xl border bg-card p-5">
        <div><Label>Kategori</Label>
          <select className="w-full rounded-md border bg-card p-2 text-sm" {...form.register("categoryId")}><option value="">Pilih…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          {e.categoryId && <p className="text-xs text-destructive">{e.categoryId.message}</p>}
        </div>
        <div><Label>Harga jual (Rp)</Label><Input type="number" {...form.register("basePrice")} />{e.basePrice && <p className="text-xs text-destructive">{e.basePrice.message}</p>}</div>
        <div><Label>Harga diskon (opsional)</Label><Input type="number" {...form.register("discountPrice")} />{e.discountPrice && <p className="text-xs text-destructive">{e.discountPrice.message}</p>}</div>
        <label className="flex items-center justify-between text-sm">Produk aktif <Switch checked={form.watch("active")} onCheckedChange={(c) => form.setValue("active", c)} /></label>
        <Button type="submit" className="w-full">Simpan Produk</Button>
      </div>
    </form>
  );
}
