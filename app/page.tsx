'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import NeuroFocus from '@/components/NeuroFocus'

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{background:'#07070f',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#ede9e4'}}>Carregando...</div>
  if (!user) return <Auth onLogin={() => supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))} />
  return <NeuroFocus userId={user.id} userEmail={user.email} />
}
