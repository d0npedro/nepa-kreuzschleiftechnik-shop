import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"

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
    <html lang="de" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
