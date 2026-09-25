"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function WhatsAppButton() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // 1. REGLA DE VISIBILIDAD: Ocultar SOLO en el administrador y login secreto
  if (pathname.startsWith('/admin') || pathname.startsWith('/portal-staff')) {
    return null
  }

  // 2. MENSAJE DINÁMICO
  const mensajeDefault = pathname === '/carrito' 
    ? "Hola Fragance Boutique, necesito ayuda con mi carrito de compras."
    : "Hola Fragance Boutique, quisiera hacer una consulta."

  // 3. LISTA DE ASESORES (Con indicador de estado en línea)
  const asesores = [
    { 
      nombre: "Asesor 1", 
      rol: "Ventas y Catálogo", 
      numero: "59163993851", // Cambia esto por el número real del Asesor 1
      disponible: true
    },
    { 
      nombre: "Asesor 2", 
      rol: "Atención y Pedidos", 
      numero: "59163993851", // Cambia esto por el número real del Asesor 2
      disponible: true
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      
      {/* MENÚ DESPLEGABLE (Pop-Up Premium) */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-2 w-[280px] origin-bottom-right animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Cabecera del Menú */}
          <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] p-5 rounded-t-[1.2rem] rounded-b-sm mb-2 text-white shadow-inner relative overflow-hidden">
            {/* Brillo de luz de fondo sutil */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Línea Directa
            </h3>
            <p className="text-[10px] text-emerald-50 mt-1.5 uppercase tracking-widest font-medium relative z-10">
              ¿Con quién deseas hablar?
            </p>
          </div>
          
          {/* Lista de Asesores */}
          <div className="flex flex-col gap-1 p-1">
            {asesores.map((asesor, i) => (
              <a 
                key={i} 
                href={`https://wa.me/${asesor.numero}?text=${encodeURIComponent(mensajeDefault)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-300 group"
              >
                {/* Avatar / Icono con Punto Verde (En Línea) */}
                <div className="relative">
                  <div className="w-11 h-11 bg-gray-100 text-[#25D366] rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300 shadow-sm">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  </div>
                  {/* Punto verde de conexión */}
                  {asesor.disponible && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                {/* Textos y flecha oculta */}
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">
                      {asesor.nombre}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                      {asesor.rol}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

        </div>
      )}

      {/* BOTÓN FLOTANTE (Con tu efecto de Pulso intacto) */}
      <div className="relative group">
        {!isOpen && (
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-40 transition-opacity duration-300 pointer-events-none"></div>
        )}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 z-10 ${
            isOpen 
              ? 'bg-gray-900 text-white scale-95 rotate-90 shadow-lg' 
              : 'bg-[#25D366] text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:bg-[#20bd5a] hover:scale-105'
          }`}
          aria-label={isOpen ? "Cerrar menú" : "Abrir atención al cliente"}
        >
          {isOpen ? (
            // ICONO DE CERRAR (X)
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // TU ICONO ORIGINAL DE WHATSAPP
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}