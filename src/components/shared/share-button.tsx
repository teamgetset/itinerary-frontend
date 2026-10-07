"use client";

import { useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react/dist/ssr";

/** Opens the device share sheet where there is one; otherwise copies the page link. */
export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissed by the user: nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address bar still has the link.
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-label={`Share ${title}`}
        className={`grid size-12 shrink-0 place-items-center rounded-full border border-line bg-paper text-navy transition-colors duration-300 hover:border-navy/40 ${className}`}
      >
        {copied ? <Check aria-hidden weight="bold" className="size-5" /> : <ShareNetwork aria-hidden weight="bold" className="size-5" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </>
  );
}
