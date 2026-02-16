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
          <strong className="text-cyber-green">Summary:</strong> ScamTrace does not sell personal data. We store only necessary metadata
          for monitoring, analytics, and evidence generation. Your privacy is fundamental to our service.
        </p>
      </div>

      <SectionTitle>1. Information We Collect</SectionTitle>
      <Para>We collect information you provide directly to us, including:</Para>
      <BulletList items={[
        'Account information: name, email address, password (encrypted with Argon2)',
        'Scam reports: descriptions, wallet addresses, URLs, phone numbers, and evidence you submit',
        'Chat evidence: uploaded conversations are processed locally and not permanently stored on our servers',
        'Payment information: processed securely by Stripe — we never store your credit card details',
        'Usage data: pages visited, features used, and session duration for service improvement',
      ]} />

      <SectionTitle>2. How We Use Your Information</SectionTitle>
      <Para>We use collected information exclusively for:</Para>
      <BulletList items={[
        'Providing and maintaining our transaction monitoring and forensic documentation services',
        'Processing your scam reports and generating evidence packets',
        'Cross-referencing submitted data against our scam intelligence catalog to identify patterns',
        'Improving our AI extraction and analysis accuracy',
        'Communicating with you about your account, reports, and service updates',
        'Complying with legal obligations and responding to lawful requests',
      ]} />

      <SectionTitle>3. Information Sharing</SectionTitle>
      <Para>We do not sell, rent, or trade your personal information. We may share data only in these circumstances:</Para>
      <BulletList items={[
        'With your explicit consent when submitting freeze requests to exchanges',
        'With law enforcement when required by valid legal process (subpoena, court order)',
        'With service providers who assist our operations (Stripe for payments, cloud infrastructure)',
        'In aggregated, anonymized form for scam intelligence reporting (no personal identifiers)',
        'To protect our rights, privacy, safety, or property, and that of our users',
      ]} />

      <SectionTitle>4. Data Security</SectionTitle>
      <Para>
        We implement industry-standard security measures including encryption at rest and in transit (TLS 1.3),
        access controls, audit logging, and regular security assessments. Wallet Scan operates fully offline —
        seed phrases never leave your device or reach our servers.
      </Para>

      <SectionTitle>5. Data Retention</SectionTitle>
      <Para>
        Account data is retained while your account is active. Scam reports and evidence are retained
        for a minimum of 7 years to support ongoing investigations. You may request deletion of your
        account data at any time by contacting support@scamtrace.com.
      </Para>

      <SectionTitle>6. Your Rights (GDPR / CCPA)</SectionTitle>
      <Para>Depending on your jurisdiction, you have the right to:</Para>
      <BulletList items={[
        'Access your personal data and receive a copy',
        'Correct inaccurate data',
        'Delete your account and associated personal data',
        'Object to or restrict certain processing',
        'Data portability — receive your data in a machine-readable format',
        'Withdraw consent at any time',
      ]} />
      <Para>To exercise these rights, contact privacy@scamtrace.com. We will respond within 30 days.</Para>

      <SectionTitle>7. Cookies and Tracking</SectionTitle>
      <Para>
        We use essential cookies for authentication and session management. We do not use third-party
        advertising trackers. Analytics data is collected in aggregate and does not identify individuals.
        You can disable non-essential cookies in your browser settings.
      </Para>

      <SectionTitle>8. Children's Privacy</SectionTitle>
      <Para>
        ScamTrace is not intended for use by individuals under 18 years of age. We do not knowingly
        collect personal information from children. If we learn we have collected data from a child,
        we will promptly delete it.
      </Para>

      <SectionTitle>9. International Data Transfers</SectionTitle>
      <Para>
        Your data may be transferred to and processed in countries outside your country of residence.
        We ensure appropriate safeguards are in place, including Standard Contractual Clauses for
        EU/EEA data transfers.
      </Para>

      <SectionTitle>10. Changes to This Policy</SectionTitle>
      <Para>
        We may update this policy periodically. Material changes will be communicated via email
        or prominent notice on our platform. Continued use after changes constitutes acceptance.
      </Para>

      <SectionTitle>11. Contact Us</SectionTitle>
      <Para>
        For privacy-related inquiries:<br />
        Email: privacy@scamtrace.com<br />
        ScamTrace, Inc.<br />
        Data Protection Officer
      </Para>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
        <p className="text-sm text-slate-300">
          <strong className="text-amber-400">Important:</strong> ScamTrace provides informational monitoring and forensic documentation tools only.
          We do not guarantee outcomes, recover funds, or provide financial or legal advice.
          Blockchain transactions are inherently irreversible.
        </p>
      </div>

      <SectionTitle>1. Service Description</SectionTitle>
      <Para>
        ScamTrace provides transaction monitoring, forensic documentation, and evidence generation tools
        for blockchain users. Our services include address risk scoring, fund tracing visualization,
        chat evidence analysis, domain and phone intelligence, and evidence packet generation.
      </Para>
      <Para>
        <strong className="text-white">Our services do NOT include:</strong> fund recovery, financial advice,
        legal representation, law enforcement, asset seizure, or identity investigation of individuals.
      </Para>

      <SectionTitle>2. No Guarantee of Outcomes</SectionTitle>
      <Para>
        ScamTrace makes no guarantees regarding the recovery of lost funds, the accuracy of risk
        assessments, or the effectiveness of evidence packets. Risk scores, AI analysis, and
        forensic reports are provided as informational tools only and should not be relied upon
        as the sole basis for financial or legal decisions.
      </Para>

      <SectionTitle>3. User Responsibilities</SectionTitle>
      <Para>By using ScamTrace, you agree to:</Para>
      <BulletList items={[
        'Use the service only for lawful purposes related to fraud documentation and personal protection',
        'Not use the service to harass, stalk, dox, or intimidate any individual',
        'Not submit false, misleading, or fabricated scam reports',
        'Not attempt to reverse-engineer, decompile, or extract our proprietary algorithms',
        'Maintain the security of your account credentials',
        'Comply with all applicable local, state, national, and international laws',
      ]} />

      <SectionTitle>4. Smart Contract Escrow</SectionTitle>
      <Para>
        The ScamTrace escrow feature provides a voluntary time delay before fund release. It is designed
        to add friction to potentially fraudulent transactions. The escrow is a temporary holding
        mechanism and does not constitute custody of funds. ScamTrace is not responsible for any
        losses incurred after funds are released from escrow with your explicit consent.
      </Para>

      <SectionTitle>5. Evidence Packets</SectionTitle>
      <Para>
        Evidence packets generated by ScamTrace are informational documents designed to assist with
        fraud reporting. They are not legal documents and may not be admissible in all jurisdictions.
        ScamTrace does not represent that evidence packets will result in fund recovery, account
        freezes, or prosecution. Users should consult with legal counsel for advice specific to their situation.
      </Para>

      <SectionTitle>6. Limitation of Liability</SectionTitle>
      <Para>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCAMTRACE SHALL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
        WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
        INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
      </Para>
      <Para>
        Our total aggregate liability for any claims arising from or related to the service shall
        not exceed the amount you paid to ScamTrace in the 12 months preceding the claim.
      </Para>

      <SectionTitle>7. Intellectual Property</SectionTitle>
      <Para>
        All ScamTrace software, algorithms, designs, and content are the exclusive property of
        ScamTrace, Inc. Your subscription grants you a limited, non-exclusive, non-transferable
        license to use the service for its intended purpose. Evidence packets you generate are
        owned by you.
      </Para>

      <SectionTitle>8. Subscription and Billing</SectionTitle>
      <Para>
        Subscriptions are billed monthly or annually through Stripe. You may cancel at any time;
        cancellation takes effect at the end of your current billing period. Refunds are provided
        at our discretion for unused portions of annual subscriptions. Free trial periods do not
        require a credit card.
      </Para>

      <SectionTitle>9. Account Termination</SectionTitle>
      <Para>
        We reserve the right to suspend or terminate accounts that violate these terms, submit
        fraudulent reports, or use the service for unlawful purposes. You may delete your account
        at any time through your account settings or by contacting support.
      </Para>

      <SectionTitle>10. Disclaimer of Warranties</SectionTitle>
      <Para>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
        EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
        OR COMPLETELY SECURE. RISK SCORES AND AI ANALYSIS ARE PROBABILISTIC AND MAY CONTAIN ERRORS.
      </Para>

      <SectionTitle>11. Governing Law</SectionTitle>
      <Para>
        These terms shall be governed by and construed in accordance with the laws of the State
        of Delaware, without regard to conflict of law principles. Any disputes shall be resolved
        through binding arbitration under the rules of the American Arbitration Association.
      </Para>

      <SectionTitle>12. Changes to Terms</SectionTitle>
      <Para>
        We may modify these terms at any time. Material changes will be communicated via email
        at least 30 days before taking effect. Continued use of the service after changes
        constitutes acceptance of the modified terms.
      </Para>

      <SectionTitle>13. Contact</SectionTitle>
      <Para>
        For questions about these terms:<br />
        Email: legal@scamtrace.com<br />
        ScamTrace, Inc.
      </Para>
    </>
  );
}
