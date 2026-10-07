"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { signIn, type SignInState } from "@/app/account/actions";
import { button } from "@/components/ui/button";

const inputClass =
  "leaf-sm h-12 w-full bg-paper px-4 text-ink ring-1 ring-edge transition-shadow outline-none placeholder:text-muted focus:ring-2 focus:ring-cobalt aria-invalid:ring-2 aria-invalid:ring-danger";

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { status: "idle" });

  return (
    <form action={action} noValidate className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-navy">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={state.errors?.email ? true : undefined}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          className={inputClass}
        />
        {state.errors?.email && (
          <p id="email-error" role="alert" className="text-sm text-danger">
            {state.errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-navy">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={state.errors?.password ? true : undefined}
          aria-describedby={state.errors?.password ? "password-error" : undefined}
          className={inputClass}
        />
        {state.errors?.password && (
          <p id="password-error" role="alert" className="text-sm text-danger">
            {state.errors.password}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className={button({ variant: "secondary", size: "lg", className: "w-full" })}>
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div role="status">
        {state.status === "unavailable" && (
          <p className="leaf-sm flex gap-3 bg-frost p-4 text-sm leading-relaxed text-ink">
            <Info aria-hidden weight="bold" className="mt-0.5 size-5 shrink-0 text-cobalt" />
            <span>
              Online accounts are not open yet. Your <Link href="/wishlist" className="font-semibold text-cobalt underline underline-offset-2">wishlist</Link> is
              already saved on this device, and our team can email your trip documents.
            </span>
          </p>
        )}
      </div>
    </form>
  );
}
