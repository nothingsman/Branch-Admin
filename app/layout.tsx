import type { Metadata } from "next"
import "../src/index.css"

export const metadata: Metadata = {
  title: "kelem.co Branch admin",
  description: "Branch administration dashboard for EduGov Academy",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
