"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Scroll-triggered fade-in.
 *
 * Bezpečnostní principy (UX vlna 1, bod C):
 * - Bez JavaScriptu je obsah VIDITELNÝ. Třída pro skrytí se přidává
 *   až skriptem, ne naopak.
 * - Prvek, který je při načtení už v obraze (nebo do 200 px pod ním),
 *   se vůbec neskrývá - žádný bílý mezistav po skoku na kotvu.
 * - Observer má rootMargin 200 px, obsah se objeví dřív, než vjede do obrazu.
 * - prefers-reduced-motion: žádná animace.
 */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const MARGIN = 200;
    const rect = node.getBoundingClientRect();
    const alreadyNear = rect.top < window.innerHeight + MARGIN && rect.bottom > -MARGIN;
    if (alreadyNear) return; // je v obraze nebo těsně pod ním - nechat viditelné

    node.classList.add("reveal-hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => {
              entry.target.classList.remove("reveal-hidden");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: `${MARGIN}px 0px ${MARGIN}px 0px` }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      node.classList.remove("reveal-hidden");
    };
  }, [delay]);

  const Component = Tag as any;
  return (
    <Component ref={ref} className={cn("reveal", className)}>
      {children}
    </Component>
  );
}
