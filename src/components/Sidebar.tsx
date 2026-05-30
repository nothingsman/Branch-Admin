import React from "react"
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
  User,
  Edit3,
  LogOut,
  X,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { ModuleId } from "../types"
import { ApiUser } from "../lib/api"

interface SidebarProps {
  activeModule: ModuleId
  setActiveModule: (module: ModuleId) => void
  academicYear: string
  schoolName?: string | null
  branchName?: string | null
  isOpen?: boolean
  onClose?: () => void
  user: ApiUser
  onLogout: () => void
}

const modules = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "parents" as const, label: "Parents", icon: Users },
  { id: "students" as const, label: "Students", icon: UserRound },
  { id: "teachers" as const, label: "Teachers", icon: GraduationCap },
  { id: "academia" as const, label: "Academia", icon: BookOpen },
  { id: "attendance" as const, label: "Attendance", icon: ClipboardCheck },
  { id: "announcements" as const, label: "Announcements", icon: Megaphone },
  { id: "calendar" as const, label: "Academic Calendar", icon: CalendarDays },
  { id: "batchImport" as const, label: "Batch Import", icon: FileUp },
]

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  academicYear,
  schoolName,
  branchName,
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const [isEditingProfile, setIsEditingProfile] = React.useState(false)
  const [profile, setProfile] = React.useState({
    name: user.name || "Admin User",
    role: "Branch Administrator",
    email: user.email || "admin@edugov.academy",
    phone: user.phone_number || "+251 911 223 344",
  })

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
            className="fixed inset-0 z-[55] bg-slate-900/20 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed top-0 left-0 z-[60] flex h-screen w-[17rem] transform flex-col border-r border-slate-200 bg-white text-slate-900 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* School Context Section */}
        <div className="border-b border-slate-200 px-5 py-7">
          <div className="mb-4 text-center">
            <p className="text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
              School
            </p>
            <h2 className="mt-2 text-base leading-tight font-black text-primary-navy">
              {schoolName || "School"}
            </h2>
            <p className="mt-3 text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
              Branch
            </p>
              <p className="mt-2 text-sm font-bold text-slate-600">
              {branchName || "Branch"}
            </p>
          </div>

          <div className="w-full">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:bg-slate-100"
            >
              <span className="text-sm font-bold text-primary-navy">
                {academicYear}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon
              const isActive = activeModule === module.id
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id)
                    onClose?.()
                  }}
                  className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all ${
                    isActive
                      ? "sidebar-link-active"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`}
                  />
                  <span className="text-sm font-bold">{module.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-200 px-5 py-5">
          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="group/profile flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-sm transition-all group-hover/profile:border-primary/30">
              <User className="h-4 w-4" />
              <div className="absolute inset-0 flex items-center justify-center bg-primary/12 opacity-0 transition-opacity group-hover/profile:opacity-100">
                <Edit3 className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm leading-tight font-extrabold text-slate-900">
                {profile.name}
              </h3>
              <p className="truncate text-xs font-medium text-slate-500">
                {profile.role}
              </p>
            </div>
          </button>
        </div>

        {/* Logout Action */}
        <div className="shrink-0 border-t border-slate-200 p-4">
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <LogOut className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Modal - Moved outside sidebar div for better stacking context */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="pointer-events-auto absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="scrollbar-hide pointer-events-auto relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8"
            >
              <div className="mb-6 flex shrink-0 items-center justify-between md:mb-8">
                <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  Edit Admin Profile
                </h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-full p-2 transition-all hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="mb-8 flex flex-col items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-4 border-slate-50 bg-slate-100 text-slate-400 shadow-lg md:h-24 md:w-24 md:rounded-[2rem]">
                  <User className="h-10 w-10" />
                </div>

                <div className="w-full space-y-4">
                  <div className="space-y-1.5">
                    <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Display Name
                    </label>
                    <input
                      autoFocus
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Professional Role
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                      value={profile.role}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      placeholder="e.g. Branch Principal"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="admin@school.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="pl-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 transition-all outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+251 ..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl bg-slate-50 py-3.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl bg-primary py-3.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
