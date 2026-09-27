// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
})

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair' 
})

import type { Viewport } from 'next'

// Bloquea el zoom indeseado en inputs de celulares
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Fragance Boutique | Perfumería y Cosmética',
  description: 'Especialistas en fragancias de diseñador, árabes y cosmética premium en Bolivia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-gray-50 text-gray-900 flex flex-col min-h-screen`}>
        {/* Aquí solo dejamos el {children}. Los componentes visuales se inyectarán en los otros layouts */}
        {children}
      </body>
    </html>
  )
}