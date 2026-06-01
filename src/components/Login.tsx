/**
 * Premium, glassmorphic Login component for Kelem Branch Admin.
 */

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle,
} from "lucide-react"
import { authApi, ApiError, ApiUser } from "../lib/api"

interface LoginProps {
  onLoginSuccess: (user: ApiUser) => void
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
        // Clear message from url to avoid displaying on refresh
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
      // 1. Authenticate with backend and obtain JWT
      await authApi.login(email.trim(), password)

      // 2. Fetch authenticated profile details
      const user = await authApi.getCurrentUser()

      // 3. Verify user verification status (verified_at !== null)
      if (!user.verified_at) {
        authApi.logout() // Clear tokens immediately
        setError(
          "Your account is currently unverified. Please contact your system administrator to activate your access."
        )
        setIsLoading(false)
        return
      }

      // 4. Success! Propagate profile back to App
      onLoginSuccess(user)
    } catch (err: unknown) {
      setError(getLoginErrorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 font-sans">
      {/* Background Ambient Blur Graphics */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-accent/15 blur-[120px]" />

      {/* Login Box Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Glass Card */}
        <div className="flex flex-col items-center rounded-[2rem] border border-border bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-10">
          {/* Logo & Header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/20">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl leading-tight font-black tracking-tight text-transparent uppercase">
                Kelem
              </h2>
              <p className="mt-1 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Branch Administrator Portal
              </p>
            </div>
          </div>

          {/* Success / Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error-banner"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-6 w-full overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success-banner"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-6 w-full overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="leading-relaxed">{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="pl-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edugov.academy"
                  className="w-full rounded-xl border border-input bg-white py-3.5 pr-4 pl-12 text-sm font-semibold text-foreground transition-all outline-none placeholder:text-muted-foreground hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="pl-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-input bg-white py-3.5 pr-4 pl-12 text-sm font-semibold text-foreground transition-all outline-none placeholder:text-muted-foreground hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="mt-8 flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-4 text-xs font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
