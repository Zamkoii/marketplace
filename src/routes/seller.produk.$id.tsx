import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, useMyStore } from "@/components/seller/SellerShell";
import { ProductForm } from "@/components/seller/ProductForm";
import { Empty } from "@/components/shop/ui-bits";
import { useDB } from "@/lib/data/store";

export const Route = createFileRoute("/seller/produk/$id")({ component: Edit });

function Edit() {
  const { id } = Route.useParams();
  const store = useMyStore()!;
  // Only products of the current seller's store are reachable.
  const p = useDB((d) => d.products.find((x) => x.id === id && x.storeId === store.id));
  if (!p) return <Empty title="Produk tidak ditemukan di toko Anda" />;
  return <div><PageTitle title="Edit Produk" /><ProductForm product={p} key={p.id} /></div>;
}
