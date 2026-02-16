import { useState, useEffect } from 'react';
import { Plus, X, Clock, FileText, Trash2, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface TimelineEvent {
  id: string;
  label: string;
  description: string | null;
  event_time: string;
  event_type: string;
  evidence_id: string | null;
  created_at: string;
}

interface Evidence {
  id: string;
  type: string;
  label: string;
  value: string | null;
  created_at: string;
}

interface ForensicTimelineProps {
  caseId: string;
  evidence: Evidence[];
}

export function ForensicTimeline({ caseId, evidence }: ForensicTimelineProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [generatingNarrative, setGeneratingNarrative] = useState(false);

  // Form state
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState('general');
  const [linkedEvidence, setLinkedEvidence] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchNarrative();
  }, [caseId]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('case_id', caseId)
      .order('event_time', { ascending: true });
    setEvents((data as TimelineEvent[]) ?? []);
    setLoading(false);
  };

  const fetchNarrative = async () => {
    const { data } = await supabase
      .from('narratives')
      .select('content')
      .eq('case_id', caseId)
      .order('generated_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) setNarrative(data[0].content);
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !user) return;
    setAdding(true);
    await supabase.from('timeline_events').insert({
      case_id: caseId,
      user_id: user.id,
      label: label.trim(),
      description: description.trim() || null,
      event_time: eventTime || new Date().toISOString(),
      event_type: eventType,
      evidence_id: linkedEvidence || null,
    });
    setAdding(false);
    setLabel('');
    setDescription('');
    setEventTime('');
    setEventType('general');
    setLinkedEvidence('');
    setShowAdd(false);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('timeline_events').delete().eq('id', id);
    fetchEvents();
  };

  const generateNarrative = async () => {
    if (!user || events.length === 0) return;
    setGeneratingNarrative(true);

    // Structured forensic narrative
    const line = (s = '') => s;
    const sep = (char = '=', len = 60) => char.repeat(len);
    const lines: string[] = [];

    lines.push(sep());
    lines.push('SCAMTRACE -- FORENSIC TIMELINE NARRATIVE');
    lines.push(sep());
    lines.push('');
    lines.push(`Report Generated : ${new Date().toISOString()}`);
    lines.push(`Total Events     : ${events.length}`);
    lines.push(`Evidence Items   : ${evidence.length}`);

    // Date range
    const sorted = [...events].sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime());
    if (sorted.length >= 2) {
      const first = new Date(sorted[0].event_time);
      const last = new Date(sorted[sorted.length - 1].event_time);
      const days = Math.max(1, Math.round((last.getTime() - first.getTime()) / 86400000));
      lines.push(`Time Span        : ${first.toLocaleDateString()} - ${last.toLocaleDateString()} (${days} day${days !== 1 ? 's' : ''})`);
    }

    // Event type breakdown
    const typeCounts: Record<string, number> = {};
    events.forEach(ev => { typeCounts[ev.event_type] = (typeCounts[ev.event_type] || 0) + 1; });
    lines.push(`Event Types      : ${Object.entries(typeCounts).map(([k, v]) => `${k} (${v})`).join(', ')}`);
    lines.push('');

    // Chronological narrative
    lines.push(sep('-'));
    lines.push('SECTION 1: CHRONOLOGICAL SUMMARY');
    lines.push(sep('-'));
    lines.push('');

    sorted.forEach((ev, i) => {
      const date = new Date(ev.event_time);
      const pad = String(i + 1).padStart(2, '0');
      lines.push(`  ${pad}. [${date.toISOString()}]`);
      lines.push(`      Event: ${ev.label}`);
      if (ev.description) lines.push(`      Detail: ${ev.description}`);
      if (ev.event_type !== 'general') lines.push(`      Category: ${ev.event_type.toUpperCase()}`);
      lines.push('');
    });

    // Evidence inventory
    if (evidence.length > 0) {
      lines.push(sep('-'));
      lines.push('SECTION 2: EVIDENCE INVENTORY');
      lines.push(sep('-'));
      lines.push('');

      evidence.forEach((ev, i) => {
        const pad = String(i + 1).padStart(2, '0');
        lines.push(`  ${pad}. [${ev.type.toUpperCase()}] ${ev.label}`);
        if (ev.value) lines.push(`      Identifier: ${ev.value}`);
        lines.push(`      Collected: ${new Date(ev.created_at).toISOString()}`);
        lines.push('');
      });
    }

    // Key observations
    lines.push(sep('-'));
    lines.push('SECTION 3: KEY OBSERVATIONS');
    lines.push(sep('-'));
    lines.push('');

    const txEvents = events.filter(e => e.event_type === 'transaction');
    const alertEvents = events.filter(e => e.event_type === 'alert');
    if (txEvents.length > 0) {
      lines.push(`  - ${txEvents.length} transaction-related event(s) documented`);
    }
    if (alertEvents.length > 0) {
      lines.push(`  - ${alertEvents.length} alert(s) flagged during investigation`);
    }
    const walletEvidence = evidence.filter(e => e.type === 'wallet' || e.type === 'transaction');
    if (walletEvidence.length > 0) {
      lines.push(`  - ${walletEvidence.length} blockchain identifier(s) preserved`);
    }
    if (txEvents.length === 0 && alertEvents.length === 0 && walletEvidence.length === 0) {
      lines.push('  - No specific patterns flagged. Manual review recommended.');
    }
    lines.push('');

    // Disclaimer
    lines.push(sep());
    lines.push('DISCLAIMER');
    lines.push(sep());
    lines.push('');
    lines.push('This narrative was auto-generated by ScamTrace for documentation');
    lines.push('purposes only. It does not constitute legal advice and does not');
    lines.push('guarantee fund recovery. All information should be independently');
    lines.push('verified before submission to law enforcement or exchanges.');
    lines.push('');
    lines.push(sep());

    const content = lines.join('\n');

    await supabase.from('narratives').insert({
      case_id: caseId,
      user_id: user.id,
      content,
    });

    setNarrative(content);
    setGeneratingNarrative(false);
  };

  const typeIcons: Record<string, string> = {
    general: 'bg-slate-400/10 border-slate-400/20',
    transaction: 'bg-cyber-green/10 border-cyber-green/20',
    communication: 'bg-cyan-400/10 border-cyan-400/20',
    discovery: 'bg-cyber-blue/10 border-cyber-blue/20',
    report: 'bg-cyber-purple/10 border-cyber-purple/20',
    alert: 'bg-cyber-orange/10 border-cyber-orange/20',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Forensic Timeline</h3>
        <div className="flex gap-2">
          <button onClick={generateNarrative} disabled={generatingNarrative || events.length === 0}
            className="rounded-lg bg-cyber-purple/10 text-cyber-purple px-4 py-2 text-xs font-medium hover:bg-cyber-purple/20 transition flex items-center gap-1 disabled:opacity-50">
            {generatingNarrative ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate Narrative
          </button>
          <button onClick={() => setShowAdd(true)} className="rounded-lg bg-cyber-green/10 text-cyber-green px-4 py-2 text-xs font-medium hover:bg-cyber-green/20 transition flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Event
          </button>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading timeline...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No events yet</p>
          <p className="text-xs text-slate-500 mt-1">Add timeline events to document the chronology of the fraud.</p>
        </div>
      ) : (
        <div className="relative ml-4 border-l border-white/10 pl-6 space-y-6 mb-8">
          {events.map(ev => (
            <div key={ev.id} className="relative group">
              <div className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border ${typeIcons[ev.event_type] ?? typeIcons.general}`} />
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(ev.event_time).toLocaleString()}</span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 capitalize">{ev.event_type}</span>
                    </div>
                    <h4 className="font-medium text-white text-sm">{ev.label}</h4>
                    {ev.description && <p className="text-xs text-slate-400 mt-1">{ev.description}</p>}
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className="rounded p-1 text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Generated Narrative
            </h4>
            <button
              onClick={() => {
                const blob = new Blob([narrative], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scamtrace-narrative-${caseId.slice(0, 8)}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs text-cyber-green hover:underline flex items-center gap-1"
            >
              <FileText className="h-3 w-3" /> Download
            </button>
          </div>
          <div className="glass-card rounded-xl p-5">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">{narrative}</pre>
          </div>
        </div>
      )}

      {/* Add event modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold text-white">Add Timeline Event</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addEvent} className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Event Label *</label>
                <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g., Victim sent 2 ETH to scammer"
                  className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="More details..." rows={2}
                  className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Date/Time</label>
                  <input type="datetime-local" value={eventTime} onChange={e => setEventTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white outline-none focus:border-cyber-green/50 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Event Type</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white outline-none focus:border-cyber-green/50 transition">
                    <option value="general">General</option>
                    <option value="transaction">Transaction</option>
                    <option value="communication">Communication</option>
                    <option value="discovery">Discovery</option>
                    <option value="report">Report Filed</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
              </div>
              {evidence.length > 0 && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Link Evidence</label>
                  <select value={linkedEvidence} onChange={e => setLinkedEvidence(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 px-4 text-sm text-white outline-none focus:border-cyber-green/50 transition">
                    <option value="">None</option>
                    {evidence.map(ev => (
                      <option key={ev.id} value={ev.id}>[{ev.type}] {ev.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <button type="submit" disabled={adding || !label.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3 text-sm font-bold text-dark-900 transition hover:shadow-lg disabled:opacity-50">
                {adding ? 'Adding...' : 'Add Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
