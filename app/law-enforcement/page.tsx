import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Shield, Scale, FileText, Clock, Mail } from "lucide-react";

export const metadata = {
  title: "Law Enforcement Portal | ScamTrace",
  description:
    "Information for law enforcement agencies working with ScamTrace on cryptocurrency fraud cases.",
};

export default function LawEnforcementPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5">
              <Scale className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-accent">
                Law Enforcement Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl text-balance">
              Working With{" "}
              <span className="gradient-text">Law Enforcement</span>
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-muted">
              ScamTrace cooperates with law enforcement agencies investigating
              cryptocurrency fraud. Here is how we can help.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-green/10 mb-4">
                <FileText className="h-6 w-6 text-cyber-green" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Evidence Packets
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                ScamTrace users can generate structured evidence packets
                containing timestamped wallet scan results, transaction hashes,
                risk analysis, and user-submitted case narratives. These
                packets are designed to be used as supporting documentation in
                fraud investigations.
              </p>
            </div>

            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-blue/10 mb-4">
                <Shield className="h-6 w-6 text-cyber-blue" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Data Sources
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                All blockchain data comes from public APIs: Etherscan for
                Ethereum and Blockstream for Bitcoin. Risk scores are
                algorithmically generated from on-chain patterns. We do not
                have access to private exchange data or off-chain identity
                information.
              </p>
            </div>

            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-orange/10 mb-4">
                <Clock className="h-6 w-6 text-cyber-orange" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Response Times
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                We respond to legitimate law enforcement requests within 48
                hours for standard inquiries and within 24 hours for urgent
                matters involving active fraud. All requests must come from
                official agency email addresses.
              </p>
            </div>

            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                How to Contact Us
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Law enforcement agencies can reach our compliance team at
                lawenforcement@scamtrace.com. Please include your agency name,
                badge/case number, and a description of the information you
                need. We require valid legal process for user account data.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-bold text-foreground mb-3">
              Important Notice
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              ScamTrace is an investigative tool, not a law enforcement agency.
              Our risk scores and analysis are algorithmically generated from
              publicly available blockchain data and should be treated as
              investigative leads, not definitive evidence. We cannot freeze
              funds, subpoena records, or take enforcement action. For active
              fraud, please contact your local cybercrime unit or the FBI
              IC3.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
