import React, { useState } from "react"
import {
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Link2,
  Link2Off,
  Search,
  Calendar,
  MessageSquare,
  Plus,
  ChevronRight,
  TrendingDown,
  UserPlus,
  Mail,
  MoreVertical,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
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

// Mock Data
const attendanceData = [
  { day: "Mon", rate: 94 },
  { day: "Tue", rate: 92 },
  { day: "Wed", rate: 95 },
  { day: "Thu", rate: 89 },
  { day: "Fri", rate: 91 },
  { day: "Sat", rate: 88 },
  { day: "Sun", rate: 93 },
]

const gradeComparisonData = [
  { grade: "G-9", rate: 92 },
  { grade: "G-10", rate: 88 },
  { grade: "G-11", rate: 95 },
  { grade: "G-12", rate: 91 },
  { grade: "Prep", rate: 94 },
]

const unlinkedStudents = [
  { id: "ST-001", name: "Abebe Bikila", grade: "Grade 9A" },
  { id: "ST-012", name: "Marta Hailu", grade: "Grade 10B" },
  { id: "ST-045", name: "Sara Tesfaye", grade: "Grade 11C" },
  { id: "ST-089", name: "Dawit Mekonnen", grade: "Grade 9A" },
]

const performanceRisks = [
  {
    name: "Kassa Tadesse",
    grade: "Grade 10A",
    drop: "-15%",
    status: "Critical",
  },
  { name: "Helen Girma", grade: "Grade 9B", drop: "-12%", status: "Warning" },
  { name: "Yonas Assefa", grade: "Grade 12C", drop: "-10%", status: "Warning" },
  {
    name: "Zenebech Alemu",
    grade: "Grade 11A",
    drop: "-18%",
    status: "Critical",
  },
  {
    name: "Tewodros Kassahun",
    grade: "Grade 9A",
    drop: "-8%",
    status: "Monitor",
  },
]

const upcomingEvents = [
  { title: "National Holiday", time: "Tomorrow", type: "Holiday" },
  { title: "Teacher Workshop", time: "Friday, 10:00 AM", type: "Staff" },
  { title: "Parent-Teacher Meeting", time: "Next Monday", type: "Meeting" },
]

const recentAnnouncements = [
  { title: "New Semester Schedule", readRate: 85, date: "2h ago" },
  { title: "Security Protocol Update", readRate: 62, date: "5h ago" },
]

export const Dashboard: React.FC = () => {
  const [academicYear, setAcademicYear] = useState("2025/2026")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFabOpen, setIsFabOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-slate-50 p-4 pb-24 md:p-8 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Mobile Search - only show search here on mobile as header search is hidden */}
        <div className="relative mb-6 md:hidden">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm font-medium shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-emerald-50 p-2.5">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-black">+2.4%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900">92.8%</p>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Attendance Rate
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
              <div className="rounded-2xl bg-red-50 p-2.5">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-black text-white uppercase">
                Critical
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-red-600">42</p>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Performance Risk
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-amber-50 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-[10px] font-bold text-amber-600 uppercase">
                12 Pending
              </p>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900">88%</p>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Teacher Compliance
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-primary/5 p-2.5">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] font-bold text-primary uppercase">
                Goal: 90%
              </p>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900">85.4%</p>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Parent Linkage
              </p>
            </div>
          </motion.div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center justify-between text-sm font-black tracking-wider text-slate-900 uppercase">
              Weekly Attendance Trend
              <span className="text-[10px] font-medium text-slate-400 lowercase italic">
                Last 7 days
              </span>
            </h3>
            <div className="h-[250px] min-h-[250px] w-full min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={1}
                minHeight={1}
                initialDimension={{ width: 500, height: 250 }}
              >
                <LineChart data={attendanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                    domain={[60, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontWeight: 800,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#0f172a"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-black tracking-wider text-slate-900 uppercase">
              Grade-Level Comparison
            </h3>
            <div className="h-[250px] min-h-[250px] w-full min-w-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={1}
                minHeight={1}
                initialDimension={{ width: 500, height: 250 }}
              >
                <BarChart data={gradeComparisonData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="grade"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 800, fill: "#1e293b" }}
                    width={50}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="rate" radius={[0, 10, 10, 0]} barSize={20}>
                    {gradeComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate > 90 ? "#10b981" : "#f59e0b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Widgets Context */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Critical Attention: Performance Risks */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-50 p-6">
              <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-slate-900 uppercase">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Top Performance Risks
              </h3>
              <button className="text-xs font-black text-slate-400 transition-colors hover:text-primary">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Grade
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Trend
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {performanceRisks.map((risk, index) => (
                    <tr
                      key={index}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {risk.name}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">
                        {risk.grade}
                      </td>
                      <td className="px-6 py-4 font-black text-red-600">
                        {risk.drop}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase ${
                            risk.status === "Critical"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {risk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unlinked Students */}
          <div className="flex flex-col rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-50 p-6">
              <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-slate-900 uppercase">
                <Link2Off className="h-4 w-4 text-amber-500" />
                Unlinked Students
              </h3>
            </div>
            <div className="max-h-[300px] flex-1 space-y-3 overflow-auto p-4">
              {unlinkedStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-transparent bg-slate-50 p-3 transition-all hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                      <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        {student.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {student.grade}
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black tracking-widest text-slate-600 uppercase transition-all hover:border-primary hover:bg-primary hover:text-white">
                    Link
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-slate-50/50 p-4">
              <button className="w-full rounded-xl border border-slate-200 bg-white py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600">
                Handle Bulk Linkage
              </button>
            </div>
          </div>
        </div>

        {/* Activity & Events */}
        <div className="grid grid-cols-1 gap-6 pb-12 md:grid-cols-2">
          {/* Calendar Quick-View */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-black tracking-wider text-slate-900 uppercase">
              <Calendar className="h-4 w-4 text-primary" />
              Next Up
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="h-12 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {event.title}
                    </h4>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-black tracking-wider text-slate-900 uppercase">
              <Bell className="h-4 w-4 text-primary" />
              Recent Broadcasts
            </h3>
            <div className="space-y-6">
              {recentAnnouncements.map((ann, index) => (
                <div key={index}>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900">
                      {ann.title}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 italic">
                      {ann.date}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${ann.readRate}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    {ann.readRate}% Read Rate
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Action (FAB) */}
      <div className="fixed right-6 bottom-6 z-50">
        <AnimatePresence>
          {isFabOpen && (
            <div className="absolute right-0 bottom-16 mb-2 flex flex-col items-end space-y-3">
              <motion.button
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 whitespace-nowrap shadow-xl transition-colors hover:bg-slate-50"
              >
                <span className="text-xs font-black text-slate-700">
                  Add Student
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <UserPlus className="h-4 w-4" />
                </div>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: 0.05 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 whitespace-nowrap shadow-xl transition-colors hover:bg-slate-50"
              >
                <span className="text-xs font-black text-slate-700">
                  Invite Teacher
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 whitespace-nowrap shadow-xl transition-colors hover:bg-slate-50"
              >
                <span className="text-xs font-black text-slate-700">
                  Create Announcement
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-[1.5rem] shadow-2xl transition-all duration-300 active:scale-95 ${
            isFabOpen
              ? "rotate-45 bg-slate-900 text-white"
              : "bg-primary text-white"
          }`}
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>
    </div>
  )
}
