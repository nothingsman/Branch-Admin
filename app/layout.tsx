import type { Metadata } from "next"
import "../src/index.css"

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
