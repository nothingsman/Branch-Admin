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
import { authApi, ApiUser, tokenManager } from './lib/api';
import { ModuleId, Teacher } from './types';
import { mockGrades, mockSections, mockTeachers } from './constants/mockData';
import { Loader2, KeyRound } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [academicYear, setAcademicYear] = useState('AY 2024-25');
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = tokenManager.getAccessToken();
      if (token) {
        try {
          const profile = await authApi.getCurrentUser();
          if (profile.verified_at) {
            setUser(profile);
            setIsAuthenticated(true);
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

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    setActiveModule('dashboard');
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'batchImport':
        return <BatchImport academicYear={academicYear} />;
      case 'teachers':
        return <Teachers academicYear={academicYear} />;
      case 'parents':
        return <Parents academicYear={academicYear} />;
      case 'students':
        return <Students academicYear={academicYear} />;
      case 'academia':
        return <Academia academicYear={academicYear} />;
      case 'attendance':
        return (
          <AttendanceDashboard 
            academicYear={academicYear}
            sections={mockSections}
            grades={mockGrades}
            teachers={mockTeachers as Teacher[]}
          />
        );
      case 'announcements':
        return <Announcements />;
      case 'calendar':
        return <AcademicCalendar academicYear={academicYear} />;
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
    return <Login onLoginSuccess={(u) => {
      setUser(u);
      setIsAuthenticated(true);
    }} />;
  }

  // 3. Authenticated App Layout
  return (
    <Layout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule}
      academicYear={academicYear}
      setAcademicYear={setAcademicYear}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
