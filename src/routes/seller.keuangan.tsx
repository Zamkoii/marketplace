import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/seller/SellerShell";
import { Empty } from "@/components/shop/ui-bits";

export const Route = createFileRoute("/seller/keuangan")({
  component: () => <div><PageTitle title="Keuangan" /><Empty title="Halaman ini belum dibuat">Akan diselesaikan pada tahap berikutnya.</Empty></div>,
});
