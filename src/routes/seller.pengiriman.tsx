import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, useMyStore } from "@/components/seller/SellerShell";
import { OrdersTable } from "@/components/seller/OrdersTable";

export const Route = createFileRoute("/seller/pengiriman")({ component: Page });

function Page() {
  const store = useMyStore()!;
  return (
    <div>
      <PageTitle title="Pengiriman" />
      <p className="mb-4 rounded-lg border border-dashed bg-card p-3 text-sm text-muted-foreground">Asal pengiriman: <b className="text-foreground">{store.city}</b>. Layanan kurir masih SIMULASI — ongkir dan pelacakan belum berasal dari kurir asli.</p>
      <OrdersTable storeId={store.id} tabs={[["Siap Dikirim", ["packing"]], ["Dalam Pengiriman", ["shipped"]], ["Terkirim", ["delivered", "completed"]]]} />
    </div>
  );
}
