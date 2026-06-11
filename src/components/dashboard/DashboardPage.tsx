"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────
const DASH_DEPARTMENTS = [
  { id: "cs", name: "Computer Science", faculty: "Engineering & Technology", icon: "💻", exams: 24, students: 4820, passRate: 78, color: "from-violet-600 to-indigo-600" },
  { id: "med", name: "Medicine", faculty: "Health Sciences", icon: "🏥", exams: 32, students: 6100, passRate: 72, color: "from-rose-600 to-pink-600" },
  { id: "electrical", name: "Electrical Engineering", faculty: "Engineering & Technology", icon: "⚡", exams: 28, students: 3950, passRate: 75, color: "from-amber-600 to-orange-600" },
  { id: "law", name: "Law", faculty: "Law", icon: "⚖️", exams: 20, students: 5200, passRate: 68, color: "from-emerald-600 to-teal-600" },
  { id: "accounting", name: "Accounting & Finance", faculty: "Business & Economics", icon: "📊", exams: 22, students: 7300, passRate: 82, color: "from-blue-600 to-cyan-600" },
  { id: "arch", name: "Architecture", faculty: "Engineering & Technology", icon: "🏛️", exams: 18, students: 2100, passRate: 70, color: "from-purple-600 to-violet-600" },
];

const RECENT_EXAMS = [
  { id: "e1", dept: "Computer Science", title: "Data Structures & Algorithms", year: 2023, score: 88, maxScore: 100, date: "Jun 2, 2024", difficulty: "Hard" as const },
  { id: "e2", dept: "Computer Science", title: "Database Management Systems", year: 2022, score: 75, maxScore: 100, date: "May 28, 2024", difficulty: "Medium" as const },
  { id: "e3", dept: "Computer Science", title: "Software Engineering", year: 2023, score: 92, maxScore: 100, date: "May 20, 2024", difficulty: "Medium" as const },
];

const STATS = [
  { label: "Exams Taken", value: 12, icon: "📝", color: "from-violet-500 to-indigo-500", change: "+3 this month" },
  { label: "Avg Score", value: "82%", icon: "🎯", color: "from-emerald-500 to-teal-500", change: "+5% vs last month" },
  { label: "Study Hours", value: 148, icon: "⏱️", color: "from-amber-500 to-orange-500", change: "+12h this week" },
  { label: "Rank", value: "#47", icon: "🏆", color: "from-rose-500 to-pink-500", change: "Top 5%" },
];

interface DashboardPageProps {
  externalSearch?: string;
  onNavigateToDepartments?: () => void;
}

export default function DashboardPage({ externalSearch = "", onNavigateToDepartments }: DashboardPageProps) {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const filteredDepts = DASH_DEPARTMENTS.filter((d) =>
    d.name.toLowerCase().includes(externalSearch.toLowerCase()) ||
    d.faculty.toLowerCase().includes(externalSearch.toLowerCase())
  );

  return (
    <main className="pb-24 md:pb-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Welcome Hero ── */}
        <div className="relative rounded-3xl overflow-hidden mb-8 mt-4">
          <div className={cn("p-6 md:p-8", isDark ? "animated-gradient" : "bg-gradient-to-r from-violet-600 to-indigo-600")}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32 pointer-events-none" />
            <div className="absolute bottom-0 left-32 w-48 h-48 rounded-full bg-white/5 translate-y-24 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👋</span>
                  <Badge variant="gold" size="md">{user?.isGuest ? "Guest" : `Year ${user?.year || 4}`}</Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                  Welcome back, {user?.name?.split(" ")[0] || "Student"}!
                </h2>
                <p className="text-white/70 text-sm">
                  {user?.university || "Addis Ababa University"} · {user?.department || "Computer Science"}
                </p>
                {!user?.isGuest && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{user?.gpa || "3.75"}</p>
                      <p className="text-white/60 text-xs">GPA</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">82%</p>
                      <p className="text-white/60 text-xs">Avg Score</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">12</p>
                      <p className="text-white/60 text-xs">Exams</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="glass" size="md" className="text-white border-white/30 hover:bg-white/20 min-w-[160px]" icon={<PlayIcon />}>
                  Start Practice
                </Button>
                <Button variant="glass" size="md" className="text-white border-white/30 hover:bg-white/20" icon={<BookIcon />} onClick={onNavigateToDepartments}>
                  Browse Exams
                </Button>
              </div>
            </div>

            {!user?.isGuest && (
              <div className="relative z-10 mt-6 pt-5 border-t border-white/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">Exam Readiness</span>
                  <span className="text-white font-bold text-sm">78%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div className="bg-white rounded-full h-2.5 transition-all duration-1000" style={{ width: "78%" }} />
                </div>
                <p className="text-white/50 text-xs mt-1.5">Complete 5 more practice sessions to reach 90%</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => (
            <Card key={i} style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties} className="animate-fade-up" hover>
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl mb-3", stat.color)}>
                {stat.icon}
              </div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-foreground/70">{stat.label}</p>
              <p className="text-xs text-emerald-500 mt-1">{stat.change}</p>
            </Card>
          ))}
        </div>

        {/* ── Content grid ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Featured Departments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Featured Departments</h3>
                  <p className="text-sm text-foreground/50">Browse by faculty & discipline</p>
                </div>
                <button
                  onClick={onNavigateToDepartments}
                  className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  View all 27 →
                </button>
              </div>

              {externalSearch && (
                <p className="text-sm text-foreground/50 mb-3">
                  {filteredDepts.length} result{filteredDepts.length !== 1 ? "s" : ""} for &quot;{externalSearch}&quot;
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                {(externalSearch ? filteredDepts : DASH_DEPARTMENTS).map((dept, i) => (
                  <DashDepartmentCard key={dept.id} dept={dept} delay={i * 0.04} onClick={onNavigateToDepartments} />
                ))}
              </div>
            </section>

            {/* Recent Exams */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Recent Exams</h3>
                  <p className="text-sm text-foreground/50">Your latest practice attempts</p>
                </div>
                <button className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  View all →
                </button>
              </div>
              <div className="space-y-3">
                {RECENT_EXAMS.map((exam, i) => (
                  <RecentExamCard key={exam.id} exam={exam} delay={i * 0.05} />
                ))}
              </div>
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            <StudentProfileCard user={user} />
            <ProgressStatsCard />
            <QuickLinksCard onDepartments={onNavigateToDepartments} />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Department card (dashboard mini version) ─────────────────────────────────
function DashDepartmentCard({
  dept, delay, onClick,
}: {
  dept: typeof DASH_DEPARTMENTS[0];
  delay: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="glass-card rounded-2xl p-4 card-hover cursor-pointer animate-fade-up group"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200", dept.color)}>
          {dept.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-violet-400 transition-colors">{dept.name}</h4>
          <p className="text-xs text-foreground/50 mb-2">{dept.faculty}</p>
          <div className="flex items-center gap-3 text-xs text-foreground/60">
            <span>📝 {dept.exams} exams</span>
            <span>👥 {(dept.students / 1000).toFixed(1)}K</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={dept.passRate} size="sm" color={dept.passRate >= 75 ? "emerald" : dept.passRate >= 65 ? "amber" : "rose"} animated={false} />
            <p className="text-xs text-foreground/40 mt-1">{dept.passRate}% pass rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Recent exam card ─────────────────────────────────────────────────────────
function RecentExamCard({ exam, delay }: { exam: typeof RECENT_EXAMS[0]; delay: number }) {
  const pct = Math.round((exam.score / exam.maxScore) * 100);
  const color = pct >= 85 ? "emerald" : pct >= 70 ? "blue" : pct >= 50 ? "amber" : "rose";
  const diffColors = { Easy: "success", Medium: "info", Hard: "error" } as const;

  return (
    <div
      className="glass-card rounded-2xl p-4 card-hover cursor-pointer animate-fade-up flex items-center gap-4"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg",
        pct >= 85 ? "bg-emerald-500/20 text-emerald-400" :
        pct >= 70 ? "bg-blue-500/20 text-blue-400" :
        pct >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
      )}>
        {pct}%
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-foreground text-sm truncate">{exam.title}</h4>
            <p className="text-xs text-foreground/50">{exam.dept} · {exam.year}</p>
          </div>
          <Badge variant={diffColors[exam.difficulty]} size="sm">{exam.difficulty}</Badge>
        </div>
        <div className="mt-2">
          <ProgressBar value={exam.score} max={exam.maxScore} size="sm" color={color} animated={false} />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-foreground/40">{exam.score}/{exam.maxScore} marks</span>
            <span className="text-xs text-foreground/40">{exam.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student profile card ─────────────────────────────────────────────────────
function StudentProfileCard({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  if (!user) return null;
  return (
    <Card className="text-center">
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <Avatar name={user.name} size="xl" online />
          {!user.isGuest && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md">★</div>
          )}
        </div>
        <h4 className="font-bold text-foreground text-base">{user.name}</h4>
        <p className="text-xs text-foreground/50 mt-0.5">{user.email}</p>
        {!user.isGuest ? (
          <>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="default" size="sm">Year {user.year || 4}</Badge>
              <Badge variant="info" size="sm">{user.department?.split(" ")[0]}</Badge>
            </div>
            <div className="w-full mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xl font-extrabold text-foreground">{user.gpa}</p>
                <p className="text-xs text-foreground/50">GPA</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold text-foreground">82%</p>
                <p className="text-xs text-foreground/50">Avg Score</p>
              </div>
            </div>
            <button className="mt-4 w-full py-2 text-sm font-medium text-violet-400 border border-violet-500/30 rounded-xl hover:bg-violet-500/10 transition-colors">
              Edit Profile
            </button>
          </>
        ) : (
          <div className="mt-4 w-full">
            <Badge variant="warning" size="md" dot className="w-full justify-center">Guest Mode — Limited Access</Badge>
            <button className="mt-3 w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:opacity-90 transition-opacity">
              Create Free Account
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Progress stats card ──────────────────────────────────────────────────────
function ProgressStatsCard() {
  const subjects = [
    { name: "Data Structures", progress: 88, color: "violet" as const },
    { name: "Networks", progress: 65, color: "blue" as const },
    { name: "OS Concepts", progress: 74, color: "emerald" as const },
    { name: "Database", progress: 92, color: "amber" as const },
  ];
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-foreground">Subject Progress</h4>
        <Badge variant="success" dot size="sm">On Track</Badge>
      </div>
      <div className="space-y-4">
        {subjects.map((s) => (
          <div key={s.name}>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-foreground/70">{s.name}</span>
              <span className="text-sm font-semibold text-foreground">{s.progress}%</span>
            </div>
            <ProgressBar value={s.progress} size="sm" color={s.color} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Quick links card ─────────────────────────────────────────────────────────
function QuickLinksCard({ onDepartments }: { onDepartments?: () => void }) {
  const links = [
    { icon: "📚", label: "All Departments", sub: "27 departments", action: onDepartments },
    { icon: "🧠", label: "AI Tutor", sub: "Ask anything", badge: "New", action: undefined },
    { icon: "📊", label: "Analytics", sub: "Your insights", action: undefined },
    { icon: "🏆", label: "Leaderboard", sub: "Top students", action: undefined },
  ];
  return (
    <Card>
      <h4 className="font-bold text-foreground mb-3">Quick Access</h4>
      <div className="space-y-2">
        {links.map((l) => (
          <button
            key={l.label}
            onClick={l.action}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
          >
            <span className="text-xl">{l.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground group-hover:text-violet-400 transition-colors">{l.label}</p>
              <p className="text-xs text-foreground/40">{l.sub}</p>
            </div>
            {l.badge && <Badge variant="success" size="sm">{l.badge}</Badge>}
            <ChevronIcon />
          </button>
        ))}
      </div>
    </Card>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function PlayIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
}
function BookIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
}
function ChevronIcon() {
  return <svg className="w-4 h-4 text-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
}
