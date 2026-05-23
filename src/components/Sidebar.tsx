
import React from 'react';
import { 
  LayoutDashboard,
  Users, 
  BookOpen, 
  ClipboardCheck, 
  CalendarDays,
  Megaphone,
  GraduationCap,
  FileUp,
  UserRound,
  Edit3,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleId } from '../types';
import { ApiUser } from '../lib/api';

interface SidebarProps {
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  academicYear: string;
  isOpen?: boolean;
  onClose?: () => void;
  user: ApiUser;
  onLogout: () => void;
}

const modules = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'parents' as const, label: 'Parents', icon: Users },
  { id: 'students' as const, label: 'Students', icon: UserRound },
  { id: 'teachers' as const, label: 'Teachers', icon: GraduationCap },
  { id: 'academia' as const, label: 'Academia', icon: BookOpen },
  { id: 'attendance' as const, label: 'Attendance', icon: ClipboardCheck },
  { id: 'announcements' as const, label: 'Announcements', icon: Megaphone },
  { id: 'calendar' as const, label: 'Academic Calendar', icon: CalendarDays },
  { id: 'batchImport' as const, label: 'Batch Import', icon: FileUp },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule,
  academicYear,
  isOpen,
  onClose,
  user,
  onLogout
}) => {
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profile, setProfile] = React.useState({ 
    name: user.name || 'Admin User', 
    role: 'Branch Administrator',
    email: user.email || 'admin@edugov.academy',
    phone: user.phone_number || '+251 911 223 344',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&h=100&auto=format&fit=crop'
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`w-64 h-screen bg-slate-50 border-r border-border-soft flex flex-col fixed left-0 top-0 z-[60] text-slate-800 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Section */}
        <div 
          className="p-6 border-b border-border-soft flex flex-col items-center transition-all cursor-pointer group/profile hover:bg-slate-100/50"
          onClick={() => setIsEditingProfile(true)}
        >
        <div className="flex flex-col items-center gap-3 mb-4 w-full text-center">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 overflow-hidden shrink-0 relative shadow-sm group-hover/profile:border-primary/40 transition-all">
            <img 
              src={profile.avatar} 
              alt="Admin Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/profile:opacity-100 transition-opacity flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-center relative">
            <h3 className="text-base font-bold text-slate-900 leading-tight group-hover/profile:text-primary transition-colors">{profile.name}</h3>
            <p className="text-xs text-slate-500 font-medium group-hover/profile:text-slate-400 transition-colors">{profile.role}</p>
          </div>
        </div>
        
        <div className="w-full px-2">
          <div className="w-full rounded-lg border border-border-soft bg-white px-4 py-2 text-center text-[11px] font-bold text-primary shadow-sm">
            {academicYear}
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 px-4 py-8">
        <div className="space-y-4">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => {
                  setActiveModule(module.id);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-4 px-5 py-3 transition-all group ${
                  isActive 
                    ? 'sidebar-link-active' 
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                <span className="text-sm font-bold">{module.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Logout Action */}
      <div className="p-4 border-t border-border-soft shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm group cursor-pointer active:scale-95"
        >
          <LogOut className="w-5 h-5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>

    {/* Profile Edit Modal - Moved outside sidebar div for better stacking context */}
    <AnimatePresence>
      {isEditingProfile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditingProfile(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] scrollbar-hide pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-6 md:mb-8 shrink-0">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Admin Profile</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
              <div 
                className="w-20 md:w-24 h-20 md:h-24 rounded-[1.5rem] md:rounded-[2rem] border-4 border-slate-50 overflow-hidden shadow-lg relative group shrink-0"
                onClick={handleAvatarClick}
              >
                <img 
                  src={profile.avatar} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <FileUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <div className="w-full space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                  <input 
                    autoFocus
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    value={profile.name}
                    onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Professional Role</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    value={profile.role}
                    onChange={e => setProfile(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Branch Principal"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                      value={profile.email}
                      onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@school.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input 
                      type="tel"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                      value={profile.phone}
                      onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+251 ..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-3.5 text-[10px] font-black text-white uppercase tracking-widest bg-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);
}
