import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/domain/money";
import { STATUS_LABEL, type OrderStatus } from "@/lib/domain/order-status";
import { useDB, effectivePrice } from "@/lib/data/store";
import type { Product } from "@/lib/data/types";

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const I = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Tag;
  return <I className={className} />;
}

export function ProductArt({ product, className, big }: { product: Product; className?: string; big?: boolean }) {
  const cat = useDB((d) => d.categories.find((c) => c.id === product.categoryId));
  return (
    <div className={cn("art grid place-items-center", `art-${cat?.art ?? 0}`, className)}>
      <CategoryIcon name={cat?.icon ?? "Tag"} className={big ? "size-28 opacity-80" : "size-12 opacity-80"} />
      <span className="absolute bottom-2 left-2 rounded bg-card/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Ilustrasi</span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const store = useDB((d) => d.stores.find((s) => s.id === product.storeId));
  const price = effectivePrice(product);
  const off = product.discountPrice ? Math.round((1 - product.discountPrice / product.basePrice) * 100) : 0;
  return (
    <Link to="/produk/$id" params={{ id: product.id }} className="group overflow-hidden rounded-xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className="relative">
        <ProductArt product={product} className="aspect-square" />
        {off > 0 && <span className="absolute right-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">-{off}%</span>}
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 min-h-10 text-sm leading-5">{product.name}</p>
        <p className="font-display text-base font-bold text-primary">{formatRupiah(price)}</p>
        {off > 0 && <p className="text-xs text-muted-foreground line-through">{formatRupiah(product.basePrice)}</p>}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="size-3 fill-warning text-warning" />{product.rating || "-"} · {product.sold} terjual</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{store?.city}</p>
      </div>
    </Link>
  );
}

const TONE: Record<OrderStatus, string> = {
  awaiting_payment: "bg-warning/20 text-foreground",
  to_process: "bg-primary-soft text-accent-foreground",
  packing: "bg-info/15 text-info",
  shipped: "bg-info/15 text-info",
  delivered: "bg-success/15 text-success",
  completed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
  return_requested: "bg-destructive/10 text-destructive",
  refunded: "bg-destructive/10 text-destructive",
};
export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE[status])}>{STATUS_LABEL[status]}</span>;
}

export function Empty({ icon: I = Icons.PackageOpen, title, children }: { icon?: Icons.LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-card p-10 text-center">
      <I className="size-10 text-muted-foreground" />
      <p className="mt-3 font-display text-lg font-semibold">{title}</p>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function WishButton({ productId }: { productId: string }) {
  const uid = useDB((d) => d.currentUserId);
  const on = useDB((d) => (uid ? d.wishlist[uid]?.includes(productId) : false));
  return { on, Heart };
}
