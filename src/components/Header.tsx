import React from "react"
import {
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react"
import { ModuleId } from "../types"

interface HeaderProps {
  activeModule: ModuleId
  onMenuClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onMenuClick,
}) => {

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
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white bg-white/80 px-4 backdrop-blur-md lg:px-8">
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
            <span className="font-medium text-primary">
              {moduleLabels[activeModule]}
            </span>
          </div>

          <div className="max-w-[120px] truncate text-sm font-medium text-primary sm:hidden">
            {moduleLabels[activeModule]}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-6">
          <button className="group relative rounded-full p-2 transition-colors hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600 group-hover:text-primary" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-alert-text"></span>
          </button>
        </div>
      </header>

    </>
  )
}
