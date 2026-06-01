/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Layout } from "./components/Layout"
import { Dashboard } from "./components/Dashboard"
import { BatchImport } from "./components/BatchImport"
import { Teachers } from "./components/Teachers"
import { Parents } from "./components/Parents"
import { Academia } from "./components/Academia"
import { AttendanceDashboard } from "./components/AttendanceDashboard"
import { Announcements } from "./components/Announcements"
import { AcademicCalendar } from "./components/AcademicCalendar"
import { Students } from "./components/Students"
import { Placeholder } from "./components/Placeholder"
import { Login } from "./components/Login"
import {
  authApi,
  academiaApi,
  branchesApi,
  ApiUser,
  AcademicYear,
  BranchAdminProfile,
  tokenManager,
} from "./lib/api"
import { ModuleId } from "./types"
import { Loader2 } from "lucide-react"

export default function App() {
  const searchParams = useSearchParams()
  const reset = searchParams.get("reset") === "true"
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard")
  const [user, setUser] = useState<ApiUser | null>(null)
  const [branchProfile, setBranchProfile] = useState<BranchAdminProfile | null>(
    null
  )
  const [schoolName, setSchoolName] = useState<string | null>(null)
  const [branchName, setBranchName] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Academic year context
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState<AcademicYear | null>(null)
  const [isLoadingYears, setIsLoadingYears] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const accessToken = tokenManager.getAccessToken()
      const refreshToken = tokenManager.getRefreshToken()

      if (!accessToken && refreshToken) {
        const didRefresh = await authApi.refreshSession()
        if (!didRefresh) {
          authApi.logout()
        }
      }

      if (tokenManager.getAccessToken()) {
        try {
          const profile = await authApi.getCurrentUser()
          if (profile.verified_at) {
            setUser(profile)
            setIsAuthenticated(true)
            await loadBranchContext()
          } else {
            authApi.logout()
          }
        } catch {
          authApi.logout()
        }
      }
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [])

  async function loadBranchContext() {
    try {
      const profile = await authApi.getBranchAdminProfile()
      if (profile) {
        setBranchProfile(profile)
        const [branch, fetchedSchoolName] = await Promise.all([
          branchesApi.getBranch(profile.branch),
          branchesApi.getSchoolName(profile.branch),
          loadAcademicYears(profile.branch),
        ])
        setSchoolName(
          fetchedSchoolName ?? profile.organization_name ?? branch.name ?? null
        )
        setBranchName(branch.name)
      } else {
        setSchoolName(null)
        setBranchName(null)
      }
    } catch {
      // non-fatal — branch context will be null
      setSchoolName(null)
      setBranchName(null)
    }
  }

  async function loadAcademicYears(branchId: string) {
    setIsLoadingYears(true)
    try {
      const years = await academiaApi.getAcademicYears(branchId)
      setAcademicYears(years)
      const current = years.find((y) => y.is_current) || years[0] || null
      setSelectedAcademicYear(current)
    } catch {
      setAcademicYears([])
      setSelectedAcademicYear(null)
    } finally {
      setIsLoadingYears(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    setUser(null)
    setBranchProfile(null)
    setSchoolName(null)
    setBranchName(null)
    setAcademicYears([])
    setSelectedAcademicYear(null)
    setIsAuthenticated(false)
    setActiveModule("dashboard")
  }

  const handleLoginSuccess = async (u: ApiUser) => {
    setUser(u)
    setIsAuthenticated(true)
    await loadBranchContext()
  }

  const academicYearLabel = selectedAcademicYear?.name ?? "No Academic Year"
  const resolvedSchoolName = schoolName ?? branchProfile?.organization_name ?? null
  const resolvedBranchName = branchName ?? branchProfile?.branch_name ?? null

  // Shared context IDs — passed down to every module that needs them
  const branchId = branchProfile?.branch ?? null
  const organizationId = branchProfile?.organization ?? null
  const academicYearId = selectedAcademicYear?.id ?? null

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />

      case "batchImport":
        return (
          <BatchImport
            academicYear={academicYearLabel}
            organizationId={organizationId}
            branchId={branchId}
          />
        )

      case "teachers":
        return (
          <Teachers
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        )

      case "parents":
        return (
          <Parents
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
          />
        )

      case "students":
        return (
          <Students
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        )

      case "academia":
        return (
          <Academia
            academicYearLabel={academicYearLabel}
            academicYearId={academicYearId}
            organizationId={organizationId}
            branchId={branchId}
          />
        )

      case "attendance":
        return (
          <AttendanceDashboard
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        )

      case "announcements":
        return (
          <Announcements
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        )

      case "calendar":
        return (
          <AcademicCalendar
            academicYear={academicYearLabel}
            branchId={branchId}
            organizationId={organizationId}
            academicYearId={academicYearId}
          />
        )

      default:
        return <Placeholder moduleId={activeModule} />
    }
  }

  // 1. Auth verification loading screen
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
            Loading
          </p>
        </div>
      </div>
    )
  }

  // 2. Login gate
  if (!isAuthenticated || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} resetSuccess={reset} />
  }

  // 3. Authenticated app
  return (
    <Layout
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      academicYear={
        isLoadingYears ? "Loading academic year..." : academicYearLabel
      }
      schoolName={resolvedSchoolName}
      branchName={resolvedBranchName}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  )
}
