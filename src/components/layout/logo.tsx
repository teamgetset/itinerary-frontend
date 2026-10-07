import Image from "next/image";
import logo from "@/assets/brand/getset-logo.png";
import logoWhite from "@/assets/brand/getset-logo-white.png";

/** The GETSET lockup. Decorative here: the surrounding link carries the accessible name. */
export function Logo({ tone = "default", className = "" }: { tone?: "default" | "white"; className?: string }) {
  return (
    <Image
      src={tone === "white" ? logoWhite : logo}
      alt=""
      width={146}
      height={45}
      loading="eager"
      className={`h-auto w-[7.75rem] md:w-[9.125rem] ${className}`}
    />
  );
}
