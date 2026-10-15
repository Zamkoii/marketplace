// MOCK SHIPPING PROVIDER — ongkir & tracking di sini SIMULASI, bukan dari kurir asli.
// Ganti dengan adapter Biteship/RajaOngkir saat integrasi asli tersedia.
export interface ShippingOption { id: string; name: string; price: number; eta: string }

export function quoteShipping(originCity: string, destCity: string): ShippingOption[] {
  const same = originCity.toLowerCase() === destCity.toLowerCase();
  const base = same ? 9000 : 15000 + ((originCity.length + destCity.length) % 5) * 2000;
  return [
    { id: "reg", name: "Reguler (SIMULASI)", price: base, eta: same ? "1-2 hari" : "2-4 hari" },
    { id: "exp", name: "Express (SIMULASI)", price: base + 12000, eta: "1 hari" },
    { id: "eco", name: "Hemat (SIMULASI)", price: Math.max(7000, base - 4000), eta: "4-7 hari" },
  ];
}

export function mockTracking(status: string, resi?: string) {
  if (!resi) return [];
  const steps = ["Paket diterima kurir", "Paket di gudang transit", "Paket dibawa kurir ke alamat", "Paket diterima"];
  const n = status === "shipped" ? 2 : 4;
  return steps.slice(0, n).map((s) => `[SIMULASI] ${s}`);
}
