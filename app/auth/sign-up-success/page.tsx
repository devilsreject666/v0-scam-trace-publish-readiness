import Link from "next/link";
import { Shield, CheckCircle2, Mail } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background grid-bg p-6">
      <div className="w-full max-w-md">
        <div className="glass-card-premium rounded-2xl overflow-hidden p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-green/10 border border-cyber-green/20">
              <CheckCircle2 className="h-8 w-8 text-cyber-green" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Account Created
          </h1>
          <p className="mt-3 text-sm text-muted max-w-sm mx-auto">
            Check your email to confirm your account before signing in. The
            confirmation link will redirect you to your dashboard.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-3 text-sm text-cyber-green">
            <Mail className="h-4 w-4" />
            Confirmation email sent
          </div>

          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-xl border border-border bg-white/5 px-6 py-3 text-sm font-medium text-foreground hover:bg-white/10 transition"
          >
            Back to Sign In
          </Link>

          <div className="mt-8 flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-cyber-green/60" />
            <span className="text-xs text-muted-foreground">
              ScamTrace - End-to-end encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
