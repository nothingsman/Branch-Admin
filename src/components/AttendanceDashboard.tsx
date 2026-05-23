import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  TrendingUp,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { format } from 'date-fns';
import { useAttendanceSummaries, useDailyAttendanceStatus } from '../hooks/useAttendance';
import { useGrades } from '../hooks/useGrades';
import { useSections } from '../hooks/useSections';
import { useTeachers, useHomeroomAssignments } from '../hooks/useTeachers';
import { ApiDailyAttendanceStatus } from '../lib/api';

interface AttendanceDashboardProps {
  academicYear: string;
  branchId: string | null;
  organizationId: string | null;
  academicYearId: string | null;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({
  academicYear,
  branchId,
  organizationId,
  academicYearId,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'chronic' | 'logs'>(
    'overview',
  );
  const [logFilter, setLogFilter] = useState<'all' | 'marked' | 'pending'>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const { grades, isLoading: gradesLoading, error: gradesError } = useGrades(branchId);
  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useSections(branchId, academicYearId);
  const {
    teachers,
    isLoading: teachersLoading,
    error: teachersError,
  } = useTeachers({ branchId, organizationId });
  const {
    homeroomAssignments,
    isLoading: homeroomLoading,
    error: homeroomError,
  } = useHomeroomAssignments({ branchId, organizationId, academicYearId });
  const {
    statuses,
    isLoading: statusesLoading,
    error: statusesError,
  } = useDailyAttendanceStatus({
    branchId,
    organizationId,
    academicYearId,
    date: selectedDate,
  });
  const {
    summaries,
    isLoading: summariesLoading,
    error: summariesError,
  } = useAttendanceSummaries({ organizationId, academicYearId });

  const isLoading =
    gradesLoading ||
    sectionsLoading ||
    teachersLoading ||
    homeroomLoading ||
    statusesLoading ||
    summariesLoading;
  const error =
    gradesError ||
    sectionsError ||
    teachersError ||
    homeroomError ||
    statusesError ||
    summariesError;

  const teacherNames = useMemo(() => {
    return new Map(teachers.map((teacher) => [teacher.id, teacher.user_name]));
  }, [teachers]);

  const homeroomBySection = useMemo(() => {
    return new Map(homeroomAssignments.map((assignment) => [assignment.section, assignment]));
  }, [homeroomAssignments]);

  const sectionsWithStatus = useMemo(() => {
    const statusBySection = new Map(statuses.map((status) => [status.section, status]));
    return sections.map((section) => {
      const status = statusBySection.get(section.id);
      const homeroom = homeroomBySection.get(section.id);
      const grade = grades.find((item) => item.id === section.grade);
      return {
        section,
        gradeName: grade?.name ?? status?.grade_name ?? 'Unknown Grade',
        status:
          status ??
          ({
            section: section.id,
            section_name: section.name,
            grade_name: grade?.name ?? 'Unknown Grade',
            date: selectedDate,
            total_students: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            attendance_rate: 0,
            is_marked: false,
            recorded_by: null,
            recorded_at: null,
          } satisfies ApiDailyAttendanceStatus),
        teacherName:
          (homeroom?.teacher && teacherNames.get(homeroom.teacher)) ??
          homeroom?.teacher_name ??
          'Unassigned',
      };
    });
  }, [grades, homeroomBySection, sections, selectedDate, statuses, teacherNames]);

  const kpis = useMemo(() => {
    if (sectionsWithStatus.length === 0) {
      return {
        attendanceRate: 0,
        present: 0,
        absent: 0,
        markedSections: 0,
        totalSections: 0,
      };
    }

    const totalStudents = sectionsWithStatus.reduce(
      (sum, item) => sum + item.status.total_students,
      0,
    );
    const present = sectionsWithStatus.reduce(
      (sum, item) => sum + item.status.present,
      0,
    );
    const absent = sectionsWithStatus.reduce(
      (sum, item) => sum + item.status.absent + item.status.late + item.status.excused,
      0,
    );
    const markedSections = sectionsWithStatus.filter((item) => item.status.is_marked)
      .length;

    return {
      attendanceRate: totalStudents > 0 ? (present / totalStudents) * 100 : 0,
      present,
      absent,
      markedSections,
      totalSections: sectionsWithStatus.length,
    };
  }, [sectionsWithStatus]);

  const chronicAbsentees = useMemo(() => {
    return [...summaries]
      .sort((left, right) => {
        if (right.total_absent !== left.total_absent) {
          return right.total_absent - left.total_absent;
        }
        return left.attendance_rate - right.attendance_rate;
      })
      .slice(0, 8);
  }, [summaries]);

  const selectedSection = useMemo(() => {
    return sectionsWithStatus.find((item) => item.section.id === selectedSectionId) ?? null;
  }, [sectionsWithStatus, selectedSectionId]);

  const sectionSummary = useMemo(() => {
    if (!selectedSection) return null;
    const gradeMatches = chronicAbsentees.filter(
      (summary) => summary.student_name && selectedSection.gradeName,
    );
    return {
      averageAttendance: selectedSection.status.attendance_rate,
      totalAbsent: selectedSection.status.absent,
      chronicCount: gradeMatches.filter((summary) => summary.total_absent >= 3).length,
    };
  }, [chronicAbsentees, selectedSection]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Loading attendance dashboard
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <p className="font-black text-red-700">Failed to load attendance</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-[2rem] bg-primary p-8 text-white shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                  Attendance Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">
                  {format(new Date(selectedDate), 'MMMM d, yyyy')}
                </h1>
                <p className="mt-2 text-sm font-medium text-white/70">
                  Academic year {academicYear}
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <CalendarIcon className="h-4 w-4" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="bg-transparent text-sm font-bold outline-none"
                />
              </label>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <KpiCard
                label="Daily Attendance"
                value={`${kpis.attendanceRate.toFixed(1)}%`}
                helper={`${kpis.present} present students`}
                icon={UserCheck}
              />
              <KpiCard
                label="Absent or Late"
                value={kpis.absent}
                helper="Requires follow-up"
                icon={UserX}
              />
              <KpiCard
                label="Teacher Compliance"
                value={`${kpis.markedSections}/${kpis.totalSections}`}
                helper="Sections marked today"
                icon={Clock}
              />
            </div>
          </section>

          <div className="flex gap-2 rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'chronic', label: 'Chronic', icon: AlertCircle },
              { id: 'logs', label: 'Logs', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    Section Status
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Live attendance progress by section
                  </p>
                </div>
                <div className="space-y-3">
                  {sectionsWithStatus.map((item) => (
                    <button
                      key={item.section.id}
                      onClick={() => setSelectedSectionId(item.section.id)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-slate-200"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {item.gradeName} • Section {item.section.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.teacherName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">
                          {item.status.attendance_rate.toFixed(1)}%
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {item.status.is_marked ? 'Marked' : 'Pending'}
                        </p>
                      </div>
                    </button>
                  ))}
                  {sectionsWithStatus.length === 0 && (
                    <EmptyBlock message="No attendance data is available for this day." />
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    Grade Breakdown
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Average daily rate by grade
                  </p>
                </div>
                <div className="space-y-4">
                  {buildGradeBreakdown(sectionsWithStatus).map((entry) => (
                    <div key={entry.gradeName} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                        <span>{entry.gradeName}</span>
                        <span>{entry.rate.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(entry.rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {sectionsWithStatus.length === 0 && (
                    <EmptyBlock message="No grade-level breakdown is available yet." />
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'chronic' && (
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  Chronic Absenteeism
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Students with the highest recorded absences this academic year
                </p>
              </div>
              <div className="space-y-3">
                {chronicAbsentees.map((summary) => (
                  <div
                    key={summary.id}
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {summary.student_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated {formatDateTime(summary.last_updated)}
                      </p>
                    </div>
                    <SummaryMetric label="Absent" value={summary.total_absent} />
                    <SummaryMetric
                      label="Attendance"
                      value={`${summary.attendance_rate.toFixed(1)}%`}
                    />
                    <SummaryMetric
                      label="Late"
                      value={summary.total_late + summary.total_excused}
                    />
                  </div>
                ))}
                {chronicAbsentees.length === 0 && (
                  <EmptyBlock message="No attendance summaries are available yet." />
                )}
              </div>
            </section>
          )}

          {activeTab === 'logs' && (
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    Section Logs
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Marked and pending attendance registers
                  </p>
                </div>
                <div className="flex gap-2">
                  {(['all', 'marked', 'pending'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                        logFilter === filter
                          ? 'bg-primary text-white'
                          : 'border border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-4 py-3">Section</th>
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Rate</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionsWithStatus
                      .filter((item) => {
                        if (logFilter === 'marked') return item.status.is_marked;
                        if (logFilter === 'pending') return !item.status.is_marked;
                        return true;
                      })
                      .map((item) => (
                        <tr
                          key={item.section.id}
                          onClick={() => setSelectedSectionId(item.section.id)}
                          className="cursor-pointer border-b border-slate-50 text-sm hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 font-bold text-slate-800">
                            {item.gradeName} • {item.section.name}
                          </td>
                          <td className="px-4 py-4 text-slate-600">{item.teacherName}</td>
                          <td className="px-4 py-4 text-slate-600">
                            {item.status.attendance_rate.toFixed(1)}%
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                item.status.is_marked
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {item.status.is_marked ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              {item.status.is_marked ? 'Marked' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-slate-500">
                            {formatDateTime(item.status.recorded_at)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedSection && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-slate-950/40"
              onClick={() => setSelectedSectionId(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedSection.gradeName} • Section {selectedSection.section.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedSection.teacherName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSectionId(null)}
                  className="rounded-xl p-2 hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-3">
                  <SideMetric label="Present" value={selectedSection.status.present} />
                  <SideMetric label="Absent" value={selectedSection.status.absent} />
                  <SideMetric label="Late" value={selectedSection.status.late} />
                  <SideMetric label="Excused" value={selectedSection.status.excused} />
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Register Status
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-900">
                    {selectedSection.status.is_marked ? 'Marked' : 'Pending'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Recorded {formatDateTime(selectedSection.status.recorded_at)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Daily Attendance Rate
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {selectedSection.status.attendance_rate.toFixed(1)}%
                  </p>
                </div>
                {sectionSummary && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Academic Year Snapshot
                    </p>
                    <div className="mt-3 space-y-2 text-sm font-medium text-slate-600">
                      <p>
                        Average attendance: {sectionSummary.averageAttendance.toFixed(1)}%
                      </p>
                      <p>Total recorded absences: {sectionSummary.totalAbsent}</p>
                      <p>Students with chronic flags: {sectionSummary.chronicCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function buildGradeBreakdown(
  sectionsWithStatus: Array<{
    gradeName: string;
    status: ApiDailyAttendanceStatus;
  }>,
) {
  const grouped = new Map<string, { total: number; count: number }>();
  for (const item of sectionsWithStatus) {
    const current = grouped.get(item.gradeName) ?? { total: 0, count: 0 };
    current.total += item.status.attendance_rate;
    current.count += 1;
    grouped.set(item.gradeName, current);
  }

  return [...grouped.entries()].map(([gradeName, value]) => ({
    gradeName,
    rate: value.count > 0 ? value.total / value.count : 0,
  }));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'MMM d, yyyy HH:mm');
}

function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-white/70">{helper}</p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function SideMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
