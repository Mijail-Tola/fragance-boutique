import Link from 'next/link'
import Navbar from '../components/Navbar' // Importamos tu barra de navegación

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
      
      {/* Barra de Navegación superior */}
      <Navbar />

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 py-12">
        {/* Resplandor sutil de fondo para darle profundidad */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-rose-900/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          
          {/* Etiqueta superior */}
          <span className="text-rose-400 text-xs md:text-sm font-bold tracking-[0.4em] uppercase">
            Nueva Colección 2026
          </span>

          {/* Título Principal Editorial */}
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight tracking-wide">
            Descubre las <br className="md:hidden" />
            <span className="italic font-light text-rose-100">Tendencias</span> <br className="md:hidden" />
            del Mundo
          </h1>

          {/* Párrafo descriptivo suavizado */}
          <p className="text-gray-400 text-base md:text-lg max-w-2xl font-light leading-relaxed">
            Perfumería de lujo, marcas de diseñador, exclusividades árabes y lo mejor en cosmética. Encuentra tu esencia ideal para cada ocasión.
          </p>

          {/* Botón CTA (Call to Action) Premium */}
          <div className="pt-6">
            <Link 
              href="/catalogo" 
              className="inline-block bg-white text-black border border-white px-10 py-4 text-sm font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-white transition-all duration-500 ease-out"
            >
              Explorar Tienda
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  )
}