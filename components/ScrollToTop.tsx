"use client"

import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Detectar el scroll para mostrar/ocultar el botón
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Subir al inicio"
      // 🔥 LA MAGIA AQUÍ: bottom-24 la eleva por encima de WhatsApp
      className={`fixed right-4 md:right-6 bottom-24 md:bottom-28 z-[60] flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white text-gray-900 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-gray-100 transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2.5} 
        stroke="currentColor" 
        className="w-5 h-5 md:w-6 md:h-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  )
}