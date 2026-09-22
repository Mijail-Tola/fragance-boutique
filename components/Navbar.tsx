"use client"

import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

export default function Navbar() {
  const { items } = useCartStore()
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)

  return (
  <nav className="bg-black text-white p-3 md:p-4 shadow-md sticky top-0 z-50">
    {/* flex-wrap permite que si la pantalla es minúscula, los elementos se acomoden sin romperse */}
    <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-3">
      
      {/* LOGO: text-base en celular, text-2xl en PC */}
      <Link href="/" className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-widest uppercase">
        FRAGANCE BOUTIQUE
      </Link>
      
      {/* BOTONES: Menos separación en celular (gap-4) y más en PC (gap-6) */}
      <div className="flex gap-4 md:gap-6 items-center">
        <Link href="/catalogo" className="hover:text-rose-300 transition text-sm md:text-base">
          Catálogo
        </Link>
        
        {/* CARRITO: Ícono minimalista con burbuja de notificación roja */}
        <Link href="/carrito" className="relative text-white hover:text-rose-300 transition-colors p-2 flex items-center justify-center">
          {/* Ícono de Bolsa de Compras */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          
          {/* Burbuja Roja de Notificación (Solo aparece si hay productos) */}
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#e3000f] text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
      
    </div>
  </nav>
)
}