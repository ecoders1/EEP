"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import {
  DEPARTMENTS,
  FACULTIES,
  FACULTY_ICONS,
  FACULTY_COLORS,
  UNIVERSITIES,
  EXAM_YEARS,
  type Faculty,
  type Department,
} from "@/lib/departments";

type SortBy = "name" | "passRate" | "examCount" | "students";
type Difficulty = "All" | "Easy" | "Medium" | "Hard";

interface Filters {
  search: string;
  faculty: Faculty | "All";
  university: string;
  year: string;
  difficulty: Difficulty;
  sortBy: SortBy;
  favoritesOnly: boolean;
}

const DIFFICULTY_COLORS: Record<string, "success" | "warning" | "error"> = {
  Easy: "success",
  Medium: "warning",
  Hard: "error",
};

const PROGRESS_COLORS: Record<string, "emerald" | "blue" | "amber" | "rose"> = {
  Easy: "emerald",
  Medium: "amber",
  Hard: "rose",
};

export default function DepartmentsPage({
  onSelectDepartment,
}: {
  onSelectDepartment?: (dept: Department) => void;
}) {
  const { isDark } = useTheme();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    faculty: "All",
    university: "All Universities",
    year: "All Years",
    difficulty: "All",
    sortBy: "name",
    favoritesOnly: false,
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set(["cs", "med", "accounting"]));
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filtered = useMemo(() => {
    let result = [...DEPARTMENTS];

    // search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.faculty.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          d.description.toLowerCase().includes(q)
      );
    }

    // faculty
    if (filters.faculty !== "All") {
      result = result.filter((d) => d.faculty === filters.faculty);
    }

    // difficulty
    if (filters.difficulty !== "All") {
      result = result.filter((d) => d.difficulty === filters.difficulty);
    }

    // favorites only
    if (filters.favoritesOnly) {
      result = result.filter((d) => favorites.has(d.id));
    }

    // sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "passRate": return b.passRate - a.passRate;
        case "examCount": return b.examCount - a.examCount;
        case "students": return b.studentCount - a.studentCount;
        default: return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [filters, favorites]);

  // Group by faculty for summary stats
  const facultySummary = useMemo(() => {
    return FACULTIES.map((f) => {
      const depts = DEPARTMENTS.filter((d) => d.faculty === f);
      const avgPass = Math.round(depts.reduce((s, d) => s + d.passRate, 0) / depts.length);
      return { faculty: f, count: depts.length, avgPass };
    });
  }, []);

  const activeFilterCount = [
    filters.faculty !== "All",
    filters.university !== "All Universities",
    filters.year !== "All Years",
    filters.difficulty !== "All",
    filters.favoritesOnly,
  ].filter(Boolean).length;

  return (
    <div className={cn("min-h-screen", isDark ? "bg-[#0a0a1a]" : "bg-slate-50")}>
      {/* ── Page header ── */}
      <div className="relative overflow-hidden">
        <div className={cn("px-4 pt-6 pb-8", isDark ? "bg-gradient-to-b from-[#13102a] to-[#0a0a1a]" : "bg-gradient-to-b from-violet-50 to-slate-50")}>
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="absolute top-10 -left-20 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">📚</span>
                  <Badge variant="default" size="md">{DEPARTMENTS.length} Departments</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  Browse Departments
                </h1>
                <p className="text-foreground/50 text-sm mt-1">
                  Find your department and start practicing exit exams
                </p>
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-1 glass-card rounded-xl p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-2 rounded-lg transition-all duration-200", viewMode === "grid" ? "bg-violet-600 text-white" : "text-foreground/50 hover:text-foreground")}
                  aria-label="Grid view"
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-2 rounded-lg transition-all duration-200", viewMode === "list" ? "bg-violet-600 text-white" : "text-foreground/50 hover:text-foreground")}
                  aria-label="List view"
                >
                  <ListIcon />
                </button>
              </div>
            </div>

            {/* Faculty quick-filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              <FacultyPill
                label="All"
                icon="🎓"
                active={filters.faculty === "All"}
                onClick={() => updateFilter("faculty", "All")}
                count={DEPARTMENTS.length}
              />
              {FACULTIES.map((f) => (
                <FacultyPill
                  key={f}
                  label={f.split(" ")[0]}
                  icon={FACULTY_ICONS[f]}
                  active={filters.faculty === f}
                  onClick={() => updateFilter("faculty", f)}
                  count={DEPARTMENTS.filter((d) => d.faculty === f).length}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        {/* ── Search & filter bar ── */}
        <div className="sticky top-14 z-30 py-3">
          <div className={cn("glass-card rounded-2xl p-3 shadow-lg", isDark ? "bg-[#0d0d20]/90" : "bg-white/90", "backdrop-blur-xl")}>
            <div className="flex gap-2">
              {/* Search */}
              <div className={cn("flex-1 flex items-center gap-2.5 h-10 px-3.5 rounded-xl border transition-all duration-200", isDark ? "bg-white/5 border-white/10 focus-within:border-violet-500/50" : "bg-slate-100 border-transparent focus-within:border-violet-400")}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search departments, tags..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/30"
                />
                {filters.search && (
                  <button onClick={() => updateFilter("search", "")} className="text-foreground/40 hover:text-foreground/70">
                    <XIcon />
                  </button>
                )}
              </div>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value as SortBy)}
                className={cn("h-10 px-3 rounded-xl text-sm font-medium outline-none border cursor-pointer transition-colors", isDark ? "bg-white/5 border-white/10 text-foreground" : "bg-slate-100 border-transparent text-foreground")}
              >
                <option value="name">A → Z</option>
                <option value="passRate">Pass Rate</option>
                <option value="examCount">Most Exams</option>
                <option value="students">Most Students</option>
              </select>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "relative h-10 px-3.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 border",
                  showFilters
                    ? "bg-violet-600 text-white border-violet-600"
                    : isDark
                      ? "bg-white/5 border-white/10 text-foreground/70 hover:text-foreground"
                      : "bg-slate-100 border-transparent text-foreground/70 hover:text-foreground"
                )}
              >
                <FilterIcon />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Favorites toggle */}
              <button
                onClick={() => updateFilter("favoritesOnly", !filters.favoritesOnly)}
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-200",
                  filters.favoritesOnly
                    ? "bg-amber-500 text-white border-amber-500"
                    : isDark
                      ? "bg-white/5 border-white/10 text-foreground/50 hover:text-amber-400"
                      : "bg-slate-100 border-transparent text-foreground/50 hover:text-amber-500"
                )}
                title="Show favorites only"
              >
                <StarIcon filled={filters.favoritesOnly} />
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-down">
                {/* University */}
                <div>
                  <label className="text-xs text-foreground/50 mb-1 block font-medium">University</label>
                  <select
                    value={filters.university}
                    onChange={(e) => updateFilter("university", e.target.value)}
                    className={cn("w-full h-9 px-2.5 rounded-xl text-xs outline-none border cursor-pointer", isDark ? "bg-white/5 border-white/10 text-foreground" : "bg-slate-100 border-transparent text-foreground")}
                  >
                    {UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-xs text-foreground/50 mb-1 block font-medium">Exam Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => updateFilter("year", e.target.value)}
                    className={cn("w-full h-9 px-2.5 rounded-xl text-xs outline-none border cursor-pointer", isDark ? "bg-white/5 border-white/10 text-foreground" : "bg-slate-100 border-transparent text-foreground")}
                  >
                    {EXAM_YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs text-foreground/50 mb-1 block font-medium">Difficulty</label>
                  <div className="flex gap-1.5">
                    {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => updateFilter("difficulty", d)}
                        className={cn(
                          "flex-1 h-9 rounded-xl text-xs font-medium transition-all duration-200",
                          filters.difficulty === d
                            ? d === "All" ? "bg-violet-600 text-white"
                              : d === "Easy" ? "bg-emerald-600 text-white"
                              : d === "Medium" ? "bg-amber-500 text-white"
                              : "bg-rose-600 text-white"
                            : isDark ? "bg-white/5 text-foreground/60 hover:bg-white/10" : "bg-slate-100 text-foreground/60 hover:bg-slate-200"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setFilters(f => ({ ...f, faculty: "All", university: "All Universities", year: "All Years", difficulty: "All", favoritesOnly: false }));
                    }}
                    className="col-span-2 sm:col-span-3 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium flex items-center gap-1.5"
                  >
                    <XIcon /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Faculty summary strip ── */}
        {filters.faculty === "All" && !filters.search && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-3 pb-1 min-w-max">
              {facultySummary.map((fs) => (
                <button
                  key={fs.faculty}
                  onClick={() => updateFilter("faculty", fs.faculty)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all duration-200 text-left min-w-[180px]",
                    "glass-card card-hover",
                    isDark ? "hover:border-violet-500/30" : "hover:border-violet-300"
                  )}
                >
                  <span className="text-2xl">{FACULTY_ICONS[fs.faculty]}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{fs.faculty}</p>
                    <p className="text-xs text-foreground/50">{fs.count} depts · {fs.avgPass}% pass</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-foreground/50">
            {filtered.length === DEPARTMENTS.length
              ? `All ${filtered.length} departments`
              : `${filtered.length} of ${DEPARTMENTS.length} departments`}
            {filters.faculty !== "All" && (
              <span className="ml-1.5 font-medium text-violet-400">· {filters.faculty}</span>
            )}
          </p>
          {favorites.size > 0 && (
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <StarIcon filled /> {favorites.size} saved
            </p>
          )}
        </div>

        {/* ── Department cards ── */}
        {filtered.length === 0 ? (
          <EmptyState onClear={() => setFilters(f => ({ ...f, search: "", faculty: "All", difficulty: "All", favoritesOnly: false }))} />
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dept, i) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                isFavorite={favorites.has(dept.id)}
                isExpanded={expandedCard === dept.id}
                onToggleFavorite={toggleFavorite}
                onExpand={() => setExpandedCard(expandedCard === dept.id ? null : dept.id)}
                onSelect={() => onSelectDepartment?.(dept)}
                delay={Math.min(i * 0.04, 0.3)}
                isDark={isDark}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((dept, i) => (
              <DepartmentListRow
                key={dept.id}
                dept={dept}
                isFavorite={favorites.has(dept.id)}
                onToggleFavorite={toggleFavorite}
                onSelect={() => onSelectDepartment?.(dept)}
                delay={Math.min(i * 0.03, 0.25)}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Faculty pill ─────────────────────────────────────────────────────────────
function FacultyPill({
  label, icon, active, onClick, count,
}: {
  label: string; icon: string; active: boolean; onClick: () => void; count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
        active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
          : "glass-card text-foreground/60 hover:text-foreground hover:bg-white/10"
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span className={cn("text-[11px] font-bold rounded-full px-1.5 py-0.5", active ? "bg-white/20 text-white" : "bg-white/10 text-foreground/50")}>
        {count}
      </span>
    </button>
  );
}

// ─── Grid card ────────────────────────────────────────────────────────────────
function DepartmentCard({
  dept, isFavorite, isExpanded, onToggleFavorite, onExpand, onSelect, delay, isDark,
}: {
  dept: Department;
  isFavorite: boolean;
  isExpanded: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onExpand: () => void;
  onSelect: () => void;
  delay: number;
  isDark: boolean;
}) {
  const passColor = dept.passRate >= 80 ? "emerald" : dept.passRate >= 70 ? "blue" : dept.passRate >= 60 ? "amber" : "rose";

  return (
    <div
      className={cn(
        "glass-card rounded-2xl overflow-hidden group cursor-pointer animate-fade-up",
        "border transition-all duration-300",
        isDark ? "border-white/8 hover:border-violet-500/30" : "border-white/60 hover:border-violet-300/60",
        isExpanded && (isDark ? "border-violet-500/40" : "border-violet-400/60"),
        "hover:-translate-y-1 hover:shadow-xl"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Card top — gradient band */}
      <div className={cn("h-2 w-full bg-gradient-to-r", dept.color)} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
              "bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
              dept.color
            )}>
              {dept.icon}
            </div>
            <div>
              <h3
                className="font-bold text-foreground text-sm leading-tight group-hover:text-violet-400 transition-colors cursor-pointer"
                onClick={onSelect}
              >
                {dept.name}
              </h3>
              <p className="text-xs text-foreground/50 mt-0.5">{dept.faculty}</p>
            </div>
          </div>
          <button
            onClick={(e) => onToggleFavorite(dept.id, e)}
            className={cn(
              "flex-shrink-0 p-1.5 rounded-lg transition-all duration-200",
              isFavorite
                ? "text-amber-400 bg-amber-500/15"
                : "text-foreground/30 hover:text-amber-400 hover:bg-amber-500/10"
            )}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <StarIcon filled={isFavorite} size={18} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatChip icon="📝" value={`${dept.examCount}`} label="Exams" />
          <StatChip icon="👥" value={formatK(dept.studentCount)} label="Students" />
          <StatChip icon="📈" value={`${dept.avgScore}%`} label="Avg Score" />
        </div>

        {/* Pass rate bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-foreground/60">Pass Rate</span>
            <span className={cn("text-xs font-bold", dept.passRate >= 80 ? "text-emerald-400" : dept.passRate >= 70 ? "text-blue-400" : dept.passRate >= 60 ? "text-amber-400" : "text-rose-400")}>
              {dept.passRate}%
            </span>
          </div>
          <ProgressBar value={dept.passRate} size="sm" color={passColor} />
        </div>

        {/* Tags + difficulty */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <Badge variant={DIFFICULTY_COLORS[dept.difficulty]} size="sm" dot>
            {dept.difficulty}
          </Badge>
          {dept.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", isDark ? "border-white/10 text-foreground/50" : "border-slate-200 text-foreground/60")}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Expandable description */}
        {isExpanded && (
          <div className="border-t border-white/10 pt-3 mb-4 animate-fade-down">
            <p className="text-xs text-foreground/60 leading-relaxed mb-3">{dept.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {dept.tags.map((tag) => (
                <span key={tag} className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", dept.bgAccent, "text-foreground/70")}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-xs text-foreground/40 mb-1.5">Top Universities</p>
              <div className="flex flex-wrap gap-1.5">
                {dept.topUniversities.map((u) => (
                  <span key={u} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-medium">{u}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onSelect}
            className="flex-1 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/20"
          >
            <PlayIcon /> Start Exam
          </button>
          <button
            onClick={onExpand}
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center text-xs transition-all duration-200 border",
              isExpanded
                ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                : isDark ? "bg-white/5 text-foreground/50 border-white/10 hover:bg-white/10" : "bg-slate-100 text-foreground/50 border-transparent hover:bg-slate-200"
            )}
            title={isExpanded ? "Collapse" : "More details"}
          >
            <ChevronIcon up={isExpanded} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function DepartmentListRow({
  dept, isFavorite, onToggleFavorite, onSelect, delay, isDark,
}: {
  dept: Department;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: () => void;
  delay: number;
  isDark: boolean;
}) {
  const passColor = dept.passRate >= 80 ? "emerald" : dept.passRate >= 70 ? "blue" : dept.passRate >= 60 ? "amber" : "rose";

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-4 flex items-center gap-4 animate-fade-up group cursor-pointer",
        "border transition-all duration-200",
        isDark ? "border-white/8 hover:border-violet-500/30" : "border-white/60 hover:border-violet-300/60",
        "hover:-translate-y-0.5"
      )}
      style={{ animationDelay: `${delay}s` }}
      onClick={onSelect}
    >
      {/* Icon */}
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br shadow group-hover:scale-110 transition-transform duration-200", dept.color)}>
        {dept.icon}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-bold text-foreground text-sm group-hover:text-violet-400 transition-colors">
            {dept.name}
          </h3>
          <Badge variant={DIFFICULTY_COLORS[dept.difficulty]} size="sm">{dept.difficulty}</Badge>
          {isFavorite && <StarIcon filled size={14} className="text-amber-400 flex-shrink-0" />}
        </div>
        <p className="text-xs text-foreground/50 mb-2">{dept.faculty}</p>
        <ProgressBar value={dept.passRate} size="sm" color={passColor} animated={false} />
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{dept.passRate}%</p>
          <p className="text-[10px] text-foreground/40">Pass</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{dept.examCount}</p>
          <p className="text-[10px] text-foreground/40">Exams</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{formatK(dept.studentCount)}</p>
          <p className="text-[10px] text-foreground/40">Students</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(dept.id, e); }}
          className={cn("p-2 rounded-lg transition-all duration-200", isFavorite ? "text-amber-400 bg-amber-500/15" : "text-foreground/30 hover:text-amber-400")}
        >
          <StarIcon filled={isFavorite} size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="h-8 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all duration-200"
        >
          Open
        </button>
      </div>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 dark:bg-white/3">
      <span className="text-base leading-none mb-0.5">{icon}</span>
      <span className="text-xs font-bold text-foreground">{value}</span>
      <span className="text-[10px] text-foreground/40">{label}</span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-lg font-bold text-foreground mb-2">No departments found</h3>
      <p className="text-sm text-foreground/50 mb-6 max-w-xs">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
      <button
        onClick={onClear}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Clear filters
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatK(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-foreground/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StarIcon({ filled = false, size = 20, className }: { filled?: boolean; size?: number; className?: string }) {
  return (
    <svg
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg className={cn("w-4 h-4 transition-transform duration-200", up && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
