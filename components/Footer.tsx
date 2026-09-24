"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Footer() { // O el nombre de tu componente
  const pathname = usePathname()
  
  // Si la ruta empieza con /admin, no dibujamos nada (retorna nulo)
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-[#0B0F19] text-white pt-16 pb-8 border-t border-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        
        {/* Columna 1: Marca y Descripción */}
        <div>
          <h2 className="text-xl font-black tracking-[0.2em] uppercase mb-2">Fragance Boutique</h2>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mb-6">Perfumería y Cosmética</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Especialistas en fragancias de diseñador, perfumes árabes y cosmética premium. Asesoramiento personalizado para encontrar tu esencia ideal.
          </p>
        </div>

        {/* Columna 2: Contacto (Con Íconos Profesionales SVG) */}
        <div>
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-6">Contacto Directo</h3>
          <ul className="space-y-5 text-sm text-gray-400">
            {/* Ubicación */}
            <li className="flex items-start gap-4">
              <svg className="w-5 h-5 text-[#D30F30] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span>Atención online y envíos<br/>Cochabamba, Bolivia</span>
            </li>
            {/* Teléfono */}
            <li className="flex items-center gap-4">
              <svg className="w-5 h-5 text-[#D30F30] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <span>+591 63993851</span>
            </li>
            {/* Email */}
            <li className="flex items-center gap-4">
              <svg className="w-5 h-5 text-[#D30F30] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span>ventas@fraganceboutique.com</span>
            </li>
          </ul>
        </div>

        {/* Columna 3: Redes Sociales (Con logos originales SVG) */}
        <div>
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-6">Síguenos</h3>
          <div className="flex gap-4">
            
            {/* Facebook */}
            <a href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#D30F30] hover:border-[#D30F30] hover:text-white transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            
            {/* Instagram */}
            <a href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#D30F30] hover:border-[#D30F30] hover:text-white transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            
            {/* TikTok */}
            <a href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#D30F30] hover:border-[#D30F30] hover:text-white transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 0012.67-1.48V8.71a8.31 8.31 0 004.83 1.55V6.75a4.91 4.91 0 01-2.91-1.06z"/>
              </svg>
            </a>
            
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 pt-8 text-center px-6">
        <p className="text-gray-500 text-[10px] sm:text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} FRAGANCE BOUTIQUE. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}