'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { teachersApi } from '../../../../src/lib/api'

export default function CompleteTeacherInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const uid = params?.uid as string
  const token = params?.token as string

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const isMinLength = password.length >= 8
  const isMatching = password === confirmPassword && password.length > 0
  const isValidForm = isMinLength && isMatching

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidForm) {
      if (!isMinLength) setError('Password must be at least 8 characters.')
      else if (!isMatching) setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await teachersApi.completeInvitation(uid, token, password)
      setIsSuccess(true)
      setTimeout(() => {
        router.push(
          '/?message=Your teacher account has been activated successfully. Please sign in with your new password.'
        )
      }, 2000)
    } catch (err: any) {
      let errMsg =
        'Failed to activate your account. The link may have expired or is invalid.'

      if (err.data && typeof err.data === 'object') {
        if (
          err.data.errors &&
          Array.isArray(err.data.errors) &&
          err.data.errors.length > 0
        ) {
          const firstErr = err.data.errors[0]
          errMsg = String(
            firstErr.detail || firstErr.message || JSON.stringify(firstErr)
          )
        } else if (err.data.token) {
          errMsg = Array.isArray(err.data.token)
            ? String(err.data.token[0])
            : String(err.data.token)
        } else if (err.data.uid) {
          errMsg = Array.isArray(err.data.uid)
            ? String(err.data.uid[0])
            : String(err.data.uid)
        } else if (err.data.detail) {
          errMsg = String(err.data.detail)
        }
      } else if (err.message) {
        errMsg = String(err.message)
      }

      setError(errMsg)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 font-sans">
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-accent/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[460px]"
      >
        <div className="flex flex-col items-center rounded-[2rem] border border-border bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-10">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/20">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl leading-tight font-black tracking-tight text-transparent uppercase">
                Kelem Co.
              </h2>
              <p className="mt-1 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Activate Teacher Account
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4 py-6 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-500 shadow-sm">
                  <CheckCircle2 className="h-8 w-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  Account Activated!
                </h3>
                <p className="max-w-xs text-sm font-medium text-muted-foreground">
                  Your password has been set. Redirecting you to sign in...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form-container"
                className="w-full"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {error && (
                  <div className="mb-6 w-full">
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  </div>
                )}

                <p className="mb-6 text-center text-xs leading-relaxed font-medium text-slate-500">
                  Welcome to Kelem EduGov. Set your secure password below to
                  activate your teacher account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="pl-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-input bg-white py-3.5 pr-12 pl-12 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-muted-foreground transition-colors hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="pl-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-input bg-white py-3.5 pr-12 pl-12 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 text-muted-foreground transition-colors hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isMinLength ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span>At least 8 characters long</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isMatching ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span>Passwords match exactly</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={isValidForm ? { scale: 1.01 } : {}}
                    whileTap={isValidForm ? { scale: 0.99 } : {}}
                    type="submit"
                    disabled={isLoading || !isValidForm}
                    className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-4 text-xs font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <span>Activate & Sign In</span>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
