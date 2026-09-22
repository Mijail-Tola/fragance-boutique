"use client"

import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity } = useCartStore()

  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)

  // Si el carrito está cerrado, no renderizamos el fondo oscuro
  if (!isOpen) return null

  return (
    <>
      {/* Fondo oscuro desenfocado */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={toggleCart}
      />

      {/* Panel lateral derecho */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Cabecera del Carrito */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900">Tu Carrito ({items.length})</h2>
          <button onClick={toggleCart} className="text-gray-400 hover:text-black text-2xl transition">×</button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-6xl">🛍️</span>
              <p className="text-gray-500 font-medium tracking-wide">Tu carrito está vacío</p>
              <button onClick={toggleCart} className="text-rose-600 font-bold uppercase tracking-widest text-xs hover:underline">
                Volver al catálogo
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-white">
                <div className="w-20 h-20 relative bg-gray-50 rounded border shrink-0">
                  <Image src={item.imagen_url} alt={item.nombre} fill className="object-contain p-2" unoptimized />
                </div>
                <div className="flex-1 flex flex-col justify-between h-20">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{item.nombre}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.tamano}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="font-bold text-rose-600">{item.precio}Bs</p>
                    <div className="flex items-center gap-3 border px-2 py-1 rounded">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))} className="text-gray-400 hover:text-black font-bold">-</button>
                      <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="text-gray-400 hover:text-black font-bold">+</button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="h-20 text-gray-300 hover:text-rose-600 transition pl-2">
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Zona de Pago (Footer) */}
        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Total</span>
              <span className="text-2xl font-bold text-gray-900">{total} Bs.</span>
            </div>
            
            {/* AQUÍ ESTÁ LA MAGIA: Ahora es un Link que te lleva a la pasarela completa y cierra la barra lateral */}
            <Link 
              href="/carrito"
              onClick={toggleCart}
              className="w-full bg-black text-white py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-[#e3000f] transition shadow-lg flex items-center justify-center gap-2"
            >
              Iniciar Pago Seguro
            </Link>
            
            <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-wider">Pago Seguro por QR / Transferencia</p>
          </div>
        )}
      </div>
    </>
  )
}