import { cache } from "react";
import type { Testimonial } from "@/types";
import { fetchApi, orEmpty } from "@/lib/api";
import { toTestimonial, type TestimonialDto } from "@/lib/mappers";

/** Published reviews in the admin's order. Fifty is plenty for the carousel. */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const read = fetchApi<TestimonialDto[]>("/testimonials?pageSize=50", { tags: ["testimonials"] }).then((result) => result?.data ?? []);
  return (await orEmpty(read, "testimonials")).map(toTestimonial);
});
