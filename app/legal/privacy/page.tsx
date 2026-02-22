import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Privacy Policy | ScamTrace",
  description: "How ScamTrace collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12">
          <h1 className="text-3xl font-extrabold text-foreground mb-8">
            Privacy Policy
          </h1>
          <div className="prose-dark flex flex-col gap-6 text-sm text-muted leading-relaxed">
            <p>
              <strong className="text-foreground">Last updated:</strong>{" "}
              February 2026
            </p>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                1. Information We Collect
              </h2>
              <p>
                ScamTrace collects information you provide directly: your email
                address and name when you create an account, scam reports you
                submit, blockchain addresses you scan, and any evidence text you
                provide. We also collect usage data including scan history and
                feature interactions through server-side logging.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                2. How We Use Your Information
              </h2>
              <p>
                We use your data to provide the ScamTrace service: processing
                blockchain scans via the Etherscan and Blockstream APIs, storing
                your cases and evidence in our Supabase database, managing your
                subscription through Stripe, and enforcing plan-based rate
                limits. We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                3. Data Storage and Security
              </h2>
              <p>
                Your data is stored in Supabase with Row Level Security (RLS)
                policies ensuring only you can access your own data. Passwords
                are managed by Supabase Auth with industry-standard hashing.
                Payment data is processed by Stripe and never stored on our
                servers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                4. Third-Party Services
              </h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside flex flex-col gap-1 mt-2">
                <li>
                  <strong className="text-foreground">Supabase</strong> - Authentication and database
                </li>
                <li>
                  <strong className="text-foreground">Stripe</strong> - Payment processing
                </li>
                <li>
                  <strong className="text-foreground">Etherscan API</strong> - Ethereum blockchain data
                </li>
                <li>
                  <strong className="text-foreground">Blockstream API</strong> - Bitcoin blockchain data
                </li>
                <li>
                  <strong className="text-foreground">Vercel</strong> - Hosting and deployment
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                5. Your Rights
              </h2>
              <p>
                You can access, update, or delete your personal data from the
                dashboard settings page. To delete your account entirely,
                contact our support team. We will respond to data requests
                within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                6. Contact
              </h2>
              <p>
                For privacy-related inquiries, contact us at
                privacy@scamtrace.com.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
