// app/(public)/layout.tsx
import CartSidebar from '@/components/CartSidebar'
import WhatsAppButton from '@/components/WhatsAppButton'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import ScrollToTop from '@/components/ScrollToTop' // 1. Importamos el componente

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen flex-1">
      <div className="flex-1">
        {children}
      </div>
      
      {/* Componentes exclusivos de la tienda (No aparecerán en el Admin) */}
      <CartSidebar />
      <WhatsAppButton />
      <ScrollToTop /> {/* 2. Inyectamos la flecha flotante */}
      <Footer />
      <CookieBanner />
    </div>
  )
}