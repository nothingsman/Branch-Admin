import { ApiError } from "./api"

/**
 * Formats an error from the forgot-password / reset-password flow.
 */
export function formatAuthError(err: unknown): string {
  const status = err instanceof ApiError ? err.status : null
  const msg =
    (err instanceof ApiError
      ? err.message
      : err instanceof Error
        ? err.message
        : String(err ?? "")) ?? ""

  const normalized = msg.toLowerCase()

  if (status === 0 || /network|failed to fetch|load failed/i.test(normalized)) {
    return "Unable to reach the server. Check your internet connection and try again."
  }

  if (status === 400) {
    if (/not found/i.test(normalized) || /no active account/i.test(normalized)) {
      return "Account not found with that email address."
    }
    if (/already in use/i.test(normalized)) {
      return "This email is already associated with an account."
    }
    return msg || "Invalid request. Please check your input and try again."
  }

  if (status === 401) {
    return "Invalid or expired reset link. Please request a new password reset."
  }

  if (status === 404) {
    return "Account not found with that email address."
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment before trying again."
  }

  if (status !== null && status >= 500) {
    return "Something went wrong on our end. Please try again later."
  }

  if (msg && !looksTechnical(msg)) {
    return msg
  }

  return "Something unexpected happened. Please try again."
}

/**
 * Validates a password against frontend rules:
 * - at least 8 characters
 * - at least one uppercase letter
 * - at least one lowercase letter
 * - at least one number
 * - at least one special character
 */
export function validatePassword(
  password: string,
): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." }
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter.",
    }
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter.",
    }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number." }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character.",
    }
  }
  return { valid: true }
}

function looksTechnical(msg: string): boolean {
  const patterns = [
    /^Unexpected token/i,
    /^JSON\.parse/i,
    /^Cannot read/i,
    /is not defined/i,
    /networkerror/i,
    /failed to fetch/i,
    /load failed/i,
    /status \d+/i,
    /<html/i,
    /<!doctype/i,
    /internal server error/i,
    /traceback/i,
  ]
  return patterns.some((re) => re.test(msg))
}
