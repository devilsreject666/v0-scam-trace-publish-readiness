import { Shield, CheckCircle2, XCircle } from 'lucide-react';

export function Transparency() {
  return (
    <section className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-cyber-green" />
            <span className="text-xs font-medium text-cyber-green">Our Promise</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Transparency & <span className="gradient-text">Integrity</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            ScamTrace is a documentation platform, not a recovery service. We believe transparency builds trust.
            We make no false claims, no guaranteed promises, and no hidden practices.
          </p>
        </div>

        {/* Mission quote */}
        <div className="mx-auto max-w-2xl mb-16">
          <div className="glass-card-premium rounded-2xl p-8 text-center">
            <p className="text-xl font-medium text-slate-200 italic leading-relaxed">
              {"\"Help people document the truth.\""}
            </p>
            <p className="mt-4 text-sm text-slate-500">Our mission is simple.</p>
          </div>
        </div>

        {/* What makes us different */}
        <div className="grid gap-8 sm:grid-cols-2 mb-16">
          <div className="glass-card-premium rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">What Others Do</h3>
            <ul className="space-y-3">
              {[
                'Sell to governments',
                'Hide behind enterprise pricing',
                'Focus on surveillance',
                'Make recovery promises',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <XCircle className="h-4 w-4 flex-shrink-0 text-slate-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card-premium rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">What ScamTrace Does</h3>
            <ul className="space-y-3">
              {[
                'Empower individuals',
                'Focus on documentation',
                'Produce usable forensic artifacts',
                'Honest, transparent pricing',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyber-green" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom note */}
        <div className="text-center">
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Case narrative + timeline + evidence export for victims. That is our focus, and no one else does it like we do.
          </p>
        </div>
      </div>
    </section>
  );
}
