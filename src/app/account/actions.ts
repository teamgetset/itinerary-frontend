"use server";

export type SignInState = {
  status: "idle" | "invalid" | "unavailable";
  email?: string;
  errors?: { email?: string; password?: string };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: SignInState["errors"] = {};
  // Length check first: the pattern backtracks quadratically on long hostile input.
  if (email.length > 254 || !EMAIL.test(email)) errors.email = "Enter an email address like name@example.com.";
  if (!password) errors.password = "Enter your password.";
  if (errors.email || errors.password) return { status: "invalid", email: email.slice(0, 254), errors };

  // ponytail: accounts are not live yet; call the auth service here once the backend lands.
  return { status: "unavailable", email };
}
