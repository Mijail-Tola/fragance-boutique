"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    const cookiesAceptadas = localStorage.getItem('fragance_cookies_aceptadas')
    if (!cookiesAceptadas) {
      const timer = setTimeout(() => setMostrar(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const aceptarCookies = () => {
    localStorage.setItem('fragance_cookies_aceptadas', 'true')
    setMostrar(false)
  }

  if (!mostrar) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none flex justify-center pb-safe">
      <div className="bg-[#0B0F19] text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 md:p-6 max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-5 pointer-events-auto border border-gray-800/60 animate-in slide-in-from-bottom-10 fade-in duration-700">
        
        <div className="text-[11px] md:text-xs text-gray-400 leading-relaxed text-center md:text-left font-medium">
          <strong className="text-white block mb-1 font-bold text-sm tracking-wide">Privacidad y Cookies</strong>
          Utilizamos cookies esenciales y almacenamiento local para mantener tu carrito de compras activo y brindarte una experiencia fluida. No utilizamos cookies de rastreo invasivas. Al continuar, aceptas nuestra{' '}
          <Link href="/privacidad" className="text-white font-bold underline decoration-gray-600 underline-offset-2 hover:text-[#D30F30] hover:decoration-[#D30F30] transition-colors">
            Política de Privacidad
          </Link>.
        </div>

        <button 
          onClick={aceptarCookies}
          className="shrink-0 bg-white text-black hover:bg-[#D30F30] hover:text-white px-8 py-3.5 md:py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-md w-full md:w-auto active:scale-95"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}