'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handle = async () => {
    setLoading(true); setError('')
    const { error } = isLogin ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    if (error) setError(error.message); else onLogin()
    setLoading(false)
  }
  return (
    <div style={{position:'fixed',inset:0,background:'#07070f',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{background:'#0d0d1e',border:'1px solid rgba(255,255,255,0.07)',borderRadius:24,padding:'2rem',width:'100%',maxWidth:400}}>
        <div style={{fontSize:10,color:'#e8294a',textTransform:'uppercase',marginBottom:8}}>NeuroFocus</div>
        <div style={{fontSize:'1.75rem',marginBottom:4,color:'#ede9e4'}}>{isLogin ? 'Entrar' : 'Criar conta'}</div>
        <div style={{fontSize:13,color:'#7070a0',marginBottom:24}}>{isLogin ? 'Acesse sua conta' : 'Crie sua conta gratis'}</div>
        <input type='email' placeholder='seu@email.com' value={email} onChange={e => setEmail(e.target.value)} style={{width:'100%',background:'#121228',border:'1.5px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'11px 14px',fontSize:13,color:'#ede9e4',outline:'none',marginBottom:10,boxSizing:'border-box'}} />
        <input type='password' placeholder='Senha' value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} style={{width:'100%',background:'#121228',border:'1.5px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'11px 14px',fontSize:13,color:'#ede9e4',outline:'none',marginBottom:16,boxSizing:'border-box'}} />
        {error && <div style={{color:'#e8294a',fontSize:12,marginBottom:12}}>{error}</div>}
        <button onClick={handle} disabled={loading} style={{width:'100%',background:'linear-gradient(135deg,#e8294a,#f05a2a)',border:'none',borderRadius:13,padding:15,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',marginBottom:10}}>{loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}</button>
        <button onClick={() => setIsLogin(l => !l)} style={{width:'100%',background:'none',border:'none',color:'#7070a0',fontSize:12,cursor:'pointer',padding:8}}>{isLogin ? 'Nao tem conta? Criar agora' : 'Ja tem conta? Entrar'}</button>
      </div>
    </div>
  )
}