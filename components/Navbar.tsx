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
        
        {/* CARRITO: Botón un poco más compacto en móviles (px-3 py-1.5) */}
        <Link href="/carrito" className="bg-rose-600 hover:bg-rose-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md font-medium transition flex items-center gap-2 text-sm md:text-base">
          🛒 Carrito <span className="bg-white text-rose-600 px-2 rounded-full text-xs py-0.5">{totalItems}</span>
        </Link>
      </div>
      
    </div>
  </nav>
)
}