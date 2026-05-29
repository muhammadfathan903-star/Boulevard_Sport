'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { loginAction, type AuthFormState } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    loginAction,
    null
  )

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#ccff00]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#00f0ff]/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-3xl p-8 md:p-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.4)]">
              <ShoppingBag className="h-7 w-7 text-black" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-white">Selamat Datang!</h1>
            <p className="mt-1 text-sm text-gray-400">
              Masuk ke akun Boulevard Sport kamu
            </p>
          </div>

          {/* Error Message */}
          {state?.message && !state.success && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.message}
            </div>
          )}

          {/* Form */}
          <form action={action} className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="kamu@contoh.com"
              error={state?.errors?.email?.[0]}
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              error={state?.errors?.password?.[0]}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              size="lg"
              loading={pending}
              className="mt-2 w-full"
            >
              {pending ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-bold text-[#ccff00] hover:text-[#b3e600] transition-colors"
            >
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
