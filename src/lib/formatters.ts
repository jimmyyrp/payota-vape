/**
 * Vape Store - Global Formatters Utility
 * Digunakan untuk standarisasi tampilan angka dan harga di seluruh aplikasi.
 */

/**
 * Memformat angka menjadi ringkas (e.g. 1500 -> 1,5 rb, 1000000 -> 1 jt)
 */
export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(num || 0);
};

/**
 * Memformat angka dengan pemisah ribuan tanpa pembulatan (e.g. 1234 -> "1.234")
 */
export const formatFullNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
};

/**
 * Memformat angka menjadi mata uang Rupiah tanpa desimal.
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price || 0);
};

/**
 * Memformat harga menjadi rentang bila price_max lebih besar dari price.
 * Contoh: 200000 & 350000 -> "Rp 200 rb - Rp 350 rb"
 */
export const formatPriceRange = (price: number, priceMax?: number | null): string => {
  const min = Number(price) || 0;
  const max = Number(priceMax) || 0;
  if (max > 0 && max > min) {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }
  return formatPrice(min);
};

/**
 * Versi ringkas untuk kartu/tabel: "Rp 200 rb - 350 rb".
 */
export const formatPriceRangeCompact = (price: number, priceMax?: number | null): string => {
  const min = Number(price) || 0;
  const max = Number(priceMax) || 0;
  if (max > 0 && max > min) {
    return `Rp ${formatCompactPrice(min)} - ${formatCompactPrice(max)}`;
  }
  return `Rp ${formatCompactPrice(min)}`;
};

function formatCompactPrice(value: number): string {
  if (value >= 1_000_000) {
    const jt = value / 1_000_000;
    return `${jt % 1 === 0 ? jt : jt.toFixed(1)} jt`;
  }
  if (value >= 1_000) {
    const rb = value / 1_000;
    return `${rb % 1 === 0 ? rb : rb.toFixed(1)} rb`;
  }
  return String(value);
}