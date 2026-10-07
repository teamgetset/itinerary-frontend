import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { getSettings } from "@/services/settings";
import { CURRENCY_STORAGE_KEY } from "@/lib/currency";
import { CurrencyProvider } from "@/components/currency/currency";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import "./globals.css";

const mona = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Holiday packages from Dubai and Calicut`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_AE",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f3f6f9",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { currencies, defaultCurrency, content } = await getSettings();
  // Codes are validated by the API (three capitals); filtered again because they go into CSS and a script.
  const codes = currencies.map((currency) => currency.code).filter((code) => /^[A-Z]{3}$/.test(code));
  // Show only the selected currency's prices, and mark its toggle button, from the first paint.
  const currencyCss = codes
    .map(
      (code) =>
        `html:not([data-currency="${code}"]) [data-price="${code}"]{display:none!important}` +
        `html[data-currency="${code}"] [data-currency-option="${code}"]{background:var(--color-navy);color:var(--color-white)}`,
    )
    .join("");
  const restoreCurrency = `try{var c=localStorage.getItem(${JSON.stringify(CURRENCY_STORAGE_KEY)});if(${JSON.stringify(codes)}.indexOf(c)>-1)document.documentElement.dataset.currency=c}catch(e){}`;

  return (
    // The head script may change data-currency before React hydrates.
    <html lang="en" data-scroll-behavior="smooth" data-currency={defaultCurrency} className={mona.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: currencyCss }} />
        <script dangerouslySetInnerHTML={{ __html: restoreCurrency }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <CurrencyProvider currencies={currencies} defaultCurrency={defaultCurrency}>
        <a
          href="#main"
          className="leaf-sm fixed top-3 left-3 z-50 -translate-y-24 bg-navy px-5 py-3 font-semibold text-white transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        {content.testimonials.enabled && <TestimonialsSection />}
        <SiteFooter />
        </CurrencyProvider>
      </body>
    </html>
  );
}
