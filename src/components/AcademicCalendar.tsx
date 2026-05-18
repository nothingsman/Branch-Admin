
import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  Filter,
  Users,
  Bell,
  X,
  Clock,
  Globe,
  Settings2,
  Trash2,
  Edit3,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  descriptionEn: string;
  descriptionAm: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  category: 'Exam' | 'Holiday' | 'Meeting' | 'School Event';
  audience: 'Entire School' | 'Grade 9 Only' | 'Grade 10 Only' | 'Teachers' | 'All Parents' | 'Staff Only';
  createAnnouncement: boolean;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'First Semester Exams',
    descriptionEn: 'Mid-term examinations for all grades.',
    descriptionAm: 'የመጀመሪያ ሴሚስተር ፈተናዎች ለሁሉም ክፍሎች።',
    startDate: '2025-05-15',
    endDate: '2025-05-20',
    category: 'Exam',
    audience: 'Entire School',
    createAnnouncement: true,
  },
  {
    id: '2',
    title: 'Staff Development Day',
    descriptionEn: 'Internal training for teachers and administrative staff.',
    descriptionAm: 'ለአስተማሪዎች እና ለአስተዳደር ሰራተኞች ውስጣዊ ስልጠና።',
    startDate: '2025-05-22',
    endDate: '2025-05-22',
    category: 'Meeting',
    audience: 'Teachers',
    createAnnouncement: false,
  },
  {
    id: '3',
    title: 'Victory of Adwa',
    descriptionEn: 'National public holiday.',
    descriptionAm: 'የአድዋ ድል በዓል ብሔራዊ በዓል።',
    startDate: '2025-03-02',
    endDate: '2025-03-02',
    category: 'Holiday',
    audience: 'Entire School',
    createAnnouncement: true,
  },
];

const categoryColors = {
  'Exam': 'bg-red-500',
  'Holiday': 'bg-emerald-500',
  'Meeting': 'bg-blue-500',
  'School Event': 'bg-amber-500',
};

const categoryBadge = {
  'Exam': 'bg-red-50 text-red-600 border-red-100',
  'Holiday': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Meeting': 'bg-blue-50 text-blue-600 border-blue-100',
  'School Event': 'bg-amber-50 text-amber-600 border-amber-100',
};

export const AcademicCalendar: React.FC<{ academicYear: string }> = ({ academicYear }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025
  const [view, setView] = useState<'monthly' | 'agenda'>('monthly');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllDay, setIsAllDay] = useState(true);
  const [isRange, setIsRange] = useState(false);
  const [syncAnnouncement, setSyncAnnouncement] = useState(true);
  const [syncType, setSyncType] = useState<'immediately' | 'scheduled'>('immediately');
  
  // Custom Picker States
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null); // 'start' | 'end' | null
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null); // 'start' | 'end' | null
  const [tempDates, setTempDates] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '09:00'
  });

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Container */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Academic Calendar
              <span className="text-xs font-bold px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                {academicYear}
              </span>
            </h1>
          </div>

          <div className="h-8 w-px bg-slate-100 hidden md:block" />

          {/* View Toggles */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setView('monthly')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Monthly View</span>
            </button>
            <button 
              onClick={() => setView('agenda')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'agenda' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agenda View</span>
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 scrollbar-hide">
        {view === 'monthly' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {format(currentDate, 'MMMM')} <span className="text-primary/40">{format(currentDate, 'yyyy')}</span>
                </h2>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {Object.entries(categoryColors).map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-slate-100 bg-slate-50/50">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={`${day}-${i}`} className="bg-slate-50 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                const dayEvents = mockEvents.filter(e => isSameDay(new Date(e.startDate), day));
                const isCurrentMonthDay = isSameMonth(day, monthStart);
                const isTodayDay = isToday(day);

                return (
                  <div 
                    key={i} 
                    className={`min-h-[120px] bg-white p-3 transition-colors hover:bg-slate-50/50 group relative cursor-pointer ${
                      !isCurrentMonthDay ? 'opacity-30 pointer-events-none grayscale' : ''
                    }`}
                  >
                    <span className={`text-sm font-black transition-all ${
                      isTodayDay ? 'text-primary' : 'text-slate-400 group-hover:text-slate-900'
                    }`}>
                      {format(day, 'd')}
                    </span>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {dayEvents.map(event => (
                        <motion.button
                          key={event.id}
                          layoutId={`event-${event.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-black leading-tight border transition-all ${categoryBadge[event.category]} shadow-sm hover:scale-[1.02] active:scale-95`}
                        >
                          <p className="truncate">{event.title}</p>
                          <div className="flex items-center gap-1 mt-0.5 opacity-60">
                            <Users className="w-2.5 h-2.5" />
                            <span className="truncate">{event.audience}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {dayEvents.length === 0 && isCurrentMonthDay && (
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all bg-primary/5"
                      >
                        <Plus className="w-6 h-6 text-primary/30" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-6xl mx-auto flex gap-8">
            {/* Main Agenda Feed */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Full Agenda</h2>
              </div>
              {mockEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(event => (
                <motion.div
                  key={event.id}
                  layoutId={`event-list-${event.id}`}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex items-start gap-4 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shrink-0 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(event.startDate), 'MMM')}</span>
                    <span className="text-2xl font-black text-slate-900 leading-none">{format(new Date(event.startDate), 'd')}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>All Day</span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${categoryBadge[event.category]} uppercase tracking-wider`}>
                            {event.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {event.descriptionEn}
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600">
                        <Users className="w-3 h-3" />
                        <span>{event.audience}</span>
                      </div>
                      {event.createAnnouncement && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-lg text-[10px] font-bold text-primary">
                          <Bell className="w-3 h-3" />
                          <span>Announcement Synced</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Upcoming Events Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 space-y-6 hidden lg:block"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming</h2>
                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-600 rounded-full animate-pulse" />
                  Live Feed
                </div>
              </div>

              <div className="space-y-3">
                {mockEvents
                  .filter(e => new Date(e.startDate) >= new Date())
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .slice(0, 4)
                  .map(event => (
                    <div 
                      key={`upcoming-${event.id}`}
                      className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-1.5 h-8 rounded-full ${categoryColors[event.category]}`} />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {format(new Date(event.startDate), 'MMM d, yyyy')}
                          </p>
                          <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">To: {event.audience}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-1">Calendar Sync</h4>
                  <p className="text-[10px] text-primary/60 font-bold leading-relaxed mb-3">Your personal calendar is up to date with events this week.</p>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest underline decoration-2 underline-offset-4">Refresh Now</button>
                </div>
                <CalendarIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/5 group-hover:rotate-12 transition-transform duration-500" />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Side-Sheet Detail View */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${categoryBadge[selectedEvent.category]}`}>
                  {selectedEvent.category}
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8 space-y-8">
                <header className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</p>
                        <p className="text-sm font-bold text-slate-900">{format(new Date(selectedEvent.startDate), 'PPPP')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Audience</p>
                        <p className="text-sm font-bold text-slate-900">{selectedEvent.audience}</p>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Globe className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">English Description</span>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed italic">
                      \"{selectedEvent.descriptionEn}\"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Globe className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">አማርኛ መግለጫ (Amharic)</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 leading-relaxed">
                      {selectedEvent.descriptionAm}
                    </p>
                  </div>
                </div>

                {selectedEvent.createAnnouncement && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-primary/20 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-primary leading-none mb-1">Announcement Active</h4>
                      <p className="text-xs text-primary/60 font-bold">This event is automatically synced to the announcements board.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                <button className="flex-1 py-3 bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Event
                </button>
                <button className="flex-1 py-3 bg-white border border-red-100 text-[10px] font-black text-red-400 uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button className="col-span-2 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Reminder to {selectedEvent.audience}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-[80vh] md:h-auto max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Create New Event</h3>
                      <p className="text-xs text-slate-500 font-bold">Add an event to the academic calendar</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-8 scrollbar-hide">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Basics */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Parent-Teacher Conference"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                        />
                      </div>

                        <div className="space-y-4">
                          {/* Row 1: Toggles */}
                          <div className="flex items-center justify-between pb-2">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                              <button 
                                onClick={() => setIsRange(false)}
                                className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${!isRange ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                              >
                                Single Day
                              </button>
                              <button 
                                onClick={() => setIsRange(true)}
                                className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${isRange ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                              >
                                Date Range
                              </button>
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">All Day</span>
                              <div className="relative inline-flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={isAllDay} 
                                  onChange={(e) => setIsAllDay(e.target.checked)}
                                  className="sr-only peer" 
                                />
                                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                              </div>
                            </label>
                          </div>

                          {/* Row 2: Selection Areas */}
                          <div className="space-y-4">
                            {/* Start/Single Selection */}
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                {isRange ? 'Starts On' : 'Event On'}
                              </label>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setShowDatePicker('start')}
                                  className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-white hover:border-primary/30 transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-bold text-slate-900">{format(new Date(tempDates.start), 'MMM d, yyyy')}</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                </button>
                                
                                {!isAllDay && (
                                  <button 
                                    onClick={() => setShowTimePicker('start')}
                                    className="w-32 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-white hover:border-primary/30 transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Clock className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                      <span className="text-sm font-bold text-slate-900">{tempDates.startTime}</span>
                                    </div>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* End Selection (If Range) */}
                            {isRange && (
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ends On</label>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setShowDatePicker('end')}
                                    className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-white hover:border-primary/30 transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                      <span className="text-sm font-bold text-slate-900">{format(new Date(tempDates.end), 'MMM d, yyyy')}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                  </button>
                                  
                                  {!isAllDay && (
                                    <button 
                                      onClick={() => setShowTimePicker('end')}
                                      className="w-32 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-white hover:border-primary/30 transition-all group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span className="text-sm font-bold text-slate-900">{tempDates.endTime}</span>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* End Time Only (Single Day + Not All Day) */}
                            {!isRange && !isAllDay && (
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ends At</label>
                                <button 
                                  onClick={() => setShowTimePicker('end')}
                                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-white hover:border-primary/30 transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-bold text-slate-900">{tempDates.endTime}</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                            <option>Exam</option>
                            <option>Holiday</option>
                            <option>Meeting</option>
                            <option>School Event</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audience</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                            <option>Entire School</option>
                            <option>Grade 9 Only</option>
                            <option>Teachers</option>
                            <option>Staff Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between bg-primary/[0.02] p-4 rounded-2xl border border-primary/5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sync Announcement</span>
                            <span className="text-[10px] text-primary/60 font-bold">Auto-post to board</span>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={syncAnnouncement}
                              onChange={(e) => setSyncAnnouncement(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {syncAnnouncement && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button 
                                  onClick={() => setSyncType('immediately')}
                                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${syncType === 'immediately' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  Immediately
                                </button>
                                <button 
                                  onClick={() => setSyncType('scheduled')}
                                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${syncType === 'scheduled' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                  Scheduled
                                </button>
                              </div>

                              {syncType === 'scheduled' && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Post Scheduling</p>
                                    <p className="text-[10px] text-amber-600/70 font-bold opacity-80 leading-relaxed mt-0.5">
                                      Announcement will be published on the event's start date ({format(new Date(tempDates.start), 'MMM d, yyyy')}).
                                    </p>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Right Column: Descriptions */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">English Details</label>
                        </div>
                        <textarea 
                          rows={4}
                          placeholder="Describe the event in English..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-primary/40" />
                          <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest">የአማርኛ መግለጫ (Amharic)</label>
                        </div>
                        <textarea 
                          rows={4}
                          placeholder="የዝግጅቱን ዝርዝር በአማርኛ ይግለጹ..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all">
                    Create Event
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Popover Date Pickers */}
      <AnimatePresence>
        {showDatePicker && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDatePicker(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative w-full max-sm bg-white rounded-3xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Select {showDatePicker === 'start' ? 'Start' : 'End'} Date</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Academic Calendar</p>
                </div>
                <button onClick={() => setShowDatePicker(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Simple Calendar Placeholder Logic */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-[10px] font-black text-slate-300 text-center py-2">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      const day = (i + 1).toString().padStart(2, '0');
                      const newDate = `2025-05-${day}`;
                      setTempDates(prev => ({ ...prev, [showDatePicker as 'start' | 'end']: newDate }));
                      setShowDatePicker(null);
                    }}
                    className={`h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        tempDates[showDatePicker as 'start' | 'end'] === `2025-05-${(i + 1).toString().padStart(2, '0')}`
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Popover Time Pickers */}
      <AnimatePresence>
        {showTimePicker && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTimePicker(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative w-full max-w-[280px] bg-white rounded-3xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Select Time</h4>
                </div>
                <button onClick={() => setShowTimePicker(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px] no-scrollbar pr-1">
                {Array.from({ length: 24 }).map((_, h) => (
                  <button 
                    key={h}
                    onClick={() => {
                      const hour = h.toString().padStart(2, '0');
                      const newTime = `${hour}:00`;
                      setTempDates(prev => ({ 
                        ...prev, 
                        [showTimePicker === 'start' ? 'startTime' : 'endTime']: newTime 
                      }));
                      setShowTimePicker(null);
                    }}
                    className={`py-2.5 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      tempDates[showTimePicker === 'start' ? 'startTime' : 'endTime'] === `${h.toString().padStart(2, '0')}:00`
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {h.toString().padStart(2, '0')}:00
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
