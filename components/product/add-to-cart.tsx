'use client'

import { useState, useTransition } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import type { Inventory } from '@/types/database'
import { addToCartAction } from '@/features/cart/actions'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

interface AddToCartProps {
  inventory: Inventory[]
}

export function AddToCart({ inventory }: AddToCartProps) {
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const { toast } = useToast()

  const inStock = inventory.some((inv) => inv.stok > 0)
  const selectedInv = inventory.find((inv) => inv.id === selectedInvId)

  function handleAdd() {
    if (!selectedInvId) {
      toast('Pilih ukuran terlebih dahulu.', 'warning')
      return
    }
    if (!selectedInv || selectedInv.stok === 0) {
      toast('Stok ukuran ini habis.', 'error')
      return
    }

    startTransition(async () => {
      const result = await addToCartAction(selectedInvId, 1)
      if (result.error) {
        toast(result.error, 'error')
      } else {
        toast('Berhasil ditambahkan ke keranjang!', 'success')
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Size selector */}
      {inventory.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-400">
            Pilih Ukuran
          </p>
          <div className="flex flex-wrap gap-2">
            {inventory.map((inv) => {
              const isSelected = selectedInvId === inv.id
              const outOfStock = inv.stok === 0
              return (
                <button
                  key={inv.id}
                  disabled={outOfStock}
                  onClick={() => setSelectedInvId(inv.id)}
                  className={`flex min-w-[60px] flex-col items-center rounded-xl border px-3 py-2 text-center transition-all ${
                    isSelected
                      ? 'border-[#ccff00] bg-[#ccff00]/20 text-white shadow-lg shadow-[#ccff00]/20'
                      : outOfStock
                        ? 'border-white/5 bg-white/[0.02] text-gray-600 opacity-40 cursor-not-allowed'
                        : 'border-white/15 bg-white/5 text-white hover:border-[#ccff00]/50'
                  }`}
                >
                  <span className="text-sm font-semibold">{inv.ukuran}</span>
                  <span className="text-[10px] text-gray-400">{inv.stok} pcs</span>
                  {inv.stok > 0 && inv.stok <= inv.batas_minimum && (
                    <span className="text-[9px] text-yellow-500">hampir habis</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <Button
        size="lg"
        onClick={handleAdd}
        loading={isPending}
        disabled={!inStock || isPending}
        className="w-full gap-2"
        id="add-to-cart-btn"
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Ditambahkan!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            {inStock ? 'Tambah ke Keranjang' : 'Stok Habis'}
          </>
        )}
      </Button>
    </div>
  )
}
