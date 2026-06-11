"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type LoginTab = "email" | "phone";

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithTelegram, loginAsGuest, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState<LoginTab>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      prev?.focus();
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await login(email, password);
    } catch {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 9) {
      setError("Enter a valid phone number.");
      return;
    }
    setOtpSent(true);
    setError("");
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    await login(phone, code);
  };

  return (
    <div className={cn("min-h-screen w-full relative overflow-hidden", isDark ? "animated-gradient" : "animated-gradient-light")}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl float-delayed" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl float" />
        {/* Ethiopian flag stripe accent */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-ethiopia-green" />
          <div className="flex-1 bg-ethiopia-yellow" />
          <div className="flex-1 bg-ethiopia-red" />
        </div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 glass rounded-xl p-2.5 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Hero illustration + branding */}
        <div className="text-center mb-8 animate-fade-up">
          <GraduationIllustration isDark={isDark} />
          <div className="mt-4">
            <h1 className="text-3xl font-extrabold gradient-text tracking-tight">
              Exit Exam Ethiopia
            </h1>
            <p className="text-foreground/60 text-sm mt-1.5">
              ዩኒቨርሲቲ ምረቃ ፈተና · University Graduation Exam
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-foreground/50 text-xs">50K+ Students</span>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-3xl p-6 md:p-8">
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden mb-6 bg-white/5 border border-white/10 p-1">
              {(["email", "phone"] as LoginTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); setOtpSent(false); }}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    tab === t
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  {t === "email" ? "📧 Email" : "📱 Phone / OTP"}
                </button>
              ))}
            </div>

            {/* Email login form */}
            {tab === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@university.edu.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<MailIcon />}
                  required
                />
                <Input
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<LockIcon />}
                  rightIcon={showPass ? <EyeOffIcon /> : <EyeIcon />}
                  onRightIconClick={() => setShowPass(!showPass)}
                  required
                />
                {error && (
                  <p className="text-red-400 text-sm flex items-center gap-1.5">
                    <AlertIcon /> {error}
                  </p>
                )}
                <div className="flex items-center justify-end">
                  <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Sign In
                </Button>
              </form>
            )}

            {/* Phone OTP form */}
            {tab === "phone" && (
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                {!otpSent ? (
                  <>
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      leftIcon={<PhoneIcon />}
                    />
                    {error && (
                      <p className="text-red-400 text-sm flex items-center gap-1.5">
                        <AlertIcon /> {error}
                      </p>
                    )}
                    <Button type="button" fullWidth size="lg" onClick={handleSendOtp}>
                      Send OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-foreground/70 mb-4">
                        OTP sent to <strong className="text-foreground">{phone}</strong>
                      </p>
                      <div className="flex gap-2 justify-center mb-2">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, i)}
                            onKeyDown={(e) => handleOtpKeyDown(e, i)}
                            className={cn(
                              "w-11 h-14 text-center text-xl font-bold rounded-xl",
                              "glass-card outline-none",
                              "focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40",
                              "transition-all duration-200 text-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(["","","","","",""]); }}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Change number
                      </button>
                    </div>
                    {error && (
                      <p className="text-red-400 text-sm text-center flex items-center justify-center gap-1.5">
                        <AlertIcon /> {error}
                      </p>
                    )}
                    <Button type="submit" fullWidth size="lg" loading={loading}>
                      Verify & Sign In
                    </Button>
                  </>
                )}
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-foreground/40 text-xs uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social logins */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="glass"
                size="md"
                onClick={loginWithGoogle}
                loading={loading}
                icon={<GoogleIcon />}
                className="text-sm"
              >
                Google
              </Button>
              <Button
                variant="glass"
                size="md"
                onClick={loginWithTelegram}
                loading={loading}
                icon={<TelegramIcon />}
                className="text-sm"
              >
                Telegram
              </Button>
            </div>

            {/* Sign up + Guest */}
            <div className="flex flex-col gap-2.5">
              <div className="text-center text-sm text-foreground/60">
                Don&apos;t have an account?{" "}
                <button className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign Up Free
                </button>
              </div>
              <button
                onClick={loginAsGuest}
                className="w-full py-2.5 text-sm text-foreground/50 hover:text-foreground/80 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <GuestIcon />
                Continue as Guest
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-foreground/30 mt-6">
            By signing in, you agree to our{" "}
            <button className="underline hover:text-foreground/50 transition-colors">Terms</button>
            {" "}and{" "}
            <button className="underline hover:text-foreground/50 transition-colors">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Graduation SVG Illustration ────────────────────────────────────────────
function GraduationIllustration({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative mx-auto w-48 h-48">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/20 blur-2xl animate-pulse-glow" />
      <div className="relative w-full h-full">
        <svg viewBox="0 0 200 200" className="w-full h-full" aria-label="University graduation illustration">
          {/* Background circle */}
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#1e0a3c" : "#ede9fe"} />
              <stop offset="100%" stopColor={isDark ? "#0d1b4b" : "#dbeafe"} />
            </linearGradient>
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="gownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
            <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Main circle */}
          <circle cx="100" cy="100" r="90" fill="url(#bgGrad)" />

          {/* Stars */}
          <circle cx="35" cy="45" r="2" fill="#f59e0b" opacity="0.8" />
          <circle cx="165" cy="40" r="1.5" fill="#f59e0b" opacity="0.6" />
          <circle cx="155" cy="165" r="2" fill="#06b6d4" opacity="0.7" />
          <circle cx="40" cy="160" r="1.5" fill="#7c3aed" opacity="0.7" />
          <circle cx="170" cy="110" r="1" fill="#f59e0b" opacity="0.5" />
          <circle cx="30" cy="100" r="1" fill="#06b6d4" opacity="0.5" />

          {/* Ethiopian flag small */}
          <rect x="82" y="20" width="36" height="8" rx="1" fill="#078930" />
          <rect x="82" y="28" width="36" height="8" rx="1" fill="#FCDD09" />
          <rect x="82" y="36" width="36" height="8" rx="1" fill="#DA121A" />

          {/* Graduate body - gown */}
          <ellipse cx="100" cy="155" rx="30" ry="22" fill="url(#gownGrad)" />
          <rect x="72" y="120" width="56" height="45" rx="8" fill="url(#gownGrad)" />

          {/* Collar detail */}
          <path d="M85 120 Q100 130 115 120" stroke="#c4b5fd" strokeWidth="2" fill="none" />

          {/* Head */}
          <circle cx="100" cy="105" r="20" fill={isDark ? "#fde68a" : "#fbbf24"} />

          {/* Face details */}
          <circle cx="93" cy="102" r="2.5" fill={isDark ? "#92400e" : "#78350f"} />
          <circle cx="107" cy="102" r="2.5" fill={isDark ? "#92400e" : "#78350f"} />
          <path d="M94 111 Q100 116 106 111" stroke={isDark ? "#92400e" : "#78350f"} strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Graduation cap */}
          <rect x="78" y="83" width="44" height="8" rx="2" fill="url(#capGrad)" />
          <polygon points="100,68 126,83 74,83" fill="url(#capGrad)" />
          {/* Tassel */}
          <circle cx="126" cy="83" r="3" fill="#f59e0b" />
          <line x1="126" y1="86" x2="126" y2="96" stroke="#f59e0b" strokeWidth="2" />
          <line x1="126" y1="96" x2="122" y2="104" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="126" y1="96" x2="130" y2="104" stroke="#f59e0b" strokeWidth="1.5" />

          {/* Diploma scroll */}
          <rect x="112" y="130" width="30" height="22" rx="4" fill="url(#scrollGrad)" />
          <rect x="108" y="128" width="6" height="26" rx="3" fill="#d97706" />
          <rect x="134" y="128" width="6" height="26" rx="3" fill="#d97706" />
          <line x1="116" y1="138" x2="136" y2="138" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="116" y1="143" x2="136" y2="143" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="116" y1="148" x2="130" y2="148" stroke="white" strokeWidth="1" opacity="0.5" />

          {/* Outer ring decoration */}
          <circle cx="100" cy="100" r="88" fill="none" stroke={isDark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)"} strokeWidth="2" strokeDasharray="8 4" />
        </svg>
      </div>
    </div>
  );
}

// ─── Icon components ─────────────────────────────────────────────────────────
function MailIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:18,height:18}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:18,height:18}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:18,height:18}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:18,height:18}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:18,height:18}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function GuestIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path fill="#2AABEE" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.958 14.41l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.834.949l-.644.2z"/>
    </svg>
  );
}
