import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CaseStudies } from './components/CaseStudies';
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
import { AuthModal } from './components/AuthModal';
import { LegalPages } from './components/LegalPages';
import { RequestDemo } from './components/RequestDemo';
import { LawEnforcement } from './components/LawEnforcement';
import { CompliancePage } from './components/CompliancePage';
import { CaseDashboard } from './components/CaseDashboard';
import { Transparency } from './components/Transparency';

type Page = 'home' | 'law-enforcement' | 'compliance' | 'dashboard';

function AppContent() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [legalPage, setLegalPage] = useState<'privacy' | 'terms' | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [page, setPage] = useState<Page>('home');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const navigate = (p: string) => {
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200">
      <Navbar
        onSignIn={() => openAuth('login')}
        onSignUp={() => openAuth('signup')}
        onRequestDemo={() => setDemoOpen(true)}
        onNavigate={navigate}
      />

      {page === 'law-enforcement' && (
        <LawEnforcement
          onRequestDemo={() => setDemoOpen(true)}
          onBack={() => navigate('home')}
        />
      )}

      {page === 'compliance' && (
        <CompliancePage onBack={() => navigate('home')} />
      )}

      {page === 'dashboard' && user && (
        <CaseDashboard />
      )}

      {page === 'home' && (
        <main>
          <Hero onGetStarted={() => user ? navigate('dashboard') : openAuth('signup')} />
          <Features />
          <CaseStudies />
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
          <Pricing onSelectPlan={() => user ? navigate('dashboard') : openAuth('signup')} />
          <Transparency />
          <FAQ />
        </main>
      )}

      <Footer
        onOpenPrivacy={() => setLegalPage('privacy')}
        onOpenTerms={() => setLegalPage('terms')}
        onNavigate={navigate}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
      <LegalPages
        page={legalPage}
        onClose={() => setLegalPage(null)}
      />
      <RequestDemo
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
