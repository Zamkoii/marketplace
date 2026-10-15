// All money is stored as integer Rupiah to avoid floating-point errors.
export type Rupiah = number;

export function formatRupiah(v: Rupiah): string {
  return "Rp" + Math.round(v).toLocaleString("id-ID");
}

/** Percentage in basis points (500 = 5%). Rounded half-up to whole Rupiah. */
export function percentOf(amount: Rupiah, bps: number): Rupiah {
  return Math.round((amount * bps) / 10000);
}
