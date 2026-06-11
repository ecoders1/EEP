"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { validateEmail, validatePassword, validateFullName } from "@/lib/supabase";

// ─── View states ──────────────────────────────────────────────────────────────
type AuthMode = "signin" | "signup" | "forgot" | "check-email";

// ─── Validation state ─────────────────────────────────────────────────────────
interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, resetPassword, continueAsGuest, loading, session, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const clearErrors = () => {
    setFieldErrors({});
    setGlobalError("");
    setSuccessMsg("");
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    clearErrors();
    setPassword("");
    setConfirmPassword("");
    setShowPass(false);
    setShowConfirmPass(false);
  };

  // ── Password strength ──────────────────────────────────────────────────────
  const passwordStrength = (p: string): { score: number; label: string; color: string } => {
    if (!p) return { score: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = passwordStrength(password);

  // ── Sign In ────────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const errors: FieldErrors = {};
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    const { error } = await signIn(email, password);
    if (error) setGlobalError(error);
  };

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const errors: FieldErrors = {};
    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (nameErr) errors.fullName = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    const { error, needsConfirmation } = await signUp(email, password, fullName);
    if (error) { setGlobalError(error); return; }
    if (needsConfirmation) {
      setMode("check-email");
    }
    // If no confirmation needed, AuthContext onAuthStateChange will log the user in
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const emailErr = validateEmail(resetEmail);
    if (emailErr) { setFieldErrors({ email: emailErr }); return; }

    const { error } = await resetPassword(resetEmail);
    if (error) { setGlobalError(error); return; }
    setSuccessMsg(`Reset link sent to ${resetEmail}. Check your inbox.`);
  };

  // ── Render check-email screen ──────────────────────────────────────────────
  if (mode === "check-email") {
    return (
      <AuthShell isDark={isDark} toggleTheme={toggleTheme}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl mx-auto mb-5">
            📧
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Check your email</h2>
          <p className="text-foreground/60 text-sm leading-relaxed mb-6">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-foreground">{email}</span>.
            Click the link to activate your account.
          </p>
          <div className={cn("rounded-2xl p-4 text-sm text-left mb-6", isDark ? "bg-white/5" : "bg-slate-100")}>
            <p className="font-semibold text-foreground mb-1">Didn&apos;t receive it?</p>
            <ul className="text-foreground/60 space-y-1 text-xs list-disc list-inside">
              <li>Check your spam / junk folder</li>
              <li>Make sure you typed the email correctly</li>
              <li>Wait 1–2 minutes and check again</li>
            </ul>
          </div>
          <Button fullWidth size="lg" onClick={() => switchMode("signin")}>
            Back to Sign In
          </Button>
          <button
            onClick={() => switchMode("signup")}
            className="mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Use a different email
          </button>
        </div>
      </AuthShell>
    );
  }

  // ── Render forgot password ─────────────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <AuthShell isDark={isDark} toggleTheme={toggleTheme}>
        <div className="mb-6">
          <button
            onClick={() => switchMode("signin")}
            className="flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground transition-colors mb-5"
          >
            <ChevronLeftIcon /> Back to Sign In
          </button>
          <h2 className="text-2xl font-extrabold text-foreground">Reset password</h2>
          <p className="text-foreground/60 text-sm mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {successMsg ? (
          <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-sm text-emerald-400 text-center">
            ✅ {successMsg}
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@university.edu.et"
              value={resetEmail}
              onChange={(e) => { setResetEmail(e.target.value); clearErrors(); }}
              leftIcon={<MailIcon />}
              error={fieldErrors.email}
            />
            {globalError && <ErrorBox message={globalError} />}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </AuthShell>
    );
  }

  // ── Main sign in / sign up form ────────────────────────────────────────────
  return (
    <AuthShell isDark={isDark} toggleTheme={toggleTheme}>
      {/* ── Active session warning ── */}
      {session && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-sm mb-4 animate-fade-down">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-400 text-sm">Active session detected</p>
            <p className="text-foreground/60 text-xs mt-0.5 truncate">
              Signed in as <span className="font-mono">{session.user.email}</span>
            </p>
          </div>
          <button
            onClick={async () => { await signOut(); }}
            className="flex-shrink-0 text-xs font-bold text-amber-400 hover:text-amber-300 underline transition-colors"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex rounded-xl overflow-hidden mb-6 bg-white/5 border border-white/10 p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
              mode === m
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                : "text-foreground/60 hover:text-foreground"
            )}
          >
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* ── Sign In form ── */}
      {mode === "signin" && (
        <form onSubmit={handleSignIn} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@university.edu.et"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
            leftIcon={<MailIcon />}
            error={fieldErrors.email}
            autoComplete="email"
          />
          <div>
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
              leftIcon={<LockIcon />}
              rightIcon={showPass ? <EyeOffIcon /> : <EyeIcon />}
              onRightIconClick={() => setShowPass(!showPass)}
              error={fieldErrors.password}
              autoComplete="current-password"
            />
          </div>

          {globalError && <ErrorBox message={globalError} />}

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Sign In
          </Button>
        </form>
      )}

      {/* ── Sign Up form ── */}
      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            placeholder="Abebe Kebede"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); clearErrors(); }}
            leftIcon={<UserIcon />}
            error={fieldErrors.fullName}
            autoComplete="name"
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@university.edu.et"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
            leftIcon={<MailIcon />}
            error={fieldErrors.email}
            autoComplete="email"
          />
          <div>
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
              leftIcon={<LockIcon />}
              rightIcon={showPass ? <EyeOffIcon /> : <EyeIcon />}
              onRightIconClick={() => setShowPass(!showPass)}
              error={fieldErrors.password}
              hint={!fieldErrors.password ? "Minimum 6 characters" : undefined}
              autoComplete="new-password"
            />
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        strength.score >= i ? strength.color : isDark ? "bg-white/10" : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className={cn(
                    "text-xs font-medium",
                    strength.score <= 1 ? "text-red-400" :
                    strength.score <= 2 ? "text-amber-400" :
                    strength.score <= 3 ? "text-blue-400" : "text-emerald-400"
                  )}>
                    {strength.label} password
                  </p>
                )}
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showConfirmPass ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearErrors(); }}
            leftIcon={<LockIcon />}
            rightIcon={showConfirmPass ? <EyeOffIcon /> : <EyeIcon />}
            onRightIconClick={() => setShowConfirmPass(!showConfirmPass)}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />

          {globalError && <ErrorBox message={globalError} />}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Create Account
          </Button>

          <p className="text-xs text-foreground/40 text-center">
            By signing up you agree to our{" "}
            <button type="button" className="underline hover:text-foreground/60 transition-colors">Terms</button>
            {" "}and{" "}
            <button type="button" className="underline hover:text-foreground/60 transition-colors">Privacy Policy</button>
          </p>
        </form>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-foreground/40 text-xs uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google OAuth */}
      <Button
        variant="glass"
        size="md"
        fullWidth
        onClick={async () => {
          clearErrors();
          const { error } = await signInWithGoogle();
          if (error) setGlobalError(error);
        }}
        loading={loading}
        icon={<GoogleIcon />}
        className="mb-3"
      >
        Continue with Google
      </Button>

      {/* Guest */}
      <button
        onClick={continueAsGuest}
        className="w-full py-2.5 text-sm text-foreground/50 hover:text-foreground/80 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
      >
        <GuestIcon /> Continue as Guest
      </button>
    </AuthShell>
  );
}

// ─── Auth shell wrapper (shared layout) ───────────────────────────────────────
function AuthShell({
  children,
  isDark,
  toggleTheme,
}: {
  children: React.ReactNode;
  isDark: boolean;
  toggleTheme: () => void;
}) {
  return (
    <div className={cn("min-h-screen w-full relative overflow-hidden", isDark ? "animated-gradient" : "animated-gradient-light")}>
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl float-delayed" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl float" />
        {/* Ethiopian flag stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-ethiopia-green" />
          <div className="flex-1 bg-ethiopia-yellow" />
          <div className="flex-1 bg-ethiopia-red" />
        </div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 glass rounded-xl p-2.5 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Branding */}
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

        {/* Card */}
        <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-3xl p-6 md:p-8">
            {children}
          </div>
          <p className="text-center text-xs text-foreground/30 mt-5">
            Protected by Supabase Auth · End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Error box ────────────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
      <AlertIcon />
      <span className="flex-1">{message}</span>
    </div>
  );
}

// ─── Graduation SVG ───────────────────────────────────────────────────────────
function GraduationIllustration({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative mx-auto w-44 h-44">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/20 blur-2xl animate-pulse-glow" />
      <div className="relative w-full h-full">
        <svg viewBox="0 0 200 200" className="w-full h-full" aria-label="Graduation illustration">
          <defs>
            <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#1e0a3c" : "#ede9fe"} />
              <stop offset="100%" stopColor={isDark ? "#0d1b4b" : "#dbeafe"} />
            </linearGradient>
            <linearGradient id="capGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="gownGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
            <linearGradient id="scrollGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="url(#bgGrad2)" />
          <circle cx="35" cy="45" r="2" fill="#f59e0b" opacity="0.8" />
          <circle cx="165" cy="40" r="1.5" fill="#f59e0b" opacity="0.6" />
          <circle cx="155" cy="165" r="2" fill="#06b6d4" opacity="0.7" />
          <circle cx="40" cy="160" r="1.5" fill="#7c3aed" opacity="0.7" />
          <rect x="82" y="20" width="36" height="8" rx="1" fill="#078930" />
          <rect x="82" y="28" width="36" height="8" rx="1" fill="#FCDD09" />
          <rect x="82" y="36" width="36" height="8" rx="1" fill="#DA121A" />
          <ellipse cx="100" cy="155" rx="30" ry="22" fill="url(#gownGrad2)" />
          <rect x="72" y="120" width="56" height="45" rx="8" fill="url(#gownGrad2)" />
          <path d="M85 120 Q100 130 115 120" stroke="#c4b5fd" strokeWidth="2" fill="none" />
          <circle cx="100" cy="105" r="20" fill={isDark ? "#fde68a" : "#fbbf24"} />
          <circle cx="93" cy="102" r="2.5" fill={isDark ? "#92400e" : "#78350f"} />
          <circle cx="107" cy="102" r="2.5" fill={isDark ? "#92400e" : "#78350f"} />
          <path d="M94 111 Q100 116 106 111" stroke={isDark ? "#92400e" : "#78350f"} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="78" y="83" width="44" height="8" rx="2" fill="url(#capGrad2)" />
          <polygon points="100,68 126,83 74,83" fill="url(#capGrad2)" />
          <circle cx="126" cy="83" r="3" fill="#f59e0b" />
          <line x1="126" y1="86" x2="126" y2="96" stroke="#f59e0b" strokeWidth="2" />
          <line x1="126" y1="96" x2="122" y2="104" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="126" y1="96" x2="130" y2="104" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="112" y="130" width="30" height="22" rx="4" fill="url(#scrollGrad2)" />
          <rect x="108" y="128" width="6" height="26" rx="3" fill="#d97706" />
          <rect x="134" y="128" width="6" height="26" rx="3" fill="#d97706" />
          <line x1="116" y1="138" x2="136" y2="138" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="116" y1="143" x2="136" y2="143" stroke="white" strokeWidth="1" opacity="0.5" />
          <circle cx="100" cy="100" r="88" fill="none" stroke={isDark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)"} strokeWidth="2" strokeDasharray="8 4" />
        </svg>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function MailIcon() {
  return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
function LockIcon() {
  return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
}
function UserIcon() {
  return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
function EyeIcon() {
  return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
}
function EyeOffIcon() {
  return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;
}
function AlertIcon() {
  return <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}
function GuestIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
function ChevronLeftIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
}
function SunIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function MoonIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
}
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
