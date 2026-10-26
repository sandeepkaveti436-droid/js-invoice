import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  UserPlus, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Check, 
  ChevronDown,
  KeyRound,
  AlertCircle,
  Mail,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { validateOfficialEmail } from '../utils/validation';

interface CountryCode {
  name: string;
  code: string;
  flag: string;
}

const COUNTRIES: CountryCode[] = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
];

const CAROUSEL_SLIDES = [
  {
    title: 'Discover the best delivery today.',
    subtitle: 'Streamlined invoice generation, automated payment tracking, and real-time financial reporting for modern businesses.',
    badge: 'Fast & Automated',
  },
  {
    title: 'GST & Multi-currency billing ready.',
    subtitle: 'Create compliant CGST, SGST, IGST, and international tax invoices in under two minutes with zero calculation errors.',
    badge: '100% Compliant',
  },
  {
    title: 'Get paid 2x faster with smart links.',
    subtitle: 'Share live invoices with client self-service portal, multiple payment gateways, and instant PDF downloads.',
    badge: 'Instant Ledger',
  },
];

export const AuthPage: React.FC = () => {
  const { login, signup, verifyEmail, showToast, currentUser } = useApp();

  // Mode: 'signin' | 'signup' | 'forgot' | 'verify_pending'
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'verify_pending'>('signin');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isSuccessTransition, setIsSuccessTransition] = useState(false);
  const [transitionUser, setTransitionUser] = useState({ name: '', title: '' });

  // Verification flow state
  const [verificationDetails, setVerificationDetails] = useState<{
    name: string;
    email: string;
    token: string;
    url: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  // Carousel slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Detect verification link from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify');
    const verifyEmailParam = params.get('email');

    if (verifyToken) {
      handleConfirmVerification(verifyToken, verifyEmailParam || undefined);
    }
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 95,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#4F46E5', '#10B981', '#F43F5E', '#3B82F6']
      });
    } catch {}
  };

  const handleConfirmVerification = async (token: string, emailParam?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const verifiedUser = await verifyEmail(token, emailParam);
      setShowCongratsModal(true);
      triggerConfetti();

      // Clean query parameters from browser URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid or expired verification link.');
      setMode('signin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchDashboardFromCongrats = () => {
    setShowCongratsModal(false);
    setIsSuccessTransition(true);
    setTransitionUser({
      name: currentUser?.name || 'Verified User',
      title: 'Launching Workspace'
    });

    setTimeout(() => {
      showToast(`Welcome to your official JS Invoice workspace!`, 'success');
    }, 900);
  };

  const handleCopyVerificationLink = () => {
    if (!verificationDetails?.url) return;
    navigator.clipboard.writeText(verificationDetails.url);
    setCopiedLink(true);
    showToast('Verification link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const cleanEmail = email.trim();
        if (!cleanEmail) {
          setErrorMessage('Please enter your official email address.');
          setIsLoading(false);
          return;
        }

        const emailCheck = validateOfficialEmail(cleanEmail);
        if (!emailCheck.valid) {
          setErrorMessage(emailCheck.reason || 'Please enter a valid official email address.');
          setIsLoading(false);
          return;
        }

        if (!password.trim()) {
          setErrorMessage('Please enter your password.');
          setIsLoading(false);
          return;
        }

        // Validate credentials FIRST before triggering any workspace transition
        try {
          const user = await login(cleanEmail, password);
          
          // Only if credentials are valid, show transition animation
          setIsSuccessTransition(true);
          setTransitionUser({
            name: user.name || cleanEmail.split('@')[0],
            title: 'Welcome Back!'
          });

          setTimeout(() => {
            showToast(`Welcome back to JS Invoice, ${user.name}!`, 'success');
            setIsLoading(false);
          }, 800);
        } catch (err: any) {
          setIsSuccessTransition(false);
          setErrorMessage(err?.message || 'Authentication error. Please check your credentials.');
          setIsLoading(false);
        }
        return;

      } else if (mode === 'signup') {
        const cleanName = fullName.trim();
        const cleanEmail = email.trim();

        if (!cleanName) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }

        const emailCheck = validateOfficialEmail(cleanEmail);
        if (!emailCheck.valid) {
          setErrorMessage(emailCheck.reason || 'Please enter a valid official email address.');
          setIsLoading(false);
          return;
        }

        if (!password.trim() || password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }

        const fullPhoneNumber = phone.trim() ? `${selectedCountry.code} ${phone.trim()}` : '';

        try {
          // Attempt registration and generate official verification link
          const res = await signup(cleanName, cleanEmail, password, `${cleanName}'s Business`, fullPhoneNumber);
          
          setVerificationDetails({
            name: cleanName,
            email: cleanEmail,
            token: res.verificationToken,
            url: res.verificationUrl,
          });

          setMode('verify_pending');
          setIsLoading(false);
          showToast(`Official verification link generated for ${cleanEmail}!`, 'info');
        } catch (err: any) {
          setIsSuccessTransition(false);
          setErrorMessage(err?.message || 'Failed to create account.');
          setIsLoading(false);
        }
        return;

      } else if (mode === 'forgot') {
        const cleanEmail = email.trim();
        if (!cleanEmail) {
          setErrorMessage('Please enter your registered official email address.');
          setIsLoading(false);
          return;
        }

        const emailCheck = validateOfficialEmail(cleanEmail);
        if (!emailCheck.valid) {
          setErrorMessage(emailCheck.reason || 'Please enter a valid official email address.');
          setIsLoading(false);
          return;
        }

        // Simulated password reset
        setResetSent(true);
        showToast('Password reset link sent to ' + cleanEmail, 'info');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please check your details.');
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Navigate to create account form with clean blank inputs so user enters their genuine Google details
    setMode('signup');
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setErrorMessage(null);
    showToast('Please enter your official Google account details to register your JS Invoice workspace.', 'info');
  };

  const activeSlideData = CAROUSEL_SLIDES[currentSlide];

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-3 sm:p-5 font-sans selection:bg-amber-100 selection:text-amber-900 relative">
      
      {/* ======================================================== */}
      {/* CONGRATULATIONS POPUP MODAL (ON EMAIL VERIFICATION)      */}
      {/* ======================================================== */}
      {showCongratsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-100 animate-checkmark-pop space-y-4">
            <div className="relative mx-auto w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Official Email Verified & Activated
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Congratulations! Your JS Invoice is ready to use!
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Thank you for verifying your official email (<strong>{currentUser?.email || verificationDetails?.email}</strong>). Your account is now active with your original data.
            </p>

            <button
              type="button"
              onClick={handleLaunchDashboardFromCongrats}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Main Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Outer Card Container - Perfectly Centered in the middle */}
      <div className="w-full max-w-4xl bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_15px_50px_rgba(0,0,0,0.07)] border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-2 p-3 sm:p-4 gap-5 lg:gap-7 items-center my-auto">
        
        {/* ======================================================== */}
        {/* LEFT SIDE: Branded Visual Card with Border Radius        */}
        {/* ======================================================== */}
        <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[490px] w-full rounded-[24px] overflow-hidden flex flex-col justify-between p-5 sm:p-7 bg-slate-950 text-white shadow-inner select-none">
          
          {/* Background Photo & Light Runway Effects */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1400&q=80')`,
            }}
          />

          {/* Fallback Graphic Lights & Depth Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Logo with Border Radius (as requested) */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-lg">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white">JS Invoice</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white leading-none">
                    Official
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeSlideData.badge}</span>
            </div>
          </div>

          {/* Center: Glowing Visual Accent Badge */}
          <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center text-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center p-4 transform hover:scale-105 transition-transform duration-500">
              {/* Outer Pulse */}
              <div className="absolute inset-0 rounded-3xl bg-amber-500/20 animate-ping opacity-40 pointer-events-none" />
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              {/* Floating micro badges */}
              <div className="absolute -top-3 -right-3 px-2 py-1 bg-emerald-500 text-[10px] font-bold text-white rounded-lg shadow-md flex items-center gap-1">
                <Check className="w-3 h-3" /> Official SaaS
              </div>
            </div>
          </div>

          {/* Bottom Content: Headline, Subtitle, & Carousel Dots */}
          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-white transition-all duration-300">
                {activeSlideData.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-md line-clamp-3">
                {activeSlideData.subtitle}
              </p>
            </div>

            {/* Carousel Indicator Dots (matching reference image) */}
            <div className="flex items-center gap-2 pt-2">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    currentSlide === idx
                      ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Form Content Only                            */}
        {/* ======================================================== */}
        <div className="w-full max-w-md mx-auto py-3 sm:py-6 px-1 sm:px-3 flex flex-col justify-center">
          
          {isSuccessTransition ? (
            /* ======================================================== */
            /* CELEBRATION & WORKSPACE LAUNCH ANIMATION                 */
            /* ======================================================== */
            <div className="w-full py-8 px-4 flex flex-col items-center justify-center text-center animate-workspace-enter">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/20 animate-checkmark-pop">
                  <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-checkmark-pop">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
                {transitionUser.title}
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Welcome, {transitionUser.name}!
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                Loading your official JS Invoice workspace...
              </p>

              {/* Animated Progress Bar */}
              <div className="w-64 h-2.5 bg-slate-100 rounded-full mt-6 overflow-hidden border border-slate-200">
                <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 rounded-full w-full animate-pulse transition-all duration-1000" />
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Launching main workspace...</span>
              </div>
            </div>
          ) : mode === 'verify_pending' && verificationDetails ? (
            /* ======================================================== */
            /* VERIFY PENDING VIEW: OFFICIAL LINK GENERATED & SHARE     */
            /* ======================================================== */
            <div className="w-full py-4 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
                <Mail className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Verify your email
                </h1>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  We've generated an official verification link for your email address:
                </p>
                <div className="pt-1">
                  <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                    {verificationDetails.email}
                  </span>
                </div>
              </div>

              {/* Official Simulated Email Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px] text-slate-500">
                  <span>From: <strong className="text-slate-700">verify@jsinvoice.com</strong></span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">Official</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Hi <strong>{verificationDetails.name}</strong>, click the official verification button below to activate your account and access your JS Invoice workspace:
                </p>

                <button
                  type="button"
                  onClick={() => handleConfirmVerification(verificationDetails.token, verificationDetails.email)}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Click to Verify & Open JS Invoice</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleCopyVerificationLink}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link copied!' : 'Copy verification link'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-500 hover:text-amber-600 transition-colors font-medium"
                >
                  Already verified? <span className="font-semibold text-amber-500">Log in with your credentials</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Circle Avatar (matching the reference image icon) */}
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 mx-auto mb-4 shadow-sm">
                {mode === 'signup' ? (
                  <UserPlus className="w-6 h-6 text-slate-600" />
                ) : mode === 'forgot' ? (
                  <KeyRound className="w-6 h-6 text-slate-600" />
                ) : (
                  <UserIcon className="w-6 h-6 text-slate-600" />
                )}
              </div>

          {/* Form Header Titles */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
              {mode === 'signup' 
                ? 'Create account' 
                : mode === 'forgot' 
                ? 'Reset password' 
                : 'Log in'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'signup'
                ? 'Enter your official details to create an account.'
                : mode === 'forgot'
                ? 'Enter your email address to receive password instructions.'
                : 'Enter your credentials to access your account.'}
            </p>
          </div>

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reset Link Sent Success Banner */}
          {mode === 'forgot' && resetSent && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Password reset instructions sent!
              </div>
              <p className="text-emerald-700">
                Check your inbox at <strong>{email}</strong> for instructions to reset your password.
              </p>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* SIGN UP ONLY: Full Name Field */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* SIGN UP ONLY: Phone Number Field with Country Prefix Dropdown */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phone number
                </label>
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
                  
                  {/* Flag / Country Code Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-l-xl transition-colors focus:outline-none"
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Country Dropdown Popover */}
                    {isCountryDropdownOpen && (
                      <div className="absolute z-30 left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 max-h-48 overflow-y-auto">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span className="font-medium text-slate-800">{c.name}</span>
                            </span>
                            <span className="text-slate-500 font-mono">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vertical Divider Line (matching reference screenshot) */}
                  <div className="h-6 w-px bg-slate-200 mr-2" />

                  {/* Phone Input */}
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter number"
                    className="w-full py-2.5 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* Email Address Field (Present in all modes) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official.name@company.com or @gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
              />
            </div>

            {/* Password Field (Sign In & Sign Up) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setResetSent(false);
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-amber-600 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button (Amber Yellow as in reference screenshot) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signup' ? (
                'Create account'
              ) : mode === 'forgot' ? (
                'Send reset instructions'
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Bottom Switch Link (matching reference screenshot) */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                >
                  Back to Log in
                </button>
              </p>
            )}
          </div>

          {/* Social Auth & Quick Demo Testing Shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm"
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
          </div>
        </>
      )}

        </div>

      </div>
    </div>
  );
};
