
import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  UserX, 
  Filter,
  Check,
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { Grade, Section, Teacher } from '../types';

interface AttendanceDashboardProps {
  academicYear: string;
  sections: Section[];
  grades: Grade[];
  teachers: Teacher[];
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ academicYear, sections, grades, teachers }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'chronic' | 'logs'>('overview');
  const [logFilter, setLogFilter] = useState<'all' | 'marked' | 'pending'>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Close calendar logic handled by overlay and button
  useEffect(() => {
    // Note: State-based closing via overlay handles this now.
  }, [isCalendarOpen]);

  // Calendar logic
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setIsCalendarOpen(false);
  };

  // Palette: Primary Blue (#1A237E), Alert Red, White
  const kpis = [
    { label: 'Daily Attendance %', value: '94%', subValue: 'Present on this day', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Absent Students', value: '28', subValue: 'Action needed', icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Teacher Compliance', value: '18/20', subValue: 'Registers marked', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const chronicAbsentees = [
    { id: '1', name: 'Nardos Tesfaye', grade: 'Grade 9', section: 'A', absences: 5, status: 'Notified', statusType: 'success' },
    { id: '2', name: 'Bereket Desta', grade: 'Grade 10', section: 'A', absences: 4, status: 'Action Needed', statusType: 'warning' },
    { id: '3', name: 'Liya Mekonnen', grade: 'Grade 9', section: 'B', absences: 7, status: 'Action Needed', statusType: 'warning' },
    { id: '4', name: 'Yonas Kebede', grade: 'Grade 12', section: 'A', absences: 6, status: 'Notified', statusType: 'success' },
  ];

  const gradeAttendance = [
    { grade: 'G9', percentage: 92 },
    { grade: 'G10', percentage: 95 },
    { grade: 'G11', percentage: 89 },
    { grade: 'G12', percentage: 97 },
  ];

  // Helper for heatmap colors - using Primary scales
  const getHeatmapColor = (val: number) => {
    if (val > 95) return 'bg-primary';
    if (val > 90) return 'bg-primary/80';
    if (val > 85) return 'bg-primary/60';
    return 'bg-red-200';
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative">
      {/* Compact Date Selector Popup */}
      <AnimatePresence>
        {isCalendarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsCalendarOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 md:left-auto md:right-8 w-[calc(100%-2rem)] max-w-[210px] bg-white border border-slate-200 rounded-[1.25rem] shadow-[0_20px_40px_-10px_rgba(26,35,126,0.2)] z-[9999] flex flex-col overflow-hidden p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 leading-tight">Pick Date</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-lg transition-all active:scale-90"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black text-slate-900">
                    {format(viewDate, 'MMM yyyy')}
                  </h4>
                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => setViewDate(subMonths(viewDate, 1))}
                      className="p-1 hover:bg-primary/5 rounded-md text-slate-400 hover:text-primary transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setViewDate(addMonths(viewDate, 1))}
                      className="p-1 hover:bg-primary/5 rounded-md text-slate-400 hover:text-primary transition-all active:scale-90"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 mb-0.5 px-0.5">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={`${day}-${i}`} className="text-[7px] font-black text-primary/20 text-center py-0.5">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {daysInMonth.map((day, i) => {
                    const isSelected = isSameDay(day, new Date(selectedDate));
                    const isCurrentMonth = isSameMonth(day, viewDate);
                    const isTodayDate = isToday(day);
                    
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`aspect-square rounded-md flex items-center justify-center text-[8px] font-black transition-all relative group/day ${
                          isSelected 
                            ? 'bg-primary text-white shadow-sm shadow-primary/20 z-10 scale-105' 
                            : isCurrentMonth 
                              ? 'text-slate-600 hover:bg-primary/5 hover:text-primary' 
                              : 'text-slate-200'
                        }`}
                      >
                        {format(day, 'd')}
                        {isTodayDate && !isSelected && (
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    const today = new Date();
                    setSelectedDate(today.toISOString().split('T')[0]);
                    setViewDate(today);
                    setIsCalendarOpen(false);
                  }}
                  className="py-2 bg-slate-50 border border-slate-100 text-[7px] font-black text-slate-400 uppercase tracking-widest rounded-lg hover:bg-primary/5 hover:text-primary transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <Clock className="w-2 h-2" />
                  <span>Today</span>
                </button>
                <button 
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedDate(yesterday.toISOString().split('T')[0]);
                    setViewDate(yesterday);
                    setIsCalendarOpen(false);
                  }}
                  className="py-2 bg-slate-50 border border-slate-100 text-[7px] font-black text-slate-400 uppercase tracking-widest rounded-lg hover:bg-primary/5 hover:text-primary transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>Yesterday</span>
                </button>
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="col-span-2 py-2.5 bg-primary text-white text-[7px] font-black uppercase tracking-widest rounded-lg shadow-md shadow-primary/20 active:scale-95"
                >
                  Confirm Selection
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-4 p-4 md:p-8">
          {/* Daily Summary Header */}
          <div className="bg-primary rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
            {/* Abstract Deco */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24 blur-2xl" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                      {academicYear}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                      Real-time Monitoring
                    </span>
                  </div>
                  <h1 
                    onClick={() => setIsCalendarOpen(true)}
                    className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
                  >
                    {displayDate}
                    <CalendarIcon className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    <span className="text-xs font-black bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/20 ml-auto md:ml-0">Active</span>
                  </h1>
                </div>
                
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 group">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Global Filters</span>
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex items-center gap-5 group hover:bg-white/10 transition-all cursor-default">
                    <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center ${kpi.color} shadow-xl transform group-hover:scale-110 transition-all duration-500`}>
                      <kpi.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{kpi.label}</p>
                      <p className={`text-2xl font-black text-white leading-none mb-1`}>{kpi.value}</p>
                      <p className="text-[10px] font-bold text-accent/80 tracking-tight">{kpi.subValue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 w-full md:w-fit shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'chronic', label: 'Chronic', icon: AlertCircle },
            { id: 'logs', label: 'Logs', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                activeSubTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-400 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'chronic' && (
                <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">4</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {/* Heatmap Grid */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Attendance Heatmap</h3>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded bg-primary/20" />
                    <div className="w-2.5 h-2.5 rounded bg-primary/60" />
                    <div className="w-2.5 h-2.5 rounded bg-primary" />
                    <span className="text-[8px] font-black text-slate-400 ml-1 uppercase">Intensity</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const val = 80 + Math.random() * 20;
                    return (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className={`aspect-square rounded-lg ${getHeatmapColor(val)} ring-primary/5 hover:ring-4 transition-all cursor-crosshair relative group`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 pointer-events-none shadow-xl">
                          Day {i + 1}: {val.toFixed(1)}%
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Grade Level Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Grade Performance</h3>
                <div className="space-y-5">
                  {gradeAttendance.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end px-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center font-black text-primary text-[10px] border border-slate-100">
                            {item.grade}
                          </div>
                          <span className="text-[11px] font-black text-slate-700 tracking-tight">{item.grade} Efficiency</span>
                        </div>
                        <span className="text-xs font-black text-primary">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          className={`h-full rounded-full ${item.percentage > 90 ? 'bg-primary' : 'bg-red-400'} relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'chronic' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {chronicAbsentees.map(student => (
                <div key={student.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Users className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 mb-1 group-hover:text-red-600 transition-colors leading-tight">{student.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{student.grade} • SEC {student.section}</p>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-4 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Absences</span>
                        <span className="text-sm font-black text-red-600 underline decoration-red-200 underline-offset-4 decoration-2">{student.absences} Days</span>
                      </div>
                    </div>

                    <div className={`text-center py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      student.statusType === 'success' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {student.status}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeSubTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-4">
                 <div>
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Compliance Logs</h3>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setLogFilter(logFilter === 'marked' ? 'all' : 'marked')}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border uppercase tracking-widest text-[9px] font-black transition-all ${
                        logFilter === 'marked' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                      }`}
                    >
                      <Check className="w-3 h-3" /> 
                      Marked
                    </button>
                    <button 
                      onClick={() => setLogFilter(logFilter === 'pending' ? 'all' : 'pending')}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border uppercase tracking-widest text-[9px] font-black transition-all ${
                        logFilter === 'pending' 
                        ? 'bg-red-600 text-white border-red-600 shadow-md' 
                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                      }`}
                    >
                      <Clock className="w-3 h-3" /> 
                      Pending
                    </button>
                 </div>
              </div>
              
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4">Section</th>
                      <th className="px-6 py-4">Teacher</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sections
                      .map((section, originalIdx) => ({ section, originalIdx, isCompleted: originalIdx < sections.length - 2 }))
                      .filter(item => {
                        if (logFilter === 'marked') return item.isCompleted;
                        if (logFilter === 'pending') return !item.isCompleted;
                        return true;
                      })
                      .map(({ section, originalIdx, isCompleted }) => {
                        const teacher = teachers.find(t => t.id === section.homeroomTeacherId) || teachers[originalIdx % teachers.length];
                        
                        return (
                          <tr 
                            key={section.id} 
                            onClick={() => setSelectedSectionId(section.id)}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer text-xs"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:text-primary group-hover:border-primary transition-all shadow-sm">
                                  {section.name}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-800">Section {section.name}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{grades.find(g => g.id === section.gradeId)?.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[9px] group-hover:bg-primary group-hover:text-white transition-all">
                                  {teacher.name?.[0]}
                                </div>
                                <span className="font-bold text-slate-700">{teacher.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {isCompleted ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {isCompleted ? 'Marked' : 'Pending'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                {isCompleted ? `08:${20 + originalIdx} AM` : '--:-- --'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Section Details Side Panel */}
      <AnimatePresence>
        {selectedSectionId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
              onClick={() => setSelectedSectionId(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[100] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Section Analytics</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Details for Section {sections.find(s => s.id === selectedSectionId)?.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedSectionId(null)}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Present</p>
                    <p className="text-2xl font-black text-emerald-700">38</p>
                    <p className="text-[9px] font-bold text-emerald-600/60 mt-1">90.4% Efficiency</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Absent</p>
                    <p className="text-2xl font-black text-red-700">4</p>
                    <p className="text-[9px] font-bold text-red-600/60 mt-1">Requires follow-up</p>
                  </div>
                </div>

                {/* Absences List */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Absences</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Nardos Tesfaye', status: 'Unexcused', time: '8:15 AM' },
                      { name: 'Liya Mekonnen', status: 'Medical', time: '9:30 AM' },
                      { name: 'Bereket Desta', status: 'Unexcused', time: '8:45 AM' },
                    ].map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 shadow-sm">
                            {entry.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{entry.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{entry.time}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${entry.status === 'Medical' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                          {entry.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Trend */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Attendance</h4>
                  <div className="flex items-end justify-between px-2 h-20 gap-1.5">
                    {[92, 95, 88, 94, 91, 0, 0].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: i < 5 ? `${val}%` : '5%' }}
                          className={`w-full rounded-t-lg shadow-sm ${i < 5 ? (val > 90 ? 'bg-primary' : 'bg-red-400') : 'bg-slate-100'}`}
                        />
                        <span className="text-[8px] font-black text-slate-400 uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all">
                  Generate Section Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
