import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { TrackerDashboard } from './components/TrackerDashboard';
import { ScamSubmission } from './components/ScamSubmission';
import { ChatEvidencePortal } from './components/ChatEvidencePortal';
import { InvestigationTools } from './components/InvestigationTools';
import { NoTraceBrowser } from './components/NoTraceBrowser';
import { SmartContractEscrow } from './components/SmartContractEscrow';
import { ScamShieldWallet } from './components/ScamShieldWallet';
import { MoneyTracker } from './components/MoneyTracker';
import { EvidenceBuilder } from './components/EvidenceBuilder';
import { AdminDashboard } from './components/AdminDashboard';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { AuthModal, type UserProfile } from './components/AuthModal';
import { LegalPages } from './components/LegalPages';

export function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [legalPage, setLegalPage] = useState<'privacy' | 'terms' | null>(null);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200">
      <Navbar
        user={user}
        onSignIn={() => openAuth('login')}
        onSignUp={() => openAuth('signup')}
        onLogout={() => setUser(null)}
      />
      <main>
        <Hero onGetStarted={() => openAuth('signup')} />
        <Features />
        <TrackerDashboard />
        <ScamSubmission />
        <ChatEvidencePortal />
        <InvestigationTools />
        <NoTraceBrowser />
        <SmartContractEscrow />
        <ScamShieldWallet />
        <MoneyTracker />
        <EvidenceBuilder />
        <AdminDashboard />
        <Testimonials />
        <Pricing onSelectPlan={() => openAuth('signup')} />
        <FAQ />
      </main>
      <Footer
        onOpenPrivacy={() => setLegalPage('privacy')}
        onOpenTerms={() => setLegalPage('terms')}
      />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={setUser}
        initialMode={authMode}
      />
      <LegalPages
        page={legalPage}
        onClose={() => setLegalPage(null)}
      />
    </div>
  );
}
