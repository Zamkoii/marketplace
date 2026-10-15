// Penyimpanan lokal di browser (tanpa database). Semua aturan bisnis tetap
// dijalankan lewat fungsi domain agar mudah dipindah ke server nanti.
import { useSyncExternalStore } from "react";
import type { DB, Order, Role, Product } from "./types";
import { buildSeed } from "./seed";
import { quoteCheckout, commissionFor } from "@/lib/domain/pricing";
import { canTransition, type Actor, type OrderStatus } from "@/lib/domain/order-status";
import { computeStoreFinance, validatePayout } from "@/lib/domain/finance";
import { quoteShipping } from "@/lib/integrations/shipping";

const KEY = "pasarku-demo-db-v1";
const seed = buildSeed();
let state: DB = seed;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const s = localStorage.getItem(KEY);
    if (s) state = JSON.parse(s);
  } catch { /* ignore */ }
}
function commit(next: DB) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
function mutate(fn: (d: DB) => void) {
  load();
  const draft: DB = structuredClone(state);
  fn(draft);
  commit(draft);
}

export function useDB<T>(sel: (d: DB) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => { load(); return sel(state); },
    () => sel(seed),
  );
}
export function getDB() { load(); return state; }

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1e4)}`;
function audit(d: DB, action: string) {
  const u = d.users.find((x) => x.id === d.currentUserId);
  d.audit.unshift({ id: uid("AL"), actor: u?.name ?? "Sistem", action, at: now() });
}
function notify(d: DB, userId: string, text: string) {
  d.notifications.unshift({ id: uid("N"), userId, text, at: now(), read: false });
}
function requireUser(d: DB, role?: Role) {
  const u = d.users.find((x) => x.id === d.currentUserId);
  if (!u) throw new Error("Silakan masuk terlebih dahulu");
  if (!u.active) throw new Error("Akun dinonaktifkan");
  if (role && !u.roles.includes(role)) throw new Error("Akses ditolak");
  return u;
}

export const effectivePrice = (p: Product) => p.discountPrice ?? p.basePrice;

export const actions = {
  resetDemo() { commit(buildSeed()); },
  login(userId: string) { mutate((d) => { d.currentUserId = userId; }); },
  logout() { mutate((d) => { d.currentUserId = null; }); },
  register(name: string, email: string) {
    let id = "";
    mutate((d) => {
      if (d.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email sudah terdaftar");
      id = uid("U");
      d.users.push({ id, name, email, roles: ["buyer"], active: true });
      d.currentUserId = id;
    });
    return id;
  },
  updateProfile(name: string) { mutate((d) => { requireUser(d).name = name; }); },

  addAddress(a: Omit<DB["addresses"][number], "id" | "userId" | "isDefault">) {
    mutate((d) => {
      const u = requireUser(d);
      const first = !d.addresses.some((x) => x.userId === u.id);
      d.addresses.push({ ...a, id: uid("A"), userId: u.id, isDefault: first });
    });
  },
  setDefaultAddress(id: string) {
    mutate((d) => { const u = requireUser(d); d.addresses.forEach((a) => { if (a.userId === u.id) a.isDefault = a.id === id; }); });
  },
  deleteAddress(id: string) {
    mutate((d) => { const u = requireUser(d); d.addresses = d.addresses.filter((a) => !(a.id === id && a.userId === u.id)); });
  },

  addToCart(productId: string, variantId: string, qty: number) {
    mutate((d) => {
      const u = requireUser(d);
      const p = d.products.find((x) => x.id === productId);
      const v = p?.variants.find((x) => x.id === variantId);
      if (!p || !v || !p.active) throw new Error("Produk tidak tersedia");
      const cart = (d.carts[u.id] ??= []);
      const line = cart.find((l) => l.variantId === variantId);
      const newQty = (line?.qty ?? 0) + qty;
      if (newQty > v.stock) throw new Error(`Stok tersisa ${v.stock}`);
      if (line) line.qty = newQty; else cart.push({ productId, variantId, qty, selected: true });
    });
  },
  setCartQty(variantId: string, qty: number) {
    mutate((d) => {
      const u = requireUser(d);
      const cart = d.carts[u.id] ?? [];
      const line = cart.find((l) => l.variantId === variantId);
      if (!line) return;
      const v = d.products.find((p) => p.id === line.productId)?.variants.find((x) => x.id === variantId);
      line.qty = Math.max(1, Math.min(qty, v?.stock ?? 1));
    });
  },
  toggleCartLine(variantId: string, selected: boolean) {
    mutate((d) => { const u = requireUser(d); const l = d.carts[u.id]?.find((x) => x.variantId === variantId); if (l) l.selected = selected; });
  },
  removeCartLine(variantId: string) {
    mutate((d) => { const u = requireUser(d); d.carts[u.id] = (d.carts[u.id] ?? []).filter((l) => l.variantId !== variantId); });
  },
  toggleWishlist(productId: string) {
    mutate((d) => { const u = requireUser(d); const w = (d.wishlist[u.id] ??= []); d.wishlist[u.id] = w.includes(productId) ? w.filter((x) => x !== productId) : [...w, productId]; });
  },
  toggleFollow(storeId: string) {
    mutate((d) => { const u = requireUser(d); const w = (d.follows[u.id] ??= []); d.follows[u.id] = w.includes(storeId) ? w.filter((x) => x !== storeId) : [...w, storeId]; });
  },

  /** Recomputes all prices from the catalog; never trusts prices from the UI. */
  placeOrder(input: { addressId: string; shippingByStore: Record<string, string>; method: string }) {
    let groupId = "";
    mutate((d) => {
      const u = requireUser(d);
      const addr = d.addresses.find((a) => a.id === input.addressId && a.userId === u.id);
      if (!addr) throw new Error("Pilih alamat pengiriman");
      const lines = (d.carts[u.id] ?? []).filter((l) => l.selected);
      if (!lines.length) throw new Error("Keranjang kosong");
      const resolved = lines.map((l) => {
        const p = d.products.find((x) => x.id === l.productId);
        const v = p?.variants.find((x) => x.id === l.variantId);
        const store = d.stores.find((s) => s.id === p?.storeId);
        if (!p || !v || !p.active || store?.status !== "active") throw new Error("Ada produk yang tidak tersedia");
        if (v.stock < l.qty) throw new Error(`Stok ${p.name} (${v.name}) tidak cukup`);
        return { l, p, v, store };
      });
      const shippingCost: Record<string, number> = {};
      const shippingName: Record<string, string> = {};
      for (const { store } of resolved) {
        const opt = quoteShipping(store.city, addr.city).find((o) => o.id === input.shippingByStore[store.id]);
        if (!opt) throw new Error(`Pilih pengiriman untuk ${store.name}`);
        shippingCost[store.id] = opt.price; shippingName[store.id] = opt.name;
      }
      const q = quoteCheckout({
        lines: resolved.map(({ p, v, l }) => ({ storeId: p.storeId, unitPrice: v.price, qty: l.qty })),
        shippingByStore: shippingCost,
        storeDiscountBps: Object.fromEntries(d.stores.map((s) => [s.id, s.voucherBps])),
        serviceFee: d.settings.serviceFee,
      });
      groupId = uid("CHK");
      const created = now();
      const orderIds: string[] = [];
      for (const sq of q.stores) {
        const oid = uid("ORD");
        orderIds.push(oid);
        const items = resolved.filter((x) => x.p.storeId === sq.storeId);
        // Reserve stock at checkout; released again on cancel/expiry.
        items.forEach(({ v, l }) => { v.stock -= l.qty; });
        d.orders.unshift({
          id: oid, groupId, storeId: sq.storeId, buyerId: u.id,
          items: items.map(({ p, v, l }) => ({ productId: p.id, variantId: v.id, name: p.name, variantName: v.name, sku: v.sku, price: v.price, qty: l.qty })),
          subtotal: sq.subtotal, discount: sq.discount, shipping: sq.shipping, shippingService: shippingName[sq.storeId],
          commissionBps: d.settings.commissionBps, commission: commissionFor(sq.subtotal, sq.discount, d.settings.commissionBps),
          status: "awaiting_payment", createdAt: created, addressText: `${addr.recipient}, ${addr.line}, ${addr.city} ${addr.postal}`,
          history: [{ status: "awaiting_payment", at: created }],
        });
      }
      d.groups.unshift({ id: groupId, buyerId: u.id, orderIds, total: q.total, serviceFee: q.serviceFee, createdAt: created,
        payment: { method: input.method, status: "pending", ref: uid("PAY"), expiresAt: new Date(Date.now() + 86400000).toISOString(), events: [] } });
      d.carts[u.id] = (d.carts[u.id] ?? []).filter((l) => !l.selected);
    });
    return groupId;
  },

  /** Simulates the payment gateway webhook. Idempotent per event id. */
  paymentWebhook(groupId: string, eventId: string, result: "paid" | "failed" | "expired") {
    mutate((d) => {
      const g = d.groups.find((x) => x.id === groupId);
      if (!g) throw new Error("Transaksi tidak ditemukan");
      if (g.payment.events.includes(eventId)) return; // duplicate webhook: ignore
      g.payment.events.push(eventId);
      if (g.payment.status !== "pending") return;
      g.payment.status = result;
      for (const o of d.orders.filter((x) => g.orderIds.includes(x.id))) {
        if (result === "paid") {
          moveStatus(d, o, "to_process", "system", "Pembayaran terverifikasi");
          for (const it of o.items) { const p = d.products.find((x) => x.id === it.productId); if (p) p.sold += it.qty; }
          const store = d.stores.find((s) => s.id === o.storeId)!;
          notify(d, store.ownerId, `Pesanan baru ${o.id} perlu diproses`);
        } else {
          moveStatus(d, o, "cancelled", "system", result === "expired" ? "Pembayaran kedaluwarsa" : "Pembayaran gagal");
        }
      }
      notify(d, g.buyerId, result === "paid" ? `Pembayaran ${g.id} berhasil` : `Pembayaran ${g.id} ${result === "failed" ? "gagal" : "kedaluwarsa"}`);
    });
  },

  updateOrderStatus(orderId: string, to: OrderStatus, actor: Actor, extra?: { resi?: string; note?: string }) {
    mutate((d) => {
      const u = requireUser(d);
      const o = d.orders.find((x) => x.id === orderId);
      if (!o) throw new Error("Pesanan tidak ditemukan");
      if (actor === "buyer" && o.buyerId !== u.id) throw new Error("Akses ditolak");
      if (actor === "seller" && u.storeId !== o.storeId) throw new Error("Akses ditolak: bukan pesanan toko Anda");
      if (actor === "admin" && !u.roles.includes("admin")) throw new Error("Akses ditolak");
      if (to === "shipped") {
        if (!extra?.resi?.trim()) throw new Error("Nomor resi wajib diisi");
        o.resi = extra.resi.trim();
      }
      moveStatus(d, o, to, actor, extra?.note);
      notify(d, o.buyerId, `Pesanan ${o.id}: ${to.replace("_", " ")}`);
      if (actor !== "buyer") audit(d, `Ubah status ${o.id} → ${to}`);
    });
  },

  addReview(orderId: string, productId: string, rating: number, text: string) {
    mutate((d) => {
      const u = requireUser(d);
      const o = d.orders.find((x) => x.id === orderId && x.buyerId === u.id);
      if (!o || o.status !== "completed") throw new Error("Ulasan hanya untuk pesanan selesai");
      if (d.reviews.some((r) => r.orderId === orderId && r.productId === productId)) throw new Error("Sudah diulas");
      if (rating < 1 || rating > 5) throw new Error("Rating tidak valid");
      d.reviews.unshift({ id: uid("R"), productId, orderId, userName: u.name, rating, text, createdAt: now() });
      const p = d.products.find((x) => x.id === productId)!;
      const rs = d.reviews.filter((r) => r.productId === productId);
      p.reviewCount = rs.length;
      p.rating = Math.round((rs.reduce((a, r) => a + r.rating, 0) / rs.length) * 10) / 10;
    });
  },
  replyReview(reviewId: string, reply: string) {
    mutate((d) => {
      const u = requireUser(d, "seller");
      const r = d.reviews.find((x) => x.id === reviewId);
      const p = d.products.find((x) => x.id === r?.productId);
      if (!r || p?.storeId !== u.storeId) throw new Error("Akses ditolak");
      r.reply = reply;
    });
  },

  // Seller
  applyStore(name: string, city: string, description: string) {
    mutate((d) => {
      const u = requireUser(d);
      if (u.storeId) throw new Error("Anda sudah memiliki toko");
      const id = uid("S");
      d.stores.push({ id, slug: id.toLowerCase(), name, ownerId: u.id, city, description, status: "pending", rating: 0, voucherBps: 0, joinedAt: now(), featured: false });
      u.storeId = id;
      if (!u.roles.includes("seller")) u.roles.push("seller");
    });
  },
  updateStore(patch: { name: string; city: string; description: string; voucherBps: number }) {
    mutate((d) => {
      const u = requireUser(d, "seller");
      const s = d.stores.find((x) => x.id === u.storeId)!;
      if (patch.voucherBps < 0 || patch.voucherBps > 5000) throw new Error("Diskon toko maksimal 50%");
      Object.assign(s, patch);
    });
  },
  saveProduct(p: Omit<Product, "storeId" | "createdAt" | "sold" | "rating" | "reviewCount"> & { id?: string }) {
    mutate((d) => {
      const u = requireUser(d, "seller");
      if (p.discountPrice != null && p.discountPrice >= p.basePrice) throw new Error("Harga diskon harus lebih kecil dari harga jual");
      const price = p.discountPrice ?? p.basePrice;
      const variants = p.variants.map((v) => ({ ...v, price }));
      if (p.id) {
        const ex = d.products.find((x) => x.id === p.id);
        if (!ex || ex.storeId !== u.storeId) throw new Error("Akses ditolak: produk bukan milik toko Anda");
        Object.assign(ex, { ...p, variants });
      } else {
        d.products.unshift({ ...p, id: uid("P"), variants, storeId: u.storeId!, createdAt: now(), sold: 0, rating: 0, reviewCount: 0 });
      }
    });
  },
  deleteProduct(id: string) {
    mutate((d) => {
      const u = requireUser(d, "seller");
      const ex = d.products.find((x) => x.id === id);
      if (!ex || ex.storeId !== u.storeId) throw new Error("Akses ditolak");
      d.products = d.products.filter((x) => x.id !== id);
    });
  },
  toggleProduct(id: string) {
    mutate((d) => {
      const u = requireUser(d, "seller");
      const ex = d.products.find((x) => x.id === id);
      if (!ex || ex.storeId !== u.storeId) throw new Error("Akses ditolak");
      ex.active = !ex.active;
    });
  },
  requestPayout(amount: number) {
    mutate((d) => {
      const u = requireUser(d, "seller");
      const f = computeStoreFinance(d.orders.filter((o) => o.storeId === u.storeId), d.payouts.filter((p) => p.storeId === u.storeId));
      const err = validatePayout(amount, f.available);
      if (err) throw new Error(err);
      d.payouts.unshift({ id: uid("PO"), storeId: u.storeId!, amount, status: "requested", createdAt: now(), bank: "BCA •••• 4521" });
      audit(d, `Ajukan pencairan Rp${amount}`);
    });
  },

  // Admin
  setStoreStatus(storeId: string, status: DB["stores"][number]["status"]) {
    mutate((d) => { requireUser(d, "admin"); d.stores.find((s) => s.id === storeId)!.status = status; audit(d, `Status toko ${storeId} → ${status}`); });
  },
  setUserActive(userId: string, active: boolean) {
    mutate((d) => { requireUser(d, "admin"); d.users.find((s) => s.id === userId)!.active = active; audit(d, `${active ? "Aktifkan" : "Nonaktifkan"} akun ${userId}`); });
  },
  setPayoutStatus(id: string, status: DB["payouts"][number]["status"]) {
    mutate((d) => { requireUser(d, "admin"); d.payouts.find((p) => p.id === id)!.status = status; audit(d, `Pencairan ${id} → ${status}`); });
  },
  moderateProduct(id: string, active: boolean) {
    mutate((d) => { requireUser(d, "admin"); d.products.find((p) => p.id === id)!.active = active; audit(d, `Moderasi produk ${id} → ${active ? "aktif" : "diturunkan"}`); });
  },
  updateSettings(s: Partial<DB["settings"]>) {
    mutate((d) => {
      requireUser(d, "admin");
      if (s.commissionBps != null && (s.commissionBps < 0 || s.commissionBps > 3000)) throw new Error("Komisi 0–30%");
      Object.assign(d.settings, s);
      audit(d, `Ubah pengaturan: ${JSON.stringify(s)}`);
    });
  },
  addCategory(name: string) {
    mutate((d) => { requireUser(d, "admin"); const id = uid("C"); d.categories.push({ id, slug: name.toLowerCase().replace(/\s+/g, "-"), name, icon: "Tag", art: d.categories.length % 8 }); audit(d, `Tambah kategori ${name}`); });
  },
  markNotificationsRead() {
    mutate((d) => { const u = requireUser(d); d.notifications.forEach((n) => { if (n.userId === u.id) n.read = true; }); });
  },
};

function moveStatus(d: DB, o: Order, to: OrderStatus, actor: Actor, note?: string) {
  if (!canTransition(o.status, to, actor)) throw new Error("Perubahan status tidak diizinkan");
  if (to === "cancelled") {
    for (const it of o.items) {
      const v = d.products.find((p) => p.id === it.productId)?.variants.find((x) => x.id === it.variantId);
      if (v) v.stock += it.qty;
    }
  }
  o.status = to;
  o.history.push({ status: to, at: now(), note });
}
