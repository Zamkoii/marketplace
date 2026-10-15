import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/seller/SellerShell";
import { ProductForm } from "@/components/seller/ProductForm";

export const Route = createFileRoute("/seller/produk/baru")({
  component: () => <div><PageTitle title="Tambah Produk" /><ProductForm /></div>,
});
