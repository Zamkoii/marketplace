import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/shop/SiteShell";

export const Route = createFileRoute("/kebijakan")({
  head: () => ({ meta: [{ title: "Syarat & Kebijakan — Pasarku" }, { name: "description", content: "Syarat penggunaan, pembatalan, dan pengembalian dana Pasarku." }, { property: "og:title", content: "Syarat & Kebijakan — Pasarku" }, { property: "og:description", content: "Kebijakan marketplace." }] }),
  component: () => (
    <SiteShell>
      <article className="mx-auto max-w-2xl space-y-4 rounded-2xl border bg-card p-6 text-sm leading-6">
        <h1 className="font-display text-3xl font-bold">Syarat & Kebijakan</h1>
        <p className="rounded bg-warning/20 p-3">Draf kebijakan contoh — perlu ditinjau ahli hukum sebelum digunakan.</p>
        <h2 className="font-display text-lg font-bold">Pembatalan</h2><p>Pembeli dapat membatalkan pesanan yang belum dibayar atau belum dikemas. Stok dikembalikan otomatis.</p>
        <h2 className="font-display text-lg font-bold">Pengembalian dana</h2><p>Pengembalian dapat diajukan setelah paket diterima dan sebelum pesanan dikonfirmasi selesai. Penjual atau admin meninjau pengajuan.</p>
        <h2 className="font-display text-lg font-bold">Komisi penjual</h2><p>Marketplace memungut komisi dari nilai produk setelah diskon toko, tidak termasuk ongkir. Besarnya diatur admin.</p>
        <h2 className="font-display text-lg font-bold">Data pribadi</h2><p>Data kartu pembayaran tidak disimpan oleh Pasarku dan ditangani payment gateway.</p>
      </article>
    </SiteShell>
  ),
});
