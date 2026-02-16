import { useState, useEffect } from 'react';
import { Plus, FolderOpen, Search, Clock, AlertTriangle, CheckCircle2, X, ArrowRight, Trash2, Archive } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CaseDetail } from './CaseDetail';

interface Case {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'closed' | 'archived';
  scam_type: string | null;
  total_loss: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export function CaseDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New case form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scamType, setScamType] = useState('');
  const [totalLoss, setTotalLoss] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchCases();
  }, [user]);

  const fetchCases = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    setCases((data as Case[]) ?? []);
    setLoading(false);
  };

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setCreating(true);
    const { error } = await supabase.from('cases').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      scam_type: scamType || null,
      total_loss: totalLoss ? parseFloat(totalLoss) : null,
    });
    setCreating(false);
    if (!error) {
      setTitle('');
      setDescription('');
      setScamType('');
      setTotalLoss('');
      setShowNew(false);
      fetchCases();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('cases').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    fetchCases();
  };

  const deleteCase = async (id: string) => {
    await supabase.from('cases').delete().eq('id', id);
    fetchCases();
  };

  const filtered = cases.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusIcon = (s: string) => {
    if (s === 'open') return <AlertTriangle className="h-3.5 w-3.5 text-cyber-orange" />;
    if (s === 'closed') return <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green" />;
    return <Archive className="h-3.5 w-3.5 text-slate-400" />;
  };

  if (selectedCase) {
    return <CaseDetail caseId={selectedCase} onBack={() => { setSelectedCase(null); fetchCases(); }} />;
  }

  return (
    <section id="case-dashboard" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">My Cases</h2>
            <p className="text-sm text-slate-400 mt-1">{cases.length} total cases</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Case
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text" placeholder="Search cases..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-dark-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'closed', 'archived'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition capitalize ${
                  filter === f ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Case list */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading cases...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No cases found</h3>
            <p className="text-sm text-slate-500 mt-1">Create your first case to start investigating.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="glass-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.06] transition"
                onClick={() => setSelectedCase(c.id)}>
                <div className="flex items-start gap-3 flex-grow min-w-0">
                  {statusIcon(c.status)}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{c.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {c.scam_type && (
                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">{c.scam_type}</span>
                      )}
                      {c.total_loss != null && (
                        <span className="text-xs text-cyber-red font-medium">${c.total_loss.toLocaleString()} {c.currency}</span>
                      )}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {c.status === 'open' && (
                    <button onClick={() => updateStatus(c.id, 'closed')} className="rounded-lg bg-cyber-green/10 px-3 py-1.5 text-xs text-cyber-green hover:bg-cyber-green/20 transition">Close</button>
                  )}
                  {c.status === 'closed' && (
                    <button onClick={() => updateStatus(c.id, 'archived')} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10 transition">Archive</button>
                  )}
                  <button onClick={() => deleteCase(c.id)} className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New case modal */}
        {showNew && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-lg font-bold text-white">New Case</h3>
                <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white transition"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={createCase} className="px-6 pb-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Case Title *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Pig Butchering - $50K Loss"
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief summary..." rows={3}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Scam Type</label>
                    <select value={scamType} onChange={e => setScamType(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white outline-none focus:border-cyber-green/50 transition">
                      <option value="">Select...</option>
                      <option value="pig_butchering">Pig Butchering</option>
                      <option value="rug_pull">Rug Pull</option>
                      <option value="phishing">Phishing</option>
                      <option value="fake_exchange">Fake Exchange</option>
                      <option value="romance_scam">Romance Scam</option>
                      <option value="ponzi">Ponzi / HYIP</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Total Loss (USD)</label>
                    <input type="number" value={totalLoss} onChange={e => setTotalLoss(e.target.value)} placeholder="0.00"
                      className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition" />
                  </div>
                </div>
                <button type="submit" disabled={creating || !title.trim()}
                  className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create Case'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
