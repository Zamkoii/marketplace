import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { actions, useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/akun")({
  head: () => ({ meta: [{ title: "Akun Saya — Pasarku" }, { name: "description", content: "Profil, alamat, dan riwayat transaksi." }, { property: "og:title", content: "Akun Saya — Pasarku" }, { property: "og:description", content: "Kelola akun Anda." }] }),
  component: () => <SiteShell><RequireLogin><Account /></RequireLogin></SiteShell>,
});

const addrSchema = z.object({
  label: z.string().trim().min(1, "Wajib").max(30), recipient: z.string().trim().min(2, "Wajib").max(60),
  phone: z.string().trim().regex(/^[0-9+\- ]{8,16}$/, "Nomor tidak valid"), line: z.string().trim().min(5, "Terlalu pendek").max(200),
  city: z.string().trim().min(2, "Wajib").max(50), postal: z.string().trim().regex(/^\d{5}$/, "5 digit"),
});

function Account() {
  const navigate = useNavigate();
  const user = useDB((d) => d.users.find((u) => u.id === d.currentUserId)!);
  const addresses = useDB((d) => d.addresses.filter((a) => a.userId === user.id));
  const groups = useDB((d) => d.groups.filter((g) => g.buyerId === user.id).slice(0, 10));
  const [name, setName] = useState(user.name);
  const [adding, setAdding] = useState(false);
  const form = useForm<z.infer<typeof addrSchema>>({ resolver: zodResolver(addrSchema) });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-5">
        <h1 className="font-display text-2xl font-bold">Profil</h1>
        <p className="text-sm text-muted-foreground">{user.email} · {user.roles.join(", ")}</p>
        <div className="mt-4 flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /><Button onClick={() => run(() => actions.updateProfile(name.trim()), "Profil disimpan")}>Simpan</Button></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!user.storeId && <Button asChild variant="outline"><Link to="/buka-toko">Buka Toko</Link></Button>}
          {user.roles.includes("seller") && <Button asChild variant="outline"><Link to="/seller">Seller Center</Link></Button>}
          <Button variant="ghost" onClick={() => { actions.logout(); navigate({ to: "/" }); }}>Keluar</Button>
        </div>
      </section>
      <section className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Alamat</h2><Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>{adding ? "Tutup" : "+ Tambah"}</Button></div>
        {adding && (
          <form className="mt-3 grid gap-2 sm:grid-cols-2" onSubmit={form.handleSubmit((v) => { if (run(() => actions.addAddress(v), "Alamat ditambahkan")) { form.reset(); setAdding(false); } })}>
            {(["label", "recipient", "phone", "line", "city", "postal"] as const).map((k) => (
              <div key={k} className={k === "line" ? "sm:col-span-2" : ""}>
                <Label className="text-xs">{{ label: "Label", recipient: "Penerima", phone: "Telepon", line: "Alamat lengkap", city: "Kota", postal: "Kode pos" }[k]}</Label>
                <Input {...form.register(k)} />
                {form.formState.errors[k] && <p className="text-xs text-destructive">{form.formState.errors[k]?.message}</p>}
              </div>
            ))}
            <Button type="submit" className="sm:col-span-2">Simpan Alamat</Button>
          </form>
        )}
        <ul className="mt-3 space-y-2">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-lg border p-3 text-sm">
              <p className="font-semibold">{a.label} {a.isDefault && <span className="ml-1 rounded bg-primary-soft px-1.5 text-xs text-accent-foreground">Utama</span>}</p>
              <p className="text-muted-foreground">{a.recipient} · {a.phone}<br />{a.line}, {a.city} {a.postal}</p>
              <div className="mt-1 flex gap-3 text-xs">
                {!a.isDefault && <button className="text-primary" onClick={() => run(() => actions.setDefaultAddress(a.id))}>Jadikan utama</button>}
                <button className="text-destructive" onClick={() => run(() => actions.deleteAddress(a.id), "Alamat dihapus")}>Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border bg-card p-5 lg:col-span-2">
        <h2 className="font-display text-xl font-bold">Riwayat Transaksi</h2>
        <table className="mt-3 w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th className="py-2">ID</th><th>Tanggal</th><th>Metode</th><th>Status</th><th className="text-right">Total</th></tr></thead>
          <tbody>{groups.map((g) => <tr key={g.id} className="border-t"><td className="py-2"><Link to="/bayar/$id" params={{ id: g.id }} className="text-primary">{g.id}</Link></td><td>{new Date(g.createdAt).toLocaleDateString("id-ID")}</td><td className="text-xs">{g.payment.method}</td><td>{g.payment.status}</td><td className="text-right">{formatRupiah(g.total)}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
