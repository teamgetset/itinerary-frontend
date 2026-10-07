/*
 * Templates only remount when their own segment changes, so the root template misses
 * /packages -> /packages/[slug] and package-to-package moves. This one covers them.
 */
export { default } from "../template";
