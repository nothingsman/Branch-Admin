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
import {
  authApi,
  academiaApi,
  ApiUser,
  AcademicYear,
  BranchAdminProfile,
  tokenManager,
} from './lib/api';
import { ModuleId } from './types';
import { Loader2, KeyRound } from 'lucide-react';

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
      const current = years.find((y) => y.is_current) || years[0] || null;
      setSelectedAcademicYear(current);
    } catch {
      setAcademicYears([]);
      setSelectedAcademicYear(null);
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

  const academicYearLabel = selectedAcademicYear?.name ?? 'No Academic Year';

  // Shared context IDs — passed down to every module that needs them
  const branchId = branchProfile?.branch ?? null;
  const organizationId = branchProfile?.organization ?? null;
  const academicYearId = selectedAcademicYear?.id ?? null;

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;

      case 'batchImport':
        return (
          <BatchImport
            academicYear={academicYearLabel}
            organizationId={organizationId}
            branchId={branchId}
          />
        );

      case 'teachers':
        return (
          <Teachers
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        );

      case 'parents':
        return (
          <Parents
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
          />
        );

      case 'students':
        return (
          <Students
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        );

      case 'academia':
        return (
          <Academia
            academicYearLabel={academicYearLabel}
            academicYearId={academicYearId}
            organizationId={organizationId}
            branchId={branchId}
          />
        );

      case 'attendance':
        return (
          <AttendanceDashboard
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        );

      case 'announcements':
        return (
          <Announcements
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        );

      case 'calendar':
        return <AcademicCalendar academicYear={academicYearLabel} />;

      default:
        return <Placeholder moduleId={activeModule} />;
    }
  };

  // 1. Auth verification loading screen
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

  // 2. Login gate
  if (!isAuthenticated || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated app
  return (
    <Layout
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      academicYear={isLoadingYears ? 'Loading academic year...' : academicYearLabel}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
