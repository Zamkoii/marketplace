import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { actions, useDB } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/buka-toko")({
  head: () => ({ meta: [{ title: "Buka Toko — Pasarku" }, { name: "description", content: "Daftarkan toko Anda dan mulai berjualan di Pasarku." }, { property: "og:title", content: "Buka Toko — Pasarku" }, { property: "og:description", content: "Mulai berjualan." }] }),
  component: () => <SiteShell><RequireLogin><Apply /></RequireLogin></SiteShell>,
});

const schema = z.object({ name: z.string().trim().min(3, "Minimal 3 huruf").max(50), city: z.string().trim().min(2).max(50), description: z.string().trim().min(10, "Minimal 10 huruf").max(500) });

function Apply() {
  const navigate = useNavigate();
  const store = useDB((d) => d.stores.find((s) => s.ownerId === d.currentUserId));
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  if (store) return (
    <div className="mx-auto max-w-md rounded-xl border bg-card p-6 text-center">
      <p className="font-display text-xl font-bold">{store.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">Status: {{ pending: "Menunggu verifikasi admin", active: "Aktif", rejected: "Ditolak", suspended: "Dinonaktifkan" }[store.status]}</p>
      <Button className="mt-4" onClick={() => navigate({ to: "/seller" })}>Buka Seller Center</Button>
    </div>
  );
  return (
    <form className="mx-auto max-w-lg space-y-3 rounded-2xl border bg-card p-6" onSubmit={form.handleSubmit((v) => { if (run(() => actions.applyStore(v.name, v.city, v.description), "Pengajuan dikirim ke admin")) navigate({ to: "/seller" }); })}>
      <h1 className="font-display text-2xl font-bold">Buka Toko di Pasarku</h1>
      <p className="text-sm text-muted-foreground">Toko akan aktif setelah diverifikasi admin.</p>
      {(["name", "city"] as const).map((k) => <div key={k}><Label>{k === "name" ? "Nama toko" : "Kota asal pengiriman"}</Label><Input {...form.register(k)} />{form.formState.errors[k] && <p className="text-xs text-destructive">{form.formState.errors[k]?.message}</p>}</div>)}
      <div><Label>Deskripsi</Label><Textarea {...form.register("description")} />{form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}</div>
      <Button type="submit" className="w-full">Ajukan Toko</Button>
    </form>
  );
}
