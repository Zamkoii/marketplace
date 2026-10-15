// Payment provider interface. Midtrans/Xendit adapters plug in here later; the
// webhook must verify signature server-side and be idempotent per event id.
export const PAYMENT_METHODS = [
  "Virtual Account BCA (SIMULASI)",
  "Virtual Account Mandiri (SIMULASI)",
  "QRIS (SIMULASI)",
  "E-Wallet (SIMULASI)",
];
