"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import DashboardPage from "@/components/dashboard/DashboardPage";
import DepartmentsPage from "@/components/departments/DepartmentsPage";
import ExamPracticePage from "@/components/exam/ExamPracticePage";
import MockTestPage from "@/components/exam/MockTestPage";
import ResultsPage from "@/components/exam/ResultsPage";
import { type MockExam } from "@/lib/examData";

export type AppView = "home" | "departments" | "notifications" | "profile" | "practice" | "mock" | "results";

type ExamSession = {
  answers: Record<string, "A" | "B" | "C" | "D">;
  timeTaken: number;
} | null;

const NOTIFICATIONS_DATA = [
  { id: "n1", type: "info" as const, title: "New Exam Added", msg: "2024 Civil Engineering exit exam is now available.", time: "2m ago", unread: true },
  { id: "n2", type: "success" as const, title: "Score Updated", msg: "Your Data Structures exam score has been published.", time: "1h ago", unread: true },
  { id: "n3", type: "warning" as const, title: "Exam Reminder", msg: "Mock exam session starts in 2 days.", time: "3h ago", unread: false },
  { id: "n4", type: "info" as const, title: "System Update", msg: "New practice questions added for Medicine.", time: "1d ago", unread: false },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState<AppView>("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [examSession, setExamSession] = useState<ExamSession>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMockExam, setSelectedMockExam] = useState<MockExam | null>(null);

  const unreadCount = NOTIFICATIONS_DATA.filter((n) => n.unread).length;

  const handleExamFinish = (answers: Record<string, "A" | "B" | "C" | "D">, timeTaken: number) => {
    setExamSession({ answers, timeTaken });
    setActiveView("results");
  };

  return (
    <div className={cn("min-h-screen", isDark ? "dark bg-[#0a0a1a]" : "bg-slate-50")}>
      {/* Ethiopian flag accent */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-1">
        <div className="flex-1 bg-ethiopia-green" />
        <div className="flex-1 bg-ethiopia-yellow" />
        <div className="flex-1 bg-ethiopia-red" />
      </div>

      {/* ── Top navigation bar ── */}
      {!["practice", "mock", "results"].includes(activeView) && (
      <header className={cn(
        "fixed top-1 left-0 right-0 z-40 px-4 py-3",
        isDark ? "bg-[#0a0a1a]/85" : "bg-white/85",
        "backdrop-blur-xl border-b",
        isDark ? "border-white/5" : "border-gray-200/80"
      )}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => setActiveView("home")}
            className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-violet-500/25">
              EE
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-tight">Exit Exam</p>
              <p className="text-xs text-foreground/50 leading-tight">Ethiopia</p>
            </div>
          </button>

          {/* Desktop nav tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {([
              { id: "home", label: "Dashboard", icon: "🏠" },
              { id: "departments", label: "Departments", icon: "📚" },
            ] as { id: AppView; label: string; icon: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  activeView === tab.id
                    ? "bg-violet-600/15 text-violet-400 border border-violet-500/30"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Search — shown only on home */}
          {activeView === "home" && (
            <div className="flex-1 max-w-sm hidden md:block">
              <div className={cn(
                "flex items-center gap-2.5 h-10 px-3.5 rounded-xl border transition-all duration-200",
                isDark ? "bg-white/5 border-white/10 focus-within:border-violet-500/50" : "bg-slate-100 border-transparent focus-within:border-violet-400"
              )}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search departments, exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/30"
                />
              </div>
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl glass-card text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl glass-card text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center badge-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2"
            >
              <Avatar name={user?.name || "User"} size="sm" online={true} />
              <span className="hidden sm:block text-sm font-medium text-foreground/80 max-w-[100px] truncate">
                {user?.name?.split(" ")[0]}
              </span>
            </button>
          </div>
        </div>
      </header>
      )}

      {/* ── Overlay panels ── */}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          isDark={isDark}
        />
      )}
      {showProfileMenu && (
        <ProfileMenu
          user={user}
          onClose={() => setShowProfileMenu(false)}
          onLogout={signOut}
          isDark={isDark}
        />
      )}

      {/* ── Page content ── */}
      <div className={cn("pt-14", (activeView === "practice" || activeView === "mock" || activeView === "results") && "pt-0")}>
        {activeView === "home" && (
          <DashboardPage
            externalSearch={searchQuery}
            onNavigateToDepartments={() => setActiveView("departments")}
            onStartPractice={() => setActiveView("practice")}
            onStartMock={() => setActiveView("mock")}
          />
        )}
        {activeView === "departments" && (
          <DepartmentsPage onStartPractice={() => setActiveView("practice")} />
        )}
        {activeView === "practice" && (
          <ExamPracticePage
            onExit={() => setActiveView("home")}
            onFinish={handleExamFinish}
          />
        )}
        {activeView === "mock" && (
          <MockTestPage
            onBack={() => setActiveView("home")}
            onStartExam={(exam) => {
              setSelectedMockExam(exam);
              setActiveView("practice");
            }}
          />
        )}
        {activeView === "results" && examSession && (
          <ResultsPage
            answers={examSession.answers}
            timeTakenSeconds={examSession.timeTaken}
            onHome={() => setActiveView("home")}
            onRetry={() => setActiveView("practice")}
          />
        )}
        {activeView === "notifications" && (
          <NotificationsFullPage isDark={isDark} />
        )}
        {activeView === "profile" && (
          <ProfileFullPage user={user} onLogout={signOut} isDark={isDark} />
        )}
      </div>

      {/* ── Mobile bottom navigation ── */}
      {!["practice", "mock", "results"].includes(activeView) && (
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        isDark ? "bg-[#0d0d20]/90 border-white/5" : "bg-white/90 border-gray-200/80",
        "border-t backdrop-blur-xl px-2 pb-safe-bottom"
      )}>
        <div className="flex items-center justify-around py-2">
          {([
            { id: "home", icon: "🏠", label: "Home" },
            { id: "departments", icon: "📚", label: "Departments" },
            { id: "notifications", icon: "🔔", label: "Alerts", badge: unreadCount },
            { id: "profile", icon: "👤", label: "Profile" },
          ] as { id: AppView; icon: string; label: string; badge?: number }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                activeView === tab.id
                  ? "text-violet-400 bg-violet-500/15"
                  : "text-foreground/40 hover:text-foreground/70"
              )}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {!!tab.badge && tab.badge > 0 && (
                <span className="absolute -top-0.5 right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
      )}
    </div>
  );
}

// ─── Notifications panel ──────────────────────────────────────────────────────
function NotificationsPanel({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const notifBg: Record<string, string> = { success: "bg-emerald-500/20", warning: "bg-amber-500/20", error: "bg-red-500/20", info: "bg-blue-500/20" };
  const notifEmoji: Record<string, string> = { success: "✅", warning: "⚠️", error: "🚨", info: "ℹ️" };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={cn("fixed top-16 right-4 z-50 w-80 max-h-96 overflow-y-auto glass-card rounded-2xl shadow-2xl animate-fade-down", isDark ? "bg-[#12122a]/95" : "bg-white/95")}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h4 className="font-bold text-foreground">Notifications</h4>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground/70 transition-colors p-1">
            <XIcon />
          </button>
        </div>
        <div className="p-2">
          {NOTIFICATIONS_DATA.map((n) => (
            <div key={n.id} className={cn("flex gap-3 p-3 rounded-xl mb-1 cursor-pointer transition-colors", n.unread ? "bg-violet-500/10 hover:bg-violet-500/15" : "hover:bg-white/5")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0", notifBg[n.type] ?? "bg-blue-500/20")}>
                {notifEmoji[n.type] ?? "ℹ️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {n.unread && <div className="w-2 h-2 bg-violet-500 rounded-full mt-1 flex-shrink-0" />}
                </div>
                <p className="text-xs text-foreground/60 line-clamp-2">{n.msg}</p>
                <p className="text-xs text-foreground/30 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Profile menu ─────────────────────────────────────────────────────────────
function ProfileMenu({ user, onClose, onLogout, isDark }: {
  user: ReturnType<typeof useAuth>["user"];
  onClose: () => void;
  onLogout: () => void;
  isDark: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={cn("fixed top-16 right-4 z-50 w-64 glass-card rounded-2xl shadow-2xl animate-fade-down p-2", isDark ? "bg-[#12122a]/95" : "bg-white/95")}>
        <div className="p-3 mb-1">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || "User"} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-foreground/50 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-1">
          {[{ icon: "👤", label: "My Profile" }, { icon: "📊", label: "My Results" }, { icon: "⚙️", label: "Settings" }, { icon: "❓", label: "Help" }].map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left">
              <span>{item.icon}</span>
              <span className="text-sm text-foreground">{item.label}</span>
            </button>
          ))}
          <div className="border-t border-white/10 mt-1 pt-1">
            <button onClick={() => { onLogout(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors">
              <span>🚪</span>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Notifications full page (mobile) ────────────────────────────────────────
function NotificationsFullPage({ isDark }: { isDark: boolean }) {
  const notifBg: Record<string, string> = { success: "bg-emerald-500/20", warning: "bg-amber-500/20", error: "bg-red-500/20", info: "bg-blue-500/20" };
  const notifEmoji: Record<string, string> = { success: "✅", warning: "⚠️", error: "🚨", info: "ℹ️" };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-extrabold text-foreground mb-6">Notifications</h2>
      <div className="space-y-3">
        {NOTIFICATIONS_DATA.map((n) => (
          <div key={n.id} className={cn("glass-card rounded-2xl flex gap-4 p-4 cursor-pointer transition-colors", n.unread ? "border-l-4 border-violet-500" : "")}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0", notifBg[n.type] ?? "bg-blue-500/20")}>
              {notifEmoji[n.type] ?? "ℹ️"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{n.title}</p>
                {n.unread && <span className="text-[10px] font-bold text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full">New</span>}
              </div>
              <p className="text-sm text-foreground/60 mt-1">{n.msg}</p>
              <p className="text-xs text-foreground/30 mt-2">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile full page (mobile) ───────────────────────────────────────────────
function ProfileFullPage({ user, onLogout, isDark }: {
  user: ReturnType<typeof useAuth>["user"];
  onLogout: () => void;
  isDark: boolean;
}) {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h2 className="text-xl font-extrabold text-foreground mb-6">Profile</h2>
      <div className="glass-card rounded-3xl p-6 text-center mb-6">
        <Avatar name={user?.name || "User"} size="xl" className="mx-auto mb-4" online />
        <h3 className="text-lg font-extrabold text-foreground">{user?.name}</h3>
        <p className="text-sm text-foreground/50 mt-1">{user?.email}</p>
        {!user?.isGuest && (
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-white/10">
            <div><p className="text-xl font-extrabold text-foreground">{user?.gpa}</p><p className="text-xs text-foreground/50">GPA</p></div>
            <div><p className="text-xl font-extrabold text-foreground">Year {user?.year}</p><p className="text-xs text-foreground/50">Study Year</p></div>
          </div>
        )}
      </div>
      <div className="glass-card rounded-2xl overflow-hidden mb-4">
        {[{ icon: "✏️", label: "Edit Profile" }, { icon: "🔒", label: "Change Password" }, { icon: "🔔", label: "Notifications" }, { icon: "🌙", label: "Appearance" }].map((item, i, arr) => (
          <button key={item.label} className={cn("w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors", i < arr.length - 1 && "border-b border-white/5")}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <svg className="w-4 h-4 text-foreground/30 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl bg-red-500/15 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 border border-red-500/20"
      >
        🚪 Sign Out
      </button>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon() {
  return <svg className="w-4 h-4 text-foreground/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function BellIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
}
function SunIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function MoonIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
}
function XIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
}
