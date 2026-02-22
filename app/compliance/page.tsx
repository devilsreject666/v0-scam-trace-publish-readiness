import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Shield, Lock, Database, Eye } from "lucide-react";

export const metadata = {
  title: "Compliance | ScamTrace",
  description: "ScamTrace security and compliance information.",
};

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-1.5">
              <Shield className="h-3.5 w-3.5 text-cyber-green" />
              <span className="text-xs font-medium text-cyber-green">
                Security & Compliance
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl text-balance">
              How We Protect <span className="gradient-text">Your Data</span>
            </h1>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-green/10 mb-4">
                <Lock className="h-6 w-6 text-cyber-green" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Authentication Security
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                All authentication is handled by Supabase Auth with
                industry-standard password hashing (bcrypt). Sessions are
                managed through secure HTTP-only cookies with automatic token
                refresh via middleware.
              </p>
            </div>

            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-blue/10 mb-4">
                <Database className="h-6 w-6 text-cyber-blue" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Row Level Security
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Every database table uses Supabase Row Level Security (RLS)
                policies. Users can only access their own data - scan history,
                cases, evidence, and cooling-off transactions are isolated per
                user at the database level.
              </p>
            </div>

            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-orange/10 mb-4">
                <Shield className="h-6 w-6 text-cyber-orange" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Payment Security
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                All payment processing is handled by Stripe. We never store
                credit card numbers, CVVs, or other sensitive payment data on
                our servers. Subscription management uses Stripe webhooks with
                signature verification.
              </p>
            </div>

            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4">
                <Eye className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Data Transparency
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                All blockchain data comes from public APIs (Etherscan,
                Blockstream). We do not have proprietary intelligence feeds.
                Risk scores are computed from observable on-chain patterns and
                the methodology is documented in our disclaimer.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-bold text-foreground mb-3">
              Current Infrastructure
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green" />
                Hosted on Vercel with automatic HTTPS
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green" />
                Database: Supabase PostgreSQL with RLS enabled on all tables
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green" />
                Auth: Supabase Auth with session-based middleware
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green" />
                Payments: Stripe with webhook signature verification
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green" />
                Blockchain APIs: Etherscan (ETH), Blockstream (BTC)
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
