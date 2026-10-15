import { createFileRoute } from "@tanstack/react-router";
import { SellerShell } from "@/components/seller/SellerShell";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Seller Center — Pasarku" }, { name: "description", content: "Kelola toko, produk, pesanan, dan keuangan." }, { property: "og:title", content: "Seller Center — Pasarku" }, { property: "og:description", content: "Dashboard penjual." }] }),
  component: SellerShell,
});
