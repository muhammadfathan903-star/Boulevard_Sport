'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Application error:', error)
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
          Terjadi Kesalahan
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-gray-400">
          {error.message || 'Sesuatu yang tidak diharapkan terjadi. Silakan coba lagi.'}
        </p>
        <Button onClick={reset} className="w-full gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    </div>
  )
}
