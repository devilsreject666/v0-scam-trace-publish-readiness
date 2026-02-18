import { Shield } from 'lucide-react';

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`text-xs text-slate-500 max-w-3xl mx-auto text-center ${className}`}>
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Shield className="h-3 w-3 text-slate-600" />
        <span className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">Legal Disclaimer</span>
      </div>
      <p>
        ScamTrace provides informational tools only. We do not offer financial, legal, or recovery services.
        Blockchain transactions are irreversible. Use of this platform does not guarantee outcomes.
      </p>
    </div>
  );
}
