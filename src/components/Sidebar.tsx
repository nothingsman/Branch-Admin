import React, { useState, useRef, useEffect, useCallback } from "react"
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
  Shield,
  Hexagon,
  Settings,
  Contrast,
  Moon,
  Type,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { ModuleId } from "../types"
import { PhoneField } from "./ui/PhoneField"
import { ApiUser } from "../lib/api"

interface SidebarProps {
  activeModule: ModuleId
  setActiveModule: (module: ModuleId) => void
  academicYear: string
  schoolName?: string | null
  branchName?: string | null
  logoUrl?: string | null
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

const STORAGE_KEY = "kelem_accessibility_settings"

interface AccessibilitySettings {
  fontSize: "small" | "normal" | "large"
  highContrast: boolean
  reducedMotion: boolean
}

const FONT_SIZE_VALUES: Record<AccessibilitySettings["fontSize"], string> = {
  small: "14px",
  normal: "16px",
  large: "20px",
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "normal",
  highContrast: false,
  reducedMotion: false,
}

function loadSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement
  root.style.fontSize = FONT_SIZE_VALUES[settings.fontSize]
  root.classList.toggle("high-contrast", settings.highContrast)
  root.classList.toggle("reduced-motion", settings.reducedMotion)
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  academicYear,
  schoolName,
  branchName,
  logoUrl,
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const [isEditingProfile, setIsEditingProfile] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [profile, setProfile] = React.useState({
    name: user.name || "Admin User",
    role: "Branch Administrator",
    email: user.email || "admin@kelem.academy",
    phone: user.phone_number || "+251 911 223 344",
  })
  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD"
  const [accessibilitySettings, setAccessibilitySettings] = React.useState<AccessibilitySettings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accessibilitySettings))
    applySettings(accessibilitySettings)
  }, [accessibilitySettings])

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setAccessibilitySettings((prev) => ({ ...prev, [key]: value }))
  }, [])

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

        {/* Branding & Institution Header — matches Teacher Dashboard style */}
        <div className="px-4 sm:px-5 pt-5 sm:pt-7 pb-4 border-b border-slate-100 bg-linear-to-b from-white to-slate-50/30">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#1A237E]/8 rounded-full border border-[#1A237E]/10">
                <Shield
                  size={10}
                  className="text-[#1A237E]"
                  fill="currentColor"
                />
                <span className="text-[9px] font-bold text-[#1A237E] uppercase tracking-[0.2em] leading-none">
                  Kelem Platform
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={schoolName || "School logo"}
                  className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-100 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-linear-to-br from-[#1A237E] to-[#3949AB] rounded-xl flex items-center justify-center shadow-md shadow-blue-900/15 shrink-0 ring-1 ring-white/20">
                  <Hexagon
                    className="text-white fill-white/10"
                    size={18}
                    strokeWidth={2.5}
                  />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h2 className="text-[12px] font-bold uppercase tracking-tight text-slate-800 truncate leading-tight">
                  {schoolName || "School"}
                </h2>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                  Administration Portal
                </p>
                {branchName && (
                  <p className="text-[9px] font-medium text-slate-500 truncate">
                    {branchName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:bg-slate-100"
            >
              <span className="text-xs font-semibold text-[#1A237E]">
                {academicYear}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 sm:px-4 py-2">
          <div className="space-y-1">
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
                  className={`w-full flex items-center gap-3 min-h-[44px] px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                  <span className="text-sm font-semibold tracking-tight">{module.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Profile Section — matches Teacher Dashboard style */}
        <ProfileDropdown
          profile={profile}
          initials={initials}
          onEditProfile={() => setIsEditingProfile(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={onLogout}
        />
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
                <h3 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                  View Profile
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
                    <label className="pl-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Display Name
                    </label>
                    <input
                      autoFocus
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
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
                    <label className="pl-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Professional Role
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
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
                      <label className="pl-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
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
                    <PhoneField
                      label="Phone Number"
                      value={profile.phone}
                      onChange={(value) => setProfile((prev) => ({ ...prev, phone: value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl bg-slate-50 py-3.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl bg-primary py-3.5 text-[10px] font-bold tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Accessibility Settings Modal — matches Teacher Dashboard style */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <Settings size={18} className="text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold text-card-foreground">Accessibility Settings</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Settings Rows */}
                <div className="px-6 py-5 space-y-6">
                  {/* Font Size */}
                  <SettingRow
                    icon={<Type size={18} />}
                    label="Font Size"
                    description="Adjust text size across the dashboard"
                  >
                    <div className="flex gap-1.5">
                      {(["small", "normal", "large"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateSetting("fontSize", size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            accessibilitySettings.fontSize === size
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {size === "small" ? "Small" : size === "normal" ? "Normal" : "Large"}
                        </button>
                      ))}
                    </div>
                  </SettingRow>

                  {/* High Contrast */}
                  <SettingRow
                    icon={<Contrast size={18} />}
                    label="High Contrast"
                    description="Increase color contrast for better visibility"
                  >
                    <ToggleButton
                      enabled={accessibilitySettings.highContrast}
                      onToggle={() => updateSetting("highContrast", !accessibilitySettings.highContrast)}
                    />
                  </SettingRow>

                  {/* Reduced Motion */}
                  <SettingRow
                    icon={<Moon size={18} />}
                    label="Reduced Motion"
                    description="Minimize animations and transitions"
                  >
                    <ToggleButton
                      enabled={accessibilitySettings.reducedMotion}
                      onToggle={() => updateSetting("reducedMotion", !accessibilitySettings.reducedMotion)}
                    />
                  </SettingRow>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-muted/50 border-t border-border">
                  <p className="text-[10px] font-medium text-muted-foreground text-center">
                    Settings are saved locally and persist across sessions.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

interface ProfileDropdownProps {
  profile: { name: string; role: string }
  initials: string
  onEditProfile: () => void
  onOpenSettings: () => void
  onLogout: () => void
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  profile,
  initials,
  onEditProfile,
  onOpenSettings,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener("mousedown", handleClickOutside)
    return () => window.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div className="p-4 border-t border-slate-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 p-2 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition"
      >
        <div className="w-10 h-10 rounded-full bg-[#1A237E] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
          {initials}
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">
            {profile.name}
          </p>
          <p className="text-[10px] font-medium text-slate-400">
            {profile.role}
          </p>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="mt-2 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onEditProfile()
            }}
            className="w-full px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <User size={14} /> View Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onOpenSettings()
            }}
            className="w-full px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Settings size={14} /> Settings
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-card-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function ToggleButton({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}
