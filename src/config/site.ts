/*
 * Fixed brand facts used in metadata. Everything an admin can change (navigation, contacts, social links,
 * homepage copy) comes from the API's site content instead.
 */
export const siteConfig = {
  name: "GETSET Tours & Travels",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://teamgetset.com",
  description:
    "Handpicked international holiday packages from our teams in Dubai and Calicut, each with a day-by-day itinerary you can download.",
} as const;

/** WhatsApp deep link with an optional prefilled message. `number` is digits with country code. */
export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
