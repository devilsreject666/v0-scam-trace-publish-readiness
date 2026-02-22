import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background grid-bg p-6">
      <div className="w-full max-w-md">
        <div className="glass-card-premium rounded-2xl overflow-hidden p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Authentication Error
          </h1>
          <p className="mt-3 text-sm text-muted">
            Something went wrong during authentication. Please try again.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue px-6 py-3 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
