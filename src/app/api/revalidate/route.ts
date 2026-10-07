import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { CacheTag } from "@/lib/api";

/*
 * Called by the GETSET API after admins change content, so cached pages refresh on their next visit.
 * Protected by REVALIDATE_SECRET (the same value on both sides). Stale pages are never served after this:
 * an unpublished package must disappear immediately.
 */

const TAGS: CacheTag[] = ["catalog", "testimonials", "hero", "content"];

function authorised(header: string | null) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !header) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) {
  if (!authorised(request.headers.get("x-revalidate-secret"))) {
    return Response.json({ success: false, error: { code: "UNAUTHORIZED", message: "Bad secret" } }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is CacheTag => TAGS.includes(tag as CacheTag)) : [];
  if (!tags.length) return Response.json({ success: false, error: { code: "NO_TAGS", message: "Send known tags" } }, { status: 400 });
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ success: true, data: { revalidated: tags } });
}
