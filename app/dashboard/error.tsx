'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="glass max-w-md rounded-3xl p-10">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">
          Gagal Memuat Dashboard
        </h2>
        <p className="mb-8 text-sm text-gray-400">
          Terjadi kesalahan saat memuat data. Silakan coba lagi.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
          <Link href="/">
            <Button variant="ghost" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
