/**
 * Package photos morph from card to package page only when a package is opened.
 * Without this, photos that appear on two list pages would also fly between them.
 */
export const OPEN_PACKAGE = "package-open";

/** `share` value for the photo's <ViewTransition>: the morph class for package opens, nothing otherwise. */
export const OPEN_PACKAGE_MORPH = { [OPEN_PACKAGE]: "package-photo", default: "none" };
