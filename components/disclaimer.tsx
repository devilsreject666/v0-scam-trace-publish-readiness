"use client";

import { Shield } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`text-xs text-muted-foreground max-w-3xl mx-auto text-center ${className}`}
    >
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Shield className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Legal Disclaimer
        </span>
      </div>
      <p>
        ScamTrace provides transaction monitoring and forensic documentation
        tools. We do not guarantee recovery of funds, prevent losses, or provide
        legal or financial advice. Blockchain transactions are inherently
        irreversible.
      </p>
      <p className="mt-1.5">
        Our services add time delays for reconsideration, generate evidence, and
        provide reporting tools. We cannot guarantee that funds remain
        recoverable.
      </p>
    </div>
  );
}
