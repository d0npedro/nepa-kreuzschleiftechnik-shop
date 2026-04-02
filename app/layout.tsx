import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "NEPA Kreuzschleiftechnik – Hon-Ersatzteile & Schleiftechnik",
    template: "%s | NEPA Kreuzschleiftechnik",
  },
  description:
    "Online-Shop für Hon-Ersatzteile, Kreuzschleifsteine und Schleiftechnik-Zubehör. Finden Sie passende Teile für Ihre Maschine mit unserem Kompatibilitätsfinder.",
  keywords: [
    "Hon-Ersatzteile",
    "Kreuzschleiftechnik",
    "Honleisten",
    "Schleifsteine",
    "NEPA",
    "Honen",
    "Ersatzteile",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
