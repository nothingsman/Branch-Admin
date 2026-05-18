
import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronRight, 
  X, 
  Shield, 
  BellRing, 
  Globe, 
  Palette, 
  Building,
  UserCog,
  History,
  Lock,
  Save,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleId } from '../types';

interface HeaderProps {
  activeModule: ModuleId;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModule, onMenuClick }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'ui' | 'security'>('general');

  const moduleLabels: Record<ModuleId, string> = {
    dashboard: 'Dashboard',
    parents: 'Parents',
    students: 'Students',
    teachers: 'Teachers',
    academia: 'Academia',
    attendance: 'Attendance',
    calendar: 'Academic Calendar',
    announcements: 'Announcements',
    batchImport: 'Batch Import',
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-border-soft flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-400">Branch Admin</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="font-semibold text-primary">{moduleLabels[activeModule]}</span>
          </div>

          <div className="sm:hidden font-semibold text-primary text-sm truncate max-w-[120px]">
            {moduleLabels[activeModule]}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-6">
          {/* Search */}
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search students, staff, records..."
              className="w-48 lg:w-64 bg-slate-50 border border-border-soft rounded-edugov py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
          </div>

          {/* System Actions */}
          <div className="flex items-center gap-1 lg:gap-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors group">
              <Bell className="w-5 h-5 text-slate-600 group-hover:text-primary" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-alert-text rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors group"
            >
              <Settings className="w-5 h-5 text-slate-600 group-hover:text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal - Moved outside header element for better stacking context */}
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 lg:p-8 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[92vh] md:h-[600px] pointer-events-auto"
          >
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-8 flex flex-col shrink-0">
                <div className="mb-4 md:mb-8 flex items-center justify-between md:block">
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Settings</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">System Configuration</p>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-all">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:space-y-2 flex-1 scrollbar-hide">
                  {[
                    { id: 'general', label: 'General', icon: Building },
                    { id: 'notifications', label: 'Notifications', icon: BellRing },
                    { id: 'ui', label: 'Interface', icon: Palette },
                    { id: 'security', label: 'Security', icon: Shield },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap md:w-full ${
                        activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-slate-500 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 shrink-0" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="hidden md:block pt-6 border-t border-slate-200">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Lock className="w-4 h-4" />
                    Lock Terminal
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col bg-white min-h-0 min-w-0">
                <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">Manage your {activeTab} preferences</p>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="hidden md:block p-2 hover:bg-slate-50 rounded-full transition-all">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-8 min-h-0">
                  {activeTab === 'general' && (
                    <div className="space-y-6 md:space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">School Name</label>
                          <input type="text" defaultValue="EduGov Academy Central" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Branch ID</label>
                          <input type="text" defaultValue="HQ-ADDIS-001" disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regional Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Timezone</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">
                              <option>East Africa Time (GMT+3)</option>
                              <option>Universal Time (UTC)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Currency</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">
                              <option>ETB (Birr)</option>
                              <option>USD (Dollar)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="w-10 md:w-12 h-10 md:h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <History className="w-5 md:w-6 h-5 md:h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">Automatic Backup</p>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Last backup: 25 mins ago</p>
                          </div>
                        </div>
                        <button className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
                          Configure
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-4 md:space-y-6">
                      {[
                        { title: 'Student Grade Alerts', desc: 'Notify parents when new grades are published', status: true },
                        { title: 'Daily Attendance Report', desc: 'Send daily summary to branch directors', status: true },
                        { title: 'Emergency Broadcasts', desc: 'Push notifications for critical school safety', status: true },
                        { title: 'Fee Payment Reminders', desc: 'Automatic SMS for overdue school fees', status: false },
                        { title: 'Teacher Compliance', desc: 'Alert admins when registers are not submitted', status: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                          <div className="flex-1 pr-4">
                            <p className="text-sm font-black text-slate-900 leading-none">{item.title}</p>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium mt-1">{item.desc}</p>
                          </div>
                          <button className={`w-10 md:w-12 h-5 md:h-6 rounded-full relative transition-colors duration-200 shrink-0 ${item.status ? 'bg-primary' : 'bg-slate-200'}`}>
                            <div className={`absolute top-0.5 md:top-1 left-0.5 md:left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${item.status ? 'translate-x-5 md:translate-x-6' : ''}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'ui' && (
                    <div className="space-y-6 md:space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Theme Preference</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                          {['Modern Light', 'Technical Dark', 'High Contrast'].map((theme, i) => (
                            <button key={i} className={`p-4 rounded-2xl border flex flex-row md:flex-col items-center gap-3 transition-all ${i === 0 ? 'bg-primary/5 border-primary shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                              <div className="w-16 md:w-full aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-100/50 shrink-0" />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-primary' : 'text-slate-500'}`}>{theme}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compactness</h4>
                        <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <button className="flex-1 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-[10px] font-black text-slate-900 uppercase tracking-widest">Comfortable</button>
                          <button className="flex-1 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compact</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6 md:space-y-8">
                      <div className="grid grid-cols-1 gap-4 md:gap-6">
                        <button className="flex items-center justify-between p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl hover:border-primary/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center text-primary border border-slate-200 shrink-0">
                              <UserCog className="w-5 md:w-6 h-5 md:h-6" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-slate-900">Manage Staff Credentials</p>
                              <p className="text-[10px] md:text-xs text-slate-500 font-medium">Update roles and permissions</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </button>

                        <button className="flex items-center justify-between p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl hover:border-primary/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center text-primary border border-slate-200 shrink-0">
                              <Lock className="w-5 md:w-6 h-5 md:h-6" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-slate-900">Two-Factor Auth</p>
                              <p className="text-[10px] md:text-xs text-emerald-600 font-medium">Currently Enabled</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </button>
                      </div>

                      <div className="bg-red-50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border border-red-100">
                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Danger Zone</h4>
                        <p className="text-[10px] md:text-xs text-red-500/70 font-medium mb-4 leading-relaxed">
                          Resetting the database will permanently delete all records for the current academic year.
                        </p>
                        <button className="w-full md:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all">
                          Factory Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 md:p-8 border-t border-slate-50 flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 md:gap-4 shrink-0">
                  <button onClick={() => setIsSettingsOpen(false)} className="order-2 md:order-1 px-4 md:px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">
                    Discard Transitions
                  </button>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="order-1 md:order-2 flex items-center justify-center gap-2 bg-primary text-white px-6 md:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
