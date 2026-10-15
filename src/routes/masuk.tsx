import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, Store, User } from "lucide-react";
import { SiteShell } from "@/components/shop/SiteShell";
import { actions, useDB } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { run } from "@/lib/use-action";

export const Route = createFileRoute("/masuk")({
  head: () => ({ meta: [{ title: "Masuk — Pasarku" }, { name: "description", content: "Masuk atau daftar akun Pasarku." }, { property: "og:title", content: "Masuk — Pasarku" }, { property: "og:description", content: "Masuk atau daftar akun." }] }),
  component: Login,
});

const regSchema = z.object({ name: z.string().trim().min(2, "Nama minimal 2 huruf").max(60), email: z.string().trim().email("Email tidak valid") });

function Login() {
  const navigate = useNavigate();
  const users = useDB((d) => d.users);
  const current = useDB((d) => d.currentUserId);
  const form = useForm<z.infer<typeof regSchema>>({ resolver: zodResolver(regSchema) });
  const demo = [
    { id: "u1", icon: User, title: "Pembeli", desc: "Rina — belanja & lacak pesanan", to: "/" as const },
    { id: "u2", icon: Store, title: "Penjual", desc: "Budi — Batik Sekar Jagad", to: "/seller" as const },
    { id: "u9", icon: ShieldCheck, title: "Admin", desc: "Kelola seluruh marketplace", to: "/admin" as const },
  ];
  return (
    <SiteShell>
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h1 className="font-display text-2xl font-bold">Masuk dengan akun demo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Belum ada server login. Pilih peran untuk mencoba aplikasi.</p>
          <div className="mt-4 space-y-2">
            {demo.map((d) => (
              <button key={d.id} onClick={() => { actions.login(d.id); navigate({ to: d.to }); }} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:border-primary ${current === d.id ? "border-primary bg-primary-soft" : ""}`}>
                <d.icon className="size-5 text-primary" /><div><p className="font-semibold">{d.title}</p><p className="text-xs text-muted-foreground">{d.desc}</p></div>
              </button>
            ))}
          </div>
          <details className="mt-4 text-sm"><summary className="cursor-pointer text-muted-foreground">Akun penjual lain</summary>
            {users.filter((u) => u.roles.includes("seller") && u.id !== "u2").map((u) => <button key={u.id} className="block py-1 text-primary" onClick={() => { actions.login(u.id); navigate({ to: "/seller" }); }}>{u.name}</button>)}
          </details>
          {current && <Button variant="outline" className="mt-4 w-full" onClick={() => { actions.logout(); navigate({ to: "/" }); }}>Keluar</Button>}
        </div>
        <form className="rounded-2xl border bg-card p-6" onSubmit={form.handleSubmit((v) => { if (run(() => actions.register(v.name, v.email), "Akun dibuat")) navigate({ to: "/akun" }); })}>
          <h2 className="font-display text-2xl font-bold">Daftar akun baru</h2>
          <div className="mt-4 space-y-3">
            <div><Label htmlFor="name">Nama</Label><Input id="name" {...form.register("name")} />{form.formState.errors.name && <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...form.register("email")} />{form.formState.errors.email && <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>}</div>
            <p className="text-xs text-muted-foreground">Mode demo tanpa kata sandi. Login dengan password aman akan aktif setelah server terhubung.</p>
            <Button className="w-full" type="submit">Daftar</Button>
          </div>
        </form>
      </div>
    </SiteShell>
  );
}
