import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageTitle, Stat, useMyStore } from "@/components/seller/SellerShell";
import { StatusBadge } from "@/components/shop/ui-bits";
import { useDB } from "@/lib/data/store";
import { formatRupiah } from "@/lib/domain/money";
import { computeStoreFinance } from "@/lib/domain/finance";
import { inRange, salesSeries, topProducts } from "@/lib/domain/analytics";
import { STATUS_LABEL, type OrderStatus, isPaid } from "@/lib/domain/order-status";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/seller/")({ component: Dashboard });

const DAY = 86400000;
export const RANGES = [[7, "7 hari"], [30, "30 hari"], [90, "90 hari"]] as const;

function Dashboard() {
  const store = useMyStore()!;
  const orders = useDB((d) => d.orders.filter((o) => o.storeId === store.id));
  const products = useDB((d) => d.products.filter((p) => p.storeId === store.id));
  const payouts = useDB((d) => d.payouts.filter((p) => p.storeId === store.id));
  const [days, setDays] = useState(30);
  const now = Date.now();
  const from = now - days * DAY;
  const cur = inRange(orders, from, now + DAY);
  const prev = inRange(orders, from - days * DAY, from);
  const omzet = (l: typeof orders) => l.filter((o) => isPaid(o.status) && o.status !== "refunded").reduce((a, o) => a + o.subtotal - o.discount, 0);
  const f = computeStoreFinance(orders, payouts);
  const stock = (p: (typeof products)[0]) => p.variants.reduce((a, v) => a + v.stock, 0);
  const low = products.filter((p) => stock(p) > 0 && stock(p) <= 10);
  const out = products.filter((p) => stock(p) === 0);
  const series = salesSeries(orders, from, now + DAY, days > 30 ? "week" : "day");
  const delta = omzet(prev) ? Math.round(((omzet(cur) - omzet(prev)) / omzet(prev)) * 100) : 0;
  const statusCount = (Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => ({ s, n: cur.filter((o) => o.status === s).length })).filter((x) => x.n);

  return (
    <div>
      <PageTitle title={`Halo, ${store.name}`}>
        <div className="flex gap-1">{RANGES.map(([n, l]) => <Button key={n} size="sm" variant={days === n ? "default" : "outline"} onClick={() => setDays(n)}>{l}</Button>)}</div>
      </PageTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label={`Total penjualan (${days} hr)`} value={formatRupiah(omzet(cur))} hint={`${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}% vs periode lalu`} />
        <Stat label="Total pesanan" value={String(cur.length)} />
        <Stat label="Pesanan baru (24 jam)" value={String(orders.filter((o) => now - new Date(o.createdAt).getTime() < DAY).length)} />
        <Stat label="Perlu diproses" value={String(orders.filter((o) => o.status === "to_process").length)} tone="warn" />
        <Stat label="Produk aktif" value={String(products.filter((p) => p.active).length)} />
        <Stat label="Stok menipis" value={String(low.length)} tone="warn" />
        <Stat label="Produk habis" value={String(out.length)} tone="bad" />
        <Stat label="Estimasi pendapatan bersih" value={formatRupiah(f.net)} hint="Setelah komisi, semua waktu" />
        <Stat label="Saldo tersedia" value={formatRupiah(f.available)} tone="good" />
        <Stat label="Rating toko" value={`★ ${store.rating}`} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4"><p className="mb-2 font-semibold">Penjualan</p>
          <ResponsiveContainer width="100%" height={240}><LineChart data={series}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} /><Tooltip formatter={(v: number) => formatRupiah(v)} /><Line dataKey="omzet" stroke="var(--chart-1)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-4"><p className="mb-2 font-semibold">Jumlah Pesanan</p>
          <ResponsiveContainer width="100%" height={240}><BarChart data={series}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="pesanan" fill="var(--chart-2)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-4"><p className="mb-2 font-semibold">Produk Terlaris</p>
          {topProducts(cur).map((p, i) => <div key={p.name} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{i + 1}. {p.name}</span><span className="text-muted-foreground">{p.qty} pcs · {formatRupiah(p.omzet)}</span></div>)}
        </div>
        <div className="rounded-xl border bg-card p-4"><p className="mb-2 font-semibold">Status Pesanan ({days} hr)</p>
          <div className="flex flex-wrap gap-2">{statusCount.map((x) => <span key={x.s} className="flex items-center gap-1"><StatusBadge status={x.s} /><b className="text-sm">{x.n}</b></span>)}</div>
          <p className="mb-2 mt-4 font-semibold">Stok Rendah</p>
          {[...out, ...low].slice(0, 5).map((p) => <Link key={p.id} to="/seller/produk/$id" params={{ id: p.id }} className="flex justify-between py-1 text-sm hover:text-primary"><span>{p.name}</span><span className={stock(p) ? "text-warning" : "text-destructive"}>{stock(p)} pcs</span></Link>)}
        </div>
      </div>
      <div className="mt-4 rounded-xl border bg-card p-4"><p className="mb-2 font-semibold">Transaksi Terbaru</p>
        <table className="w-full text-sm"><tbody>{orders.slice(0, 6).map((o) => <tr key={o.id} className="border-t"><td className="py-2">{o.id}</td><td>{new Date(o.createdAt).toLocaleDateString("id-ID")}</td><td><StatusBadge status={o.status} /></td><td className="text-right">{formatRupiah(o.subtotal - o.discount)}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
