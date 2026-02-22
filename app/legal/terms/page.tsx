import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Terms of Service | ScamTrace",
  description: "Terms governing the use of ScamTrace services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12">
          <h1 className="text-3xl font-extrabold text-foreground mb-8">
            Terms of Service
          </h1>
          <div className="prose-dark flex flex-col gap-6 text-sm text-muted leading-relaxed">
            <p>
              <strong className="text-foreground">Last updated:</strong>{" "}
              February 2026
            </p>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using ScamTrace, you agree to be bound by these
                Terms of Service. If you do not agree, do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                2. Service Description
              </h2>
              <p>
                ScamTrace provides blockchain address risk scanning, scam
                reporting, case management, and transaction cooling-off
                protection tools. The service uses real-time data from public
                blockchain APIs (Etherscan, Blockstream) and is not a financial
                advisor, law enforcement agency, or legal service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                3. Limitations
              </h2>
              <p>
                ScamTrace analyzes publicly available blockchain data. Risk
                scores are algorithmically generated based on transaction
                patterns and are not definitive assessments. A low risk score
                does not guarantee safety, and a high risk score does not
                constitute proof of fraud. When no data is available, the system
                reports &quot;Insufficient intelligence to assess risk&quot;
                rather than fabricating results.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                4. Subscription and Billing
              </h2>
              <p>
                Free accounts are limited to {3} scans per month. Paid plans
                (Starter: $9/mo with 25 scans, Pro: $19/mo unlimited, Investigator:
                $49/mo unlimited) are billed through Stripe. You can cancel
                anytime, and your plan will remain active until the end of the
                billing period.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                5. Cooling-Off Protection
              </h2>
              <p>
                The cooling-off feature creates a time-delayed hold record in
                our database. ScamTrace does not control any blockchain wallets
                or execute transactions. The hold is an informational tool to
                help you make deliberate decisions. You are solely responsible
                for executing or canceling actual transactions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                6. User Responsibilities
              </h2>
              <p>
                You agree to use ScamTrace only for lawful purposes. You will
                not submit false scam reports, use the service to harass
                individuals, or attempt to circumvent rate limits. You are
                responsible for the accuracy of information you provide.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                7. Disclaimer
              </h2>
              <p>
                ScamTrace is provided &quot;as is&quot; without warranty of any
                kind. We do not guarantee the accuracy, completeness, or
                reliability of any risk assessments. ScamTrace is not a
                substitute for professional legal, financial, or law enforcement
                advice.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
