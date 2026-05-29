'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Add to Cart ──────────────────────────────────────────────────────────────
export async function addToCartAction(
  inventoryId: string,
  jumlah: number = 1
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/produk')
  }

  // Check inventory stock
  const { data } = await supabase
    .from('inventory')
    .select('stok')
    .eq('id', inventoryId)
    .single()

  const inv = data as unknown as { stok: number } | null

  if (!inv) return { error: 'Varian produk tidak ditemukan.' }
  if (inv.stok < jumlah) return { error: 'Stok tidak mencukupi.' }

  // Check if item already in cart
  const { data: existingData } = await supabase
    .from('cart_items')
    .select('id, jumlah')
    .eq('user_id', user.id)
    .eq('inventory_id', inventoryId)
    .single()

  const existing = existingData as unknown as { id: string, jumlah: number } | null

  if (existing) {
    const newQty = existing.jumlah + jumlah
    if (newQty > (inv.stok as number)) {
      return { error: `Stok tersedia hanya ${inv.stok} pcs.` }
    }
    const { error } = await supabase
      .from('cart_items')
      .update({ jumlah: newQty } as any)
      .eq('id', existing.id)
    if (error) return { error: 'Gagal memperbarui keranjang.' }
  } else {
    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      inventory_id: inventoryId,
      jumlah,
    } as any)
    if (error) return { error: 'Gagal menambahkan ke keranjang.' }
  }

  revalidatePath('/cart')
  return { success: true }
}

// ─── Update Quantity ─────────────────────────────────────────────────────────
export async function updateCartQuantityAction(
  cartItemId: string,
  jumlah: number
): Promise<{ error?: string }> {
  if (jumlah < 1) return { error: 'Jumlah minimal 1.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi.' }

  // Verify cart item belongs to user and check stock
  const { data: item } = await supabase
    .from('cart_items')
    .select('id, inventory_id, inventory(stok)')
    .eq('id', cartItemId)
    .eq('user_id', user.id)
    .single()

  if (!item) return { error: 'Item tidak ditemukan.' }

  const stok = (item.inventory as unknown as { stok: number } | null)?.stok ?? 0
  if (jumlah > stok) return { error: `Stok tersedia hanya ${stok} pcs.` }

  const { error } = await supabase
    .from('cart_items')
    .update({ jumlah } as any)
    .eq('id', cartItemId)
    .eq('user_id', user.id)

  if (error) return { error: 'Gagal memperbarui jumlah.' }

  revalidatePath('/cart')
  return {}
}

// ─── Remove from Cart ────────────────────────────────────────────────────────
export async function removeFromCartAction(
  cartItemId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi.' }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id)

  if (error) return { error: 'Gagal menghapus item.' }

  revalidatePath('/cart')
  return {}
}

// ─── Clear Cart ──────────────────────────────────────────────────────────────
export async function clearCartAction(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('cart_items').delete().eq('user_id', user.id)
  revalidatePath('/cart')
}

// ─── Get Cart Count (for badge) ──────────────────────────────────────────────
export async function getCartCountAction(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return count ?? 0
}
