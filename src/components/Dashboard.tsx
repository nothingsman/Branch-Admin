import React from "react"
import {
  AlertCircle,
  GraduationCap,
  Link2,
  Link2Off,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"
import { motion } from "motion/react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import { useBranchDashboard } from "../hooks/useBranchDashboard"
import { ApiStudent } from "../lib/api"

interface DashboardProps {
  branchId: string | null
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatWeekLabel(year: number, week: number) {
  return `${String(year).slice(-2)} W${week}`
}

function formatRiskDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Unknown"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function formatStudentPlacement(student: ApiStudent) {
  const grade = student.grade_name ?? "No Grade"
  const section = student.section_name?.trim()
  return section ? `${grade} ${section}` : grade
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

export const Dashboard: React.FC<DashboardProps> = ({ branchId }) => {
  const { data, topRisks, unlinkedStudents, isLoading, error, refetch } =
    useBranchDashboard(branchId)

  const weeklyAttendance =
    data?.attendance_trend.weekly.map((point) => ({
      label: formatWeekLabel(point.year, point.week),
      attendanceRate: point.attendance_rate,
    })) ?? []

  const perGradeData =
    data?.per_grade.map((item) => ({
      grade: item.grade_name,
      performanceScore: item.performance_score,
    })) ?? []

  if (!branchId) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Branch context is still loading.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-black tracking-[0.25em] text-slate-400 uppercase">
              Branch Analytics
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Live dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Attendance, performance, staffing, and parent-linkage metrics are
              loaded from the branch analytics endpoints.
            </p>
          </div>
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Unable to load analytics.</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        {isLoading && !data ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm font-semibold">
                Loading branch analytics...
              </p>
            </div>
          </div>
        ) : null}

        {data ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-emerald-50 p-2.5">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    Weekly Trend
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatPercent(data.attendance_rate)}
                  </p>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Attendance Rate
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-red-50 p-2.5">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-xs font-bold text-red-600">
                    {formatPercent(data.performance_risk.percent)}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-red-600">
                    {data.performance_risk.at_risk_students}
                  </p>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    At-Risk Students
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-amber-50 p-2.5">
                    <GraduationCap className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-bold text-amber-600">
                    {data.totals.active_students} students
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-slate-900">
                    {data.totals.active_teachers}
                  </p>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Active Teachers
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-primary/5 p-2.5">
                    <Link2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {data.totals.active_branch_admins} admins
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatPercent(data.parent_linkage_percent)}
                  </p>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Parent Linkage
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-6 flex items-center justify-between text-sm font-bold tracking-wider text-slate-900 uppercase">
                  Weekly Attendance Trend
                  <span className="text-[10px] font-medium text-slate-400 lowercase italic">
                    by ISO week
                  </span>
                </h3>
                {weeklyAttendance.length > 0 ? (
                  <div className="h-[250px] min-h-[250px] w-full min-w-0">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={1}
                      minHeight={1}
                      initialDimension={{ width: 500, height: 250 }}
                    >
                      <LineChart data={weeklyAttendance}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: "#64748b",
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: "#64748b",
                          }}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            `${value.toFixed(1)}%`,
                            "Attendance",
                          ]}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            fontWeight: 800,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="attendanceRate"
                          stroke="#0f172a"
                          strokeWidth={4}
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState label="No weekly attendance trend is available for this branch yet." />
                )}
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-sm font-bold tracking-wider text-slate-900 uppercase">
                  Grade-Level Comparison
                </h3>
                {perGradeData.length > 0 ? (
                  <div className="h-[250px] min-h-[250px] w-full min-w-0">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={1}
                      minHeight={1}
                      initialDimension={{ width: 500, height: 250 }}
                    >
                      <BarChart data={perGradeData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis
                          dataKey="grade"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 800,
                            fill: "#1e293b",
                          }}
                          width={80}
                        />
                        <Tooltip
                          cursor={{ fill: "transparent" }}
                          formatter={(value: number) => [
                            `${value.toFixed(1)}%`,
                            "Performance",
                          ]}
                        />
                        <Bar
                          dataKey="performanceScore"
                          radius={[0, 10, 10, 0]}
                          barSize={20}
                        >
                          {perGradeData.map((entry, index) => (
                            <Cell
                              key={`grade-cell-${index}`}
                              fill={
                                entry.performanceScore >= 75
                                  ? "#10b981"
                                  : entry.performanceScore >= 50
                                    ? "#f59e0b"
                                    : "#ef4444"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState label="No grade performance data is available yet." />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-50 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-900 uppercase">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Top Performance Risks
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    {topRisks.length} students
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Student
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Grade
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Risk Count
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Average Score
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Latest Risk
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {topRisks.length > 0 ? (
                        topRisks.map((risk) => (
                          <tr
                            key={risk.student_id}
                            className="transition-colors hover:bg-slate-50"
                          >
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">
                                {risk.student_name}
                              </p>
                              <p className="mt-1 text-[10px] font-semibold text-slate-400 uppercase">
                                {risk.roll_no}
                              </p>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500">
                              {risk.grade_name ?? "Unassigned"}
                            </td>
                            <td className="px-6 py-4 font-bold text-red-600">
                              {risk.risk_count}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {formatPercent(risk.average_percentage)}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500">
                              {formatRiskDate(risk.latest_risk_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-sm font-medium text-slate-500"
                          >
                            No students are currently flagged by the
                            performance-risk endpoint.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-50 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-900 uppercase">
                    <Link2Off className="h-4 w-4 text-amber-500" />
                    Unlinked Students
                  </h3>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Active students without any parent link
                  </p>
                </div>
                <div className="max-h-[420px] flex-1 space-y-3 overflow-auto p-4">
                  {unlinkedStudents.length > 0 ? (
                    unlinkedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="rounded-2xl border border-transparent bg-slate-50 p-3 transition-all hover:border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                            <Users className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase">
                              {formatStudentPlacement(student)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                      <p className="text-sm font-medium text-slate-500">
                        Every active student currently has at least one linked
                        parent.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
