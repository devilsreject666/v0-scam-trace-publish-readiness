"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Scale,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  full_name?: string;
  role?: string;
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", u.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const productItems = [
    {
      name: "Wallet Scanner",
      desc: "Risk-score any blockchain address",
      href: "/scan",
    },
    {
      name: "Report a Scam",
      desc: "Submit scam reports with evidence",
      href: "/report",
    },
    {
      name: "Cooling-Off Protection",
      desc: "Pre-send delay to prevent fraud",
      href: "/protect",
    },
    {
      name: "Evidence Builder",
      desc: "Auto-generate freeze packets",
      href: "/dashboard/cases",
    },
  ];

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
  ];

  const displayName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const avatar = displayName.substring(0, 2).toUpperCase();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-dark-900/90 backdrop-blur-xl shadow-xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-green to-cyber-blue transition-shadow group-hover:shadow-lg group-hover:shadow-cyber-green/20">
              <Shield className="h-5 w-5 text-dark-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Scam<span className="text-cyber-green">Trace</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-foreground">
                Products{" "}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${productsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {productsOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-border bg-dark-800/95 p-2 shadow-2xl backdrop-blur-xl">
                  {productItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block rounded-lg px-3 py-2.5 transition hover:bg-white/5"
                      onClick={() => setProductsOpen(false)}
                    >
                      <div className="text-sm font-medium text-foreground">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/law-enforcement"
              className="rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-foreground flex items-center gap-1"
            >
              <Scale className="h-3.5 w-3.5" /> Law Enforcement
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm text-cyber-green hover:bg-cyber-green/10 transition flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> My Cases
                </Link>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-border px-3 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyber-green to-cyber-blue text-[10px] font-bold text-dark-900">
                    {avatar}
                  </div>
                  <span className="text-sm text-foreground">{displayName}</span>
                  {profile?.role === "admin" && (
                    <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground transition flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="btn-primary text-sm px-5 py-2.5 rounded-lg inline-flex items-center gap-1.5"
                >
                  Launch App
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-foreground p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-dark-900/98 backdrop-blur-xl md:hidden animate-fade-in">
          <div className="flex flex-col gap-1 px-4 py-4">
            {[
              { label: "Features", href: "/#features" },
              { label: "Wallet Scanner", href: "/scan" },
              { label: "Report Scam", href: "/report" },
              { label: "Pricing", href: "/pricing" },
              { label: "Law Enforcement", href: "/law-enforcement" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block rounded-lg px-3 py-2.5 text-sm text-cyber-green hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Cases
                  </Link>
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyber-green to-cyber-blue text-[10px] font-bold text-dark-900">
                        {avatar}
                      </div>
                      {displayName}
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileOpen(false);
                      }}
                      className="text-sm text-muted"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/sign-up"
                  className="block w-full btn-primary text-center text-sm py-3 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Launch App
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
