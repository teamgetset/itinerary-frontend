import { cache } from "react";
import type { Testimonial } from "@/types";
import { fetchApi } from "@/lib/api";
import { toTestimonial, type TestimonialDto } from "@/lib/mappers";

/** Published reviews in the admin's order. Fifty is plenty for the carousel. */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const result = await fetchApi<TestimonialDto[]>("/testimonials?pageSize=50", { tags: ["testimonials"] });
  return (result?.data ?? []).map(toTestimonial);
});
