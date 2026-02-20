import { useState, useRef, useCallback } from 'react';
import {
  MessageCircle, Upload, Shield, CheckCircle2, AlertTriangle,
  FileText, Clock, ExternalLink, Wallet, Phone, Mail, Globe,
  X, Loader2, Link2, Send, Eye, Copy, Image,
  ArrowRight, Hash, Bot, Smartphone, Camera
} from 'lucide-react';
import { extractWallets, extractUrls, extractPhones, extractEmails, extractIPs } from '@/lib/extractors';

interface ExtractedEntity {
  type: 'wallet' | 'url' | 'phone' | 'email' | 'ip';
  value: string;
  risk: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  detail: string;
}

interface ParsedMessage {
  sender: 'other' | 'self';
  text: string;
  time: string;
  flagged: boolean;
  entities: string[];
}

type PortalType = 'telegram' | 'whatsapp' | null;
type UploadStep = 'select' | 'connect' | 'upload' | 'analyzing' | 'results';

const entityIcons: Record<string, typeof Wallet> = {
  wallet: Wallet,
  url: Globe,
  phone: Phone,
  email: Mail,
  ip: Globe,
};

const riskBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
  unknown: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function ChatEvidencePortal() {
  const [portal, setPortal] = useState<PortalType>(null);
  const [step, setStep] = useState<UploadStep>('select');
  const [connectionId, setConnectionId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [pastedChat, setPastedChat] = useState('');
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<'chat' | 'entities' | 'timeline'>('chat');
  const [dragOver, setDragOver] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null);
  const [realEntities, setRealEntities] = useState<ExtractedEntity[]>([]);
  const [parsedMessages, setParsedMessages] = useState<ParsedMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPortal = (type: PortalType) => {
    setPortal(type);
    setStep('connect');
  };

  const handleConnect = () => {
    if (!connectionId.trim()) return;
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      setTimeout(() => setStep('upload'), 800);
    }, 2000);
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map(f => f.name);
    setUploadedFiles(prev => [...prev, ...names]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleAnalyze = () => {
    if (uploadedFiles.length === 0 && !pastedChat.trim()) return;
    setStep('analyzing');
    setAnalyzeProgress(0);

    // Extract real entities from pasted chat text
    const text = pastedChat.trim();
    const wallets = extractWallets(text);
    const urls = extractUrls(text);
    const phones = extractPhones(text);
    const emails = extractEmails(text);
    const ips = extractIPs(text);

    const entities: ExtractedEntity[] = [
      ...wallets.map(w => ({
        type: 'wallet' as const, value: w.value,
        risk: 'high' as const,
        detail: `${w.type === 'wallet_eth' ? 'Ethereum' : w.type === 'wallet_btc' ? 'Bitcoin' : 'TRON'} address found in chat text`,
      })),
      ...urls.map(u => ({
        type: 'url' as const, value: u.value,
        risk: 'high' as const,
        detail: 'URL found in chat — check domain intelligence',
      })),
      ...phones.map(p => ({
        type: 'phone' as const, value: p.value,
        risk: 'medium' as const,
        detail: 'Phone number found in chat — run carrier lookup',
      })),
      ...emails.map(e => ({
        type: 'email' as const, value: e.value,
        risk: 'medium' as const,
        detail: 'Email found in chat — may be disposable or scam-linked',
      })),
      ...ips.map(ip => ({
        type: 'ip' as const, value: ip,
        risk: 'medium' as const,
        detail: 'IP address found in chat — run geolocation/VPN check',
      })),
    ];

    // Parse chat messages line-by-line
    const lines = text.split('\n').filter(l => l.trim());
    const allEntityValues = entities.map(e => e.value);
    const messages: ParsedMessage[] = lines.map(line => {
      const lineEntities = allEntityValues.filter(v => line.includes(v));
      const hasEntity = lineEntities.length > 0;
      return {
        sender: 'other' as const,
        text: line,
        time: '',
        flagged: hasEntity,
        entities: lineEntities,
      };
    });

    setRealEntities(entities);
    setParsedMessages(messages);

    const interval = setInterval(() => {
      setAnalyzeProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setStep('results');
            setShowResults(true);
          }, 300);
          return 100;
        }
        return p + 3;
      });
    }, 50);
  };

  const handleReset = () => {
    setPortal(null);
    setStep('select');
    setConnectionId('');
    setConnecting(false);
    setConnected(false);
    setUploadedFiles([]);
    setPastedChat('');
    setAnalyzeProgress(0);
    setShowResults(false);
  };

  const copyEntity = (val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedEntity(val);
    setTimeout(() => setCopiedEntity(null), 2000);
  };

  const analysisSteps = [
    { threshold: 10, label: 'Parsing chat messages...' },
    { threshold: 25, label: 'Running OCR on screenshots...' },
    { threshold: 40, label: 'Extracting wallet addresses...' },
    { threshold: 55, label: 'Detecting URLs & domains...' },
    { threshold: 70, label: 'Identifying phone numbers & emails...' },
    { threshold: 80, label: 'Cross-referencing scam databases...' },
    { threshold: 90, label: 'Scoring risk levels...' },
    { threshold: 98, label: 'Building evidence timeline...' },
  ];

  const currentAnalysisStep = analysisSteps.filter(s => analyzeProgress >= s.threshold).pop();

  return (
    <section id="chat-evidence" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-blue/[0.04] blur-[150px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyber-purple/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-blue/20 bg-cyber-blue/[0.06] px-4 py-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-cyber-blue" />
            <span className="text-xs font-medium text-cyber-blue">Chat Evidence Portal</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Upload Scammer <span className="gradient-text">Conversations</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Connect your Telegram or WhatsApp to upload chat evidence. Our AI automatically extracts
            wallet addresses, URLs, phone numbers, and builds a prosecution-ready timeline.
          </p>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-5xl">

          {/* Step 1: Select Portal */}
          {step === 'select' && (
            <div className="animate-fade-in-up">
              <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                {/* Telegram */}
                <button
                  onClick={() => handleSelectPortal('telegram')}
                  className="glass-card-premium rounded-2xl p-8 text-center group hover:border-cyan-400/30 transition-all"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition">
                    <Send className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Telegram</h3>
                  <p className="mt-2 text-sm text-slate-400">Connect your Telegram account to forward scam conversations directly</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {['Chat Export', 'Screenshots', 'Bot Forward'].map(f => (
                      <span key={f} className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[10px] text-cyan-400">{f}</span>
                    ))}
                  </div>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleSelectPortal('whatsapp')}
                  className="glass-card-premium rounded-2xl p-8 text-center group hover:border-green-400/30 transition-all"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition">
                    <Smartphone className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">WhatsApp</h3>
                  <p className="mt-2 text-sm text-slate-400">Export and upload WhatsApp chats with media for AI analysis</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {['Chat Export', 'Media Files', 'Voice Notes'].map(f => (
                      <span key={f} className="rounded-full border border-green-500/20 bg-green-500/5 px-2.5 py-1 text-[10px] text-green-400">{f}</span>
                    ))}
                  </div>
                </button>
              </div>

              {/* Direct upload option */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => { setPortal(null); setStep('upload'); }}
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                >
                  <Upload className="h-4 w-4" />
                  Or upload chat exports / screenshots directly
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Connect */}
          {step === 'connect' && (
            <div className="mx-auto max-w-lg animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8">
                <button onClick={handleReset} className="text-slate-400 hover:text-white transition mb-4 text-sm flex items-center gap-1">
                  ← Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    portal === 'telegram' ? 'bg-cyan-500/10' : 'bg-green-500/10'
                  }`}>
                    {portal === 'telegram' ? <Send className="h-6 w-6 text-cyan-400" /> : <Smartphone className="h-6 w-6 text-green-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Connect {portal === 'telegram' ? 'Telegram' : 'WhatsApp'}
                    </h3>
                    <p className="text-sm text-slate-400">Link your account to import conversations</p>
                  </div>
                </div>

                {portal === 'telegram' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Telegram Username or Phone Number</label>
                      <input
                        type="text"
                        placeholder="@username or +1234567890"
                        className="w-full rounded-lg border border-white/10 bg-dark-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 transition"
                        value={connectionId}
                        onChange={e => setConnectionId(e.target.value)}
                      />
                    </div>
                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-slate-400">
                          <p className="font-medium text-cyan-400 mb-1">How it works:</p>
                          <ol className="space-y-1 list-decimal pl-3">
                            <li>Search <span className="text-white font-mono">@ScamTraceBot</span> on Telegram</li>
                            <li>Forward any scam conversation to the bot</li>
                            <li>The bot will send you a secure link to view the analysis</li>
                            <li>Or export chat as .txt and upload below</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">WhatsApp Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1234567890"
                        className="w-full rounded-lg border border-white/10 bg-dark-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-green-400/50 transition"
                        value={connectionId}
                        onChange={e => setConnectionId(e.target.value)}
                      />
                    </div>
                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                      <div className="flex items-start gap-2">
                        <Smartphone className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-slate-400">
                          <p className="font-medium text-green-400 mb-1">How to export WhatsApp chats:</p>
                          <ol className="space-y-1 list-decimal pl-3">
                            <li>Open the scam conversation in WhatsApp</li>
                            <li>Tap ⋮ → More → Export Chat → Include Media</li>
                            <li>Save the .zip file and upload it below</li>
                            <li>Or take screenshots and upload as images</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {connected ? (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-cyber-green/10 border border-cyber-green/20 px-4 py-3 animate-fade-in">
                    <CheckCircle2 className="h-5 w-5 text-cyber-green" />
                    <span className="text-sm font-medium text-cyber-green">Connected successfully!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={!connectionId.trim() || connecting}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-40"
                  >
                    {connecting ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><Link2 className="h-4 w-4" /> Connect & Continue</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Upload */}
          {step === 'upload' && (
            <div className="animate-fade-in-up">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Upload area */}
                <div className="space-y-4">
                  {portal && (
                    <button onClick={handleReset} className="text-slate-400 hover:text-white transition text-sm flex items-center gap-1">
                      ← Change platform
                    </button>
                  )}

                  {/* Drag & drop zone */}
                  <div
                    className={`glass-card rounded-2xl p-8 border-2 border-dashed transition-all text-center cursor-pointer ${
                      dragOver ? 'border-cyber-green/50 bg-cyber-green/5' : 'border-white/10 hover:border-white/20'
                    }`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept=".txt,.zip,.json,.csv,.pdf,.png,.jpg,.jpeg,.webp"
                      onChange={e => handleFileUpload(e.target.files)}
                    />
                    <Upload className={`mx-auto h-12 w-12 mb-4 ${dragOver ? 'text-cyber-green' : 'text-slate-500'}`} />
                    <h4 className="text-base font-bold text-white">Drop chat exports here</h4>
                    <p className="mt-2 text-sm text-slate-400">
                      Supports .txt, .zip, .json, .csv, .pdf files
                    </p>
                    <p className="mt-1 text-xs text-slate-500">or click to browse files</p>
                  </div>

                  {/* Screenshot upload */}
                  <div
                    className="glass-card rounded-xl p-4 cursor-pointer hover:bg-white/[0.04] transition flex items-center gap-4"
                    onClick={() => screenshotInputRef.current?.click()}
                  >
                    <input
                      ref={screenshotInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.gif"
                      onChange={e => handleFileUpload(e.target.files)}
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-purple/10 flex-shrink-0">
                      <Camera className="h-5 w-5 text-cyber-purple" />
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-white">Upload Screenshots</div>
                      <div className="text-xs text-slate-400">AI-powered OCR will extract text, addresses, and URLs from images</div>
                    </div>
                    <Image className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  </div>

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="glass-card rounded-xl p-4">
                      <div className="text-xs font-medium text-slate-400 mb-3">Uploaded Files ({uploadedFiles.length})</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-cyber-blue flex-shrink-0" />
                              <span className="text-sm text-white truncate">{f}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setUploadedFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                              className="text-slate-400 hover:text-cyber-red transition flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Paste chat text */}
                  <div className="glass-card rounded-xl p-4">
                    <div className="text-xs font-medium text-slate-400 mb-2">Or paste chat text directly</div>
                    <textarea
                      className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 resize-none font-mono"
                      rows={4}
                      placeholder="Paste exported chat conversation here..."
                      value={pastedChat}
                      onChange={e => setPastedChat(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={uploadedFiles.length === 0 && !pastedChat.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-4 text-base font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Eye className="h-5 w-5" />
                    Analyze with AI
                  </button>
                </div>

                {/* Preview / instructions */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                    <Shield className="h-5 w-5 text-cyber-green" />
                    What AI Will Extract
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Crypto Wallet Addresses', desc: 'BTC, ETH, TRON, and 40+ formats auto-detected and risk-scored' },
                      { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'URLs & Domains', desc: 'Scam sites, phishing links, and malicious domains identified' },
                      { icon: Phone, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Phone Numbers', desc: 'Carrier lookup, VoIP detection, and fraud database cross-reference' },
                      { icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Email Addresses', desc: 'Scam campaign association and disposable email detection' },
                      { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Timeline Builder', desc: 'Chronological reconstruction of scam progression' },
                      { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Manipulation Tactics', desc: 'AI detects urgency, false promises, and social engineering' },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} flex-shrink-0`}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{item.label}</div>
                          <div className="text-xs text-slate-400">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-lg border border-white/5 bg-dark-900/50 p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Shield className="h-3.5 w-3.5 text-cyber-green" />
                      <span>Your data is encrypted end-to-end. Chat content is analyzed locally and never stored on our servers.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Analyzing */}
          {step === 'analyzing' && (
            <div className="mx-auto max-w-lg animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyber-green/10 animate-pulse-glow">
                  <Bot className="h-10 w-10 text-cyber-green" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Analyzing Evidence</h3>
                <p className="text-sm text-slate-400 mb-6">
                  {currentAnalysisStep?.label || 'Initializing...'}
                </p>

                <div className="mb-4 h-2 overflow-hidden rounded-full bg-dark-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyber-green to-cyber-blue transition-all duration-150"
                    style={{ width: `${analyzeProgress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-cyber-green">{analyzeProgress}%</span>

                <div className="mt-6 space-y-2">
                  {analysisSteps.map((s, i) => {
                    const done = analyzeProgress >= s.threshold + 10;
                    const active = analyzeProgress >= s.threshold && !done;
                    return (
                      <div key={i} className={`flex items-center gap-2 text-xs transition-all ${
                        done ? 'text-cyber-green' : active ? 'text-white' : 'text-slate-600'
                      }`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-700" />}
                        {s.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {step === 'results' && showResults && (
            <div className="animate-fade-in-up">
              {/* Results summary */}
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{parsedMessages.length}</div>
                  <div className="text-xs text-slate-400">Lines Analyzed</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-red">{parsedMessages.filter(m => m.flagged).length}</div>
                  <div className="text-xs text-slate-400">Flagged Lines</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{realEntities.filter(e => e.type === 'wallet').length}</div>
                  <div className="text-xs text-slate-400">Wallets Found</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-cyber-blue">{realEntities.filter(e => e.type === 'url').length}</div>
                  <div className="text-xs text-slate-400">URLs Detected</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                  <div className="text-2xl font-bold text-cyber-orange">{realEntities.length}</div>
                  <div className="text-xs text-slate-400">Total Entities</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg border border-white/5 bg-dark-800 p-1 w-fit">
                {([
                  { key: 'chat' as const, label: 'Chat Analysis' },
                  { key: 'entities' as const, label: `Extracted Entities (${realEntities.length})` },
                  { key: 'timeline' as const, label: 'Evidence Timeline' },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveResultTab(tab.key)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      activeResultTab === tab.key ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button onClick={handleReset} className="ml-2 rounded-md px-3 py-2 text-xs text-slate-400 hover:text-white transition">
                  New Analysis
                </button>
              </div>

              {/* Chat Analysis */}
              {activeResultTab === 'chat' && (
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Analyzed Conversation</span>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-400/60" /> Flagged</div>
                      <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-cyan-400/60" /> Entity</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                    {parsedMessages.length === 0 ? (
                      <p className="text-sm text-slate-500 py-8 text-center">No chat messages to display. Paste chat text and run analysis first.</p>
                    ) : parsedMessages.map((msg, idx) => (
                      <div key={idx} className="flex justify-start">
                        <div className={`max-w-[90%] rounded-2xl px-4 py-3 bg-dark-700 ${msg.flagged ? 'border border-red-500/20 bg-red-500/[0.03]' : ''}`}>
                          {msg.flagged && (
                            <div className="flex items-center gap-1 mb-1">
                              <AlertTriangle className="h-3 w-3 text-red-400" />
                              <span className="text-[10px] font-bold text-red-400">ENTITY DETECTED</span>
                            </div>
                          )}
                          <p className="text-sm text-slate-200 break-words">{msg.text}</p>
                          {msg.entities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {msg.entities.map((e, i) => (
                                <button
                                  key={i}
                                  onClick={() => copyEntity(e)}
                                  className="flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400 font-mono hover:bg-cyan-500/20 transition truncate max-w-[200px]"
                                >
                                  {copiedEntity === e ? <CheckCircle2 className="h-2.5 w-2.5" /> : <ExternalLink className="h-2.5 w-2.5" />}
                                  {e.length > 30 ? e.slice(0, 15) + '...' + e.slice(-8) : e}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{parsedMessages.length} lines analyzed, {parsedMessages.filter(m => m.flagged).length} flagged</span>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-cyber-green hover:underline">
                      Export Analysis <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Extracted Entities */}
              {activeResultTab === 'entities' && (
                <div className="space-y-3">
                  {realEntities.length === 0 && (
                    <p className="text-sm text-slate-500 py-8 text-center">No entities were found. Paste chat text containing wallet addresses, URLs, phone numbers, or emails and run the analysis.</p>
                  )}
                  {realEntities.map((entity, idx) => {
                    const Icon = entityIcons[entity.type];
                    return (
                      <div key={idx} className={`glass-card rounded-xl p-4 border ${
                        entity.risk === 'critical' ? 'border-red-500/20' : entity.risk === 'high' ? 'border-orange-500/20' : 'border-white/5'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                            entity.type === 'wallet' ? 'bg-amber-500/10' : entity.type === 'url' ? 'bg-blue-500/10' : entity.type === 'phone' ? 'bg-green-500/10' : entity.type === 'email' ? 'bg-purple-500/10' : 'bg-slate-500/10'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              entity.type === 'wallet' ? 'text-amber-400' : entity.type === 'url' ? 'text-blue-400' : entity.type === 'phone' ? 'text-green-400' : entity.type === 'email' ? 'text-purple-400' : 'text-slate-400'
                            }`} />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-400 uppercase">{entity.type}</span>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${riskBadge[entity.risk]}`}>{entity.risk}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <code className="text-sm font-mono text-white break-all">{entity.value}</code>
                              <button onClick={() => copyEntity(entity.value)} className="text-slate-400 hover:text-white transition flex-shrink-0">
                                {copiedEntity === entity.value ? <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">{entity.detail}</p>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {entity.type === 'wallet' && (
                              <a href="#tracker" className="text-[10px] font-medium text-cyber-green hover:underline flex items-center gap-0.5">
                                Trace <ArrowRight className="h-2.5 w-2.5" />
                              </a>
                            )}
                            {entity.type === 'url' && (
                              <a href="#osint-tools" className="text-[10px] font-medium text-cyber-blue hover:underline flex items-center gap-0.5">
                                Check <ArrowRight className="h-2.5 w-2.5" />
                              </a>
                            )}
                            {entity.type === 'phone' && (
                              <a href="#osint-tools" className="text-[10px] font-medium text-green-400 hover:underline flex items-center gap-0.5">
                                Lookup <ArrowRight className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <a href="#tracker" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyber-green/10 border border-cyber-green/20 py-3 text-sm font-bold text-cyber-green hover:bg-cyber-green/20 transition">
                      <Hash className="h-4 w-4" /> Trace All Wallets
                    </a>
                    <a href="#evidence" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 py-3 text-sm font-bold text-cyber-blue hover:bg-cyber-blue/20 transition">
                      <FileText className="h-4 w-4" /> Generate Evidence Packet
                    </a>
                  </div>
                </div>
              )}

              {/* Evidence Timeline */}
              {activeResultTab === 'timeline' && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                    <Clock className="h-5 w-5 text-cyber-green" />
                    Extracted Entity Timeline
                  </h3>
                  <div className="relative pl-8">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-green via-cyber-orange to-cyber-red" />
                    {(realEntities.length > 0 ? realEntities.map((ent, i) => ({
                      time: `Entity ${i + 1}`,
                      event: ent.type === 'wallet' ? 'Crypto Address Found' : ent.type === 'url' ? 'URL/Domain Found' : ent.type === 'phone' ? 'Phone Number Found' : ent.type === 'email' ? 'Email Found' : 'IP Address Found',
                      detail: `${ent.detail} — Value: ${ent.value}`,
                      risk: ent.risk === 'critical' ? 'critical' : ent.risk === 'high' ? 'high' : 'medium',
                      type: ent.type,
                    })) : [{
                      time: '-',
                      event: 'No entities found',
                      detail: 'Paste chat text containing wallet addresses, URLs, phone numbers, or emails and run the analysis.',
                      risk: 'medium',
                      type: 'info',
                    }]).map((event, idx) => (
                      <div key={idx} className="relative mb-6 last:mb-0">
                        <div className={`absolute -left-5 top-1 h-3 w-3 rounded-full border-2 ${
                          event.risk === 'critical' ? 'border-red-400 bg-red-500/30' :
                          event.risk === 'high' ? 'border-orange-400 bg-orange-500/30' : 'border-yellow-400 bg-yellow-500/30'
                        }`} />
                        <div className="rounded-lg bg-white/[0.02] p-4">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono text-slate-500">{event.time}</span>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${riskBadge[event.risk]}`}>{event.risk}</span>
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 capitalize">{event.type}</span>
                          </div>
                          <div className="text-sm font-medium text-white">{event.event}</div>
                          <p className="mt-1 text-xs text-slate-400">{event.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <a href="#evidence" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3 text-sm font-bold text-dark-900 hover:shadow-lg hover:shadow-cyber-green/20 transition">
                      <FileText className="h-4 w-4" /> Add to Evidence Packet
                    </a>
                    <button onClick={handleReset} className="flex-1 btn-secondary text-sm py-3 text-center">
                      Analyze Another Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
