"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-cyber-green"];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!agreedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
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
            <h1 className="text-xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted">
              Start protecting yourself from crypto fraud
            </p>
          </div>

          <div className="px-8 pb-8 pt-6">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="text-xs text-muted block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-dark-900 py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-xs text-muted block mb-1.5">Email Address</label>
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
                <label htmlFor="password" className="text-xs text-muted block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
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
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : "bg-white/10"}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[10px] ${strength >= 3 ? "text-cyber-green" : strength >= 2 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {strength > 0 ? strengthLabels[strength - 1] : "Too short"}
                    </span>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-dark-900 accent-cyber-green h-3.5 w-3.5"
                />
                <span className="text-xs text-muted">
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-cyber-green">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-cyber-green">
                    Privacy Policy
                  </Link>
                  . My data is encrypted end-to-end.
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Creating account..." : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cyber-green hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
