import { Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import type { Branch } from "@/types";
import { whatsappLink } from "@/config/site";
import { button, type ButtonVariant } from "@/components/ui/button";

/** Contacts the branch that sells the trip: WhatsApp where the branch has it, otherwise a phone call. */
export function EnquiryButton({
  branch,
  message,
  variant = "outline",
  className = "",
}: {
  branch: Branch;
  message: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  if (branch.whatsapp) {
    return (
      <a
        href={whatsappLink(branch.whatsapp, message)}
        target="_blank"
        rel="noreferrer"
        className={button({ variant, className })}
      >
        <WhatsappLogo aria-hidden weight="bold" className="size-5" />
        {/* Shorter on phones so it fits beside share and save; the full label stays for screen readers. */}
        <span>
          <span className="max-sm:sr-only">Chat on </span>WhatsApp
        </span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className={button({ variant, className })}>
      <Phone aria-hidden weight="bold" className="size-5" />
      Call the office
      <span className="sr-only">in {branch.name}</span>
    </a>
  );
}
