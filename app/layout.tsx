import type { Metadata } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ToastProvider } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const fontHeading = Syne({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans-custom',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Boulevard Sport – Premium Sports Gear',
    template: '%s | Boulevard Sport',
  },
  description: 'Premium sports gear for peak performance.',
  keywords: ['sports', 'gear', 'apparel', 'boulevard sport'],
  openGraph: {
    title: 'Boulevard Sport',
    description: 'Premium sports gear',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={cn(fontHeading.variable, fontSans.variable)}>
      <body className="min-h-screen bg-[#050505] text-white antialiased selection:bg-[#ccff00] selection:text-black">
        <ToastProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  )
}
