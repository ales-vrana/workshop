import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "on-dark";
  className?: string;
  children: React.ReactNode;
  /**
   * Otevřít v novém okně. Výchozí: automaticky podle odkazu -
   * kotvy (#terminy) a interní cesty (/dekujeme) se otevírají ve stejném
   * okně, externí adresy (https://…) v novém.
   */
  external?: boolean;
  ariaLabel?: string;
  id?: string;
}

function isInternalHref(href: string): boolean {
  return href.startsWith("#") || href.startsWith("/");
}

export function CTAButton({
  href,
  variant = "primary",
  className,
  children,
  external,
  ariaLabel,
  id,
}: CTAButtonProps) {
  const opensNewWindow = external ?? !isInternalHref(href);

  const classes = {
    primary: "btn-primary group",
    secondary: "btn-secondary group",
    "on-dark": "btn-on-dark group",
  }[variant];

  const label =
    ariaLabel ?? (typeof children === "string" ? children : undefined);
  const labelWithSuffix =
    label && opensNewWindow ? `${label} (otevře se v novém okně)` : label;

  return (
    <a
      id={id}
      href={href}
      target={opensNewWindow ? "_blank" : undefined}
      rel={opensNewWindow ? "noopener noreferrer" : undefined}
      aria-label={labelWithSuffix}
      className={cn(classes, className)}
    >
      <span>{children}</span>
      <ArrowRight
        className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden
      />
    </a>
  );
}
