import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tinggi, berat, gender, jenis } = body

    if (!tinggi || !berat || !gender || !jenis) {
      return NextResponse.json(
        { error: 'Semua kolom (tinggi, berat, gender, jenis produk) harus diisi.' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server belum dikonfigurasi untuk AI (GEMINI_API_KEY hilang). Tambahkan API Key di file .env.local' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
Kamu adalah ahli fashion olahraga (sports wear fashion assistant).
Berdasarkan data pengguna berikut:
- Tinggi Badan: ${tinggi} cm
- Berat Badan: ${berat} kg
- Jenis Kelamin: ${gender}
- Jenis Produk yang Ingin Dibeli: ${jenis}

Berikan rekomendasi ukuran yang paling ideal untuk produk olahraga tersebut. 
Aturan jawaban:
1. Sebutkan ukuran yang direkomendasikan secara eksplisit di awal (misalnya: S, M, L, XL, atau ukuran sepatu seperti 39, 40, 41, dst).
2. Berikan alasan singkat mengapa ukuran tersebut cocok (berdasarkan BMI atau rasio tubuh standar).
3. Tambahkan saran 'fit' (misalnya: regular fit, slim fit, atau snug fit).
4. Jawab dalam 2-3 kalimat pendek saja. Jangan terlalu panjang.
5. Gunakan bahasa Indonesia yang ramah, profesional, dan sporty.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ recommendation: text })
  } catch (error: any) {
    console.error('Error generating AI size recommendation:', error)
    return NextResponse.json(
      { error: 'Gagal mendapatkan rekomendasi AI. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
