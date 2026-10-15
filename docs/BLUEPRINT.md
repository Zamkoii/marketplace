# Blueprint Marketplace Multi-Vendor ("Pasarku" — nama sementara)

## 0. Penyesuaian Stack (penting)
Platform ini menjalankan **TanStack Start (React 19 + Vite) di Cloudflare Workers** dengan **Lovable Cloud** (PostgreSQL terkelola + Auth + Storage). Next.js dan Prisma tidak didukung di sini. Padanannya:

| Diminta | Dipakai | Alasan |
|---|---|---|
| Next.js App Router | TanStack Start (file routes, SSR, `createServerFn`) | Framework yang didukung platform; fitur setara (SSR, server functions, API routes) |
| Prisma + PostgreSQL | PostgreSQL Lovable Cloud + migrasi SQL + tipe TS ter-generate | Prisma tidak berjalan baik di Workers; SQL migration + RLS memberi keamanan di level DB |
| Auth email/password | Lovable Cloud Auth (bcrypt, JWT, reset password) | Hashing & sesi aman tanpa implementasi manual |
| Object storage | Lovable Cloud Storage (bucket `product-images`, `store-assets`) | Kebijakan akses per pemilik |
| Tailwind, shadcn/ui, Zod, RHF, Recharts, Lucide | Sama | — |
| Midtrans / Xendit | Adapter `PaymentProvider` + webhook di `/api/public/payments/*` | Ganti provider tanpa ubah logika bisnis |
| Agregator kurir (Biteship/RajaOngkir) | Adapter `ShippingProvider` + `MockShippingProvider` berlabel "SIMULASI" | Tidak memalsukan ongkir asli |

## 1. Arsitektur
```text
Browser (Storefront / Seller Center / Admin Console)
   │  createServerFn (RPC, bearer token)        Webhook gateway / kurir
   ▼                                              ▼
TanStack Start server (Workers) ── services/ ── /api/public/* (verifikasi signature)
   │  supabase client (RLS sebagai user)   │ admin client (hanya setelah cek role)
   ▼                                        ▼
PostgreSQL: tabel + RLS + fungsi SQL transaksional (checkout, stok, ledger)
```
Prinsip: harga, total, komisi, dan stok **selalu dihitung di server/fungsi SQL**. Frontend tidak dipercaya.

## 2. Alur Pengguna
```text
Pembeli: Daftar → Cari/Filter → Detail → Keranjang (multi-toko) → Checkout
  → pilih alamat & kurir per toko → checkout_group + order per toko (stok direservasi)
  → Payment (pending) → webhook paid → order "perlu diproses"
  → Seller kemas → input resi → shipped → delivered → buyer konfirmasi → completed → ulasan
Penjual: Daftar → Ajukan toko → Admin verifikasi → Kelola produk/pesanan → Saldo → Payout
Admin: Verifikasi toko, moderasi, komisi, payout, sengketa, audit log
```

## 3. ERD (ringkas)
```text
auth.users 1─1 profiles          user_roles (user_id, role: buyer|seller|admin)
profiles 1─* addresses
stores (owner_id) 1─* store_members, products, promotions, vouchers(store)
categories (parent_id self)  1─* products
products 1─* product_images, product_variants (sku, price, discount_price, stock, reserved)
carts 1─* cart_items → product_variants
wishlists (user, product)   store_follows (user, store)
checkout_groups 1─* orders (per toko) 1─* order_items (snapshot nama/sku/harga)
checkout_groups 1─* payments 1─* payment_events (provider_event_id UNIQUE → idempoten)
orders 1─1 shipments 1─* shipment_events
orders 1─* order_status_history
order_items 1─0..1 reviews
orders 1─* refunds        commissions (order_id, rate, amount)
seller_ledger (store_id, type: credit_pending|release|commission|refund|payout, amount)
payouts (store_id, bank_account_id, status)   bank_accounts (nomor ter-masking)
notifications, conversations 1─* messages, audit_logs, platform_settings, banners
```
Uang: `numeric(14,2)` (Rupiah). Constraint: `stock >= 0`, `reserved >= 0`, `amount >= 0`.

## 4. Status
- Order: `awaiting_payment → to_process → packing → shipped → delivered → completed`; cabang `cancelled`, `return_requested → refunded`.
- Payment: `pending | paid | failed | expired | refunded`.
- Payout: `requested → approved → paid | rejected`.
Transisi divalidasi fungsi `can_transition(from,to,role)` — diuji unit test.

## 5. Keuangan
- Saat `paid`: ledger `credit_pending` = subtotal − diskon toko; `commission` = subtotal × rate (dari `platform_settings`).
- Saat `completed` (+ masa tahan N hari): `release` → saldo tersedia.
- Refund: ledger negatif. Payout hanya ≤ saldo tersedia, dikunci transaksi.
- Omzet ≠ pendapatan bersih ≠ saldo tersedia ≠ saldo tertahan (ditampilkan terpisah).

## 6. Route
Publik: `/`, `/kategori/$slug`, `/cari`, `/produk/$slug`, `/toko/$slug`, `/bantuan`, `/kebijakan`, `/auth`
Pembeli (`_authenticated`): `/keranjang`, `/checkout`, `/bayar/$id`, `/pesanan`, `/pesanan/$id`, `/wishlist`, `/akun`, `/akun/alamat`, `/notifikasi`
Penjual: `/seller` (dashboard), `/seller/produk`, `/seller/produk/baru`, `/seller/pesanan`, `/seller/pengiriman`, `/seller/promo`, `/seller/ulasan`, `/seller/pelanggan`, `/seller/keuangan`, `/seller/pencairan`, `/seller/analitik`, `/seller/pengaturan`
Admin: `/admin`, `/admin/toko`, `/admin/pengguna`, `/admin/kategori`, `/admin/produk`, `/admin/pesanan`, `/admin/pembayaran`, `/admin/payout`, `/admin/konten`, `/admin/voucher`, `/admin/sengketa`, `/admin/pengaturan`, `/admin/audit`
Webhook: `/api/public/payments/midtrans`, `/api/public/payments/xendit`, `/api/public/shipping/webhook`

## 7. Server functions (per modul `src/features/*/*.functions.ts`)
catalog: listProducts, getProduct, getStore · cart: add/update/remove · checkout: quote, placeOrder (RPC SQL transaksional) · payment: createPayment, getPaymentStatus · orders: listMyOrders, confirmReceived, requestCancel/Return · seller: CRUD produk, updateOrderStatus, inputResi, stats(range) · finance: getBalance, requestPayout · admin: approveStore, setCommission, processPayout, moderate · reviews, notifications, chat.

## 8. Keamanan
RLS di setiap tabel (seller hanya `store_id` miliknya via `is_store_member()`), roles di tabel terpisah + `has_role()` security definer, Zod di setiap input, signature webhook (Midtrans SHA512, Xendit callback token), idempotensi via UNIQUE event id, rate limit tabel `rate_limits` untuk login/checkout, upload: tipe MIME & ukuran dibatasi, path per user, audit_logs untuk aksi admin/finansial, secret via environment, pesan error generik ke klien.

## 9. Struktur Folder
```text
src/routes/            halaman & layout (storefront, seller., admin., api/public)
src/components/ui/     shadcn
src/components/{store,seller,admin}/  komponen per area (desain berbeda)
src/features/<modul>/  *.functions.ts, *.server.ts, schemas.ts, components/
src/lib/domain/        logika murni: pricing, commission, order-status, ledger (diuji)
src/lib/integrations/  payment/{midtrans,xendit,mock}.ts, shipping/{biteship,mock}.ts
supabase/migrations/   skema SQL + seed demo (flag is_demo)
src/test/              unit & integrasi
```

## 10. Asumsi
Mata uang IDR; komisi default 5% (dapat diubah admin); masa tahan dana 3 hari setelah selesai; reservasi stok saat checkout, dilepas jika kedaluwarsa 24 jam; data demo ditandai `is_demo = true`; akun demo dibuat lewat pendaftaran biasa lalu role diberikan admin (tidak ada password di kode).
