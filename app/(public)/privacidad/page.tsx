import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8">Política de Privacidad</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>Última actualización: Septiembre de 2026</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">1. Información que recopilamos</h2>
          <p>En Fragance Boutique recopilamos información estrictamente necesaria para procesar y entregar sus pedidos. Esto incluye: Nombre completo, número de teléfono, ciudad de residencia y detalles del pedido. No procesamos ni almacenamos datos de tarjetas de crédito, ya que los pagos se realizan de forma externa mediante transferencia QR.</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">2. Uso de la información</h2>
          <p>La información recopilada se utiliza exclusivamente para: procesar su pedido, enviar actualizaciones sobre el estado del envío vía WhatsApp y mejorar nuestro servicio al cliente. No vendemos, alquilamos ni compartimos sus datos personales con terceros no relacionados con el servicio de entrega.</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">3. Uso de Cookies</h2>
          <p>Nuestra tienda utiliza "cookies" técnicas esenciales y almacenamiento local (Local Storage) para mantener los productos en su carrito de compras mientras navega por la página. Estas herramientas no recopilan datos de navegación externos ni información personal confidencial.</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8">4. Seguridad de los datos</h2>
          <p>Implementamos medidas de seguridad de nivel empresarial (encriptación de base de datos) para mantener su información a salvo. Nuestro proveedor de base de datos cumple con los estándares de seguridad modernos.</p>

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