"use client";

import Link from "next/link";
import { Shield, Github, Twitter, Mail, ArrowRight } from "lucide-react";
import { Disclaimer } from "./disclaimer";

export function Footer() {
  return (
    <footer className="border-t border-border bg-dark-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-px overflow-hidden rounded-b-2xl border border-t-0 border-border bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-green/[0.03] via-transparent to-cyber-blue/[0.03]" />
          <div className="relative flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">
              Ready to start monitoring?
            </h3>
            <p className="mt-3 max-w-xl text-sm text-muted">
              Start documenting and reporting crypto fraud today.
              Free plan available — no credit card required.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/scan"
                className="btn-primary text-sm px-6 py-3 flex items-center gap-2"
              >
                Launch ScamTrace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="btn-secondary text-sm px-6 py-3">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-green to-cyber-blue">
                <Shield className="h-5 w-5 text-dark-900" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-foreground">
                Scam<span className="text-cyber-green">Trace</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Transaction monitoring and forensic documentation platform for
              blockchain users. Trace fund movements, generate evidence, and
              report fraud.
            </p>

            <div className="mt-6">
              <p className="text-xs font-medium text-muted mb-2">
                Get threat intelligence updates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-grow rounded-lg border border-border bg-dark-800 px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                />
                <button className="rounded-lg bg-cyber-green/10 px-3 py-2 text-sm font-medium text-cyber-green transition hover:bg-cyber-green/20">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-white/5 hover:text-foreground hover:border-white/20"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-white/5 hover:text-foreground hover:border-white/20"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Products</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                { label: "Wallet Scanner", href: "/scan" },
                { label: "Report a Scam", href: "/report" },
                { label: "Cooling-Off Protection", href: "/protect" },
                { label: "Evidence Builder", href: "/dashboard/cases" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition hover:text-cyber-green"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                "Documentation",
                "API Reference",
                "Blog",
                "Case Studies",
                "Community Forum",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted transition hover:text-cyber-green"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted transition hover:text-cyber-green"
                >
                  About Us
                </a>
              </li>
              <li>
                <Link
                  href="/law-enforcement"
                  className="text-sm text-muted transition hover:text-cyber-green"
                >
                  Law Enforcement
                </Link>
              </li>
              <li>
                <Link
                  href="/compliance"
                  className="text-sm text-muted transition hover:text-cyber-green"
                >
                  Security & Compliance
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-muted transition hover:text-cyber-green"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-muted transition hover:text-cyber-green"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@scamtrace.com"
                  className="text-sm text-muted transition hover:text-cyber-green"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Disclaimer className="mt-12 pt-8 border-t border-border" />

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ScamTrace, Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
              All systems operational
            </span>
            <span className="text-xs text-muted-foreground">v3.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
