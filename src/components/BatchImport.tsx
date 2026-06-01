import React, { useMemo, useState } from "react"
import {
  FileUp,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  History,
  Clock,
  ExternalLink,
  Download,
  ShieldCheck,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { importApi } from "../lib/api"

interface BatchImportProps {
  academicYear?: string
  organizationId: string | null
  branchId: string | null
}

export const BatchImport: React.FC<BatchImportProps> = ({
  academicYear,
  organizationId,
  branchId,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<
    "idle" | "uploading" | "validating" | "success"
  >("idle")
  const [isToastMinimized, setIsToastMinimized] = useState(false)
  const [progress, setProgress] = useState(0)
  const isProcessing = status !== "idle"
  const canShowPreviousUpload = useMemo(() => !isProcessing, [isProcessing])

  const [targetModule, setTargetModule] = useState("Teacher Record")
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false)
  const modules = [
    "Teacher Record",
    "Parent Record",
    "Student Record",
    "Academic Calendar",
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const getEndpointTag = (
    moduleName: string
  ): "students" | "parents" | "teachers" | null => {
    if (moduleName === "Student Record") return "students"
    if (moduleName === "Parent Record") return "parents"
    if (moduleName === "Teacher Record") return "teachers"
    return null
  }

  const [errors, setErrors] = useState<any[]>([])
  const [taskId, setTaskId] = useState<string | null>(null)

  const startProcess = async () => {
    if (!file || !organizationId || !branchId) return

    const endpoint = getEndpointTag(targetModule)
    if (!endpoint) {
      alert("This module is not supported for import yet.")
      return
    }

    setStatus("uploading")
    setProgress(25)
    setErrors([])

    try {
      setProgress(50)
      const started = await importApi.uploadBulkFile(
        endpoint,
        file,
        organizationId,
        branchId
      )
      if (!started.task_id) {
        throw new Error("Bulk import started without a task id.")
      }
      setTaskId(started.task_id)
      setStatus("validating")

      let attempts = 0
      while (attempts < 60) {
        const job = await importApi.getStatus(started.task_id)
        setProgress(Math.max(55, Math.min(job.progress || 0, 100)))
        if (job.status === "success") {
          setProgress(100)
          setStatus("success")
          return
        }
        if (job.status === "failed") {
          setStatus("idle")
          setErrors(
            Array.isArray(job.errors) ? job.errors : [{ errors: job.errors }]
          )
          throw new Error("Bulk import failed.")
        }
        attempts += 1
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      throw new Error("Bulk import is still processing. Check again shortly.")
    } catch (err: any) {
      setStatus("idle")
      if (err.status === 400 && err.data?.errors) {
        setErrors(err.data.errors)
        alert("Validation failed. Please review row-level errors.")
      } else {
        alert(err.message || "An unexpected error occurred during import.")
      }
    }
  }

  const downloadTemplate = (name: string) => {
    let csvContent = ""
    if (name === "Teacher Template") {
      csvContent =
        "FullName,Email,EmployeeId,PrimarySubject,Sections\nJohn Doe,john.doe@school.edu,EMP001,Mathematics,9A;10B"
    } else if (name === "Parent Template") {
      csvContent =
        "ParentName,Email,PhoneNumber,ChildName,ChildId\nRobert Smith,robert.s@gmail.com,+123456789,Alice Smith,S001"
    } else if (name === "Student Template") {
      csvContent =
        "StudentName,DateOfBirth,Gender,Grade,Section\nCharlie Brown,2010-05-15,Male,Grade 9,9B"
    } else if (name === "Academic Template") {
      csvContent =
        "EventName,StartDate,EndDate,Type,Description\nFall Semester,2025-09-01,2025-12-20,Term,Academic year start"
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.toLowerCase().replace(/\s+/g, "_")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-full space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Batch Data Import</h2>
          <p className="text-sm text-slate-500">
            Upload CSV or Excel files to bulk create records
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
          <Info className="h-4 w-4" />
          {taskId
            ? `Import Job ${taskId.slice(0, 8)}`
            : "Template Version 2.1.2"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-20 lg:grid-cols-3">
        {/* Upload Zone */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 shadow-sm group flex flex-col items-center justify-center py-16 transition-all hover:bg-slate-50">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 transition-transform group-hover:scale-110">
              <FileUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Choose a file or drag it here
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              Supported formats: .csv, .xlsx (Max 10MB)
            </p>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv,.xlsx"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A237E] px-7 py-3.5 font-semibold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[#151B63] hover:shadow-[0_15px_30px_-5px_rgba(26,35,126,0.5)] active:translate-y-0 active:scale-[0.97] disabled:opacity-50 cursor-pointer ring-offset-2"
            >
              Browse Files
            </label>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex w-full max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-green-50">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {file.name}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {errors.length > 0 && (
              <div className="mt-4 max-h-60 w-full overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  Import Failed: Row-level Validation Errors
                </h4>
                <div className="space-y-2">
                  {errors.map((err, idx) => (
                    <div key={idx} className="text-xs text-red-700">
                      <span className="font-semibold">Row {err.row || "N/A"}:</span>{" "}
                      {Object.entries(err.errors).map(([field, msgs]: any) => (
                        <span key={field} className="mr-2">
                          <span className="underline">{field}</span>:{" "}
                          {msgs.join(", ")}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-primary">Import Settings</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Target Module Dropdown */}
              <div className="relative">
                <p className="mb-2 ml-1 text-[10px] font-semibold tracking-wider text-primary uppercase">
                  Target Module
                </p>
                <button
                  onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                  className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-primary shadow-sm transition-all hover:border-primary/40 hover:bg-slate-50 focus:ring-2 focus:ring-primary/10 focus:outline-none"
                >
                  <span className="truncate">{targetModule}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-primary transition-transform duration-300 ${isModuleDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isModuleDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsModuleDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="!absolute top-full left-0 z-20 mt-1 w-full min-w-[200px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
                      >
                        {modules.map((m) => (
                          <div
                            key={m}
                            onClick={() => {
                              setTargetModule(m)
                              setIsModuleDropdownOpen(false)
                            }}
                            className={`flex w-full cursor-pointer items-center rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#1A237E] py-2.5 ${m === targetModule ? "bg-primary text-white hover:bg-primary/90 hover:text-white" : ""}`}
                          >
                            {m}
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <button
            disabled={!file || status !== "idle"}
            onClick={startProcess}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 font-semibold shadow-lg transition-all ${
              !file || status !== "idle"
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
            }`}
          >
            {status === "idle"
              ? "Begin Import Process"
              : "Process in Progress..."}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Statistics & Resources Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Download Templates</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Teacher Template", format: "XLSX", size: "14KB" },
                { name: "Parent Template", format: "CSV", size: "8KB" },
                { name: "Student Template", format: "XLSX", size: "12KB" },
                { name: "Academic Template", format: "CSV", size: "22KB" },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => downloadTemplate(item.name)}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] tracking-tighter text-slate-400 uppercase">
                      {item.format} • {item.size}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-2 transition-all group-hover:bg-primary group-hover:text-white">
                    <Download className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-[#632c2c]">Guidelines</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-[11px] leading-relaxed font-medium text-[#28374d]">
                  Ensure all dates follow{" "}
                  <span className="cursor-help text-primary underline">
                    ISO-8601
                  </span>{" "}
                  format (YYYY-MM-DD).
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-[11px] leading-relaxed font-medium text-[#28374d]">
                  You can always resume partial imports from where you left
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-[11px] leading-relaxed font-medium text-[#28374d]">
                  Verify the target module below before
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Google Drive Style Floating Upload Toast */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed right-14 bottom-0 z-[60] w-[360px] overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            {/* Toast Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8f9fa] px-4 py-3">
              <span className="truncate pr-4 text-sm font-medium text-[#202124]">
                {status === "success"
                  ? "1 upload complete"
                  : "Uploading batch data..."}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setIsToastMinimized(!isToastMinimized)}
                  className="rounded-full p-1 text-[#5f6368] transition-colors hover:bg-black/5"
                >
                  {isToastMinimized ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => setStatus("idle")}
                  className="rounded-full p-1 text-[#5f6368] transition-colors hover:bg-black/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sub-header / Status Row */}
            <AnimatePresence>
              {!isToastMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-b border-slate-200 bg-white"
                >
                  <div className="flex items-center justify-between px-4 py-2 text-[13px]">
                    <span className="text-[#5f6368]">
                      {status === "uploading"
                        ? "Starting uploads..."
                        : status === "validating"
                          ? "Verifying records..."
                          : "Upload complete"}
                    </span>
                    {status !== "success" && (
                      <button
                        onClick={() => setStatus("idle")}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List Item */}
            <motion.div
              animate={{ height: isToastMinimized ? 0 : "auto" }}
              className="max-h-[300px] overflow-hidden overflow-y-auto bg-white"
            >
              <div className="group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50">
                <div className="flex flex-1 items-center gap-4 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-50">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-[#3c4043]">
                      {file?.name || "teacher_records_bulk.xlsx"}
                    </p>
                    {status !== "success" && (
                      <div className="mt-1.5 w-full">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-semibold tracking-wider text-[#5f6368] uppercase">
                            {status === "uploading"
                              ? "Uploading"
                              : "Processing"}
                          </span>
                          <span className="text-[10px] font-semibold text-[#5f6368]">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {status === "success" ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                      <div
                        className={`absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent ${status === "uploading" ? "animate-spin" : ""}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative extra rows to match the "list" vibe of the screenshot */}
              {canShowPreviousUpload && (
                <div className="flex items-center justify-between gap-4 border-t border-slate-200 p-4 opacity-40">
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="h-5 w-5 text-slate-400" />
                    <p className="text-sm text-slate-400">
                      previous_upload.csv
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
