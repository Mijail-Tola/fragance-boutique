"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      // CREAMOS LA CREDENCIAL PARA EL MIDDLEWARE (Válida por 1 día)
      document.cookie = "fragance_admin=true; path=/; max-age=86400"
      router.push('/admin') // Nos vamos al panel
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex justify-center items-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-700 text-center mb-8">Acceso Admin</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3 text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          />

          <div className="relative mt-4">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-400 rounded-md py-3 pl-3 pr-12 text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Aquí cambiamos a type="submit" y agregamos el estado de carga */}
          <button
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white font-bold tracking-widest uppercase py-4 rounded-md mt-6 hover:bg-[#e3000f] transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'INGRESAR'}
          </button>
        </div>
      </form>
    </div>
  )
}