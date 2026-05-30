import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'missing'
  
  let fetchError = null
  let productsCount = null

  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      fetchError = error.message
    } else {
      productsCount = count
    }
  } catch (err: any) {
    fetchError = err.message
  }

  return NextResponse.json({
    supabaseUrl,
    supabaseAnonKey,
    productsCount,
    fetchError,
    nodeEnv: process.env.NODE_ENV
  })
}
