import React, { useState } from "react"
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
  Menu,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { ModuleId } from "../types"

interface HeaderProps {
  activeModule: ModuleId
  onMenuClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onMenuClick,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "ui" | "security"
  >("general")

  const moduleLabels: Record<ModuleId, string> = {
    dashboard: "Dashboard",
    parents: "Parents",
    students: "Students",
    teachers: "Teachers",
    academia: "Academia",
    attendance: "Attendance",
    calendar: "Academic Calendar",
    announcements: "Announcements",
    batchImport: "Batch Import",
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-soft bg-white bg-white/80 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-slate-400">Branch Admin</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="font-semibold text-primary">
              {moduleLabels[activeModule]}
            </span>
          </div>

          <div className="max-w-[120px] truncate text-sm font-semibold text-primary sm:hidden">
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
              className="w-48 rounded-edugov border border-border-soft bg-slate-50 py-1.5 pr-4 pl-10 text-xs transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:outline-none lg:w-64"
            />
            <Search className="absolute top-2 left-3 h-4 w-4 text-slate-400" />
          </div>

          {/* System Actions */}
          <div className="flex items-center gap-1 lg:gap-4">
            <button className="group relative rounded-full p-2 transition-colors hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600 group-hover:text-primary" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-alert-text"></span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="group rounded-full p-2 transition-colors hover:bg-slate-100"
            >
              <Settings className="h-5 w-5 text-slate-600 group-hover:text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal - Moved outside header element for better stacking context */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-2 md:p-4 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="pointer-events-auto absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl md:h-[600px] md:flex-row md:rounded-[2.5rem]"
            >
              {/* Sidebar */}
              <div className="flex w-full shrink-0 flex-col border-b border-slate-100 bg-slate-50 p-4 md:w-64 md:border-r md:border-b-0 md:p-8">
                <div className="mb-4 flex items-center justify-between md:mb-8 md:block">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 md:text-xl">
                      Settings
                    </h2>
                    <p className="mt-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      System Configuration
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="rounded-full p-2 transition-all hover:bg-slate-100 md:hidden"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <nav className="scrollbar-hide flex flex-1 gap-2 overflow-x-auto pb-2 md:flex-col md:space-y-2 md:pb-0">
                  {[
                    { id: "general", label: "General", icon: Building },
                    {
                      id: "notifications",
                      label: "Notifications",
                      icon: BellRing,
                    },
                    { id: "ui", label: "Interface", icon: Palette },
                    { id: "security", label: "Security", icon: Shield },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black whitespace-nowrap transition-all md:w-full ${
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-500 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <tab.icon className="h-4 w-4 shrink-0" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="hidden border-t border-slate-200 pt-6 md:block">
                  <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black text-red-500 transition-all hover:bg-red-50">
                    <Lock className="h-4 w-4" />
                    Lock Terminal
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-50 p-5 md:p-8">
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900 uppercase md:text-lg">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                      Settings
                    </h3>
                    <p className="text-[10px] font-medium text-slate-400 md:text-xs">
                      Manage your {activeTab} preferences
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="hidden rounded-full p-2 transition-all hover:bg-slate-50 md:block"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-8">
                  {activeTab === "general" && (
                    <div className="space-y-6 md:space-y-8">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                        <div className="space-y-2">
                          <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            School Name
                          </label>
                          <input
                            type="text"
                            defaultValue="EduGov Academy Central"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Branch ID
                          </label>
                          <input
                            type="text"
                            defaultValue="HQ-ADDIS-001"
                            disabled
                            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          Regional Settings
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                          <div className="space-y-2">
                            <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                              Timezone
                            </label>
                            <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none">
                              <option>East Africa Time (GMT+3)</option>
                              <option>Universal Time (UTC)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                              Currency
                            </label>
                            <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none">
                              <option>ETB (Birr)</option>
                              <option>USD (Dollar)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4 md:flex-row md:rounded-[2rem] md:p-6">
                        <div className="flex w-full items-center gap-4 md:w-auto">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white md:h-12 md:w-12">
                            <History className="h-5 w-5 text-slate-400 md:h-6 md:w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              Automatic Backup
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 md:text-xs">
                              Last backup: 25 mins ago
                            </p>
                          </div>
                        </div>
                        <button className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-50 md:w-auto">
                          Configure
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="space-y-4 md:space-y-6">
                      {[
                        {
                          title: "Student Grade Alerts",
                          desc: "Notify parents when new grades are published",
                          status: true,
                        },
                        {
                          title: "Daily Attendance Report",
                          desc: "Send daily summary to branch directors",
                          status: true,
                        },
                        {
                          title: "Emergency Broadcasts",
                          desc: "Push notifications for critical school safety",
                          status: true,
                        },
                        {
                          title: "Fee Payment Reminders",
                          desc: "Automatic SMS for overdue school fees",
                          status: false,
                        },
                        {
                          title: "Teacher Compliance",
                          desc: "Alert admins when registers are not submitted",
                          status: true,
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-2xl p-3 transition-colors hover:bg-slate-50 md:p-4"
                        >
                          <div className="flex-1 pr-4">
                            <p className="text-sm leading-none font-black text-slate-900">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-slate-500 md:text-xs">
                              {item.desc}
                            </p>
                          </div>
                          <button
                            className={`relative h-5 w-10 shrink-0 rounded-full transition-colors duration-200 md:h-6 md:w-12 ${item.status ? "bg-primary" : "bg-slate-200"}`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 md:top-1 md:left-1 ${item.status ? "translate-x-5 md:translate-x-6" : ""}`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "ui" && (
                    <div className="space-y-6 md:space-y-8">
                      <div className="space-y-4">
                        <h4 className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          Theme Preference
                        </h4>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                          {[
                            "Modern Light",
                            "Technical Dark",
                            "High Contrast",
                          ].map((theme, i) => (
                            <button
                              key={i}
                              className={`flex flex-row items-center gap-3 rounded-2xl border p-4 transition-all md:flex-col ${i === 0 ? "border-primary bg-primary/5 shadow-sm" : "border-slate-100 bg-slate-50 hover:border-slate-300"}`}
                            >
                              <div className="aspect-video w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100/50 bg-slate-200 md:w-full" />
                              <span
                                className={`text-[10px] font-black tracking-widest uppercase ${i === 0 ? "text-primary" : "text-slate-500"}`}
                              >
                                {theme}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          Compactness
                        </h4>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 md:p-4">
                          <button className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-[10px] font-black tracking-widest text-slate-900 uppercase shadow-sm">
                            Comfortable
                          </button>
                          <button className="flex-1 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Compact
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-6 md:space-y-8">
                      <div className="grid grid-cols-1 gap-4 md:gap-6">
                        <button className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary/20 md:rounded-3xl md:p-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary md:h-12 md:w-12 md:rounded-2xl">
                              <UserCog className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-slate-900">
                                Manage Staff Credentials
                              </p>
                              <p className="text-[10px] font-medium text-slate-500 md:text-xs">
                                Update roles and permissions
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-primary" />
                        </button>

                        <button className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary/20 md:rounded-3xl md:p-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary md:h-12 md:w-12 md:rounded-2xl">
                              <Lock className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-slate-900">
                                Two-Factor Auth
                              </p>
                              <p className="text-[10px] font-medium text-emerald-600 md:text-xs">
                                Currently Enabled
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-primary" />
                        </button>
                      </div>

                      <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-5 md:rounded-[2rem] md:p-6">
                        <h4 className="mb-2 text-[10px] font-black tracking-widest text-red-600 uppercase">
                          Danger Zone
                        </h4>
                        <p className="mb-4 text-[10px] leading-relaxed font-medium text-red-500/70 md:text-xs">
                          Resetting the database will permanently delete all
                          records for the current academic year.
                        </p>
                        <button className="w-full rounded-xl bg-red-600 px-6 py-2.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-red-200 transition-all active:scale-95 md:w-auto">
                          Factory Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-stretch justify-end gap-3 border-t border-slate-50 p-5 md:flex-row md:items-center md:gap-4 md:p-8">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="order-2 px-4 py-3 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-600 md:order-1 md:px-6"
                  >
                    Discard Transitions
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="order-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 md:order-2 md:px-8"
                  >
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
