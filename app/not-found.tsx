import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-7xl font-black text-slate-200">404</h1>
      <p className="mt-2 text-lg font-bold text-slate-800">Page not found</p>
      <p className="mt-1 text-sm text-slate-500">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        Back to Home
      </Link>
    </div>
  )
}
