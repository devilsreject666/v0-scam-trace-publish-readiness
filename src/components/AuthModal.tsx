import { useState } from 'react';
import {
  X, Shield, Mail, Lock, User, Eye, EyeOff, CheckCircle2,
  Chrome, Apple, ArrowRight, AlertTriangle, KeyRound
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'investigator';
  plan: 'free' | 'pro' | 'investigator' | 'enterprise';
  avatar: string;
  joinDate: string;
  casesCreated: number;
  verified: boolean;
}

export function AuthModal({ isOpen, onClose, onLogin, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | '2fa'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !agreedTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (!email.trim() || (mode !== 'forgot' && !password.trim())) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setResetSent(true);
      }, 1500);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate 2FA for login
      if (mode === 'login') {
        setMode('2fa');
        return;
      }
      // Signup success
      completeAuth();
    }, 1500);
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFACode.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      completeAuth();
    }, 1000);
  };

  const completeAuth = () => {
    const isAdmin = email.toLowerCase().includes('admin');
    const user: UserProfile = {
      name: name || email.split('@')[0],
      email,
      role: isAdmin ? 'admin' : 'user',
      plan: 'pro',
      avatar: (name || email).substring(0, 2).toUpperCase(),
      joinDate: new Date().toISOString(),
      casesCreated: 0,
      verified: true,
    };
    onLogin(user);
    onClose();
    resetForm();
  };

  const handleOAuth = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        name: provider === 'google' ? 'John Doe' : 'Jane Smith',
        email: provider === 'google' ? 'john@gmail.com' : 'jane@icloud.com',
        role: 'user',
        plan: 'free',
        avatar: provider === 'google' ? 'JD' : 'JS',
        joinDate: new Date().toISOString(),
        casesCreated: 0,
        verified: true,
      };
      onLogin(user);
      onClose();
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setTwoFACode('');
    setAgreedTerms(false);
    setResetSent(false);
    setMode('login');
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-cyber-green'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-800 shadow-2xl animate-fade-in-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-brand-800 via-dark-800 to-dark-900 px-8 pt-8 pb-6">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white transition p-1">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-green to-cyber-blue">
              <Shield className="h-5 w-5 text-dark-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white">Scam<span className="text-cyber-green">Trace</span></span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset password'}
            {mode === '2fa' && 'Two-factor authentication'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login' && 'Sign in to access your investigation dashboard'}
            {mode === 'signup' && 'Start protecting yourself from crypto fraud'}
            {mode === 'forgot' && "Enter your email and we'll send a reset link"}
            {mode === '2fa' && 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <div className="px-8 pb-8 pt-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 2FA Form */}
          {mode === '2fa' && (
            <form onSubmit={handle2FA} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-green/10">
                  <KeyRound className="h-8 w-8 text-cyber-green" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full rounded-xl border border-white/10 bg-dark-900 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-600 outline-none focus:border-cyber-green/50 transition"
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || twoFACode.length < 6}
                className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <p className="text-center text-xs text-slate-500">
                Didn't receive a code? <button type="button" className="text-cyber-green hover:underline">Resend</button>
              </p>
            </form>
          )}

          {/* Forgot Password */}
          {mode === 'forgot' && (
            resetSent ? (
              <div className="text-center py-6 animate-fade-in-up">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-green/10">
                  <CheckCircle2 className="h-8 w-8 text-cyber-green" />
                </div>
                <h3 className="text-lg font-bold text-white">Check your email</h3>
                <p className="mt-2 text-sm text-slate-400">
                  We sent a password reset link to <span className="text-white font-medium">{email}</span>
                </p>
                <button
                  onClick={() => { setMode('login'); setResetSent(false); }}
                  className="mt-6 text-sm text-cyber-green hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setMode('login')} className="w-full text-sm text-slate-400 hover:text-white transition">
                  Back to sign in
                </button>
              </form>
            )
          )}

          {/* Login / Signup */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              {/* OAuth buttons */}
              <div className="space-y-2.5 mb-6">
                <button
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </button>
                <button
                  onClick={() => handleOAuth('apple')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  <Apple className="h-4 w-4" />
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-dark-800 px-4 text-xs text-slate-500">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-12 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className={`text-[10px] ${strength >= 3 ? 'text-cyber-green' : strength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {strength > 0 ? strengthLabels[strength - 1] : 'Too short'} — {password.length < 8 ? 'Min 8 chars' : 'Use uppercase, numbers, symbols'}
                      </span>
                    </div>
                  )}
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/20 bg-dark-900 accent-cyber-green h-3.5 w-3.5" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-cyber-green hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === 'signup' && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-dark-900 accent-cyber-green h-3.5 w-3.5"
                    />
                    <span className="text-xs text-slate-400">
                      I agree to the <a href="#" className="text-cyber-green hover:underline">Terms of Service</a> and{' '}
                      <a href="#" className="text-cyber-green hover:underline">Privacy Policy</a>. My data is encrypted end-to-end.
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3.5 text-sm font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Processing...'
                  ) : mode === 'login' ? (
                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                  ) : (
                    <>Create Account <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                {mode === 'login' ? (
                  <>Don&apos;t have an account? <button onClick={() => setMode('signup')} className="text-cyber-green hover:underline font-medium">Sign up free</button></>
                ) : (
                  <>Already have an account? <button onClick={() => setMode('login')} className="text-cyber-green hover:underline font-medium">Sign in</button></>
                )}
              </p>

              {/* Security badges */}
              <div className="mt-6 flex items-center justify-center gap-4 border-t border-white/5 pt-5">
                {['256-bit SSL', 'SOC 2', 'GDPR'].map(b => (
                  <div key={b} className="flex items-center gap-1 text-[10px] text-slate-600">
                    <Lock className="h-2.5 w-2.5" />
                    {b}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
