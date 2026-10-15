import type { OrderStatus } from "@/lib/domain/order-status";

export type Role = "buyer" | "seller" | "admin";

export interface User { id: string; name: string; email: string; roles: Role[]; storeId?: string; active: boolean }
export interface Address { id: string; userId: string; label: string; recipient: string; phone: string; line: string; city: string; postal: string; isDefault: boolean }
export interface Category { id: string; slug: string; name: string; icon: string; art: number }
export interface Store {
  id: string; slug: string; name: string; ownerId: string; city: string; description: string;
  status: "pending" | "active" | "rejected" | "suspended"; rating: number; voucherBps: number; joinedAt: string; featured: boolean;
}
export interface Variant { id: string; name: string; sku: string; price: number; stock: number }
export interface Product {
  id: string; storeId: string; categoryId: string; name: string; description: string;
  basePrice: number; discountPrice?: number; variants: Variant[]; active: boolean; createdAt: string;
  sold: number; rating: number; reviewCount: number; flashSale?: boolean;
}
export interface OrderItem { productId: string; variantId: string; name: string; variantName: string; sku: string; price: number; qty: number }
export interface Order {
  id: string; groupId: string; storeId: string; buyerId: string; items: OrderItem[];
  subtotal: number; discount: number; shipping: number; shippingService: string; commission: number; commissionBps: number;
  status: OrderStatus; createdAt: string; resi?: string; addressText: string;
  history: { status: OrderStatus; at: string; note?: string }[];
}
export interface CheckoutGroup {
  id: string; buyerId: string; orderIds: string[]; total: number; serviceFee: number;
  payment: { method: string; status: "pending" | "paid" | "failed" | "expired"; ref: string; expiresAt: string; events: string[] };
  createdAt: string;
}
export interface Payout { id: string; storeId: string; amount: number; status: "requested" | "approved" | "paid" | "rejected"; createdAt: string; bank: string }
export interface Review { id: string; productId: string; orderId: string; userName: string; rating: number; text: string; createdAt: string; reply?: string }
export interface Notification { id: string; userId: string; text: string; at: string; read: boolean }
export interface AuditLog { id: string; actor: string; action: string; at: string }
export interface CartLine { productId: string; variantId: string; qty: number; selected: boolean }

export interface DB {
  version: number;
  currentUserId: string | null;
  users: User[]; addresses: Address[]; categories: Category[]; stores: Store[]; products: Product[];
  orders: Order[]; groups: CheckoutGroup[]; payouts: Payout[]; reviews: Review[];
  notifications: Notification[]; audit: AuditLog[];
  carts: Record<string, CartLine[]>; wishlist: Record<string, string[]>; follows: Record<string, string[]>;
  settings: { commissionBps: number; serviceFee: number; flashSaleEnabled: boolean; marketplaceName: string };
}
