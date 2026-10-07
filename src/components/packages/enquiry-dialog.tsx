"use client";

import { useRef, useState } from "react";
import { EnvelopeSimple, X } from "@phosphor-icons/react/dist/ssr";
import { browserApi } from "@/lib/api";
import { describeTravellers } from "@/lib/pricing";
import { button, iconButton } from "@/components/ui/button";
import { activeCurrency, useCurrencies } from "@/components/currency/currency";
import { useTrip } from "./traveller-pricing";

const field = "leaf-xs mt-1.5 block w-full bg-paper px-4 py-3 text-ink ring-1 ring-edge outline-none focus:ring-2 focus:ring-cobalt aria-invalid:ring-danger";

/**
 * "Send an enquiry": name and a way to reply, sent to the branch with the travellers and the
 * estimate in the currency on show. For people who prefer not to use WhatsApp.
 */
export function EnquiryDialog({ packageSlug, packageTitle, branchName }: { packageSlug: string; packageTitle: string; branchName: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { travellers } = useTrip();
  const { defaultCurrency } = useCurrencies();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [sending, setSending] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const submit = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "").trim() || null;
    setSending(true);
    const response = await browserApi<{ received: boolean }>("/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: text("name") ?? "",
        email: text("email"),
        phone: text("phone"),
        whatsapp: data.get("onWhatsapp") ? text("phone") : null,
        travelDate: text("travelDate"),
        message: text("message"),
        website: text("website") ?? undefined,
        packageSlug,
        currency: activeCurrency(defaultCurrency),
        ...travellers,
      }),
    });
    setSending(false);
    if (response.success) {
      setErrors({});
      setStatus({ ok: true, message: `Thank you. Your enquiry is with our ${branchName} office, and they will get back to you.` });
      form.reset();
      return;
    }
    const fieldErrors: Record<string, string> = {};
    for (const detail of response.error.details ?? []) fieldErrors[detail.path] ??= detail.message;
    setErrors(fieldErrors);
    setStatus({ ok: false, message: response.error.message });
  };

  const error = (name: string) =>
    errors[name] ? (
      <span id={`enquiry-${name}-error`} className="mt-1 block text-sm text-danger">
        {errors[name]}
      </span>
    ) : null;
  const invalid = (name: string) => ({ "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `enquiry-${name}-error` : undefined });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatus(null);
          dialog.current?.showModal();
        }}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cobalt underline-offset-4 hover:underline"
      >
        <EnvelopeSimple aria-hidden weight="bold" className="size-4" />
        Prefer email or a call back? Send an enquiry
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="enquiry-title"
        className="leaf-lg m-auto w-[min(34rem,calc(100%-1.5rem))] max-w-none bg-paper p-0 text-ink backdrop:bg-night/45 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 id="enquiry-title" className="type-display text-2xl text-navy">
              Enquire about this trip
            </h2>
            <p className="mt-1 text-sm text-muted">
              {packageTitle}, for {describeTravellers(travellers)}.
            </p>
          </div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className={iconButton}>
            <X aria-hidden weight="bold" className="size-5" />
          </button>
        </div>

        {status?.ok ? (
          <div className="px-6 py-8">
            <p role="status" className="text-lg text-navy">
              {status.message}
            </p>
            <button type="button" onClick={() => dialog.current?.close()} className={button({ className: "mt-6" })}>
              Close
            </button>
          </div>
        ) : (
          <form
            noValidate
            className="space-y-4 px-6 py-6"
            onSubmit={(event) => {
              event.preventDefault();
              submit(event.currentTarget);
            }}
          >
            {status && !status.ok && (
              <p role="alert" className="text-sm text-danger">
                {status.message}
              </p>
            )}
            <label className="block text-sm font-semibold">
              Your name
              <input name="name" autoComplete="name" required className={field} {...invalid("name")} />
              {error("name")}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Phone
                <input name="phone" type="tel" autoComplete="tel" className={field} {...invalid("phone")} />
                {error("phone")}
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input name="email" type="email" autoComplete="email" className={field} {...invalid("email")} />
                {error("email")}
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="onWhatsapp" defaultChecked className="size-4 accent-navy" />
              My phone number is on WhatsApp
            </label>
            <label className="block text-sm font-semibold">
              Travel date (if you know it)
              <input name="travelDate" type="date" min={today} className={field} {...invalid("travelDate")} />
              {error("travelDate")}
            </label>
            <label className="block text-sm font-semibold">
              Anything we should know?
              <textarea name="message" rows={3} className={field} />
            </label>
            {/* Hidden from people; bots fill it in and are quietly ignored. */}
            <label aria-hidden className="absolute -left-[9999px]">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <p className="text-xs text-muted">We use your details only to reply about this trip.</p>
            <button type="submit" disabled={sending} className={button({ className: "w-full" })}>
              {sending ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
