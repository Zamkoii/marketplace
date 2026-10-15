import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Bell, HelpCircle, LayoutDashboard, LogOut, Menu, MessageSquareText, Package, PackagePlus, ReceiptText, Settings, Tag, Truck, Users, Wallet } from "lucide-react";
import { actions, useDB } from "@/lib/data/store";
import { DemoBar, RequireLogin } from "@/components/shop/SiteShell";

const NAV = [
  { to: "/seller", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/seller/produk", icon: Package, label: "Produk Saya", exact: true },
  { to: "/seller/produk/baru", icon: PackagePlus, label: "Tambah Produk" },
  { to: "/seller/pesanan", icon: ReceiptText, label: "Pesanan" },
  { to: "/seller/pengiriman", icon: Truck, label: "Pengiriman" },
  { to: "/seller/promo", icon: Tag, label: "Promo dan Diskon" },
  { to: "/seller/ulasan", icon: MessageSquareText, label: "Ulasan Produk" },
  { to: "/seller/pelanggan", icon: Users, label: "Pelanggan" },
  { to: "/seller/keuangan", icon: Wallet, label: "Keuangan & Pencairan" },
  { to: "/seller/analitik", icon: BarChart3, label: "Analitik Penjualan" },
  { to: "/seller/pengaturan", icon: Settings, label: "Pengaturan Toko" },
  { to: "/bantuan", icon: HelpCircle, label: "Bantuan" },
] as const;

export function useMyStore() {
  return useDB((d) => d.stores.find((s) => s.id === d.users.find((u) => u.id === d.currentUserId)?.storeId));
}

export function SellerShell() {
  return <RequireLogin role="seller"><Inner /></RequireLogin>;
}

function Inner() {
  const store = useMyStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pending = useDB((d) => d.orders.filter((o) => o.storeId === store?.id && o.status === "to_process").length);
  const user = useDB((d) => d.users.find((u) => u.id === d.currentUserId));
  return (
    <div className="min-h-screen bg-muted">
      <DemoBar />
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-sidebar text-sidebar-foreground transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
            <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary font-display font-extrabold text-sidebar-primary-foreground">P</span>
            <div><p className="font-display font-bold text-sidebar-accent-foreground">Seller Center</p><p className="text-xs">{store?.name}</p></div>
          </div>
          <nav className="space-y-0.5 overflow-y-auto p-3 text-sm">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: "exact" in n }} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent" activeProps={{ className: "bg-sidebar-accent text-sidebar-primary font-semibold" }}>
                <n.icon className="size-4" />{n.label}
              </Link>
            ))}
            <button onClick={() => { actions.logout(); navigate({ to: "/" }); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent"><LogOut className="size-4" />Logout</button>
          </nav>
        </aside>
        {open && <button className="fixed inset-0 z-40 bg-foreground/40 md:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu" />}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card px-4 py-3">
            <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu /></button>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Ke marketplace</Link>
            <div className="ml-auto flex items-center gap-4">
              <Link to="/seller/pesanan" className="relative" aria-label="Pesanan perlu diproses"><Bell className="size-5" />{pending > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{pending}</span>}</Link>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </header>
          <main className="p-4 sm:p-6">
            {!store ? <p>Anda belum punya toko. <Link to="/buka-toko" className="text-primary">Buka toko</Link></p> : store.status !== "active" ? (
              <div className="rounded-xl border bg-card p-6"><p className="font-display text-xl font-bold">Toko {store.status === "pending" ? "menunggu verifikasi" : "tidak aktif"}</p><p className="mt-1 text-sm text-muted-foreground">Admin perlu menyetujui toko sebelum Anda dapat berjualan.</p></div>
            ) : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h1 className="font-display text-2xl font-bold">{title}</h1>{children}</div>;
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "warn" | "bad" | "good" }) {
  const c = tone === "warn" ? "text-warning" : tone === "bad" ? "text-destructive" : tone === "good" ? "text-success" : "";
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${c}`}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
