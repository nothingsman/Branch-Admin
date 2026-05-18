/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
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
import { ModuleId, Teacher } from './types';
import { mockGrades, mockSections, mockTeachers } from './constants/mockData';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [academicYear, setAcademicYear] = useState('AY 2024-25');

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

  return (
    <Layout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule}
      academicYear={academicYear}
      setAcademicYear={setAcademicYear}
    >
      {renderContent()}
    </Layout>
  );
}
