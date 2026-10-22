import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { getSettings } from "@/services/settings";
import { CurrencyProvider } from "@/components/currency/currency";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NotOnPackagePages } from "@/components/testimonials/not-on-package-pages";
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
  const { currencies, content } = await getSettings();

  return (
    <html lang="en" data-scroll-behavior="smooth" className={mona.variable}>
      <body className="flex min-h-dvh flex-col">
        {/* Every price is shown in its package's currency (its branch's); this only carries symbols and grouping. */}
        <CurrencyProvider currencies={currencies}>
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
        {content.testimonials.enabled && (
          <NotOnPackagePages>
            <TestimonialsSection />
          </NotOnPackagePages>
        )}
        <SiteFooter />
        </CurrencyProvider>
      </body>
    </html>
  );
}
