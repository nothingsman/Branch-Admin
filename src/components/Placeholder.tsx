import React from "react"
import { Box } from "lucide-react"
import { ModuleId } from "../types"

interface PlaceholderProps {
  moduleId: ModuleId
}

export const Placeholder: React.FC<PlaceholderProps> = ({ moduleId }) => {
  const titles: Record<ModuleId, string> = {
    dashboard: "Dashboard",
    parents: "Parent Management",
    students: "Students Management",
    teachers: "Teacher Directory",
    academia: "Curriculum & Subjects",
    attendance: "Attendance Tracking",
    calendar: "Academic Calendar",
    announcements: "Branch Announcements",
    batchImport: "Batch Data Import",
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-6 py-20 text-center shadow-sm">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Box className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-primary">
          {titles[moduleId]}
        </h2>
        <p className="mx-auto mb-8 max-w-xs text-slate-500">
          This module is ready for integration. Click "Canvas Ready" to begin
          building the detailed interface.
        </p>
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A237E] px-7 py-3.5 font-semibold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[#151B63] hover:shadow-[0_15px_30px_-5px_rgba(26,35,126,0.5)] active:translate-y-0 active:scale-[0.97] disabled:opacity-50">
          Initialize {titles[moduleId]}
        </button>
      </div>
    </div>
  )
}
