/**
 * Premium, glassmorphic Login component for Kelem EduGov Branch Admin.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, AlertCircle, Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { authApi, ApiUser } from '../lib/api';

interface LoginProps {
  onLoginSuccess: (user: ApiUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const msg = params.get('message');
      if (msg) {
        setSuccess(msg);
        // Clear message from url to avoid displaying on refresh
        const url = new URL(window.location.href);
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.pathname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Authenticate with backend and obtain JWT
      await authApi.login(email.trim(), password);

      // 2. Fetch authenticated profile details
      const user = await authApi.getCurrentUser();

      // 3. Verify user verification status (verified_at !== null)
      if (!user.verified_at) {
        authApi.logout(); // Clear tokens immediately
        setError('Your account is currently unverified. Please contact your system administrator to activate your access.');
        setIsLoading(false);
        return;
      }

      // 4. Success! Propagate profile back to App
      onLoginSuccess(user);
    } catch (err: any) {
      // Handle various Djoser error formats
      let errMsg = 'Unable to connect to the authentication server. Please check your internet connection.';
      
      if (err.status === 400 || err.status === 401) {
        errMsg = 'Invalid email address or password. Please verify and try again.';
      } else if (err.message && (
        err.message.toLowerCase().includes('failed to fetch') || 
        err.message.toLowerCase().includes('network error') ||
        err.message.toLowerCase().includes('load failed')
      )) {
        errMsg = 'Authentication failed. Please verify that your email and password are correct and that the backend is running at http://localhost:8000.';
      } else if (err.message) {
        errMsg = typeof err.message === 'object' 
          ? (err.message.detail || JSON.stringify(err.message)) 
          : String(err.message);
      }
      
      // Parse field-specific validation errors from Djoser if present
      if (err.data && typeof err.data === 'object') {
        if (err.data.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
          const firstErr = err.data.errors[0];
          if (firstErr.code === 'no_active_account') {
            errMsg = 'Incorrect email or password';
          } else {
            errMsg = firstErr.detail ? String(firstErr.detail) : JSON.stringify(firstErr);
          }
        } else {
          const firstErrorKey = Object.keys(err.data)[0];
          if (firstErrorKey && Array.isArray(err.data[firstErrorKey])) {
            const firstErrorVal = err.data[firstErrorKey][0];
            errMsg = typeof firstErrorVal === 'object' ? JSON.stringify(firstErrorVal) : String(firstErrorVal);
          } else if (err.data.detail) {
            if (typeof err.data.detail === 'object') {
              errMsg = err.data.detail.detail ? String(err.data.detail.detail) : JSON.stringify(err.data.detail);
            } else {
              errMsg = String(err.data.detail);
            }
          } else if (err.data.non_field_errors) {
            errMsg = String(err.data.non_field_errors[0]);
          }
        }
      }

      // Final fallback to guarantee errMsg is a string and not a React child object
      if (typeof errMsg === 'object' && errMsg !== null) {
        errMsg = (errMsg as any).detail || JSON.stringify(errMsg);
      } else {
        errMsg = String(errMsg);
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

      {/* Login Box Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-[440px] z-10"
      >
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/70 border border-border shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2rem] p-8 md:p-10 flex flex-col items-center">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-3 text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight tracking-tight uppercase">
                Kelem Co.
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
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
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-6 overflow-hidden"
              >
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-semibold text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success-banner"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-6 overflow-hidden"
              >
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-semibold text-emerald-800">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="leading-relaxed">{success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edugov.academy"
                  className="w-full bg-white border border-input hover:border-slate-300 focus:border-primary text-foreground rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none transition-all placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-input hover:border-slate-300 focus:border-primary text-foreground rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none transition-all placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 mt-8 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
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
  );
};
