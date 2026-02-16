import { useState, useRef, useCallback } from 'react';
import {
  FileText, Upload, AlertTriangle, CheckCircle2, X, Loader2,
  Globe, Phone, Mail, Wallet, DollarSign, User,
  Shield, Camera, Hash, ArrowRight, ChevronDown, Tag, MapPin
} from 'lucide-react';

type SubmitStep = 'form' | 'uploading' | 'extracting' | 'review' | 'submitted';

interface ScamReport {
  scamType: string;
  url: string;
  description: string;
  timeline: string;
  lossAmount: string;
  lossCurrency: string;
  walletAddresses: string;
  phoneNumbers: string;
  emails: string;
  usernames: string;
  platform: string;
}

const scamTypes = [
  'Crypto Investment Scam',
  'Pig Butchering',
  'Phishing',
  'Impersonation',
  'Romance Scam',
  'Marketplace Fraud',
  'Ransomware',
  'Rug Pull / DeFi Scam',
  'Ponzi / Pyramid Scheme',
  'Tech Support Scam',
  'NFT Scam',
  'Other',
];

const extractedEntities = [
  { type: 'wallet', value: '0x7a250d...dEad', chain: 'Ethereum', risk: 'critical' },
  { type: 'wallet', value: 'bc1qxy2...0wlh', chain: 'Bitcoin', risk: 'high' },
  { type: 'url', value: 'crypto-invest-returns.xyz', chain: '', risk: 'critical' },
  { type: 'phone', value: '+1 (332) 555-0147', chain: '', risk: 'high' },
  { type: 'email', value: 'invest@protonmail.com', chain: '', risk: 'medium' },
];

export function ScamSubmission() {
  const [step, setStep] = useState<SubmitStep>('form');
  const [report, setReport] = useState<ScamReport>({
    scamType: '', url: '', description: '', timeline: '',
    lossAmount: '', lossCurrency: 'USD', walletAddresses: '',
    phoneNumbers: '', emails: '', usernames: '', platform: '',
  });
  const [files, setFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const caseIdRef = useRef('');

  const updateReport = (key: keyof ScamReport, value: string) => {
    setReport(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    setFiles(prev => [...prev, ...Array.from(fileList).map(f => f.name)]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleSubmit = () => {
    if (!report.scamType || !report.description.trim()) return;
    caseIdRef.current = 'SC-' + Date.now().toString(36).toUpperCase();
    setStep('uploading');
    setProgress(0);

    // Phase 1: Upload simulation
    const uploadInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 50) {
          clearInterval(uploadInterval);
          setStep('extracting');
          // Phase 2: AI extraction
          const extractInterval = setInterval(() => {
            setProgress(p2 => {
              if (p2 >= 100) {
                clearInterval(extractInterval);
                setTimeout(() => setStep('review'), 500);
                return 100;
              }
              return p2 + 2;
            });
          }, 60);
          return 50;
        }
        return p + 3;
      });
    }, 60);
  };

  const handleConfirmSubmit = () => {
    setStep('submitted');
  };

  const handleReset = () => {
    setStep('form');
    setReport({
      scamType: '', url: '', description: '', timeline: '',
      lossAmount: '', lossCurrency: 'USD', walletAddresses: '',
      phoneNumbers: '', emails: '', usernames: '', platform: '',
    });
    setFiles([]);
    setProgress(0);
    setActiveSection(0);
  };

  const sections = [
    { title: 'Scam Details', icon: AlertTriangle },
    { title: 'Evidence Upload', icon: Upload },
    { title: 'Scammer Info', icon: User },
    { title: 'Financial Loss', icon: DollarSign },
  ];

  const filledFields = [
    report.scamType, report.description, report.url, report.walletAddresses,
    report.lossAmount, report.phoneNumbers, report.emails,
  ].filter(Boolean).length;

  return (
    <section id="submit-report" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-cyber-red/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-red/20 bg-cyber-red/[0.06] px-4 py-1.5">
            <FileText className="h-3.5 w-3.5 text-cyber-red" />
            <span className="text-xs font-medium text-cyber-red">Scam Submission System</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Report a <span className="gradient-text">Scam</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Submit detailed scam reports with evidence. Our AI automatically extracts wallet addresses,
            URLs, phone numbers, and links them to known scam campaigns for investigation.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {/* ==================== FORM ==================== */}
          {step === 'form' && (
            <div className="animate-fade-in-up">
              {/* Progress indicator */}
              <div className="mb-8 flex items-center justify-between">
                {sections.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => setActiveSection(i)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      activeSection === i
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{s.title}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Section 0: Scam Details */}
                  {activeSection === 0 && (
                    <div className="glass-card rounded-xl p-6 space-y-4 animate-fade-in">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                        <AlertTriangle className="h-5 w-5 text-cyber-red" />
                        Scam Details
                      </h3>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Scam Type *</label>
                        <div className="relative">
                          <select
                            value={report.scamType}
                            onChange={e => updateReport('scamType', e.target.value)}
                            className="w-full appearance-none rounded-xl border border-white/10 bg-dark-900 px-4 py-3 text-sm text-white outline-none focus:border-cyber-green/50 transition cursor-pointer"
                          >
                            <option value="">Select scam type...</option>
                            {scamTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Scam Website URL</label>
                        <div className="relative">
                          <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="url"
                            placeholder="https://scam-site.com"
                            className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition font-mono"
                            value={report.url}
                            onChange={e => updateReport('url', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Platform Where Scam Occurred</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Telegram, WhatsApp, Twitter, Instagram..."
                            className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                            value={report.platform}
                            onChange={e => updateReport('platform', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Description *</label>
                        <textarea
                          rows={5}
                          placeholder="Describe how the scam occurred in detail. Include what the scammer said, what they promised, and what happened..."
                          className="w-full rounded-xl border border-white/10 bg-dark-900 p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 resize-none transition"
                          value={report.description}
                          onChange={e => updateReport('description', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Timeline of Events</label>
                        <textarea
                          rows={3}
                          placeholder="Jan 5: First contact via Telegram&#10;Jan 7: Sent 2 ETH to address&#10;Jan 8: Scammer stopped responding"
                          className="w-full rounded-xl border border-white/10 bg-dark-900 p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 resize-none transition font-mono"
                          value={report.timeline}
                          onChange={e => updateReport('timeline', e.target.value)}
                        />
                      </div>

                      <button onClick={() => setActiveSection(1)} className="flex items-center gap-2 text-sm text-cyber-green hover:underline transition">
                        Next: Upload Evidence <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Section 1: Evidence Upload */}
                  {activeSection === 1 && (
                    <div className="glass-card rounded-xl p-6 space-y-4 animate-fade-in">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                        <Upload className="h-5 w-5 text-cyber-blue" />
                        Evidence Upload
                      </h3>
                      <p className="text-sm text-slate-400">Upload screenshots, PDFs, chat exports, or images. AI will automatically extract entities using OCR.</p>

                      <div
                        className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                          dragOver ? 'border-cyber-green/50 bg-cyber-green/5' : 'border-white/10 hover:border-white/20'
                        }`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                      >
                        <input ref={fileRef} type="file" className="hidden" multiple
                          accept=".txt,.zip,.json,.csv,.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx"
                          onChange={e => handleFileUpload(e.target.files)} />
                        <Upload className="mx-auto h-10 w-10 text-slate-500 mb-3" />
                        <p className="text-sm font-medium text-white">Drop evidence files here</p>
                        <p className="mt-1 text-xs text-slate-500">Screenshots, PDFs, chat exports, images • Max 50MB each</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white hover:bg-white/10 transition"
                        >
                          <Camera className="h-4 w-4" /> Screenshots
                        </button>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white hover:bg-white/10 transition"
                        >
                          <FileText className="h-4 w-4" /> Documents
                        </button>
                      </div>

                      {files.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-400">Uploaded ({files.length})</div>
                          {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 text-cyber-blue flex-shrink-0" />
                                <span className="text-sm text-white truncate">{f}</span>
                              </div>
                              <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-400 transition">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="rounded-lg border border-cyber-green/20 bg-cyber-green/5 p-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Shield className="h-3.5 w-3.5 text-cyber-green flex-shrink-0" />
                          Files are hashed (SHA-256) for integrity verification. OCR + NLP extract entities automatically.
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <button onClick={() => setActiveSection(0)} className="text-sm text-slate-400 hover:text-white transition">← Back</button>
                        <button onClick={() => setActiveSection(2)} className="flex items-center gap-2 text-sm text-cyber-green hover:underline transition">
                          Next: Scammer Info <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section 2: Scammer Info */}
                  {activeSection === 2 && (
                    <div className="glass-card rounded-xl p-6 space-y-4 animate-fade-in">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                        <User className="h-5 w-5 text-cyber-orange" />
                        Scammer Information
                      </h3>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Crypto Wallet Addresses</label>
                        <div className="relative">
                          <Wallet className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                          <textarea
                            rows={3}
                            placeholder="One address per line:&#10;0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D&#10;bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                            className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 resize-none transition font-mono"
                            value={report.walletAddresses}
                            onChange={e => updateReport('walletAddresses', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1.5">Phone Numbers</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                              type="text"
                              placeholder="+1 332 555 0147"
                              className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition font-mono"
                              value={report.phoneNumbers}
                              onChange={e => updateReport('phoneNumbers', e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1.5">Email Addresses</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                              type="email"
                              placeholder="scammer@email.com"
                              className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition font-mono"
                              value={report.emails}
                              onChange={e => updateReport('emails', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Scammer Usernames / Social Profiles</label>
                        <div className="relative">
                          <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            placeholder="@telegram_user, Instagram handle, etc."
                            className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                            value={report.usernames}
                            onChange={e => updateReport('usernames', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <button onClick={() => setActiveSection(1)} className="text-sm text-slate-400 hover:text-white transition">← Back</button>
                        <button onClick={() => setActiveSection(3)} className="flex items-center gap-2 text-sm text-cyber-green hover:underline transition">
                          Next: Financial Loss <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Financial Loss */}
                  {activeSection === 3 && (
                    <div className="glass-card rounded-xl p-6 space-y-4 animate-fade-in">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                        <DollarSign className="h-5 w-5 text-cyber-green" />
                        Financial Loss (Optional)
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1.5">Amount Lost</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                              type="text"
                              placeholder="5,000"
                              className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition font-mono"
                              value={report.lossAmount}
                              onChange={e => updateReport('lossAmount', e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1.5">Currency</label>
                          <select
                            value={report.lossCurrency}
                            onChange={e => updateReport('lossCurrency', e.target.value)}
                            className="w-full appearance-none rounded-xl border border-white/10 bg-dark-900 px-4 py-3 text-sm text-white outline-none focus:border-cyber-green/50 transition"
                          >
                            {['USD', 'EUR', 'GBP', 'ETH', 'BTC', 'USDT', 'USDC', 'Other'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                        <p className="text-xs text-slate-400">
                          <span className="text-yellow-400 font-medium">Note:</span> Financial loss information helps prioritize cases and
                          aggregate fraud statistics. This data is never shared publicly.
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <button onClick={() => setActiveSection(2)} className="text-sm text-slate-400 hover:text-white transition">← Back</button>
                      </div>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!report.scamType || !report.description.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-4 text-base font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Shield className="h-5 w-5" />
                    Submit Scam Report & Run AI Extraction
                  </button>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="text-sm font-bold text-white mb-3">Report Progress</h4>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Scam Type', done: !!report.scamType },
                        { label: 'Description', done: !!report.description },
                        { label: 'Website URL', done: !!report.url },
                        { label: 'Evidence Files', done: files.length > 0 },
                        { label: 'Wallet Addresses', done: !!report.walletAddresses },
                        { label: 'Contact Info', done: !!report.phoneNumbers || !!report.emails },
                        { label: 'Financial Loss', done: !!report.lossAmount },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          {item.done ? (
                            <CheckCircle2 className="h-4 w-4 text-cyber-green" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-white/20" />
                          )}
                          <span className={`text-xs ${item.done ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-1.5 rounded-full bg-dark-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyber-green to-cyber-blue transition-all" style={{ width: `${(filledFields / 7) * 100}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-slate-500 text-right">{filledFields}/7 fields completed</div>
                  </div>

                  <div className="glass-card rounded-xl p-5">
                    <h4 className="text-sm font-bold text-white mb-3">AI Will Extract</h4>
                    <div className="space-y-2">
                      {[
                        { icon: Wallet, label: 'Wallet addresses (BTC, ETH, TRC-20+)', color: 'text-amber-400' },
                        { icon: Globe, label: 'URLs & domains', color: 'text-blue-400' },
                        { icon: Phone, label: 'Phone numbers', color: 'text-green-400' },
                        { icon: Mail, label: 'Email addresses', color: 'text-purple-400' },
                        { icon: Hash, label: 'IP addresses', color: 'text-cyan-400' },
                        { icon: Tag, label: 'Brand impersonation', color: 'text-red-400' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400">
                          <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-5">
                    <h4 className="text-sm font-bold text-white mb-2">File Integrity</h4>
                    <p className="text-xs text-slate-400">
                      All uploaded files are SHA-256 hashed for evidence integrity verification. Hashes are stored immutably and can be used in legal proceedings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== UPLOADING / EXTRACTING ==================== */}
          {(step === 'uploading' || step === 'extracting') && (
            <div className="mx-auto max-w-lg animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyber-green/10 animate-pulse-glow">
                  <Loader2 className="h-10 w-10 text-cyber-green animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {step === 'uploading' ? 'Uploading Evidence' : 'AI Extracting Entities'}
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  {step === 'uploading'
                    ? 'Encrypting and uploading files with SHA-256 integrity hashing...'
                    : 'Running OCR, NLP entity extraction, and scam database cross-referencing...'
                  }
                </p>
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-dark-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyber-green to-cyber-blue transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-sm font-bold text-cyber-green">{progress}%</span>

                <div className="mt-6 space-y-2 text-left">
                  {[
                    { label: 'File encryption & upload', threshold: 15 },
                    { label: 'SHA-256 hash generation', threshold: 30 },
                    { label: 'OCR text extraction', threshold: 50 },
                    { label: 'NLP entity detection', threshold: 65 },
                    { label: 'Wallet address parsing', threshold: 75 },
                    { label: 'Scam database cross-reference', threshold: 85 },
                    { label: 'Risk scoring & cataloging', threshold: 95 },
                  ].map((s, i) => {
                    const done = progress >= s.threshold + 5;
                    const active = progress >= s.threshold && !done;
                    return (
                      <div key={i} className={`flex items-center gap-2 text-xs ${done ? 'text-cyber-green' : active ? 'text-white' : 'text-slate-600'}`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-700" />}
                        {s.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== REVIEW ==================== */}
          {step === 'review' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="glass-card rounded-xl border-cyber-green/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-cyber-green" />
                  <h3 className="text-lg font-bold text-white">AI Extraction Complete</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Review the extracted entities below. Confirm to submit your report to the ScamTrace intelligence catalog.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-6">
                  {[
                    { label: 'Wallets', value: '2', color: 'text-amber-400' },
                    { label: 'URLs', value: '1', color: 'text-blue-400' },
                    { label: 'Phones', value: '1', color: 'text-green-400' },
                    { label: 'Emails', value: '1', color: 'text-purple-400' },
                    { label: 'Total', value: '5', color: 'text-cyber-green' },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-3 text-center">
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {extractedEntities.map((e, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${
                      e.risk === 'critical' ? 'border-red-500/20 bg-red-500/[0.03]' :
                      e.risk === 'high' ? 'border-orange-500/20 bg-orange-500/[0.03]' :
                      'border-white/5 bg-white/[0.02]'
                    }`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        e.type === 'wallet' ? 'bg-amber-500/10' : e.type === 'url' ? 'bg-blue-500/10' :
                        e.type === 'phone' ? 'bg-green-500/10' : 'bg-purple-500/10'
                      }`}>
                        {e.type === 'wallet' && <Wallet className="h-4 w-4 text-amber-400" />}
                        {e.type === 'url' && <Globe className="h-4 w-4 text-blue-400" />}
                        {e.type === 'phone' && <Phone className="h-4 w-4 text-green-400" />}
                        {e.type === 'email' && <Mail className="h-4 w-4 text-purple-400" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <code className="text-sm font-mono text-white">{e.value}</code>
                        {e.chain && <span className="ml-2 text-[10px] text-slate-500">{e.chain}</span>}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        e.risk === 'critical' ? 'bg-red-500/10 text-red-400' :
                        e.risk === 'high' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>{e.risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h4 className="text-sm font-bold text-white mb-3">Report Summary</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Type', value: report.scamType },
                    { label: 'Platform', value: report.platform || 'Not specified' },
                    { label: 'Loss', value: report.lossAmount ? `${report.lossAmount} ${report.lossCurrency}` : 'Not specified' },
                    { label: 'Evidence Files', value: `${files.length} file(s)` },
                    { label: 'Case ID', value: caseIdRef.current },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-xs border-b border-white/5 pb-2">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleReset} className="flex-1 btn-secondary py-3.5 text-sm text-center">
                  Edit Report
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Confirm & Submit
                </button>
              </div>
            </div>
          )}

          {/* ==================== SUBMITTED ==================== */}
          {step === 'submitted' && (
            <div className="mx-auto max-w-lg animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyber-green/10">
                  <CheckCircle2 className="h-10 w-10 text-cyber-green" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Report Submitted Successfully</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Your scam report has been added to the ScamTrace intelligence catalog.
                  Extracted entities are now being cross-referenced with existing cases.
                </p>

                <div className="rounded-lg bg-dark-900/50 border border-white/5 p-4 mb-6 font-mono text-xs text-slate-400 space-y-1">
                  <div>Case ID: <span className="text-cyber-green">{caseIdRef.current}</span></div>
                  <div>Status: <span className="text-cyber-green">Active — Under Analysis</span></div>
                  <div>Entities Linked: <span className="text-white">5</span></div>
                  <div>Cross-references Found: <span className="text-cyber-orange">3 matching reports</span></div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">Recommended Next Steps</h4>
                  {[
                    { label: 'Trace wallet addresses', href: '#tracker', icon: Hash },
                    { label: 'Generate evidence packet', href: '#evidence', icon: FileText },
                    { label: 'Check domain intelligence', href: '#osint-tools', icon: Globe },
                    { label: 'Report to FTC / IC3', href: '#', icon: Shield },
                  ].map(item => (
                    <a key={item.label} href={item.href}
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition"
                    >
                      <item.icon className="h-4 w-4 text-cyber-green" />
                      <span className="text-sm text-white">{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" />
                    </a>
                  ))}
                </div>

                <button onClick={handleReset} className="mt-6 text-sm text-cyber-green hover:underline">
                  Submit Another Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
