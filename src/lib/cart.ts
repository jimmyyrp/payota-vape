import { CONTACT } from "./contact";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: string;
  priceNumber: number;
  art: string;
  tagline: string;
  qty: number;
}

export function parsePrice(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

export function formatIDR(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function buildCheckoutMessage(items: CartItem[]): string {
  const lines = items
    .map(
      (item, i) =>
        `${i + 1}. ${item.name} (${item.category})\n   ${item.qty} × ${formatIDR(item.priceNumber)} = ${formatIDR(item.qty * item.priceNumber)}`
    )
    .join("\n");

  const subtotal = items.reduce((sum, item) => sum + item.priceNumber * item.qty, 0);

  return [
    "Halo PAYOTA, saya ingin memesan:",
    "",
    lines,
    "",
    `Total pesanan: ${formatIDR(subtotal)}`,
    "",
    "Mohon informasi ketersediaan stok dan ongkir ke alamat saya. Terima kasih.",
  ].join("\n");
}

export function checkoutWhatsappUrl(items: CartItem[]): string {
  const text = buildCheckoutMessage(items);
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function singleProductCheckoutUrl(product: {
  id: string;
  name: string;
  category: string;
  price: string;
  art: string;
  tagline: string;
  qty: number;
}): string {
  return checkoutWhatsappUrl([{ ...product, priceNumber: parsePrice(product.price) }]);
}