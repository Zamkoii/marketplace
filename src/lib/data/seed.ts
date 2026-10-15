// DATA DEMO — semua data di sini fiktif dan hanya untuk simulasi di browser.
import type { DB, Product, Order, Category, Store } from "./types";
import { commissionFor } from "@/lib/domain/pricing";
import type { OrderStatus } from "@/lib/domain/order-status";

const categories: Category[] = [
  { id: "c1", slug: "fashion-pria", name: "Fashion Pria", icon: "Shirt", art: 0 },
  { id: "c2", slug: "fashion-wanita", name: "Fashion Wanita", icon: "Sparkles", art: 1 },
  { id: "c3", slug: "elektronik", name: "Elektronik", icon: "Headphones", art: 2 },
  { id: "c4", slug: "rumah-tangga", name: "Rumah Tangga", icon: "Sofa", art: 3 },
  { id: "c5", slug: "kecantikan", name: "Kecantikan", icon: "Droplet", art: 4 },
  { id: "c6", slug: "makanan", name: "Makanan & Minuman", icon: "Coffee", art: 5 },
  { id: "c7", slug: "olahraga", name: "Olahraga", icon: "Dumbbell", art: 6 },
  { id: "c8", slug: "hobi", name: "Hobi & Buku", icon: "BookOpen", art: 7 },
];

const stores: Store[] = [
  { id: "s1", slug: "batik-sekar", name: "Batik Sekar Jagad", ownerId: "u2", city: "Solo", description: "Batik tulis & cap asli Solo sejak 1998.", status: "active", rating: 4.8, voucherBps: 1000, joinedAt: "2024-02-01", featured: true },
  { id: "s2", slug: "gadget-nusantara", name: "Gadget Nusantara", ownerId: "u3", city: "Jakarta", description: "Aksesoris gadget original bergaransi.", status: "active", rating: 4.7, voucherBps: 0, joinedAt: "2023-11-12", featured: true },
  { id: "s3", slug: "kopi-lereng", name: "Kopi Lereng Merapi", ownerId: "u4", city: "Yogyakarta", description: "Kopi single origin dari petani lokal.", status: "active", rating: 4.9, voucherBps: 500, joinedAt: "2024-05-20", featured: true },
  { id: "s4", slug: "rumah-asri", name: "Rumah Asri", ownerId: "u5", city: "Bandung", description: "Perlengkapan rumah minimalis.", status: "active", rating: 4.6, voucherBps: 0, joinedAt: "2024-08-03", featured: false },
  { id: "s5", slug: "glow-lokal", name: "Glow Lokal Beauty", ownerId: "u6", city: "Surabaya", description: "Skincare lokal BPOM.", status: "pending", rating: 0, voucherBps: 0, joinedAt: "2026-10-10", featured: false },
];

type P = [string, string, string, number, number | undefined, string[], boolean?];
const raw: P[] = [
  ["s1", "c1", "Kemeja Batik Parang Lengan Panjang", 289000, 239000, ["M", "L", "XL"], true],
  ["s1", "c1", "Kemeja Batik Kawung Slimfit", 249000, undefined, ["M", "L", "XL"]],
  ["s1", "c2", "Dress Batik Mega Mendung", 329000, 279000, ["S", "M", "L"]],
  ["s1", "c2", "Kain Batik Tulis Sogan 2m", 450000, undefined, ["Coklat", "Biru"]],
  ["s1", "c2", "Outer Batik Cap Modern", 199000, 169000, ["All Size"]],
  ["s2", "c3", "Headphone Bluetooth ANC Pro", 899000, 749000, ["Hitam", "Putih"], true],
  ["s2", "c3", "TWS Earbuds Mini 30 Jam", 299000, 249000, ["Hitam", "Putih", "Biru"]],
  ["s2", "c3", "Powerbank 20000mAh Fast Charge", 349000, undefined, ["Hitam"]],
  ["s2", "c3", "Kabel USB-C Braided 2m", 59000, 45000, ["1m", "2m"]],
  ["s2", "c3", "Smartwatch Fit Series 5", 699000, 599000, ["Hitam", "Pink"], true],
  ["s2", "c8", "Keyboard Mekanikal 75%", 789000, undefined, ["Red Switch", "Brown Switch"]],
  ["s3", "c6", "Kopi Arabika Merapi 250g", 85000, undefined, ["Biji", "Bubuk Halus", "Bubuk Kasar"]],
  ["s3", "c6", "Kopi Robusta Temanggung 500g", 95000, 82000, ["Biji", "Bubuk"], true],
  ["s3", "c6", "Paket Drip Bag Nusantara isi 10", 75000, undefined, ["Campur"]],
  ["s3", "c4", "V60 Dripper Keramik", 135000, 119000, ["Putih", "Hitam"]],
  ["s3", "c6", "Gula Aren Cair 500ml", 45000, undefined, ["500ml"]],
  ["s4", "c4", "Rak Dinding Kayu Jati Minimalis", 179000, 149000, ["60cm", "90cm"]],
  ["s4", "c4", "Set Sprei Katun Jepang", 259000, undefined, ["Single", "Queen", "King"]],
  ["s4", "c4", "Lampu Tidur Rotan", 129000, 99000, ["Natural"], true],
  ["s4", "c4", "Keranjang Anyaman Serbaguna", 89000, undefined, ["S", "M", "L"]],
  ["s4", "c7", "Matras Yoga TPE 6mm", 189000, 159000, ["Ungu", "Hijau", "Abu"]],
  ["s2", "c7", "Botol Minum Stainless 1L", 119000, undefined, ["Hitam", "Sage"]],
  ["s1", "c8", "Buku Mewarnai Motif Batik", 49000, undefined, ["A4"]],
  ["s3", "c5", "Scrub Kopi Body Care 200g", 69000, 59000, ["Original", "Vanilla"]],
];

// Deterministic pseudo random so demo data is identical on server & client.
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

const BASE_DATE = new Date("2026-10-15T08:00:00Z").getTime();
const day = 86400000;

export function buildSeed(): DB {
  const r = rng(42);
  const products: Product[] = raw.map(([storeId, categoryId, name, base, disc, vars, flash], i) => {
    const price = disc ?? base;
    return {
      id: `p${i + 1}`, storeId, categoryId, name,
      description: `${name} — kualitas terbaik dari ${stores.find((s) => s.id === storeId)!.name}. Dikemas aman, siap kirim dari ${stores.find((s) => s.id === storeId)!.city}.`,
      basePrice: base, discountPrice: disc,
      variants: vars.map((v, j) => ({ id: `p${i + 1}v${j + 1}`, name: v, sku: `SKU-${i + 1}-${j + 1}`, price, stock: i % 7 === 3 && j === 0 ? 0 : Math.floor(r() * 40) + (j === 0 ? 2 : 8) })),
      active: true, createdAt: new Date(BASE_DATE - (raw.length - i) * 3 * day).toISOString(),
      sold: 0, rating: 0, reviewCount: 0, flashSale: flash,
    };
  });

  // Demo orders spread over 60 days; analytics are computed from these.
  const orders: Order[] = [];
  const groups: DB["groups"] = [];
  const statuses: OrderStatus[] = ["completed", "completed", "completed", "completed", "delivered", "shipped", "packing", "to_process", "awaiting_payment", "cancelled", "refunded"];
  for (let n = 0; n < 140; n++) {
    const p = products[Math.floor(r() * products.length)];
    const v = p.variants[Math.floor(r() * p.variants.length)];
    const qty = 1 + Math.floor(r() * 3);
    const daysAgo = Math.floor(r() * 60);
    let status = statuses[Math.floor(r() * statuses.length)];
    if (daysAgo > 14 && !["cancelled", "refunded"].includes(status)) status = "completed";
    const subtotal = v.price * qty;
    const store = stores.find((s) => s.id === p.storeId)!;
    const discount = Math.round((subtotal * store.voucherBps) / 10000);
    const created = new Date(BASE_DATE - daysAgo * day - Math.floor(r() * 10) * 3600000).toISOString();
    const id = `ORD-DEMO-${String(n + 1).padStart(4, "0")}`;
    const gid = `CHK-DEMO-${String(n + 1).padStart(4, "0")}`;
    orders.push({
      id, groupId: gid, storeId: p.storeId, buyerId: n % 3 === 0 ? "u1" : "u7",
      items: [{ productId: p.id, variantId: v.id, name: p.name, variantName: v.name, sku: v.sku, price: v.price, qty }],
      subtotal, discount, shipping: 12000, shippingService: "Reguler (SIMULASI)",
      commission: commissionFor(subtotal, discount, 500), commissionBps: 500,
      status, createdAt: created, resi: ["shipped", "delivered", "completed"].includes(status) ? `SIM${100000 + n}` : undefined,
      addressText: "Jl. Melati No. 12, Bandung 40115", history: [{ status, at: created }],
    });
    groups.push({ id: gid, buyerId: n % 3 === 0 ? "u1" : "u7", orderIds: [id], total: subtotal - discount + 12000 + 1000, serviceFee: 1000, createdAt: created,
      payment: { method: "Virtual Account BCA (SIMULASI)", status: status === "awaiting_payment" ? "pending" : status === "cancelled" ? "expired" : "paid", ref: `PAY-${gid}`, expiresAt: new Date(new Date(created).getTime() + day).toISOString(), events: [] } });
    if (!["awaiting_payment", "cancelled"].includes(status)) p.sold += qty;
  }

  const reviewTexts = ["Barang sesuai deskripsi, pengiriman cepat!", "Kualitas bagus, penjual responsif.", "Mantap, akan beli lagi.", "Cukup baik, packing rapi.", "Sangat puas, recommended!"];
  const reviews: DB["reviews"] = orders.filter((o) => o.status === "completed").slice(0, 60).map((o, i) => ({
    id: `r${i + 1}`, productId: o.items[0].productId, orderId: o.id, userName: o.buyerId === "u1" ? "Rina A." : "Dimas P.",
    rating: 3 + Math.floor(r() * 3), text: reviewTexts[i % reviewTexts.length], createdAt: o.createdAt,
  }));
  for (const p of products) {
    const rs = reviews.filter((x) => x.productId === p.id);
    p.reviewCount = rs.length;
    p.rating = rs.length ? Math.round((rs.reduce((a, x) => a + x.rating, 0) / rs.length) * 10) / 10 : 0;
  }

  return {
    version: 1,
    currentUserId: null,
    users: [
      { id: "u1", name: "Rina Andriani", email: "pembeli@demo.local", roles: ["buyer"], active: true },
      { id: "u2", name: "Budi Santoso", email: "penjual@demo.local", roles: ["buyer", "seller"], storeId: "s1", active: true },
      { id: "u3", name: "Sari Wijaya", email: "gadget@demo.local", roles: ["buyer", "seller"], storeId: "s2", active: true },
      { id: "u4", name: "Agus Prasetyo", email: "kopi@demo.local", roles: ["buyer", "seller"], storeId: "s3", active: true },
      { id: "u5", name: "Maya Lestari", email: "rumah@demo.local", roles: ["buyer", "seller"], storeId: "s4", active: true },
      { id: "u6", name: "Dewi Kartika", email: "glow@demo.local", roles: ["buyer", "seller"], storeId: "s5", active: true },
      { id: "u7", name: "Dimas Pratama", email: "dimas@demo.local", roles: ["buyer"], active: true },
      { id: "u9", name: "Admin Pasarku", email: "admin@demo.local", roles: ["admin"], active: true },
    ],
    addresses: [
      { id: "a1", userId: "u1", label: "Rumah", recipient: "Rina Andriani", phone: "0812-0000-1111", line: "Jl. Melati No. 12", city: "Bandung", postal: "40115", isDefault: true },
      { id: "a2", userId: "u1", label: "Kantor", recipient: "Rina Andriani", phone: "0812-0000-1111", line: "Jl. Asia Afrika No. 8", city: "Bandung", postal: "40111", isDefault: false },
    ],
    categories, stores, products, orders, groups,
    payouts: [
      { id: "PO-DEMO-1", storeId: "s1", amount: 500000, status: "paid", createdAt: new Date(BASE_DATE - 20 * day).toISOString(), bank: "BCA •••• 4521" },
      { id: "PO-DEMO-2", storeId: "s1", amount: 300000, status: "requested", createdAt: new Date(BASE_DATE - 2 * day).toISOString(), bank: "BCA •••• 4521" },
    ],
    reviews,
    notifications: [{ id: "n1", userId: "u1", text: "Selamat datang di Pasarku! Ini adalah mode demo.", at: new Date(BASE_DATE).toISOString(), read: false }],
    audit: [],
    carts: {}, wishlist: {}, follows: {},
    settings: { commissionBps: 500, serviceFee: 1000, flashSaleEnabled: true, marketplaceName: "Pasarku" },
  };
}
