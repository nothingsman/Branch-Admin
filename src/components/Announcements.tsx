
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  Send as SendIcon, 
  Clock, 
  FileText, 
  Eye, 
  AlertCircle, 
  Languages, 
  Bold, 
  List, 
  Link as LinkIcon, 
  Paperclip,
  CheckCircle,
  X,
  ChevronDown,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  parseISO
} from 'date-fns';
import { mockGrades, mockSections } from '../constants/mockData';

interface Announcement {
  id: string;
  subject: string;
  preview: string;
  amharicSubject?: string;
  amharicPreview?: string;
  audience: string;
  status: 'Sent' | 'Scheduled' | 'Draft';
  readPercentage: number;
  date: string;
  isUrgent?: boolean;
}

const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    subject: 'End of Term Schedule',
    preview: 'Please be advised that the term will conclude on...',
    audience: 'All Parents',
    status: 'Sent',
    readPercentage: 85,
    date: 'Oct 24, 2024'
  },
  {
    id: '2',
    subject: 'Staff Meeting Update',
    preview: 'The mandatory staff meeting for Grade 10 teachers has been moved...',
    audience: 'Grade 10 Teachers',
    status: 'Scheduled',
    readPercentage: 0,
    date: 'Oct 26, 2024'
  },
  {
    id: '3',
    subject: 'Urgent: Water Main Break',
    preview: 'We are experiencing a minor issue with the school infrastructure...',
    audience: 'All Staff',
    status: 'Sent',
    readPercentage: 98,
    date: 'Oct 23, 2024',
    isUrgent: true
  },
  {
    id: '4',
    subject: 'Parent-Teacher Conference',
    preview: 'Booking slots for the upcoming conferences will open...',
    audience: 'All Parents',
    status: 'Draft',
    readPercentage: 0,
    date: 'Saved Oct 22'
  }
];

interface RecipientOption {
  id: string;
  label: string;
  subtitle: string;
  type: string;
  icon: any;
}

export const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Sent' | 'Scheduled' | 'Draft' | 'Urgent'>('All');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  const [newSubject, setNewSubject] = useState('');
  const [newPreview, setNewPreview] = useState('');
  const [newAmharicSubject, setNewAmharicSubject] = useState('');
  const [newAmharicPreview, setNewAmharicPreview] = useState('');
  const [subAudience, setSubAudience] = useState<'Parents' | 'Teachers' | 'Both'>('Both');

  const recipientOptions: RecipientOption[] = useMemo(() => [
    { id: 'all', label: 'Whole School', subtitle: 'All Parents, Teachers & Staff', type: 'general', icon: Building2 },
    { id: 'parents-all', label: 'All Parents', subtitle: 'Every registered parent', type: 'general', icon: Users },
    { id: 'teachers-all', label: 'All Teachers', subtitle: 'Academic staff only', type: 'general', icon: GraduationCap },
    ...mockGrades.map(g => ({ id: `grade-${g.id}`, label: `All ${g.name}`, subtitle: 'Parents & Teachers', type: 'grade', icon: GraduationCap })),
    ...mockSections.map(s => {
      const grade = mockGrades.find(g => g.id === s.gradeId);
      return { id: `section-${s.id}`, label: `${grade?.name} - Section ${s.name}`, subtitle: 'Parents only', type: 'section', icon: Users };
    })
  ], []);

  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption>(recipientOptions[0]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'immediately' | 'scheduled'>('immediately');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isAnnouncementCalendarOpen, setIsAnnouncementCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [isRecalling, setIsRecalling] = useState(false);
  const [isConfirmingSend, setIsConfirmingSend] = useState(false);

  const filteredRecipientOptions = recipientOptions.filter(opt => 
    opt.label.toLowerCase().includes(recipientSearch.toLowerCase()) || 
    opt.subtitle.toLowerCase().includes(recipientSearch.toLowerCase()) ||
    opt.type.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.audience.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Urgent') return matchesSearch && a.isUrgent;
    return matchesSearch && a.status === activeFilter;
  });

  const selectedAnnouncement = announcements.find(a => a.id === selectedAnnouncementId);

  const resetForm = () => {
    setNewSubject('');
    setNewPreview('');
    setNewAmharicSubject('');
    setNewAmharicPreview('');
    setSelectedRecipient(recipientOptions[0]);
    setSubAudience('Both');
    setIsUrgent(false);
    setEditingId(null);
    setDeliveryMethod('immediately');
    setScheduledDate('');
    setIsAnnouncementCalendarOpen(false);
    setIsConfirmingSend(false);
  };

  const handleSaveAsDraft = () => {
    const audienceLabel = (selectedRecipient.type === 'grade' || selectedRecipient.type === 'section') 
      ? `${selectedRecipient.label} (${subAudience})`
      : selectedRecipient.label;

    const draft: Announcement = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      subject: newSubject || 'Untitled Draft',
      preview: newPreview,
      amharicSubject: newAmharicSubject,
      amharicPreview: newAmharicPreview,
      audience: audienceLabel,
      status: 'Draft',
      readPercentage: 0,
      date: `Saved ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    };

    if (editingId) {
      setAnnouncements(prev => prev.map(a => a.id === editingId ? draft : a));
    } else {
      setAnnouncements(prev => [draft, ...prev]);
    }

    setIsComposeOpen(false);
    resetForm();
  };

  const handleSend = () => {
    if (!newSubject) {
      alert('Please enter a subject');
      return;
    }

    const status = deliveryMethod === 'scheduled' ? 'Scheduled' : 'Sent';
    let dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (deliveryMethod === 'scheduled' && scheduledDate) {
      const d = new Date(scheduledDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }

    const audienceLabel = (selectedRecipient.type === 'grade' || selectedRecipient.type === 'section') 
      ? `${selectedRecipient.label} (${subAudience})`
      : selectedRecipient.label;

    const newAnnouncement: Announcement = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      subject: newSubject,
      preview: newPreview,
      amharicSubject: newAmharicSubject,
      amharicPreview: newAmharicPreview,
      audience: audienceLabel,
      status: status,
      readPercentage: 0,
      date: dateStr,
      isUrgent: isUrgent
    };

    if (editingId) {
      setAnnouncements(prev => prev.map(a => a.id === editingId ? newAnnouncement : a));
    } else {
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    }

    setIsComposeOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedAnnouncement) return;
    setEditingId(selectedAnnouncement.id);
    setNewSubject(selectedAnnouncement.subject);
    setNewPreview(selectedAnnouncement.preview);
    setNewAmharicSubject(selectedAnnouncement.amharicSubject || '');
    setNewAmharicPreview(selectedAnnouncement.amharicPreview || '');
    setIsUrgent(selectedAnnouncement.isUrgent || false);
    
    // Parse audience to extract recipient and sub-audience
    let audienceStr = selectedAnnouncement.audience;
    let foundSubAudience: 'Parents' | 'Teachers' | 'Both' = 'Both';
    
    if (audienceStr.endsWith('(Parents)')) {
      foundSubAudience = 'Parents';
      audienceStr = audienceStr.replace(' (Parents)', '');
    } else if (audienceStr.endsWith('(Teachers)')) {
      foundSubAudience = 'Teachers';
      audienceStr = audienceStr.replace(' (Teachers)', '');
    } else if (audienceStr.endsWith('(Both)')) {
      foundSubAudience = 'Both';
      audienceStr = audienceStr.replace(' (Both)', '');
    }

    const recipient = recipientOptions.find(opt => opt.label === audienceStr) || recipientOptions[0];
    setSelectedRecipient(recipient);
    setSubAudience(foundSubAudience);
    
    setSelectedAnnouncementId(null);
    setIsComposeOpen(true);
  };

  const handleRecall = () => {
    if (!selectedAnnouncementId) return;
    setAnnouncements(prev => prev.filter(a => a.id !== selectedAnnouncementId));
    setSelectedAnnouncementId(null);
    setIsRecalling(false);
  };

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setNewAmharicSubject(`ርዕስ፡ ${newSubject}`);
      setNewAmharicPreview(`ይህ መልእክት ስለ ${newSubject} ነው። ${newPreview}`);
      setIsTranslating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
            <p className="text-sm text-slate-500">Manage communication with parents and staff</p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setIsComposeOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Announcement</span>
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by subject, audience, or content..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Sent', 'Scheduled', 'Draft', 'Urgent'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === filter 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <motion.div 
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedAnnouncementId(announcement.id)}
                className={`p-5 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer ${announcement.isUrgent ? 'bg-alert-soft/30 border-alert-soft' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        announcement.isUrgent ? 'bg-alert-soft text-alert-text' : 'bg-primary/5 text-primary'
                      }`}>
                        {announcement.audience}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${
                        announcement.status === 'Sent' ? 'text-emerald-500' : 
                        announcement.status === 'Scheduled' ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {announcement.status === 'Sent' && <CheckCircle className="w-3 h-3" />}
                        {announcement.status === 'Scheduled' && <Clock className="w-3 h-3" />}
                        {announcement.status === 'Draft' && <FileText className="w-3 h-3" />}
                        {announcement.status}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className={`text-base font-bold ${announcement.isUrgent ? 'text-alert-text' : 'text-slate-900'}`}>
                        {announcement.subject}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{announcement.preview}</p>
                    </div>

                    <div className="flex items-center gap-6 pt-1">
                      <div className="flex items-center gap-2 group/stat">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${announcement.readPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{announcement.readPercentage}% opened</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 ml-auto">{announcement.date}</span>
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors shrink-0">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">No announcements found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsComposeOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] bg-white md:rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Compose Announcement</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60 hidden md:block">Target your audience</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar">
                {/* Custom Target Audience Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recipients</label>
                  <div className="relative">
                    <button 
                      onClick={() => setIsRecipientSelectorOpen(!isRecipientSelectorOpen)}
                      className="w-full flex items-center justify-between pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all text-left outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {React.createElement(selectedRecipient.icon || Users, { className: "w-4 h-4" })}
                        </div>
                        <div>
                          <p className="text-slate-900 leading-none">{selectedRecipient.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{selectedRecipient.subtitle}</p>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isRecipientSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isRecipientSelectorOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[320px]"
                        >
                          <div className="p-3 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div className="relative group">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                              <input 
                                type="text" 
                                placeholder="Filter recipients..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all outline-none"
                                value={recipientSearch}
                                onChange={(e) => setRecipientSearch(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                            {['general', 'grade', 'section'].map(type => {
                              const options = filteredRecipientOptions.filter(opt => opt.type === type);
                              if (options.length === 0) return null;

                              return (
                                <div key={type} className="mb-2">
                                  <div className="px-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">{type}s</div>
                                  {options.map(opt => (
                                    <button 
                                      key={opt.id}
                                      onClick={() => {
                                        setSelectedRecipient(opt);
                                        setIsRecipientSelectorOpen(false);
                                      }}
                                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group ${selectedRecipient.id === opt.id ? 'bg-primary/5' : ''}`}
                                    >
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${selectedRecipient.id === opt.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                        <opt.icon className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold leading-tight ${selectedRecipient.id === opt.id ? 'text-primary' : 'text-slate-700'}`}>{opt.label}</p>
                                        <p className="text-[9px] text-slate-400 truncate">{opt.subtitle}</p>
                                      </div>
                                      {selectedRecipient.id === opt.id && (
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Sub-Audience Selector for Grade/Section */}
                <AnimatePresence>
                  {(selectedRecipient.type === 'grade' || selectedRecipient.type === 'section') && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2"
                    >
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Send To</label>
                      <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                        {(['Parents', 'Teachers', 'Both'] as const).map(option => (
                          <button
                            key={option}
                            onClick={() => setSubAudience(option)}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              subAudience === option 
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Multilingual Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">English Content</label>
                      <button 
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                      >
                        <Languages className={`w-3 h-3 ${isTranslating ? 'animate-spin' : ''}`} />
                        <span>{isTranslating ? 'Translating...' : 'Auto-translate'}</span>
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Subject line (English)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                    />
                    <div className="relative">
                      <div className="absolute top-3 left-4 flex gap-3 text-slate-300 border-b border-transparent">
                        <Bold className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <List className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <LinkIcon className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                      </div>
                      <textarea 
                        rows={4}
                        placeholder="Write your message here..."
                        className="w-full px-4 pt-10 pb-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
                        value={newPreview}
                        onChange={(e) => setNewPreview(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amharic Version</label>
                    <input 
                      type="text" 
                      placeholder="ርዕሰ ጉዳይ (አማርኛ)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none font-amharic"
                      value={newAmharicSubject}
                      onChange={(e) => setNewAmharicSubject(e.target.value)}
                    />
                    <textarea 
                      rows={3}
                      placeholder="መልእክትዎን እዚህ ይጻፉ..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 outline-none font-amharic min-h-[100px]"
                      value={newAmharicPreview}
                      onChange={(e) => setNewAmharicPreview(e.target.value)}
                    />
                  </div>
                </div>

                {/* Media Attachment */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Attachments</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                    <Paperclip className="w-6 h-6 text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">Drop files or click to upload</p>
                    <p className="text-[10px] text-slate-400">PDF, PNG, JPG or MP4 (Max 20MB)</p>
                  </div>
                </div>

                {/* Urgent Toggle */}
                <div 
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isUrgent ? 'bg-alert-soft border-alert-soft ring-4 ring-alert-soft/50' : 'bg-slate-50 border-slate-200'
                  }`}
                  onClick={() => setIsUrgent(!isUrgent)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isUrgent ? 'bg-alert-text text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isUrgent ? 'text-alert-text' : 'text-slate-700'}`}>Mark as Urgent</p>
                      <p className="text-[10px] text-slate-500">Sends SMS & push notifications immediately</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isUrgent ? 'bg-alert-text' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isUrgent ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Delivery</label>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setDeliveryMethod('immediately')}
                        className={`flex-1 p-4 rounded-2xl border transition-all text-center font-bold text-xs ${
                          deliveryMethod === 'immediately' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        Immediately
                      </button>
                      <button 
                        onClick={() => setDeliveryMethod('scheduled')}
                        className={`flex-1 p-4 rounded-2xl border transition-all text-center font-bold text-xs flex items-center justify-center gap-2 ${
                          deliveryMethod === 'scheduled' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Schedule
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {deliveryMethod === 'scheduled' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="space-y-3 relative">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Schedule Date & Time</label>
                          <button 
                            type="button"
                            onClick={() => setIsAnnouncementCalendarOpen(!isAnnouncementCalendarOpen)}
                            className={`w-full flex items-center justify-between px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold transition-all hover:border-primary/40 group ${isAnnouncementCalendarOpen ? 'ring-4 ring-primary/5 border-primary shadow-sm' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <CalendarIcon className={`w-4 h-4 transition-colors ${isAnnouncementCalendarOpen ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                              <span className={scheduledDate ? 'text-slate-900' : 'text-slate-400'}>
                                {scheduledDate ? format(parseISO(scheduledDate), 'MMM dd, yyyy HH:mm') : 'Select Date & Time'}
                              </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isAnnouncementCalendarOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isAnnouncementCalendarOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-[1.25rem] shadow-[0_20px_40px_-10px_rgba(26,35,126,0.2)] z-[110] p-3 select-none max-w-[190px] mx-auto md:max-w-none"
                              >
                                {/* Micro Picker Header */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1">
                                    <div className="w-5 h-5 rounded bg-primary/5 flex items-center justify-center">
                                      <CalendarIcon className="w-2.5 h-2.5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[8.5px] font-black text-slate-900 leading-none">
                                        {format(calendarViewDate, 'MMM yyyy')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <button 
                                      type="button"
                                      onClick={() => setCalendarViewDate(subMonths(calendarViewDate, 1))}
                                      className="p-1 hover:bg-slate-50 rounded-md text-slate-400 hover:text-primary transition-all active:scale-90"
                                    >
                                      <ChevronLeft className="w-2.5 h-2.5" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setCalendarViewDate(addMonths(calendarViewDate, 1))}
                                      className="p-1 hover:bg-slate-50 rounded-md text-slate-400 hover:text-primary transition-all active:scale-90"
                                    >
                                      <ChevronRight className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Micro Date Grid */}
                                <div className="mb-2">
                                  <div className="grid grid-cols-7 mb-0.5">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                      <div key={`${day}-${i}`} className="text-[6.5px] font-black text-slate-300 text-center py-0.5">
                                        {day}
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-7 gap-0.5">
                                    {(() => {
                                      const start = startOfWeek(startOfMonth(calendarViewDate));
                                      const end = endOfWeek(endOfMonth(calendarViewDate));
                                      const days = eachDayOfInterval({ start, end });
                                      
                                      return days.map((day, i) => {
                                        const isSelected = scheduledDate ? isSameDay(day, parseISO(scheduledDate)) : false;
                                        const isCurrentMonth = isSameMonth(day, calendarViewDate);
                                        const isTodayDate = isToday(day);
                                        
                                        return (
                                          <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                              const timePortion = scheduledDate ? scheduledDate.split('T')[1] || '12:00' : '12:00';
                                              const newDate = format(day, "yyyy-MM-dd") + 'T' + timePortion;
                                              setScheduledDate(newDate);
                                            }}
                                            className={`aspect-square rounded-md flex items-center justify-center text-[7.5px] font-black transition-all relative group/day ${
                                              isSelected 
                                                ? 'bg-primary text-white shadow-sm shadow-primary/20 z-10' 
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
                                      });
                                    })()}
                                  </div>
                                </div>

                                {/* Micro Time Selection */}
                                <div className="pt-2 border-t border-slate-50">
                                  <div className="flex items-center justify-between gap-1.5 mb-1.5 px-0.5">
                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Time</span>
                                    <input 
                                      type="time" 
                                      className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-[8.5px] font-black text-slate-900 outline-none w-[66px]"
                                      value={scheduledDate ? scheduledDate.split('T')[1] || '' : ''}
                                      onChange={(e) => {
                                        const datePortion = scheduledDate ? scheduledDate.split('T')[0] : format(new Date(), "yyyy-MM-dd");
                                        setScheduledDate(`${datePortion}T${e.target.value}`);
                                      }}
                                    />
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setIsAnnouncementCalendarOpen(false)}
                                    className="w-full py-1.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all active:scale-95"
                                  >
                                    Set Schedule
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <button 
                  onClick={handleSaveAsDraft}
                  className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Save as Draft
                </button>
                <div className="relative flex-1">
                  <button 
                    onClick={() => {
                      if (isConfirmingSend) {
                        handleSend();
                      } else {
                        setIsConfirmingSend(true);
                        setTimeout(() => setIsConfirmingSend(false), 3000);
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 group ${
                      isConfirmingSend ? 'bg-emerald-600 shadow-emerald-200' : 'bg-primary shadow-primary/20 hover:bg-primary/90'
                    }`}
                  >
                    <SendIcon className={`w-4 h-4 transition-transform ${isConfirmingSend ? 'scale-110' : 'group-hover:translate-x-1'}`} />
                    <span>{isConfirmingSend ? "Confirm Send" : "Send Announcement"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Announcement Details Side Panel */}
      <AnimatePresence>
        {selectedAnnouncementId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]"
              onClick={() => setSelectedAnnouncementId(null)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:max-w-lg bg-white shadow-2xl z-[120] flex flex-col overflow-hidden"
            >
              {selectedAnnouncement && (
                <>
                  <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedAnnouncement.isUrgent ? 'bg-alert-soft text-alert-text' : 'bg-primary/5 text-primary'
                      }`}>
                        <Eye className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base md:text-lg font-black text-slate-900 truncate">Announcement Details</h2>
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">Sent on {selectedAnnouncement.date}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedAnnouncementId(null)}
                      className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 no-scrollbar pb-28 md:pb-8">
                    {/* Status & Audience */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                      <div className="flex-1 p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5 px-0.5 whitespace-nowrap">Audience</p>
                        <p className="text-[11px] md:text-xs font-black text-primary uppercase tracking-tight truncate">{selectedAnnouncement.audience}</p>
                      </div>
                      <div className="flex-1 p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5 px-0.5 whitespace-nowrap">Status</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <p className="text-[11px] md:text-xs font-black text-slate-700 uppercase tracking-tight">{selectedAnnouncement.status}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                          {selectedAnnouncement.subject}
                        </h3>
                        <div className="text-sm font-medium leading-relaxed text-slate-600">
                          <p>{selectedAnnouncement.preview}</p>
                          <p className="mt-4">
                            Detailed communication content for {selectedAnnouncement.audience}. Updates include scheduling, departmental requirements, and general registry notices.
                          </p>
                        </div>
                      </div>

                      <div className="p-6 bg-primary/[0.03] border border-primary/10 rounded-3xl">
                        <div className="flex items-center gap-2 mb-4">
                          <Languages className="w-4 h-4 text-primary/40" />
                          <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Amharic Translation</span>
                        </div>
                        <p className="text-slate-800 font-amharic leading-relaxed">
                          {selectedAnnouncement.amharicPreview || "ይህ የመልእክቱ አማርኛ ትርጉም ዝርዝር እዚህ ጋር ይሰፍራል። ወላጆች እና ተማሪዎች በቀላሉ እንዲረዱት በቋንቋቸው የቀረበ መረጃ ነው።"}
                        </p>
                      </div>
                    </div>

                    {/* Engagement Analytics */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Overview</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-3xl font-black text-primary leading-none tracking-tighter">{selectedAnnouncement.readPercentage}%</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Open Rate</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">428</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Total Views</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-2 px-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">Scheduled Delivery</span>
                          <span className="font-black text-slate-700 font-mono tracking-tight">{selectedAnnouncement.date}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">Registry Staff</span>
                          <span className="font-black text-slate-700">Admin Portal</span>
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Attached Resources</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all cursor-pointer group shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors border border-slate-100/50">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-700">School_Calendar_2024.pdf</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">2.4 MB • PDF Document</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button 
                      onClick={handleEdit}
                      className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                      Edit
                    </button>
                    {!isRecalling ? (
                      <button 
                        onClick={() => setIsRecalling(true)}
                        className="flex-1 py-3.5 bg-alert-soft text-alert-text border border-alert-soft rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-alert-soft/80 transition-all shadow-sm active:scale-95"
                      >
                        Recall
                      </button>
                    ) : (
                      <div className="flex-1 flex gap-2">
                        <button 
                          onClick={handleRecall}
                          className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-tight shadow-lg shadow-red-200 active:scale-95"
                        >
                          Confirm Recall
                        </button>
                        <button 
                          onClick={() => setIsRecalling(false)}
                          className="px-4 py-3 bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-300 transition-all active:scale-95"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
