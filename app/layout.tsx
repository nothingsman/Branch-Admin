import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "../src/index.css"

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Kelem - Branch admin",
  description: "Branch administration dashboard for Kelem Academy",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontSans.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 font-sans text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
