import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, useMyStore } from "@/components/seller/SellerShell";
import { OrdersTable } from "@/components/seller/OrdersTable";

export const Route = createFileRoute("/seller/pesanan")({ component: Page });

function Page() {
  const store = useMyStore()!;
  return (
    <div>
      <PageTitle title="Pesanan" />
      <OrdersTable storeId={store.id} tabs={[
        ["Semua", null], ["Menunggu Pembayaran", ["awaiting_payment"]], ["Perlu Diproses", ["to_process"]], ["Sedang Dikemas", ["packing"]],
        ["Dalam Pengiriman", ["shipped", "delivered"]], ["Selesai", ["completed"]], ["Dibatalkan", ["cancelled"]], ["Pengembalian", ["return_requested", "refunded"]],
      ]} />
    </div>
  );
}
