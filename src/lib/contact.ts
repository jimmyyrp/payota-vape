export const CONTACT = {
  whatsappNumber: "6282285399815",
  whatsappDisplay: "+62 822-8539-9815",
  whatsappUrl: "https://wa.me/6282285399815",
  instagramHandle: "payotavapesolok",
  instagramUrl: "https://instagram.com/payotavapesolok",
  mapsUrl: "https://maps.app.goo.gl/YFNhkDtyGDGFZy9R9",
  mapsLabel: "Solok, Sumatera Barat",
  openLabel: "Setiap Hari",
  openTime: "11.00 – 23.00 WIB",
};

export function whatsappUrlWithMessage(message: string): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}