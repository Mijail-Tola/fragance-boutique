"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// 🚀 COMPONENTE MÁGICO PERFECCIONADO: Scroll Nativo + Flechas Híbridas + Mix Blend Mode
const CarruselInfinito = ({ items }: { items: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    let animationId: number;
    let isInteracting = false;

    // Velocidad de giro automático
    const scrollSpeed = 0.5;

    const play = () => {
      // Si el usuario no está tocando ni pasando el ratón, avanzamos suavemente
      if (!isInteracting && !isHovered) {
        slider.scrollLeft += scrollSpeed;

        // Loop Infinito: Si pasamos la mitad de la pista, volvemos al inicio sin que se note
        if (slider.scrollWidth > 0 && slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(play);
    };

    animationId = requestAnimationFrame(play);

    // Eventos para pausar el giro automático en celular y reanudar al soltar
    const handleTouchStart = () => { isInteracting = true; };
    const handleTouchEnd = () => { isInteracting = false; };

    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchend', handleTouchEnd);
    slider.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animationId);
      if (slider) {
        slider.removeEventListener('touchstart', handleTouchStart);
        slider.removeEventListener('touchend', handleTouchEnd);
        slider.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [isHovered]);

  // Funciones para las flechas manuales (Visibles en PC)
  const scrollManual = (direccion: 'izquierda' | 'derecha') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 150 : 300; 
      scrollRef.current.scrollBy({
        left: direccion === 'derecha' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      className="relative flex w-full overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sombras Laterales Difuminadas */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      
      {/* FLECHAS DE NAVEGACIÓN (Ocultas en celular para usar deslizamiento nativo, visibles en PC al hover) */}
      <button 
        onClick={() => scrollManual('izquierda')}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 text-black rounded-full shadow-md items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 hover:bg-black hover:text-white"
        aria-label="Anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>

      <button 
        onClick={() => scrollManual('derecha')}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 text-black rounded-full shadow-md items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 hover:bg-black hover:text-white"
        aria-label="Siguiente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>

      {/* PISTA DEL CARRUSEL */}
      <div 
        ref={scrollRef}
        className="flex w-full overflow-x-auto gap-6 md:gap-12 px-8 md:px-16 hide-scroll select-none"
        style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }} 
      >
        {items.map((p, i) => (
          <Link 
            href={`/producto/${p.id}`} 
            key={`${p.id}-${i}`} 
            draggable={false} 
            className="flex flex-col items-center group w-24 md:w-32 shrink-0 my-4"
          >
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#F8F9FA] flex items-center justify-center mb-3 p-3 md:p-4 border border-gray-100 group-hover:border-black group-hover:shadow-md transition-all duration-300">
              <div className="relative w-full h-full pointer-events-none">
                {/* MAGIA APLICADA AQUÍ: mix-blend-multiply borra el fondo blanco de la imagen */}
                <Image src={p.imagen_url} alt={p.nombre} fill sizes="150px" className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" unoptimized draggable="false" />
              </div>
            </div>
            <p className="text-[10px] md:text-[11px] font-bold text-center text-gray-900 truncate w-full group-hover:text-[#D30F30] transition-colors">{p.nombre}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

// TARJETA DE PRODUCTO IPHONE STYLE
const TarjetaProductoInicio = ({ producto }: { producto: any }) => {
  const sinStockGeneral = Number(producto.stock) <= 0;
  
  let insignias: {texto: string, color: string}[] = [];
  let descuentoPorcentaje = 0; 
  
  if (producto.etiquetas) {
    try {
      if (producto.etiquetas.startsWith('[')) {
        const parsed = JSON.parse(producto.etiquetas);
        parsed.forEach((t: any) => {
          if (t.tipo === 'top' || t.tipo === 'descuento') {
            insignias.push({texto: t.texto, color: t.color});
          }
          if (t.tipo === 'descuento' && t.valor) {
            descuentoPorcentaje = Math.max(descuentoPorcentaje, Number(t.valor));
          }
        });
      } else {
        producto.etiquetas.split(',').forEach((t: string) => {
          const text = t.trim();
          if (text.toLowerCase().includes('top')) insignias.push({texto: 'TOP', color: 'bg-black text-white'});
          else if (text.includes('%')) {
            insignias.push({texto: text, color: 'bg-[#e50000] text-white'});
            const match = text.match(/\d+/);
            if (match) descuentoPorcentaje = Math.max(descuentoPorcentaje, parseInt(match[0]));
          }
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

  const factorDescuento = descuentoPorcentaje > 0 ? (1 - descuentoPorcentaje / 100) : 1;
  const minPrecioFinal = Math.round(minPrecio * factorDescuento);
  const maxPrecioFinal = Math.round(maxPrecio * factorDescuento);

  const mostrarAgotado = sinStockGeneral || todosAgotados;
  const mostrarRango = minPrecio > 0 && maxPrecio > 0 && minPrecio !== maxPrecio;
  
  const precioOriginalTxt = mostrarRango ? `${minPrecio} - ${maxPrecio} Bs.` : `${minPrecio} Bs.`;
  const precioFinalTxt = mostrarRango ? `${minPrecioFinal} - ${maxPrecioFinal} Bs.` : `${minPrecioFinal} Bs.`;

  return (
    <Link href={`/producto/${producto.id}`} className="group flex flex-col relative bg-white p-3 md:p-5 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 ease-out h-full">
      
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {insignias.map((ins, idx) => (
          <div key={idx} className={`${ins.color} text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-center shadow-sm backdrop-blur-sm bg-opacity-90`}>{ins.texto}</div>
        ))}
      </div>
      
      <div className="relative h-48 md:h-64 w-full bg-[#F8F9FA] rounded-[1.25rem] mb-5 overflow-hidden flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-500">
        {/* MAGIA APLICADA AQUÍ: mix-blend-multiply borra el fondo blanco de las tarjetas de productos */}
        <Image 
          src={producto.imagen_url} 
          alt={producto.nombre} 
          fill sizes="(max-width: 768px) 70vw, 25vw" unoptimized
          className={`object-contain mix-blend-multiply p-4 transition-transform duration-700 ease-out ${mostrarAgotado ? 'opacity-40' : 'group-hover:scale-110 group-hover:rotate-1'}`} 
        />
        {mostrarAgotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <span className="font-bold text-gray-900 tracking-widest text-[10px] md:text-xs px-4 py-2 bg-white shadow-lg rounded-full">AGOTADO</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 text-center px-2">
        <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">{producto.marca}</p>
        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-3 group-hover:text-[#D30F30] transition-colors line-clamp-2 leading-tight">
          {producto.nombre}
        </h4>
        <div className="mt-auto pt-2 flex flex-col items-center justify-end min-h-[3.5rem]">
          {descuentoPorcentaje > 0 && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through decoration-gray-400 mb-0.5">
              {precioOriginalTxt}
            </span>
          )}
          <span className={`inline-block text-base md:text-lg font-black tracking-tight ${mostrarAgotado ? 'text-gray-400' : 'text-gray-900 group-hover:text-[#D30F30] transition-colors'}`}>
            {precioFinalTxt}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  
  const [productosRecientes, setProductosRecientes] = useState<any[]>([])
  const [productosTendencia, setProductosTendencia] = useState<any[]>([])
  const [itemsMarquee, setItemsMarquee] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const [recData, tendData, catData] = await Promise.all([
        supabase.from('productos').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('productos').select('*').order('precio', { ascending: false }).limit(8),
        supabase.from('productos').select('id, nombre, marca, imagen_url').limit(15)
      ]);

      if (recData.data) setProductosRecientes(recData.data);
      if (tendData.data) setProductosTendencia(tendData.data);
      if (catData.data) {
        // Cuadruplicamos el array para asegurar pista suficiente y loop invisible
        setItemsMarquee([...catData.data, ...catData.data, ...catData.data, ...catData.data]);
      }
    }
    fetchData();
  }, [])

  return (
    <main className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { opacity: 0; animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <Navbar />

      <section className="relative w-full bg-gradient-to-br from-[#D30F30] via-[#b80c29] to-[#80071b] py-20 md:py-36 flex items-center justify-center text-center px-4 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl">
        <div className="max-w-4xl mx-auto z-10 relative">
          <p className="animate-fade-up text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-4 text-white/90 drop-shadow-sm">
            La verdadera esencia
          </p>
          <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-10 uppercase drop-shadow-md">
            Descubre las Tendencias del Mundo
          </h1>
          <div className="animate-fade-up delay-200">
            <Link href="/catalogo" className="inline-block bg-white text-[#D30F30] font-black uppercase tracking-widest text-xs px-10 py-4 rounded-full hover:scale-105 hover:bg-gray-50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] duration-300">
              Explorar Tienda
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white opacity-[0.07] rounded-full blur-[80px] pointer-events-none"></div>
      </section>

      {/* CARRUSEL GIRATORIO HÍBRIDO */}
      {itemsMarquee.length > 0 && (
        <section className="py-12 bg-white overflow-hidden border-b border-gray-100 relative">
          <div className="text-center mb-6 px-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Toda nuestra colección</h2>
          </div>
          <CarruselInfinito items={itemsMarquee} />
        </section>
      )}

      <section className="max-w-7xl mx-auto py-16 md:py-24 overflow-hidden">
        <div className="text-center mb-10 px-4">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-3">Recién Llegados</h2>
          <div className="w-12 h-1 bg-[#D30F30] mx-auto rounded-full"></div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scroll gap-4 px-4 md:grid md:grid-cols-4 md:gap-6 pb-8 md:px-8">
          {productosRecientes.map(prod => (
            <div key={`new-${prod.id}`} className="w-[75vw] sm:w-[45vw] md:w-auto shrink-0 snap-center">
              <TarjetaProductoInicio producto={prod} />
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/catalogo" className="inline-block bg-white border border-gray-200 text-gray-800 font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-full hover:border-black hover:bg-black hover:text-white transition-all shadow-sm">
            Ver Todo el Catálogo
          </Link>
        </div>
      </section>

      <section className="w-full px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row group transition-transform duration-500 hover:shadow-3xl">
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0f0205] to-[#3a0b16] p-10 md:p-16 lg:p-20 text-center md:text-left flex flex-col justify-center relative overflow-hidden">
            <span className="inline-block self-center md:self-start py-1.5 px-4 rounded-full bg-white/10 text-white/90 text-[9px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md border border-white/20 shadow-inner">Selección Premium</span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase leading-[0.9] mb-4 tracking-tight drop-shadow-lg relative z-10">Modo<br/>Bestia!</h2>
            <p className="text-rose-100/70 font-medium text-sm md:text-base mb-8 leading-relaxed max-w-sm mx-auto md:mx-0 relative z-10">Descubre la línea árabe más viral del momento. Proyección extrema y duración que conquista.</p>
            <Link href="/catalogo?categoria=Árabe" className="self-center md:self-start inline-block bg-white text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.15)] relative z-10">Descubrir Ahora</Link>
          </div>
          <div className="w-full md:w-1/2 bg-white h-[350px] md:h-auto relative flex items-center justify-center p-8 transition-colors duration-500">
            <div className="absolute w-64 h-64 bg-gray-50 rounded-full scale-150 md:scale-110 group-hover:scale-125 transition-transform duration-1000 ease-out"></div>
            {/* MAGIA APLICADA AQUÍ: mix-blend-multiply para el frasco gigante del Modo Bestia */}
            {productosRecientes[0] && <Image src={productosRecientes[0].imagen_url} alt="Promo" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain mix-blend-multiply filter drop-shadow-2xl scale-110 md:scale-[1.15] animate-float p-12 z-10" unoptimized />}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-16 md:py-24 overflow-hidden">
        <div className="text-center mb-10 px-4">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-3">En Tendencia Hoy</h2>
          <div className="w-12 h-1 bg-black mx-auto rounded-full"></div>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scroll gap-4 px-4 md:grid md:grid-cols-4 md:gap-6 pb-8 md:px-8">
          {productosTendencia.map(prod => <div key={`tend-${prod.id}`} className="w-[75vw] sm:w-[45vw] md:w-auto shrink-0 snap-center"><TarjetaProductoInicio producto={prod} /></div>)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-10"><h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-gray-900">Encuentra tu esencia</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-[600px] md:h-[400px]">
          <Link href="/catalogo?genero=Mujer" className="group relative flex items-center justify-center bg-rose-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-rose-200/50">
             <div className="absolute inset-0 bg-gradient-to-t from-rose-200/60 to-transparent group-hover:opacity-40 transition-opacity z-10"></div>
             <div className="z-20 text-center transform group-hover:scale-110 transition-transform duration-700 ease-out"><h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-rose-900 mb-3 drop-shadow-sm">Mujer</h3><span className="bg-white/80 backdrop-blur-sm text-rose-900 text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-sm">Explorar</span></div>
          </Link>
          <Link href="/catalogo?genero=Unisex" className="group relative flex items-center justify-center bg-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-300/50">
             <div className="absolute inset-0 bg-gradient-to-t from-gray-300/60 to-transparent group-hover:opacity-40 transition-opacity z-10"></div>
             <div className="z-20 text-center transform group-hover:scale-110 transition-transform duration-700 ease-out"><h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-gray-900 mb-3 drop-shadow-sm">Unisex</h3><span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-sm">Explorar</span></div>
          </Link>
          <Link href="/catalogo?genero=Hombre" className="group relative flex items-center justify-center bg-black rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-60 transition-opacity z-10"></div>
             <div className="z-20 text-center transform group-hover:scale-110 transition-transform duration-700 ease-out"><h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-white mb-3 drop-shadow-sm">Hombre</h3><span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-sm border border-white/20">Explorar</span></div>
          </Link>
        </div>
      </section>
    </main>
  )
}