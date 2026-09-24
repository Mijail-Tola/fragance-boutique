import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// Esta instrucción le dice a Next.js que siempre busque los datos más recientes de Supabase
export const dynamic = 'force-dynamic'

// COMPONENTE DE TARJETA DE PRODUCTO (Optimizado para servidor)
const TarjetaProductoInicio = ({ producto }: { producto: any }) => {
  const sinStockGeneral = Number(producto.stock) <= 0;
  
  let insignias: {texto: string, color: string}[] = [];
  if (producto.etiquetas) {
    try {
      if (producto.etiquetas.startsWith('[')) {
        insignias = JSON.parse(producto.etiquetas).filter((t: any) => t.tipo === 'insignia');
      } else {
        producto.etiquetas.split(',').forEach((t: string) => {
          const text = t.trim();
          if (text.toLowerCase().includes('top')) insignias.push({texto: 'TOP', color: 'bg-black text-white'});
          else if (text.includes('%')) insignias.push({texto: text, color: 'bg-[#e50000] text-white'});
        });
      }
    } catch(e) {}
  }

  let minPrecio = Number(producto.precio) || 0;
  let maxPrecio = minPrecio;
  let todosAgotados = false;

  if (producto.tamano) {
    try {
      let parsedVars: any[] = [];
      if (producto.tamano.startsWith('[')) parsedVars = JSON.parse(producto.tamano);
      else if (producto.tamano.includes(':')) parsedVars = producto.tamano.split(',').map((i: string) => ({ nombre: i.split(':')[0], precio: Number(i.split(':')[1]), agotado: false }));
      
      if (parsedVars.length > 0) {
        const disponibles = parsedVars.filter((v:any) => !v.agotado && v.precio > 0).map((v: any) => v.precio);
        if (disponibles.length > 0) {
          minPrecio = Math.min(...disponibles);
          maxPrecio = Math.max(...disponibles);
        } else {
          todosAgotados = true;
          const todos = parsedVars.filter((v:any) => v.precio > 0).map((v: any) => v.precio);
          if(todos.length > 0) { minPrecio = Math.min(...todos); maxPrecio = Math.max(...todos); }
        }
      }
    } catch(e) {}
  }

  const mostrarAgotado = sinStockGeneral || todosAgotados;
  const precioActual = minPrecio !== maxPrecio ? `${minPrecio}Bs. - ${maxPrecio}Bs.` : `${minPrecio}Bs.`;

  return (
    <Link href={`/producto/${producto.id}`} className="group flex flex-col relative bg-white p-2 md:p-4 hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-all duration-300">
      <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex flex-col gap-1">
        {insignias.map((ins, idx) => (
          <div key={idx} className={`${ins.color} text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-widest text-center`}>{ins.texto}</div>
        ))}
      </div>
      
      <div className="relative h-48 md:h-72 w-full bg-gray-50/50 mb-4 overflow-hidden flex items-center justify-center">
        <Image 
          src={producto.imagen_url} 
          alt={producto.nombre} 
          fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized
          className={`object-contain p-4 transition-transform duration-700 ${mostrarAgotado ? 'opacity-40' : 'group-hover:scale-105'}`} 
        />
        {mostrarAgotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <span className="font-bold text-gray-900 tracking-widest text-xs px-2 py-1 bg-white/90 shadow-sm">AGOTADO</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 text-center px-1">
        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1">{producto.marca}</p>
        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-2 group-hover:text-rose-600 transition-colors line-clamp-2 leading-tight">
          {producto.nombre}
        </h4>
        <p className="mt-auto font-black text-gray-900 text-sm md:text-lg">
          {precioActual}
        </p>
      </div>
    </Link>
  )
}

// Convertimos el componente principal en una función asíncrona (SSR)
export default async function Home() {
  
  // Hacemos las peticiones a Supabase DIRECTAMENTE en el servidor, sin tiempos de carga para el cliente
  const { data: recienLlegados } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)
  
  const { data: tendencias } = await supabase
    .from('productos')
    .select('*')
    .order('precio', { ascending: false })
    .limit(4)

  const productosRecientes = recienLlegados || []
  const productosTendencia = tendencias || []

  // El código HTML (JSX) se devuelve instantáneamente
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* HERO BANNER */}
      <section className="relative w-full bg-[#D30F30] py-16 md:py-24 border-b border-rose-800 flex items-center justify-center text-center px-4">
        <div className="max-w-3xl mx-auto z-10">
          <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-4 text-white/80">La verdadera esencia</p>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-8 uppercase drop-shadow-sm">
            Descubre las Tendencias del Mundo
          </h1>
          <Link href="/catalogo" className="inline-block bg-white text-[#D30F30] font-bold uppercase tracking-widest text-sm px-10 py-4 hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-300">
            Explorar Tienda
          </Link>
        </div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </section>

      {/* SECCIÓN 1: RECIÉN LLEGADOS */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-4">Recién Llegados</h2>
          <div className="w-16 h-1 bg-[#D30F30] mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {productosRecientes.map(prod => (
            <TarjetaProductoInicio key={`new-${prod.id}`} producto={prod} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/catalogo" className="inline-block border-2 border-[#D30F30] text-[#D30F30] font-bold uppercase tracking-widest text-xs px-8 py-3 hover:bg-[#D30F30] hover:text-white transition-colors">
            Ver Todo el Catálogo
          </Link>
        </div>
      </section>

      {/* BANNER PROMOCIONAL TIPO WONDER */}
      <section className="w-full bg-[#1A050A] border-y border-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 p-12 md:p-24 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight mb-4">Modo Bestia!</h2>
            <p className="text-white/80 font-medium text-lg md:text-xl mb-8 leading-relaxed">
              Descubre la línea árabe más viral del momento. Proyección extrema y duración que conquista.
            </p>
            <Link href="/catalogo?categoria=Árabe" className="inline-block bg-[#D30F30] text-white font-bold uppercase tracking-widest text-xs px-8 py-3 hover:bg-rose-700 transition-colors">
              Descubrir Ahora
            </Link>
          </div>
          <div className="w-full md:w-1/2 h-[300px] md:h-[500px] relative bg-gradient-to-tr from-[#2a0812] to-[#1A050A] flex items-center justify-center p-8">
            {productosRecientes[0] && (
               <Image 
                src={productosRecientes[0].imagen_url} 
                alt="Promo" 
                fill 
                sizes="50vw"
                className="object-contain filter drop-shadow-[0_20px_30px_rgba(211,15,48,0.2)] scale-110 md:scale-125" 
                unoptimized
              />
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: TENDENCIAS HOY */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-4">En Tendencia Hoy</h2>
          <div className="w-16 h-1 bg-[#D30F30] mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {productosTendencia.map(prod => (
            <TarjetaProductoInicio key={`tend-${prod.id}`} producto={prod} />
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: BLOQUES POR GÉNERO */}
      <section className="w-full bg-white pb-24">
        <div className="text-center mb-12 px-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">Encuentra tu esencia</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 w-full h-[600px] md:h-[400px]">
          <Link href="/catalogo?genero=Mujer" className="group relative flex items-center justify-center bg-rose-200 overflow-hidden text-gray-900">
             <div className="absolute inset-0 bg-white/20 group-hover:bg-white/40 transition-colors z-10"></div>
             <div className="z-20 text-center transform group-hover:scale-110 transition-transform duration-500">
                <h3 className="text-3xl font-black uppercase tracking-widest mb-2">Mujer</h3>
                <span className="border-b-2 border-gray-900 pb-1 text-sm font-bold uppercase tracking-wider">Comprar</span>
             </div>
          </Link>
          <Link href="/catalogo?genero=Unisex" className="group relative flex items-center justify-center bg-gray-200 overflow-hidden text-gray-900">
             <div className="absolute inset-0 bg-white/20 group-hover:bg-white/40 transition-colors z-10"></div>
             <div className="z-20 text-center transform group-hover:scale-110 transition-transform duration-500">
                <h3 className="text-3xl font-black uppercase tracking-widest mb-2">Unisex</h3>
                <span className="border-b-2 border-gray-900 pb-1 text-sm font-bold uppercase tracking-wider">Comprar</span>
             </div>
          </Link>
          <Link href="/catalogo?genero=Hombre" className="group relative flex items-center justify-center bg-[#D30F30] overflow-hidden text-white">
             <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors z-10"></div>
             <div className="z-20 text-center transform group-hover:scale-110 transition-transform duration-500">
                <h3 className="text-3xl font-black uppercase tracking-widest mb-2">Hombre</h3>
                <span className="border-b-2 border-white pb-1 text-sm font-bold uppercase tracking-wider">Comprar</span>
             </div>
          </Link>
        </div>
      </section>
    </main>
  )
}