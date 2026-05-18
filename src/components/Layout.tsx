
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ModuleId } from '../types';

interface LayoutProps {
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  activeModule, 
  setActiveModule, 
  academicYear,
  setAcademicYear,
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
        academicYear={academicYear}
        setAcademicYear={setAcademicYear}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-64 transition-all duration-300">
        <Header 
          activeModule={activeModule} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
