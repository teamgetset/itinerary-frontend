import type { Metadata } from "next";
import type { Photo, Seo } from "@/types";
import { siteConfig } from "@/config/site";

/**
 * Full metadata for an indexable page. Next.js replaces nested fields like `openGraph` per segment
 * instead of merging them, so each page gets the complete set here. SEO fields set in the admin win.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  seo,
}: {
  title?: string;
  description: string;
  path: string;
  image?: Photo;
  seo?: Seo;
}): Metadata {
  const pageTitle = seo?.title ?? title;
  const pageDescription = seo?.description ?? description;
  const shareImage = seo?.ogImage ?? image;
  const images = shareImage ? [{ url: shareImage.src, alt: shareImage.alt }] : undefined;
  const shareTitle = seo?.ogTitle ?? pageTitle ?? siteConfig.name;
  const shareDescription = seo?.ogDescription ?? pageDescription;
  return {
    // A custom SEO title is used as written, without the site-name suffix.
    ...(seo?.title ? { title: { absolute: seo.title } } : title && { title }),
    description: pageDescription,
    alternates: { canonical: seo?.canonicalUrl ?? path },
    ...(seo?.noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "en_AE",
      url: path,
      title: shareTitle,
      description: shareDescription,
      images,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: shareDescription, images },
  };
}
