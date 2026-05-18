
import React, { useState } from 'react';
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
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  Cell
} from 'recharts';

// Mock Data
const attendanceData = [
  { day: 'Mon', rate: 94 },
  { day: 'Tue', rate: 92 },
  { day: 'Wed', rate: 95 },
  { day: 'Thu', rate: 89 },
  { day: 'Fri', rate: 91 },
  { day: 'Sat', rate: 88 },
  { day: 'Sun', rate: 93 },
];

const gradeComparisonData = [
  { grade: 'G-9', rate: 92 },
  { grade: 'G-10', rate: 88 },
  { grade: 'G-11', rate: 95 },
  { grade: 'G-12', rate: 91 },
  { grade: 'Prep', rate: 94 },
];

const unlinkedStudents = [
  { id: 'ST-001', name: 'Abebe Bikila', grade: 'Grade 9A' },
  { id: 'ST-012', name: 'Marta Hailu', grade: 'Grade 10B' },
  { id: 'ST-045', name: 'Sara Tesfaye', grade: 'Grade 11C' },
  { id: 'ST-089', name: 'Dawit Mekonnen', grade: 'Grade 9A' },
];

const performanceRisks = [
  { name: 'Kassa Tadesse', grade: 'Grade 10A', drop: '-15%', status: 'Critical' },
  { name: 'Helen Girma', grade: 'Grade 9B', drop: '-12%', status: 'Warning' },
  { name: 'Yonas Assefa', grade: 'Grade 12C', drop: '-10%', status: 'Warning' },
  { name: 'Zenebech Alemu', grade: 'Grade 11A', drop: '-18%', status: 'Critical' },
  { name: 'Tewodros Kassahun', grade: 'Grade 9A', drop: '-8%', status: 'Monitor' },
];

const upcomingEvents = [
  { title: 'National Holiday', time: 'Tomorrow', type: 'Holiday' },
  { title: 'Teacher Workshop', time: 'Friday, 10:00 AM', type: 'Staff' },
  { title: 'Parent-Teacher Meeting', time: 'Next Monday', type: 'Meeting' },
];

const recentAnnouncements = [
  { title: 'New Semester Schedule', readRate: 85, date: '2h ago' },
  { title: 'Security Protocol Update', readRate: 62, date: '5h ago' },
];

export const Dashboard: React.FC = () => {
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24 md:pb-8 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Mobile Search - only show search here on mobile as header search is hidden */}
        <div className="md:hidden relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-emerald-50 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-black">+2.4%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900">92.8%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-red-50 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase">Critical</div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-red-600">42</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Performance Risk</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-amber-50 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[10px] font-bold text-amber-600 uppercase">12 Pending</p>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900">88%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher Compliance</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-primary/5 rounded-2xl">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[10px] font-bold text-primary uppercase">Goal: 90%</p>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900">85.4%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Linkage</p>
            </div>
          </motion.div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center justify-between">
              Weekly Attendance Trend
              <span className="text-[10px] text-slate-400 lowercase font-medium italic">Last 7 days</span>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    domain={[60, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#0f172a" 
                    strokeWidth={4} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">
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
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="grade" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#1e293b' }}
                    width={50}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="rate" radius={[0, 10, 10, 0]} barSize={20}>
                    {gradeComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rate > 90 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Widgets Context */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Attention: Performance Risks */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Top Performance Risks
              </h3>
              <button className="text-xs font-black text-slate-400 hover:text-primary transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {performanceRisks.map((risk, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{risk.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{risk.grade}</td>
                      <td className="px-6 py-4 text-red-600 font-black">{risk.drop}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                          risk.status === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
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
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Link2Off className="w-4 h-4 text-amber-500" />
                Unlinked Students
              </h3>
            </div>
            <div className="flex-1 overflow-auto max-h-[300px] p-4 space-y-3">
              {unlinkedStudents.map((student, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{student.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{student.grade}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all">
                    Link
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50/50">
              <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">
                Handle Bulk Linkage
              </button>
            </div>
          </div>
        </div>

        {/* Activity & Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {/* Calendar Quick-View */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Next Up
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-1.5 h-12 bg-primary rounded-full shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Recent Broadcasts
            </h3>
            <div className="space-y-6">
              {recentAnnouncements.map((ann, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-slate-900">{ann.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium italic">{ann.date}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${ann.readRate}%` }} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{ann.readRate}% Read Rate</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Action (FAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isFabOpen && (
            <div className="absolute bottom-16 right-0 space-y-3 mb-2 flex flex-col items-end">
              <motion.button 
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-xl hover:bg-slate-50 transition-colors whitespace-nowrap group"
              >
                <span className="text-xs font-black text-slate-700">Add Student</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <UserPlus className="w-4 h-4" />
                </div>
              </motion.button>
              <motion.button 
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: 0.05 }}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <span className="text-xs font-black text-slate-700">Invite Teacher</span>
                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <Mail className="w-4 h-4" />
                </div>
              </motion.button>
              <motion.button 
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <span className="text-xs font-black text-slate-700">Create Announcement</span>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </motion.button>
            </div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
            isFabOpen ? 'bg-slate-900 text-white rotate-45' : 'bg-primary text-white'
          }`}
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
