'use client'

import { useState } from 'react'
import { Sparkles, X, Ruler, Scale, User, Box, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SizeRecommendation() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [history, setHistory] = useState<{ id: number; text: string; data: any }[]>([])

  // Helper untuk parse simple markdown **bold**
  const renderMarkdown = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      tinggi: formData.get('tinggi'),
      berat: formData.get('berat'),
      gender: formData.get('gender'),
      jenis: formData.get('jenis'),
    }

    try {
      const res = await fetch('/api/ai-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Terjadi kesalahan pada server AI.')
      }

      setResult(json.recommendation)
      setHistory(prev => [{ id: Date.now(), text: json.recommendation, data }, ...prev])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ccff00] to-[#00f0ff] p-1 pr-4 text-sm font-semibold text-white shadow-lg shadow-[#ccff00]/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#ccff00]/40 active:scale-95"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        Cek Ukuran AI
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Modal Content */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="relative shrink-0 bg-gradient-to-br from-[#ccff00]/20 to-[#00f0ff]/20 p-6 text-center border-b border-white/5">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-black/20 p-2 text-gray-400 hover:bg-black/40 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ccff00] to-[#00f0ff] shadow-lg shadow-[#ccff00]/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">AI Size Guide</h2>
              <p className="mt-1 text-sm text-gray-400">
                Dapatkan rekomendasi ukuran paling pas untuk Anda.
              </p>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 scrollbar-hide">
              {!result && !loading ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                        <Ruler className="h-4 w-4 text-gray-500" /> Tinggi (cm)
                      </label>
                      <input
                        type="number"
                        name="tinggi"
                        required
                        min="100"
                        max="250"
                        placeholder="170"
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-all focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                        <Scale className="h-4 w-4 text-gray-500" /> Berat (kg)
                      </label>
                      <input
                        type="number"
                        name="berat"
                        required
                        min="30"
                        max="200"
                        placeholder="65"
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-all focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                      <User className="h-4 w-4 text-gray-500" /> Gender
                    </label>
                    <select
                      name="gender"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition-all focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                      <option value="Unisex">Unisex / Bebas</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                      <Box className="h-4 w-4 text-gray-500" /> Kategori Produk
                    </label>
                    <select
                      name="jenis"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition-all focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50"
                    >
                      <option value="Baju Olahraga (Atasan)">Baju Olahraga (Atasan)</option>
                      <option value="Celana Olahraga (Bawahan)">Celana Olahraga (Bawahan)</option>
                      <option value="Sepatu Olahraga">Sepatu Olahraga</option>
                      <option value="Jaket Olahraga">Jaket Olahraga</option>
                    </select>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="mt-2 w-full bg-gradient-to-r from-[#ccff00] to-[#00f0ff] hover:from-orange-600 hover:to-rose-600 py-6 text-base"
                    disabled={loading}
                  >
                    Dapatkan Rekomendasi
                  </Button>
                </form>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#ccff00] animate-spin"></div>
                    <Sparkles className="h-6 w-6 text-[#ccff00] animate-pulse" />
                  </div>
                  <p className="mt-4 animate-pulse font-medium text-[#ccff00]">Gemini sedang menganalisa ukuranmu...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-4 rounded-2xl bg-[#ccff00]/10 p-6 border border-[#ccff00]/20 w-full text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full pointer-events-none" />
                    <p className="text-base leading-relaxed text-gray-200 relative z-10 whitespace-pre-wrap">
                      {renderMarkdown(result!)}
                    </p>
                  </div>
                  <Button
                    onClick={() => setResult(null)}
                    variant="secondary"
                    className="w-full"
                  >
                    Cek Ukuran Lain
                  </Button>
                </div>
              )}

              {/* History Section */}
              {!result && !loading && history.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Riwayat Rekomendasi
                  </h3>
                  <div className="flex flex-col gap-3">
                    {history.map((h) => (
                      <div key={h.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left">
                        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                          <span className="rounded bg-white/10 px-1.5 py-0.5">{h.data.tinggi}cm / {h.data.berat}kg</span>
                          <span className="rounded bg-white/10 px-1.5 py-0.5">{h.data.jenis}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{renderMarkdown(h.text)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
