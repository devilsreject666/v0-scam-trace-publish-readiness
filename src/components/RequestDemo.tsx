import { useState } from 'react';
import { X, Shield, Send, CheckCircle2, Building2, Mail, User, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RequestDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDemo({ isOpen, onClose }: RequestDemoProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    const { error: dbError } = await supabase.from('demo_requests').insert({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim() || null,
      use_case: useCase.trim() || null,
    });
    setLoading(false);
    if (dbError) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  const reset = () => {
    setName('');
    setEmail('');
    setOrganization('');
    setUseCase('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={reset}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-fade-in-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-brand-800 via-dark-800 to-dark-900 px-8 pt-8 pb-6">
          <button onClick={reset} className="absolute right-4 top-4 text-slate-400 hover:text-white transition p-1">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-green to-cyber-blue">
              <Shield className="h-5 w-5 text-dark-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Request a <span className="text-cyber-green">Demo</span></span>
          </div>
          <p className="text-sm text-slate-400">See how ScamTrace can help your team investigate and document crypto fraud.</p>
        </div>

        <div className="px-8 pb-8 pt-6">
          {submitted ? (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-green/10">
                <CheckCircle2 className="h-8 w-8 text-cyber-green" />
              </div>
              <h3 className="text-lg font-bold text-white">Request Received</h3>
              <p className="mt-2 text-sm text-slate-400">
                We will reach out to <span className="text-white font-medium">{email}</span> within 1 business day.
              </p>
              <button onClick={reset} className="mt-6 rounded-xl bg-white/5 border border-white/10 px-6 py-2.5 text-sm text-white hover:bg-white/10 transition">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
              )}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Work Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="email" placeholder="jane@agency.gov" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Your agency or company" value={organization} onChange={e => setOrganization(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Use Case</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <textarea placeholder="What do you need ScamTrace for?" value={useCase} onChange={e => setUseCase(e.target.value)} rows={3}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition resize-none" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Submitting...' : <><Send className="h-4 w-4" /> Request Demo</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
