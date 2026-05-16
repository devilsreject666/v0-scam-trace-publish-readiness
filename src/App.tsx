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
import { ScamCheckWidget } from './components/ScamCheckWidget';
import { PdfReportGenerator } from './components/PdfReportGenerator';
import { ScamDatabase } from './components/ScamDatabase';
import { Blog } from './components/Blog';
import { TrustSection } from './components/TrustSection';
import { MonitoringAlerts } from './components/MonitoringAlerts';
import { EmailIntelligence } from './components/EmailIntelligence';
import { ScamPatternMatcher } from './components/ScamPatternMatcher';
import { AffiliatePage } from './components/AffiliatePage';
import { WhiteLabelPage } from './components/WhiteLabelPage';
import { ChromeExtensionPage } from './components/ChromeExtensionPage';
import {
  DomainCheckerPage,
  IpLookupPage,
  PhoneLookupPage,
  WalletCheckerPage,
} from './components/ToolLandingPages';

type Page =
  | 'home'
  | 'law-enforcement'
  | 'compliance'
  | 'dashboard'
  | 'domain-checker'
  | 'ip-lookup'
  | 'phone-lookup'
  | 'wallet-checker'
  | 'affiliate'
  | 'white-label'
  | 'chrome-extension';

function AppContent() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [legalPage, setLegalPage] = useState<'privacy' | 'terms' | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [page, setPage] = useState<Page>('home');

  // Support hash-based routing for SEO pages
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '');
    const validPages: Page[] = ['domain-checker', 'ip-lookup', 'phone-lookup', 'wallet-checker', 'affiliate', 'white-label', 'chrome-extension'];
    if (validPages.includes(hash as Page) && page !== hash) {
      setPage(hash as Page);
    }
  }

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const navigate = (p: string) => {
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update hash for SEO pages
    const seoPages = ['domain-checker', 'ip-lookup', 'phone-lookup', 'wallet-checker', 'affiliate', 'white-label', 'chrome-extension'];
    if (seoPages.includes(p)) {
      window.history.pushState(null, '', `#${p}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100">
      <Navbar
        onSignIn={() => openAuth('login')}
        onSignUp={() => openAuth('signup')}
        onRequestDemo={() => setDemoOpen(true)}
        onNavigate={navigate}
      />

      {/* ── Sub-pages ── */}

      {page === 'law-enforcement' && (
        <LawEnforcement onRequestDemo={() => setDemoOpen(true)} onBack={() => navigate('home')} />
      )}

      {page === 'compliance' && (
        <CompliancePage onBack={() => navigate('home')} />
      )}

      {page === 'dashboard' && user && (
        <CaseDashboard />
      )}

      {page === 'domain-checker' && (
        <DomainCheckerPage onBack={() => navigate('home')} onSignUp={() => openAuth('signup')} />
      )}

      {page === 'ip-lookup' && (
        <IpLookupPage onBack={() => navigate('home')} onSignUp={() => openAuth('signup')} />
      )}

      {page === 'phone-lookup' && (
        <PhoneLookupPage onBack={() => navigate('home')} onSignUp={() => openAuth('signup')} />
      )}

      {page === 'wallet-checker' && (
        <WalletCheckerPage onBack={() => navigate('home')} onSignUp={() => openAuth('signup')} />
      )}

      {page === 'affiliate' && (
        <AffiliatePage onBack={() => navigate('home')} onSignUp={() => openAuth('signup')} />
      )}

      {page === 'white-label' && (
        <WhiteLabelPage onBack={() => navigate('home')} onContact={() => openAuth('signup')} />
      )}

      {page === 'chrome-extension' && (
        <ChromeExtensionPage onBack={() => navigate('home')} onSignUp={() => openAuth('signup')} />
      )}

      {/* ── Home Page ── */}
      {page === 'home' && (
        <main>
          <Hero onGetStarted={() => user ? navigate('dashboard') : openAuth('signup')} />
          <ScamCheckWidget onSignUp={() => openAuth('signup')} />
          <Features />
          <ScamDatabase onSignUp={() => openAuth('signup')} />
          <CaseStudies />
          <TrackerDashboard />
          <ScamSubmission />
          <ChatEvidencePortal />
          <InvestigationTools onSignUp={() => openAuth('signup')} />
          <EmailIntelligence onSignUp={() => openAuth('signup')} />
          <ScamPatternMatcher onSignUp={() => openAuth('signup')} />
          <PdfReportGenerator onSignUp={() => openAuth('signup')} />
          <MonitoringAlerts onSignUp={() => openAuth('signup')} />
          <NoTraceBrowser />
          <SmartContractEscrow />
          <ScamShieldWallet />
          <MoneyTracker />
          <EvidenceBuilder />
          <AdminDashboard />
          <TrustSection />
          <Testimonials />
          <Blog />
          <Pricing onSelectPlan={() => user ? navigate('dashboard') : openAuth('signup')} />
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
