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
      <div className="card-base flex w-full max-w-lg flex-col items-center border-2 border-dashed bg-white/50 py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Box className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-primary">
          {titles[moduleId]}
        </h2>
        <p className="mx-auto mb-8 max-w-xs text-slate-500">
          This module is ready for integration. Click "Canvas Ready" to begin
          building the detailed interface.
        </p>
        <button className="btn-primary px-8">
          Initialize {titles[moduleId]}
        </button>
      </div>
    </div>
  )
}
