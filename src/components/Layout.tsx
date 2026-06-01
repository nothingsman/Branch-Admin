import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { ModuleId } from "../types"
import { ApiUser } from "../lib/api"

interface LayoutProps {
  activeModule: ModuleId
  setActiveModule: (module: ModuleId) => void
  academicYear: string
  schoolName?: string | null
  branchName?: string | null
  user: ApiUser
  onLogout: () => void
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({
  activeModule,
  setActiveModule,
  academicYear,
  schoolName,
  branchName,
  user,
  onLogout,
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        academicYear={academicYear}
        schoolName={schoolName}
        branchName={branchName}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={onLogout}
      />
      <main className="flex h-screen flex-1 flex-col overflow-hidden transition-all duration-300 lg:ml-[17rem]">
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
  )
}
