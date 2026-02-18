import { X, Shield, Lock, FileText } from 'lucide-react';

interface LegalPagesProps {
  page: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export function LegalPages({ page, onClose }: LegalPagesProps) {
  if (!page) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-fade-in-up mb-16"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-dark-800/95 backdrop-blur px-8 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-green to-cyber-blue">
              {page === 'privacy' ? <Lock className="h-5 w-5 text-dark-900" /> : <FileText className="h-5 w-5 text-dark-900" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {page === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <p className="text-xs text-slate-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-8 py-8 prose prose-sm prose-invert max-w-none">
          {page === 'privacy' ? <PrivacyContent /> : <TermsContent />}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-8 py-4 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="h-3.5 w-3.5 text-cyber-green" />
            <span>ScamTrace, Inc. — All rights reserved</span>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-bold text-white mt-8 mb-3">{children}</h3>;
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400 leading-relaxed mb-3">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mb-4 ml-4">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-slate-400 list-disc">{item}</li>
      ))}
    </ul>
  );
}

function PrivacyContent() {
  return (
    <>
      <div className="rounded-xl border border-cyber-green/20 bg-cyber-green/5 p-4 mb-6">
        <p className="text-sm text-slate-300">
          <strong className="text-cyber-green">Summary:</strong> We do not sell your data. We do not share your cases.
          All case data remains private and accessible only to the account owner unless explicitly shared.
        </p>
      </div>

      <SectionTitle>1. Information We Collect</SectionTitle>
      <Para>We collect:</Para>
      <BulletList items={[
        'Account email',
        'Case data you submit',
        'Usage analytics',
      ]} />

      <SectionTitle>2. What We Do NOT Do</SectionTitle>
      <Para>We do NOT:</Para>
      <BulletList items={[
        'Sell your data',
        'Share your cases',
        'Access private wallets',
        'Track off-platform behavior',
      ]} />

      <SectionTitle>3. Data Security</SectionTitle>
      <Para>
        We implement industry-standard security measures including encryption at rest and in transit.
        All case data remains private and accessible only to the account owner unless explicitly shared.
      </Para>

      <SectionTitle>4. Data Retention</SectionTitle>
      <Para>
        Account data is retained while your account is active. You may request deletion of your
        account data at any time by contacting support@scamtrace.store.
      </Para>

      <SectionTitle>5. Your Rights</SectionTitle>
      <Para>Depending on your jurisdiction, you have the right to:</Para>
      <BulletList items={[
        'Access your personal data and receive a copy',
        'Correct inaccurate data',
        'Delete your account and associated personal data',
        'Data portability -- receive your data in a machine-readable format',
        'Withdraw consent at any time',
      ]} />
      <Para>To exercise these rights, contact support@scamtrace.store. We will respond within 30 days.</Para>

      <SectionTitle>6. Changes to This Policy</SectionTitle>
      <Para>
        We may update this policy periodically. Material changes will be communicated via email
        or prominent notice on our platform. Continued use after changes constitutes acceptance.
      </Para>

      <SectionTitle>7. Contact Us</SectionTitle>
      <Para>
        For privacy-related inquiries:<br />
        Email: support@scamtrace.store
      </Para>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
        <p className="text-sm text-slate-300">
          <strong className="text-amber-400">Important:</strong> ScamTrace provides software tools for documentation and analysis
          of publicly available blockchain data. We do not recover funds, provide legal advice, or guarantee any result.
        </p>
      </div>

      <SectionTitle>1. Service Description</SectionTitle>
      <Para>
        ScamTrace provides software tools for documentation and analysis of publicly available blockchain data.
      </Para>

      <SectionTitle>2. Your Agreement</SectionTitle>
      <Para>You agree that:</Para>
      <BulletList items={[
        'You are responsible for all data you submit.',
        'ScamTrace does not guarantee any result.',
        'ScamTrace does not recover funds.',
        'ScamTrace does not provide legal or financial advice.',
        'Blockchain transactions are irreversible.',
        'Use of the service is at your own risk.',
      ]} />

      <SectionTitle>3. Limitation of Liability</SectionTitle>
      <Para>
        ScamTrace is not liable for losses, damages, or outcomes resulting from use of this platform.
        Evidence reports and analysis are provided as informational tools only and should not be relied upon
        as the sole basis for financial or legal decisions.
      </Para>

      <SectionTitle>4. Subscription and Billing</SectionTitle>
      <Para>
        Subscriptions are billed monthly or annually through Stripe. You may cancel at any time;
        cancellation takes effect at the end of your current billing period. Free trial periods do not
        require a credit card.
      </Para>

      <SectionTitle>5. Account Termination</SectionTitle>
      <Para>
        We reserve the right to suspend or terminate accounts that violate these terms or use the service
        for unlawful purposes. You may delete your account at any time by contacting support.
      </Para>

      <SectionTitle>6. Changes to Terms</SectionTitle>
      <Para>
        We may modify these terms at any time. Continued use of the service after changes
        constitutes acceptance of the modified terms.
      </Para>

      <SectionTitle>7. Contact</SectionTitle>
      <Para>
        For questions about these terms:<br />
        Email: contact@scamtrace.store
      </Para>
    </>
  );
}
