
import React from 'react';
import { Box } from 'lucide-react';
import { ModuleId } from '../types';

interface PlaceholderProps {
  moduleId: ModuleId;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ moduleId }) => {
  const titles: Record<ModuleId, string> = {
    dashboard: 'Dashboard',
    parents: 'Parent Management',
    students: 'Students Management',
    teachers: 'Teacher Directory',
    academia: 'Curriculum & Subjects',
    attendance: 'Attendance Tracking',
    calendar: 'Academic Calendar',
    announcements: 'Branch Announcements',
    batchImport: 'Batch Data Import',
  };

  return (
    <div className="p-8 h-full flex items-center justify-center">
      <div className="card-base text-center max-w-lg w-full py-20 bg-white/50 border-dashed border-2 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <Box className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">{titles[moduleId]}</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
          This module is ready for integration. Click "Canvas Ready" to begin building the detailed interface.
        </p>
        <button className="btn-primary px-8">
          Initialize {titles[moduleId]}
        </button>
      </div>
    </div>
  );
};
