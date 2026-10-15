import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/shop/SiteShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/bantuan")({
  head: () => ({ meta: [{ title: "Pusat Bantuan — Pasarku" }, { name: "description", content: "Jawaban seputar belanja, pembayaran, dan pengiriman." }, { property: "og:title", content: "Pusat Bantuan — Pasarku" }, { property: "og:description", content: "Pertanyaan umum." }] }),
  component: Help,
});

const FAQ = [
  ["Bagaimana checkout dari beberapa toko?", "Pilih produk dari toko mana pun di keranjang, lalu checkout sekali. Sistem membuat pesanan terpisah untuk setiap toko dengan satu pembayaran."],
  ["Kapan dana diteruskan ke penjual?", "Dana ditahan sampai pesanan selesai (dikonfirmasi diterima), lalu menjadi saldo yang dapat dicairkan oleh penjual."],
  ["Bagaimana cara membatalkan pesanan?", "Pesanan bisa dibatalkan sebelum dikemas penjual, melalui halaman detail pesanan."],
  ["Bagaimana mengajukan pengembalian?", "Setelah paket terkirim dan sebelum dikonfirmasi selesai, tekan 'Ajukan Pengembalian' di detail pesanan."],
  ["Apakah data kartu saya disimpan?", "Tidak. Data pembayaran ditangani langsung oleh payment gateway."],
];

function Help() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold">Pusat Bantuan</h1>
        <Accordion type="single" collapsible className="mt-6 rounded-xl border bg-card px-4">
          {FAQ.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </div>
    </SiteShell>
  );
}
