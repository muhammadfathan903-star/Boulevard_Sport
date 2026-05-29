'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// ─── Guard: Admin Only ────────────────────────────────────────────────────────
async function requireAdmin(): Promise<SupabaseClient<any, 'public', any>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as unknown as { role: string } | null

  if (!profile || profile.role !== 'admin') redirect('/dashboard')
  return supabase
}

// ─── Product Schemas ──────────────────────────────────────────────────────────
const productSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter.').trim(),
  harga: z.coerce.number().min(0, 'Harga tidak boleh negatif.'),
  deskripsi: z.string().trim().optional(),
  foto_url: z.string().url('URL foto tidak valid.').or(z.literal('')).optional(),
  kategori_id: z.string().uuid('Kategori tidak valid.').or(z.literal('')).optional(),
})

export type ProductFormState = {
  errors?: Record<string, string[]>
  message?: string
} | null

// ─── Create Product ───────────────────────────────────────────────────────────
export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await requireAdmin()

  const validated = productSchema.safeParse({
    nama: formData.get('nama'),
    harga: formData.get('harga'),
    deskripsi: formData.get('deskripsi') || undefined,
    foto_url: formData.get('foto_url') || undefined,
    kategori_id: formData.get('kategori_id') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  let { nama, harga, deskripsi, foto_url, kategori_id } = validated.data

  // Handle File Upload
  const file = formData.get('foto_file') as File | null
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('products')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      return { message: `Gagal mengunggah foto: ${uploadError.message}` }
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(uploadData.path)

    foto_url = publicUrlData.publicUrl
  }

  const { error } = await supabase.from('products').insert({
    nama,
    harga,
    deskripsi: deskripsi || null,
    foto_url: foto_url || null,
    kategori_id: kategori_id || null,
  } as any)

  if (error) return { message: `Gagal membuat produk: ${error.message}` }

  revalidatePath('/admin/products')
  revalidatePath('/')
  redirect('/admin/products')
}

// ─── Update Product ───────────────────────────────────────────────────────────
export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await requireAdmin()

  const validated = productSchema.safeParse({
    nama: formData.get('nama'),
    harga: formData.get('harga'),
    deskripsi: formData.get('deskripsi') || undefined,
    foto_url: formData.get('foto_url') || undefined,
    kategori_id: formData.get('kategori_id') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  let { nama, harga, deskripsi, foto_url, kategori_id } = validated.data

  // Handle File Upload
  const file = formData.get('foto_file') as File | null
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('products')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      return { message: `Gagal mengunggah foto: ${uploadError.message}` }
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(uploadData.path)

    foto_url = publicUrlData.publicUrl
  }

  const { error } = await supabase
    .from('products')
    .update({
      nama,
      harga,
      deskripsi: deskripsi || null,
      foto_url: foto_url || null,
      kategori_id: kategori_id || null,
    } as any)
    .eq('id', id)

  if (error) return { message: `Gagal memperbarui produk: ${error.message}` }

  revalidatePath('/admin/products')
  revalidatePath('/')
  redirect('/admin/products')
}

// ─── Delete Product ───────────────────────────────────────────────────────────
export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin()

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: `Gagal menghapus produk: ${error.message}` }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return {}
}

// ─── Category Actions ─────────────────────────────────────────────────────────
const categorySchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter.').trim(),
})

export type CategoryFormState = {
  errors?: Record<string, string[]>
  message?: string
} | null

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const supabase = await requireAdmin()

  const validated = categorySchema.safeParse({ nama: formData.get('nama') })
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors }

  const { error } = await supabase
    .from('categories')
    .insert({ nama: validated.data.nama } as any)

  if (error) {
    if (error.message.includes('unique')) {
      return { message: 'Kategori dengan nama ini sudah ada.' }
    }
    return { message: `Gagal membuat kategori: ${error.message}` }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/produk')
  return {}
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: `Gagal menghapus kategori: ${error.message}` }
  revalidatePath('/admin/categories')
  revalidatePath('/produk')
  return {}
}

// ─── Inventory Actions ────────────────────────────────────────────────────────
const inventorySchema = z.object({
  product_id: z.string().uuid(),
  ukuran: z.string().min(1, 'Ukuran wajib diisi.').trim(),
  stok: z.coerce.number().min(0, 'Stok tidak boleh negatif.'),
  batas_minimum: z.coerce.number().min(0),
})

export type InventoryFormState = {
  errors?: Record<string, string[]>
  message?: string
} | null

export async function upsertInventoryAction(
  _prevState: InventoryFormState,
  formData: FormData
): Promise<InventoryFormState> {
  const supabase = await requireAdmin()

  const validated = inventorySchema.safeParse({
    product_id: formData.get('product_id'),
    ukuran: formData.get('ukuran'),
    stok: formData.get('stok'),
    batas_minimum: formData.get('batas_minimum'),
  })

  if (!validated.success) return { errors: validated.error.flatten().fieldErrors }

  const { product_id, ukuran, stok, batas_minimum } = validated.data

  const { error } = await supabase
    .from('inventory')
    .upsert({ product_id, ukuran, stok, batas_minimum } as any, { onConflict: 'product_id,ukuran' })

  if (error) return { message: `Gagal menyimpan inventori: ${error.message}` }

  revalidatePath('/admin/inventory')
  revalidatePath(`/produk/${product_id}`)
  return {}
}

export async function updateStockAction(
  inventoryId: string,
  stok: number
): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('inventory')
    .update({ stok } as any)
    .eq('id', inventoryId)
  if (error) return { error: error.message }
  revalidatePath('/admin/inventory')
  return {}
}

export async function deleteInventoryAction(id: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('inventory').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/inventory')
  return {}
}

// ─── Order Status Action ──────────────────────────────────────────────────────
import type { OrderStatus } from '@/types/database'

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('orders')
    .update({ status } as any)
    .eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath('/admin/orders')
  revalidatePath('/orders')
  return {}
}
