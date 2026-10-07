import type { Metadata } from "next";
import { SignInForm } from "@/components/account/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="shell grid gap-12 py-12 lg:grid-cols-12 lg:py-20">
      <div className="lg:col-span-5">
        <h1 className="type-display text-[clamp(2.5rem,8vw,4rem)] text-navy">Your account</h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          Sign in to keep your wishlist and trip documents in one place. Online accounts are opening soon.
        </p>
      </div>
      <div className="leaf-lg bg-paper p-6 ring-1 ring-line sm:p-10 lg:col-span-6 lg:col-start-7">
        <SignInForm />
      </div>
    </div>
  );
}
