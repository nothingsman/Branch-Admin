"use client"

import React, { useState, useEffect } from "react"
import { motion } from "motion/react"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { authApi, ApiError, ApiUser } from "../lib/api"
import { LegalModal, TermsOfService, PrivacyPolicy } from "./LegalModal"

interface LoginProps {
  onLoginSuccess: (user: ApiUser) => void
  resetSuccess?: boolean
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, resetSuccess }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  useEffect(() => {
    if (!error) return

    const timeoutId = window.setTimeout(() => {
      setError(null)
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [error])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const msg = params.get("message")
      if (msg) {
        setSuccess(msg)
        const url = new URL(window.location.href)
        url.searchParams.delete("message")
        window.history.replaceState({}, "", url.pathname)
      }
    }
  }, [])

  const getLoginErrorMessage = (err: unknown) => {
    const invalidCredentialsMessage =
      "Invalid email or password. Please try again."
    const unreachableBackendMessage = "Network error, try again later."

    if (err instanceof ApiError) {
      if (err.status === 400 || err.status === 401) {
        return invalidCredentialsMessage
      }

      if (err.status === 0) {
        return unreachableBackendMessage
      }

      if (err.data && typeof err.data === "object") {
        const errorData = err.data as Record<string, unknown>

        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const firstError = errorData.errors[0] as Record<string, unknown>
          if (firstError.code === "no_active_account") {
            return invalidCredentialsMessage
          }
          if (
            typeof firstError.detail === "string" &&
            firstError.detail.trim()
          ) {
            return firstError.detail
          }
        }

        if (
          Array.isArray(errorData.non_field_errors) &&
          errorData.non_field_errors[0]
        ) {
          return String(errorData.non_field_errors[0])
        }

        if (typeof errorData.detail === "string" && errorData.detail.trim()) {
          return errorData.detail
        }
      }

      if (typeof err.message === "string") {
        const normalizedMessage = err.message.toLowerCase()
        if (
          normalizedMessage.includes("failed to fetch") ||
          normalizedMessage.includes("network error") ||
          normalizedMessage.includes("load failed")
        ) {
          return unreachableBackendMessage
        }
      }

      return err.message || "Unable to sign in right now. Please try again."
    }

    if (err instanceof Error) {
      const normalizedMessage = err.message.toLowerCase()
      if (
        normalizedMessage.includes("failed to fetch") ||
        normalizedMessage.includes("network error") ||
        normalizedMessage.includes("load failed")
      ) {
        return unreachableBackendMessage
      }

      return err.message || "Unable to sign in right now. Please try again."
    }

    return "Unable to sign in right now. Please try again."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await authApi.login(email.trim(), password)

      const user = await authApi.getCurrentUser()

      if (!user.verified_at) {
        authApi.logout()
        setError(
          "Your account is currently unverified. Please contact your system administrator to activate your access."
        )
        setIsLoading(false)
        return
      }

      onLoginSuccess(user)
    } catch (err: unknown) {
      setError(getLoginErrorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left hero panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1A237E] to-[#283593] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=1200&fit=crop&q=80"
            alt="Administrator workspace"
            className="object-cover w-full h-full opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A237E]/95 via-[#1A237E]/60 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-3xl font-semibold mb-4">Welcome back, administrator</h2>
          <p className="max-w-md text-base text-blue-200 md:text-lg">
            Sign in to manage branches, oversee academic operations, and
            coordinate with your team.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-blue-300">
            <span>Photo by</span>
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Unsplash
            </a>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">
                Branch admin login
              </h1>
              <p className="text-slate-600">
                Use your administrator credentials.
              </p>
            </div>

            {resetSuccess && (
              <div className="mb-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                  <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-800 flex-1">
                    Your password has been reset! You can now login with your new password.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6">
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                  <AlertCircle
                    size={18}
                    className="text-rose-500 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-rose-800 flex-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                  <CheckCircle
                    size={18}
                    className="text-emerald-500 mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-emerald-800 flex-1">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A237E] transition-all text-sm bg-slate-50 focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A237E] transition-all text-sm bg-slate-50 focus:bg-white disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-[#1A237E] hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1A237E] text-white font-medium hover:bg-blue-900 transition disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Sign in"}
                <LogIn size={18} />
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              By clicking continue, you agree to our{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="underline hover:text-slate-700 font-medium"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="underline hover:text-slate-700 font-medium"
              >
                Privacy Policy
              </button>
              .
            </p>
          </motion.div>
        </div>
      </div>

      <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        <TermsOfService />
      </LegalModal>

      <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <PrivacyPolicy />
      </LegalModal>
    </div>
  )
}
