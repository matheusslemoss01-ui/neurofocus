import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ uses: 0 })
  const { data } = await supabase.from('users').select('conversations_used').eq('id', userId).single()
  return NextResponse.json({ uses: data?.conversations_used || 0 })
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ ok: false })
  const { data } = await supabase.from('users').select('conversations_used').eq('id', userId).single()
  const current = data?.conversations_used || 0
  if (current === 0) {
    await supabase.from('users').insert({ id: userId, conversations_used: 1 })
  } else {
    await supabase.from('users').update({ conversations_used: current + 1 }).eq('id', userId)
  }
  return NextResponse.json({ uses: current + 1 })
}
