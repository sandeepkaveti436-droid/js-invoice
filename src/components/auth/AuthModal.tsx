import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  X,
  UserCheck,
  Eye
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, canClose = true }) => {
  const { login, signup, loginWithGoogle, showToast } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password.trim()) {
          setError('Please provide your email and password.');
          setIsLoading(false);
          return;
        }
        await login(email, password);
        showToast('Welcome back to JS Invoice!', 'success');
        if (onClose) onClose();
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError('Please fill in all required fields.');
          setIsLoading(false);
          return;
        }
        await signup(name, email, password, companyName);
        showToast('Account created successfully! Welcome to JS Invoice.', 'success');
        if (onClose) onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google successfully!', 'success');
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoUser = async () => {
    setIsLoading(true);
    try {
      await signup('Alex Rivera', 'alex@nexuscraft.design', 'demo123', 'Nexus Craft Studio');
      showToast('Logged in as Demo User!', 'success');
      if (onClose) onClose();
    } catch {
      await login('alex@nexuscraft.design', 'demo123');
      if (onClose) onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setIsLoading(true);
    try {
      await login('admin@jsinvoice.com', 'admin123');
      showToast('Logged in as JS Invoice Administrator! Admin Panel unlocked.', 'success');
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Brand Top Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-400" />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mx-auto mb-3">
            <span className="font-black text-xl tracking-tighter">JS</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            JS <span className="text-indigo-600">Invoice</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin'
              ? 'Sign in to access your personal invoice workspace'
              : 'Create an account to start generating commercial invoices'}
          </p>
        </div>

        {/* 1-Click Fast Access Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={handleQuickDemoUser}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/80 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1-Click User Login</span>
          </button>

          <button
            type="button"
            onClick={handleQuickAdmin}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>1-Click Admin Panel</span>
          </button>
        </div>

        {/* Google OAuth Option */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-subtle active:scale-[0.98] mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            New Account (Sign Up)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Business Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Creative Studio LLC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {onClose && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Continue and explore workspace as guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
