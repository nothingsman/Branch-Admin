/**
 * Premium, glassmorphic Complete Invitation component for Kelem EduGov Branch Admin.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { authApi } from '../../../../src/lib/api';

export default function CompleteInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.uid as string;
  const token = params?.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form input validation checks
  const isMinLength = password.length >= 8;
  const isMatching = password === confirmPassword && password.length > 0;
  const isValidForm = isMinLength && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm) {
      if (!isMinLength) setError('Password must be at least 8 characters.');
      else if (!isMatching) setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.completeInvitation(uid, token, password);
      setIsSuccess(true);
      
      // Deliberately delay navigation slightly to show success checkmark animation
      setTimeout(() => {
        router.push('/?message=Your account has been activated successfully! Please sign in with your new password.');
      }, 2000);
    } catch (err: any) {
      let errMsg = 'Failed to activate your account. The link may have expired or is invalid.';

      // Parse custom error from backend
      if (err.data && typeof err.data === 'object') {
        if (err.data.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
          const firstErr = err.data.errors[0];
          errMsg = String(firstErr.detail || firstErr.message || JSON.stringify(firstErr));
        } else if (err.data.token) {
          errMsg = Array.isArray(err.data.token) ? String(err.data.token[0]) : String(err.data.token);
        } else if (err.data.uid) {
          errMsg = Array.isArray(err.data.uid) ? String(err.data.uid[0]) : String(err.data.uid);
        } else if (err.data.detail) {
          errMsg = String(err.data.detail);
        }
      } else if (err.message) {
        errMsg = String(err.message);
      }

      setError(errMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background font-sans px-4">
      {/* Background Ambient Blur Graphics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/15 blur-[120px] pointer-events-none" />

      {/* Box Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-[460px] z-10"
      >
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/70 border border-border shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2rem] p-8 md:p-10 flex flex-col items-center">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-3 text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 animate-bounce">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight tracking-tight uppercase">
                Kelem Co.
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Activate Your Account
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              /* Success View */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                  <CheckCircle2 className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Account Activated!</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-xs">
                  Your new password is set. Redirecting you to the sign in portal...
                </p>
              </motion.div>
            ) : (
              /* Invitation Form */
              <motion.div
                key="form-container"
                className="w-full"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Error Banner */}
                {error && (
                  <div className="w-full mb-6">
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-semibold text-red-800">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  </div>
                )}

                <p className="text-xs font-medium text-slate-500 text-center mb-6 leading-relaxed">
                  Welcome to the Kelem Branch Administrator team! Please configure your secure password below to activate your administrative privileges.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-input hover:border-slate-300 focus:border-primary text-foreground rounded-xl pl-12 pr-12 py-3.5 text-sm font-semibold outline-none transition-all placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-muted-foreground hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-input hover:border-slate-300 focus:border-primary text-foreground rounded-xl pl-12 pr-12 py-3.5 text-sm font-semibold outline-none transition-all placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 text-muted-foreground hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength/Match Indicators */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMinLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>At least 8 characters long</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMatching ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>Passwords match exactly</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={isValidForm ? { scale: 1.01 } : {}}
                    whileTap={isValidForm ? { scale: 0.99 } : {}}
                    type="submit"
                    disabled={isLoading || !isValidForm}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 mt-8 cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
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
  );
}
