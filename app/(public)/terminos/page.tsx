import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8">Términos y Condiciones</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>Al acceder y utilizar el sitio web de Fragance Boutique, usted acepta cumplir con los siguientes términos y condiciones.</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">1. Proceso de Compra y Pagos</h2>
          <p>Todos los precios mostrados están en Bolivianos (Bs.). El proceso de compra se formaliza únicamente tras la verificación del comprobante de transferencia bancaria (QR) enviado a nuestro canal oficial de WhatsApp. Fragance Boutique se reserva el derecho de cancelar pedidos cuyo pago no haya sido verificado en un plazo de 24 horas.</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">2. Disponibilidad de Stock</h2>
          <p>El inventario de productos se actualiza constantemente. Sin embargo, en el caso inusual de que un producto adquirido se quede sin stock antes de la verificación del pago, nos contactaremos inmediatamente para ofrecerle un reembolso total o un cambio por otro producto de valor equivalente.</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">3. Envíos y Entregas</h2>
          <p>Las entregas se coordinan directamente con el cliente a través de WhatsApp una vez confirmado el pago. Los tiempos de entrega varían según la ciudad (Cochabamba, Santa Cruz, La Paz u otras) y la disponibilidad del servicio de mensajería local.</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">4. Devoluciones y Garantías</h2>
          <p>Garantizamos la autenticidad de todas nuestras fragancias. Por motivos de higiene y salud, solo se aceptarán devoluciones de productos que mantengan su empaque original sellado e intacto, reportados dentro de las 24 horas siguientes a la recepción del producto.</p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/" className="text-black font-bold uppercase tracking-widest text-xs hover:text-[#D30F30] transition-colors">
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}