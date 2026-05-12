"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
}

export function CopyButton({
  text,
  label = "Kopírovat",
  copiedLabel = "Zkopírováno",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback pro starší prohlížeče
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Skutečně nepodporováno — nic neděláme
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold rounded-md px-2.5 py-1.5 border transition-all min-h-[36px] touch-manipulation
        ${copied
          ? "bg-teal-50 text-teal-600 border-teal-300"
          : "bg-white text-teal-500 border-teal-400/30 hover:border-teal-400 hover:bg-teal-50/50"}`}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden />
          {label}
        </>
      )}
    </button>
  );
}
