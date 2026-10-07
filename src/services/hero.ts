import { cache } from "react";
import type { HeroSlide } from "@/components/hero/hero-slideshow";
import { fetchApi, orEmpty } from "@/lib/api";
import { photo, type ImageDto } from "@/lib/mappers";

interface SlideDto {
  title: string;
  label: string | null;
  image: ImageDto | null;
  buttonLink: string | null;
}

/** Published homepage carousel slides, in order. */
export const getHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  const read = fetchApi<SlideDto[]>("/hero-slides", { tags: ["hero"] }).then((result) => result?.data ?? []);
  return (await orEmpty(read, "hero slides")).flatMap((slide) =>
    slide.image ? [{ photo: photo(slide.image), code: slide.label ?? "", title: slide.title, href: slide.buttonLink ?? "#branches" }] : [],
  );
});
