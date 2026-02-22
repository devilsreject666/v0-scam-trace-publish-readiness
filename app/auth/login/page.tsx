"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background grid-bg p-6">
      <div className="w-full max-w-md">
        <div className="glass-card-premium rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 px-8 pt-8 pb-6">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-green to-cyber-blue">
                <Shield className="h-5 w-5 text-dark-900" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-foreground">
                Scam<span className="text-cyber-green">Trace</span>
              </span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">
              Sign in to access your investigation dashboard
            </p>
          </div>

          <div className="px-8 pb-8 pt-6">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="text-xs text-muted block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-dark-900 py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-xs text-muted block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-dark-900 py-3 pl-10 pr-12 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Signing in..." : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {"Don't have an account? "}
              <Link href="/auth/sign-up" className="text-cyber-green hover:underline font-medium">
                Sign up free
              </Link>
            </p>

            <div className="mt-6 flex items-center justify-center gap-4 border-t border-border pt-5">
              {["256-bit SSL", "SOC 2", "GDPR"].map((b) => (
                <div key={b} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock className="h-2.5 w-2.5" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
