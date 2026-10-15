import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, Heart, Search, ShoppingCart, Store, User, LayoutDashboard, ShieldCheck, Home, ReceiptText } from "lucide-react";
import { useDB } from "@/lib/data/store";
import { Button } from "@/components/ui/button";

export function DemoBar() {
  return (
    <div className="bg-foreground px-4 py-1 text-center text-xs text-background">
      Mode demo — data disimpan di browser Anda, pembayaran & ongkir adalah SIMULASI.
    </div>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const user = useDB((d) => d.users.find((u) => u.id === d.currentUserId));
  const cartCount = useDB((d) => (d.currentUserId ? (d.carts[d.currentUserId] ?? []).reduce((a, l) => a + l.qty, 0) : 0));
  const unread = useDB((d) => d.notifications.filter((n) => n.userId === d.currentUserId && !n.read).length);
  const cats = useDB((d) => d.categories);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <DemoBar />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-hero font-display text-lg font-extrabold text-primary-foreground">P</span>
          <span className="hidden font-display text-xl font-extrabold sm:block">Pasarku</span>
        </Link>
        <form className="flex flex-1 overflow-hidden rounded-xl border-2 border-primary bg-card" onSubmit={(e) => { e.preventDefault(); navigate({ to: "/cari", search: { q } }); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari batik, kopi, headphone…" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" aria-label="Cari produk" />
          <button className="bg-primary px-4 text-primary-foreground" aria-label="Cari"><Search className="size-4" /></button>
        </form>
        <nav className="flex items-center gap-1">
          <Link to="/notifikasi" className="relative hidden rounded-lg p-2 hover:bg-muted sm:block" aria-label="Notifikasi">
            <Bell className="size-5" />{unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />}
          </Link>
          <Link to="/wishlist" className="hidden rounded-lg p-2 hover:bg-muted sm:block" aria-label="Wishlist"><Heart className="size-5" /></Link>
          <Link to="/keranjang" className="relative rounded-lg p-2 hover:bg-muted" aria-label="Keranjang">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cartCount}</span>}
          </Link>
          {user ? (
            <Link to="/akun" className="ml-1 hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-muted md:flex"><User className="size-4" />{user.name.split(" ")[0]}</Link>
          ) : (
            <Button asChild size="sm" className="ml-1"><Link to="/masuk">Masuk</Link></Button>
          )}
        </nav>
      </div>
      <div className="mx-auto hidden max-w-7xl gap-5 overflow-x-auto px-4 pb-2 text-sm text-muted-foreground md:flex">
        {cats.map((c) => (
          <Link key={c.id} to="/cari" search={{ kategori: c.slug }} className="whitespace-nowrap hover:text-primary">{c.name}</Link>
        ))}
        {user?.roles.includes("seller") && <Link to="/seller" className="ml-auto flex items-center gap-1 whitespace-nowrap font-medium text-foreground hover:text-primary"><Store className="size-4" />Seller Center</Link>}
        {user?.roles.includes("admin") && <Link to="/admin" className="flex items-center gap-1 whitespace-nowrap font-medium text-foreground hover:text-primary"><ShieldCheck className="size-4" />Admin</Link>}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-4">
        <div>
          <p className="font-display text-lg font-extrabold">Pasarku</p>
          <p className="mt-2 text-muted-foreground">Marketplace untuk UMKM dan brand lokal Indonesia.</p>
        </div>
        <div className="space-y-2"><p className="font-semibold">Layanan</p><Link to="/bantuan" className="block text-muted-foreground hover:text-primary">Pusat Bantuan</Link><Link to="/pesanan" className="block text-muted-foreground hover:text-primary">Lacak Pesanan</Link></div>
        <div className="space-y-2"><p className="font-semibold">Jual di Pasarku</p><Link to="/buka-toko" className="block text-muted-foreground hover:text-primary">Buka Toko</Link><Link to="/seller" className="block text-muted-foreground hover:text-primary">Seller Center</Link></div>
        <div className="space-y-2"><p className="font-semibold">Kebijakan</p><Link to="/kebijakan" className="block text-muted-foreground hover:text-primary">Syarat & Ketentuan</Link><Link to="/kebijakan" className="block text-muted-foreground hover:text-primary">Pengembalian Dana</Link></div>
      </div>
      <p className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 Pasarku · Demo</p>
    </footer>
  );
}

function MobileNav() {
  const items = [
    { to: "/", icon: Home, label: "Beranda" },
    { to: "/pesanan", icon: ReceiptText, label: "Pesanan" },
    { to: "/keranjang", icon: ShoppingCart, label: "Keranjang" },
    { to: "/notifikasi", icon: Bell, label: "Notifikasi" },
    { to: "/akun", icon: User, label: "Akun" },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card md:hidden">
      {items.map((i) => (
        <Link key={i.to} to={i.to} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
          <i.icon className="size-5" />{i.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}

export function RequireLogin({ children, role }: { children: ReactNode; role?: "seller" | "admin" }) {
  const user = useDB((d) => d.users.find((u) => u.id === d.currentUserId));
  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center">
        <LayoutDashboard className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 font-display text-lg font-semibold">Silakan masuk dulu</p>
        <Button asChild className="mt-4"><Link to="/masuk">Masuk</Link></Button>
      </div>
    );
  }
  if (role && !user.roles.includes(role)) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center">
        <ShieldCheck className="mx-auto size-10 text-destructive" />
        <p className="mt-3 font-display text-lg font-semibold">Akses ditolak</p>
        <p className="mt-1 text-sm text-muted-foreground">Halaman ini khusus {role === "admin" ? "admin" : "penjual"}.</p>
        <Button asChild className="mt-4" variant="outline"><Link to="/masuk">Ganti akun</Link></Button>
      </div>
    );
  }
  return <>{children}</>;
}
