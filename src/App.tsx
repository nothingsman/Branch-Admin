/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { BatchImport } from './components/BatchImport';
import { Teachers } from './components/Teachers';
import { Parents } from './components/Parents';
import { Academia } from './components/Academia';
import { AttendanceDashboard } from './components/AttendanceDashboard';
import { Announcements } from './components/Announcements';
import { AcademicCalendar } from './components/AcademicCalendar';
import { Students } from './components/Students';
import { Placeholder } from './components/Placeholder';
import { Login } from './components/Login';
import { authApi, academiaApi, ApiUser, AcademicYear, BranchAdminProfile, tokenManager } from './lib/api';
import { ModuleId, Teacher } from './types';
import { mockGrades, mockSections, mockTeachers } from './constants/mockData';
import { Loader2, KeyRound, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [user, setUser] = useState<ApiUser | null>(null);
  const [branchProfile, setBranchProfile] = useState<BranchAdminProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Academic year context
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = tokenManager.getAccessToken();
      if (token) {
        try {
          const profile = await authApi.getCurrentUser();
          if (profile.verified_at) {
            setUser(profile);
            setIsAuthenticated(true);
            await loadBranchContext();
          } else {
            authApi.logout();
          }
        } catch {
          authApi.logout();
        }
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, []);

  async function loadBranchContext() {
    try {
      const profile = await authApi.getBranchAdminProfile();
      if (profile) {
        setBranchProfile(profile);
        await loadAcademicYears(profile.branch);
      }
    } catch {
      // non-fatal — branch context will be null
    }
  }

  async function loadAcademicYears(branchId: string) {
    setIsLoadingYears(true);
    try {
      const years = await academiaApi.getAcademicYears(branchId);
      setAcademicYears(years);
      // Auto-select the current year, or the first one
      const current = years.find(y => y.is_current) || years[0] || null;
      setSelectedAcademicYear(current);
    } catch {
      // non-fatal
    } finally {
      setIsLoadingYears(false);
    }
  }

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setBranchProfile(null);
    setAcademicYears([]);
    setSelectedAcademicYear(null);
    setIsAuthenticated(false);
    setActiveModule('dashboard');
  };

  const handleLoginSuccess = async (u: ApiUser) => {
    setUser(u);
    setIsAuthenticated(true);
    await loadBranchContext();
  };

  // Academic year display label
  const academicYearLabel = selectedAcademicYear?.name ?? 'No Academic Year';

  // Academic year picker rendered in the header area
  const AcademicYearPicker = () => (
    <div className="relative">
      <button
        onClick={() => setIsYearPickerOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black border border-primary/20 hover:bg-primary/20 transition-all"
      >
        {isLoadingYears ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            <span>{academicYearLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isYearPickerOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isYearPickerOpen && academicYears.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[180px]"
          >
            {academicYears.map(year => (
              <button
                key={year.id}
                onClick={() => {
                  setSelectedAcademicYear(year);
                  setIsYearPickerOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-xs font-bold transition-colors flex items-center justify-between gap-3 ${
                  selectedAcademicYear?.id === year.id
                    ? 'bg-primary/5 text-primary'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{year.name}</span>
                {year.is_current && (
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Current
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'batchImport':
        return (
          <BatchImport 
            academicYear={academicYearLabel} 
            organizationId={branchProfile?.organization ?? null}
            branchId={branchProfile?.branch ?? null}
          />
        );
      case 'teachers':
        return <Teachers academicYear={academicYearLabel} />;
      case 'parents':
        return <Parents academicYear={academicYearLabel} />;
      case 'students':
        return <Students academicYear={academicYearLabel} />;
      case 'academia':
        return (
          <Academia
            academicYearLabel={academicYearLabel}
            academicYearId={selectedAcademicYear?.id ?? null}
            organizationId={branchProfile?.organization ?? null}
            branchId={branchProfile?.branch ?? null}
            AcademicYearPicker={AcademicYearPicker}
          />
        );
      case 'attendance':
        return (
          <AttendanceDashboard
            academicYear={academicYearLabel}
            sections={mockSections}
            grades={mockGrades}
            teachers={mockTeachers as Teacher[]}
          />
        );
      case 'announcements':
        return <Announcements />;
      case 'calendar':
        return <AcademicCalendar academicYear={academicYearLabel} />;
      default:
        return <Placeholder moduleId={activeModule} />;
    }
  };

  // 1. Premium Loading Overlay during Auth Verification
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mt-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Conditional Login View
  if (!isAuthenticated || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated App Layout
  return (
    <Layout
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      academicYear={academicYearLabel}
      setAcademicYear={() => {}} // controlled via picker now
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
