import React, { useMemo, useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { importApi } from '../lib/api';

interface BatchImportProps {
  academicYear?: string;
  organizationId: string | null;
  branchId: string | null;
}

export const BatchImport: React.FC<BatchImportProps> = ({ academicYear, organizationId, branchId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'validating' | 'success'>('idle');
  const [isToastMinimized, setIsToastMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const isProcessing = status !== 'idle';
  const canShowPreviousUpload = useMemo(() => !isProcessing, [isProcessing]);

  const [targetModule, setTargetModule] = useState('Teacher Record');
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const modules = ["Teacher Record", "Parent Record", "Student Record", "Academic Calendar"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getEndpointTag = (moduleName: string): 'students' | 'parents' | 'teachers' | null => {
    if (moduleName === 'Student Record') return 'students';
    if (moduleName === 'Parent Record') return 'parents';
    if (moduleName === 'Teacher Record') return 'teachers';
    return null;
  };

  const [errors, setErrors] = useState<any[]>([]);

  const startProcess = async () => {
    if (!file || !organizationId || !branchId) return;

    const endpoint = getEndpointTag(targetModule);
    if (!endpoint) {
      alert("This module is not supported for import yet.");
      return;
    }

    setStatus('uploading');
    setProgress(25);
    setErrors([]);

    try {
      setProgress(50);
      await importApi.uploadBulkFile(endpoint, file, organizationId, branchId);
      setProgress(100);
      setStatus('success');
    } catch (err: any) {
      setStatus('idle');
      if (err.status === 400 && err.data?.errors) {
        setErrors(err.data.errors);
        alert("Validation failed. Please review row-level errors.");
      } else {
        alert(err.message || "An unexpected error occurred during import.");
      }
    }
  };

  const downloadTemplate = (name: string) => {
    let csvContent = "";
    if (name === 'Teacher Template') {
      csvContent = "FullName,Email,EmployeeId,PrimarySubject,Sections\nJohn Doe,john.doe@school.edu,EMP001,Mathematics,9A;10B";
    } else if (name === 'Parent Template') {
      csvContent = "ParentName,Email,PhoneNumber,ChildName,ChildId\nRobert Smith,robert.s@gmail.com,+123456789,Alice Smith,S001";
    } else if (name === 'Student Template') {
      csvContent = "StudentName,DateOfBirth,Gender,Grade,Section\nCharlie Brown,2010-05-15,Male,Grade 9,9B";
    } else if (name === 'Academic Template') {
      csvContent = "EventName,StartDate,EndDate,Type,Description\nFall Semester,2025-09-01,2025-12-20,Term,Academic year start";
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6 relative min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Batch Data Import</h2>
          <p className="text-sm text-slate-500">Upload CSV or Excel files to bulk create records</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
          <Info className="w-4 h-4" />
          Template Version 2.1.2
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base border-dashed border-2 flex flex-col items-center justify-center py-16 transition-all hover:bg-slate-50 group">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Choose a file or drag it here</h3>
            <p className="text-slate-500 text-sm mb-6">Supported formats: .csv, .xlsx (Max 10MB)</p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".csv,.xlsx"
            />
            <label 
              htmlFor="file-upload"
              className="btn-primary cursor-pointer ring-offset-2 transition-all active:scale-95"
            >
              Browse Files
            </label>
            
            {file && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center gap-3 p-3 bg-white border border-border-soft rounded-lg text-left w-full max-w-sm shadow-sm"
              >
                <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="text-green-600 w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 w-full text-left max-h-60 overflow-y-auto">
                <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Import Failed: Row-level Validation Errors
                </h4>
                <div className="space-y-2">
                  {errors.map((err, idx) => (
                    <div key={idx} className="text-xs text-red-700">
                      <span className="font-bold">Row {err.row || 'N/A'}:</span>{' '}
                      {Object.entries(err.errors).map(([field, msgs]: any) => (
                        <span key={field} className="mr-2">
                          <span className="underline">{field}</span>: {msgs.join(', ')}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card-base">
            <h3 className="font-bold text-primary mb-4">Import Settings</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Target Module Dropdown */}
              <div className="relative">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 ml-1">Target Module</p>
                <button 
                  onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                  className="w-full flex items-center justify-between bg-white border border-border-soft rounded-lg py-2.5 px-4 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-primary/40 hover:bg-slate-50 transition-all shadow-sm group"
                >
                  <span className="truncate">{targetModule}</span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 shrink-0 ${isModuleDropdownOpen ? 'rotate-180' : ''}`} />
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
                        className="dropdown-menu !absolute z-20 top-full left-0 mt-1 w-full min-w-[200px]"
                      >
                        {modules.map((m) => (
                          <div
                            key={m}
                            onClick={() => {
                              setTargetModule(m);
                              setIsModuleDropdownOpen(false);
                            }}
                            className={`dropdown-item py-2.5 ${m === targetModule ? 'bg-primary text-white hover:bg-primary/90 hover:text-white' : ''}`}
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
            disabled={!file || status !== 'idle'}
            onClick={startProcess}
            className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              !file || status !== 'idle' 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]'
            }`}
          >
            {status === 'idle' ? 'Begin Import Process' : 'Process in Progress...'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics & Resources Sidebar */}
        <div className="space-y-6">

          <div className="card-base">
            <div className="flex items-center gap-2 mb-6">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-primary">Download Templates</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Teacher Template', format: 'XLSX', size: '14KB' },
                { name: 'Parent Template', format: 'CSV', size: '8KB' },
                { name: 'Student Template', format: 'XLSX', size: '12KB' },
                { name: 'Academic Template', format: 'CSV', size: '22KB' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => downloadTemplate(item.name)}
                  className="flex items-center justify-between p-3 border border-border-soft rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{item.format} • {item.size}</span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="card-base bg-white border border-border-soft">
            <h3 className="font-bold text-[#632c2c] mb-4">Guidelines</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <p className="text-[11px] text-[#28374d] font-medium leading-relaxed">Ensure all dates follow <span className="text-accent underline cursor-help">ISO-8601</span> format (YYYY-MM-DD).</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <p className="text-[11px] text-[#28374d] font-medium leading-relaxed">Unique ID fields (Email, Staff ID) must not contain duplicates within the same batch.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <p className="text-[11px] text-[#28374d] font-medium leading-relaxed">Max record count per single file is 5,000. Use multiple files for larger datasets.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Google Drive Style Floating Upload Toast */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 right-14 w-[360px] bg-white rounded-t-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border-soft overflow-hidden z-[60]"
          >
            {/* Toast Header */}
            <div className="bg-[#f8f9fa] px-4 py-3 flex items-center justify-between border-b border-border-soft">
              <span className="text-sm font-medium text-[#202124] truncate pr-4">
                {status === 'success' ? '1 upload complete' : 'Uploading batch data...'}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setIsToastMinimized(!isToastMinimized)}
                  className="hover:bg-black/5 p-1 rounded-full transition-colors text-[#5f6368]"
                >
                  {isToastMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setStatus('idle')}
                  className="hover:bg-black/5 p-1 rounded-full transition-colors text-[#5f6368]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-header / Status Row */}
            <AnimatePresence>
              {!isToastMinimized && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-b border-border-soft bg-white"
                >
                  <div className="px-4 py-2 flex items-center justify-between text-[13px]">
                    <span className="text-[#5f6368]">
                      {status === 'uploading' ? 'Starting uploads...' : 
                       status === 'validating' ? 'Verifying records...' : 
                       'Upload complete'}
                    </span>
                    {status !== 'success' && (
                      <button 
                        onClick={() => setStatus('idle')}
                        className="text-blue-600 font-medium hover:underline"
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
              animate={{ height: isToastMinimized ? 0 : 'auto' }}
              className="overflow-hidden bg-white max-h-[300px] overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between gap-4 group hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 overflow-hidden flex-1">
                  <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm text-[#3c4043] truncate font-medium">
                      {file?.name || 'teacher_records_bulk.xlsx'}
                    </p>
                    {status !== 'success' && (
                      <div className="mt-1.5 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#5f6368] font-bold uppercase tracking-wider">
                            {status === 'uploading' ? 'Uploading' : 'Processing'}
                          </span>
                          <span className="text-[10px] text-[#5f6368] font-bold">{progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
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
                  {status === 'success' ? (
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-slate-100 rounded-full" />
                      <div className={`absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent ${status === 'uploading' ? 'animate-spin' : ''}`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative extra rows to match the "list" vibe of the screenshot */}
              {canShowPreviousUpload && (
                <div className="p-4 border-t border-border-soft flex items-center justify-between gap-4 opacity-40">
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-400">previous_upload.csv</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
