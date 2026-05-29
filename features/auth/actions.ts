'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
})

const registerSchema = z.object({
  nama: z.string().min(2, { message: 'Nama minimal 2 karakter.' }).trim(),
  username: z
    .string()
    .min(3, { message: 'Username minimal 3 karakter.' })
    .regex(/^[a-z0-9_]+$/, {
      message: 'Username hanya boleh huruf kecil, angka, dan underscore.',
    })
    .trim(),
  email: z.string().email({ message: 'Email tidak valid.' }).trim(),
  password: z.string().min(8, { message: 'Password minimal 8 karakter.' }),
})

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
} | null

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { message: 'Email atau password salah. Silakan coba lagi.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validated = registerSchema.safeParse({
    nama: formData.get('nama'),
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { nama, username, email, password } = validated.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nama,
        username,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { message: 'Email sudah terdaftar. Silakan login.' }
    }
    return { message: error.message }
  }

  return {
    success: true,
    message:
      'Registrasi berhasil! Silakan cek email untuk verifikasi (jika diperlukan).',
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
