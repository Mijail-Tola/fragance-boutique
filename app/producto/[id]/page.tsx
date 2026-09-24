"use client"

import { useEffect, useState, Suspense, use, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 tracking-widest uppercase font-bold text-sm">Cargando esencia...</div>}>
      <ProductoDetalle id={resolvedParams.id} />
    </Suspense>
  )
}

function ProductoDetalle({ id }: { id: string }) {
  const searchParams = useSearchParams()
  const tamanoURL = searchParams.get('tamano')
  
  const [producto, setProducto] = useState<any>(null)
  
  // ESTADOS Y REFERENCIAS (Mantenidos exactos)
  const [indexActivo, setIndexActivo] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  
  const [variantes, setVariantes] = useState<{nombre: string, precio: number, agotado?: boolean}[]>([])
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<{nombre: string, precio: number, agotado?: boolean} | null>(null)
  
  const [cantidad, setCantidad] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const [productosRelacionados, setProductosRelacionados] = useState<any[]>([])

  useEffect(() => {
    async function fetchProductoYRelacionados() {
      const { data } = await supabase.from('productos').select('*').eq('id', id).single()
      if (data) {
        setProducto(data)
        
        if (data.tamano) {
          try {
            let parsedVars: any[] = [];
            if (data.tamano.startsWith('[')) {
              parsedVars = JSON.parse(data.tamano);
            } else if (data.tamano.includes(':')) {
              parsedVars = data.tamano.split(',').map((item: string) => {
                const [nombre, precio] = item.split(':')
                return { nombre: nombre?.trim(), precio: Number(precio?.trim()) || 0, agotado: false }
              });
            } else {
              parsedVars = data.tamano.split(',').map((item: string) => {
                return { nombre: item.trim(), precio: Number(data.precio), agotado: false }
              });
            }

            const validVars = parsedVars.filter((v: any) => v.nombre && !isNaN(v.precio));
            setVariantes(validVars);
            
            if (validVars.length > 0) {
              const varianteInit = validVars.find((v: any) => v.nombre === tamanoURL) 
                || validVars.find((v: any) => !v.agotado) 
                || validVars[0];
              setVarianteSeleccionada(varianteInit)
            }
          } catch(e) {
            console.error("Error leyendo tamaños:", e);
          }
        }

        if (data.marca) {
          const { data: relacionados } = await supabase
            .from('productos')
            .select('*')
            .eq('marca', data.marca)
            .neq('id', id)
            .limit(4) 
          
          if (relacionados) setProductosRelacionados(relacionados)
        }
      }
    }
    fetchProductoYRelacionados()
  }, [id, tamanoURL])

  if (!producto) return <div className="min-h-screen flex items-center justify-center text-gray-500 tracking-widest uppercase font-bold text-sm">Cargando esencia...</div>

  // Lógica de Stock Bloqueado (Mantenida exacta)
  const sinStockGeneral = Number(producto.stock) <= 0
  const varianteAgotada = varianteSeleccionada?.agotado === true
  const botonBloqueado = sinStockGeneral || varianteAgotada
  const precioMostrar = varianteSeleccionada ? varianteSeleccionada.precio : producto.precio

  const galeria = producto.galeria && producto.galeria.length > 0 ? producto.galeria : [producto.imagen_url];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== indexActivo) {
      setIndexActivo(newIndex);
    }
  }

  const scrollToImage = (index: number) => {
    setIndexActivo(index);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.clientWidth * index,
        behavior: 'smooth'
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        
        {/* BREADCRUMBS PREMIUM */}
        <div className="text-[10px] md:text-xs text-gray-400 mb-8 md:mb-12 tracking-[0.2em] uppercase font-bold">
          <Link href="/" className="hover:text-black transition-colors">INICIO</Link> 
          <span className="mx-2">/</span> 
          <Link href="/catalogo" className="hover:text-black transition-colors">CATÁLOGO</Link> 
          <span className="mx-2">/</span> 
          <span className="text-gray-900">{producto.marca}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* ZONA IZQUIERDA: GALERÍA DESLIZABLE PREMIUM (Bordes Redondeados) */}
          <div className="flex flex-col gap-4">
            
            <div className="relative w-full h-[400px] md:h-[550px] bg-[#F8F9FA] rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden group">
              
              <div 
                ref={sliderRef}
                onScroll={handleScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {galeria.map((img: string, idx: number) => (
                  <div key={`img-${idx}`} className="relative w-full h-full shrink-0 snap-center flex items-center justify-center">
                    <Image 
                      src={img} 
                      alt={`${producto.nombre} - vista ${idx + 1}`} 
                      fill
                      priority={idx === 0} 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={`object-contain p-8 md:p-12 transition-opacity duration-300 ${sinStockGeneral ? 'opacity-50' : ''}`}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              
              {sinStockGeneral && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] pointer-events-none">
                  <span className="font-bold text-gray-900 tracking-widest text-lg px-8 py-3 bg-white/95 rounded-full shadow-lg">
                    AGOTADO
                  </span>
                </div>
              )}

              {/* FLECHAS DE ESCRITORIO SUAVES */}
              {galeria.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const newIndex = (indexActivo - 1 + galeria.length) % galeria.length;
                      scrollToImage(newIndex);
                    }}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white/90 text-black rounded-full shadow-md hover:bg-black hover:text-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const newIndex = (indexActivo + 1) % galeria.length;
                      scrollToImage(newIndex);
                    }}
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white/90 text-black rounded-full shadow-md hover:bg-black hover:text-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}
            </div>
            
            {/* MINIATURAS REDONDEADAS */}
            {galeria.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-center mt-2">
                {galeria.map((img: string, idx: number) => {
                  const isActive = indexActivo === idx;
                  return (
                    <button 
                      key={`miniatura-${idx}`} 
                      onClick={() => scrollToImage(idx)}
                      className={`relative h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-2xl overflow-hidden snap-center transition-all duration-300 border-2 ${isActive ? 'border-black opacity-100 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <Image src={img} alt={`Miniatura ${idx + 1}`} fill sizes="100px" className="object-cover bg-[#F8F9FA]" unoptimized />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ZONA DERECHA: INFORMACIÓN DEL PRODUCTO */}
          <div className="flex flex-col pt-2 md:pt-8">
            <h2 className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.3em] font-black mb-3">{producto.marca}</h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-[1.05] tracking-tight">{producto.nombre}</h1>
            
            <p className="text-3xl md:text-4xl font-black text-[#D30F30] mb-10 tracking-tight">
              {precioMostrar} Bs.
            </p>

            {/* SELECTOR DE VARIANTES TIPO PÍLDORAS PREMIUM */}
            {!sinStockGeneral && variantes.length > 0 && (
              <div className="mb-10 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Selecciona un tamaño</span>
                <div className="flex flex-wrap gap-3">
                  {variantes.map((v, index) => {
                    const isSelected = varianteSeleccionada?.nombre === v.nombre;
                    return (
                      <button
                        key={`${v.nombre}-${index}`} 
                        disabled={v.agotado}
                        onClick={() => setVarianteSeleccionada(v)}
                        className={`px-6 py-3 font-bold text-sm tracking-wide rounded-full transition-all duration-300 border-2 ${
                          v.agotado 
                            ? 'opacity-30 cursor-not-allowed bg-gray-50 text-gray-800 border-gray-100 line-through' 
                            : isSelected 
                              ? 'border-black bg-black text-white shadow-md transform scale-[1.02]' 
                              : 'border-gray-200 text-gray-800 bg-white hover:border-gray-900'
                        }`}
                      >
                        {v.nombre}
                      </button>
                    )
                  })}
                </div>
                {varianteSeleccionada?.agotado && (
                  <p className="text-[10px] md:text-xs font-bold text-rose-600 uppercase tracking-widest mt-4">Este tamaño está temporalmente agotado.</p>
                )}
              </div>
            )}

            {/* SELECTOR DE CANTIDAD Y BOTONES (Bordes 100% redondeados) */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-full h-16 w-full sm:w-40 px-2 shadow-inner">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-full transition-all text-2xl font-light shadow-sm">-</button>
                <span className="flex-1 text-center font-black text-lg text-gray-900">{cantidad}</span>
                <button onClick={() => setCantidad(cantidad + 1)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-full transition-all text-2xl font-light shadow-sm">+</button>
              </div>
              
              <button 
                disabled={botonBloqueado}
                onClick={() => {
                  addItem({
                    id: `${producto.id}-${varianteSeleccionada ? varianteSeleccionada.nombre : 'unico'}`,
                    producto_id: producto.id,
                    nombre: producto.nombre,
                    marca: producto.marca || '',
                    precio: precioMostrar,
                    cantidad: cantidad,
                    tamano: varianteSeleccionada ? varianteSeleccionada.nombre : '',
                    imagen_url: galeria[indexActivo] 
                  })
                }}
                className={`flex-1 h-16 rounded-full font-black uppercase tracking-widest text-xs md:text-sm transition-all duration-300 ${
                  botonBloqueado 
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-[#D30F30] hover:shadow-[0_10px_30px_rgba(211,15,48,0.2)] active:scale-[0.98]'
                }`}
              >
                {sinStockGeneral ? 'Agotado' : (varianteAgotada ? 'Tamaño no disponible' : 'Agregar al Carrito')}
              </button>
            </div>
            
            {/* DESCRIPCIÓN */}
            <div className="bg-[#F8F9FA] rounded-3xl p-6 md:p-8 mt-4 border border-gray-100">
              {producto.descripcion && producto.descripcion !== '...' && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Descripción</h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium">{producto.descripcion}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-6 mt-6">
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Categoría</span>
                  <span className="font-bold text-gray-900">{producto.categoria}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Estado</span>
                  {sinStockGeneral ? (
                    <span className="text-rose-600 font-black uppercase tracking-wider">AGOTADO</span>
                  ) : (
                    <span className="text-emerald-600 font-black uppercase tracking-wider">DISPONIBLE</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECCIÓN DE ETIQUETAS (Mantenida intacta pero modernizada) */}
        {producto.etiquetas && (
          (() => {
            let etiquetasLimpias: string[] = [];
            try {
              if (producto.etiquetas.startsWith('[')) {
                const parsed = JSON.parse(producto.etiquetas);
                etiquetasLimpias = parsed.filter((t: any) => t.tipo === 'tag').map((t: any) => t.texto);
              } else {
                etiquetasLimpias = producto.etiquetas
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter((t: string) => {
                    const low = t.toLowerCase();
                    return low !== 'top' && low !== 'top ventas' && !t.includes('%');
                  });
              }
            } catch(e) {}

            if (etiquetasLimpias.length === 0) return null;

            return (
              <div className="mt-16 md:mt-24 pt-8 border-t border-gray-100 text-center md:text-left">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Etiquetas</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {etiquetasLimpias.map((tag: string, index: number) => (
                    <span key={`tag-${index}`} className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()
        )}
        
        {/* SECCIÓN DE PRODUCTOS RELACIONADOS (Diseño Tarjetas iPhone) */}
        {productosRelacionados.length > 0 && (
          <div className="mt-20 md:mt-28">
            <div className="text-center md:text-left mb-10 px-4 md:px-0">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-2 border-none">
                Más de {producto.marca}
              </h3>
              <div className="w-10 h-1 bg-black mx-auto md:mx-0 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {productosRelacionados.map(rel => (
                <Link href={`/producto/${rel.id}`} key={rel.id} className="group flex flex-col bg-white border border-gray-100 rounded-3xl p-4 hover:shadow-[0_15px_35px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500">
                  <div className="relative h-40 md:h-48 mb-4 bg-[#F8F9FA] rounded-2xl overflow-hidden group-hover:bg-gray-100 transition-colors duration-500">
                    <Image 
                      src={rel.imagen_url} 
                      alt={rel.nombre} 
                      fill 
                      sizes="25vw"
                      className="object-contain p-4 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" 
                      unoptimized
                    />
                  </div>
                  <div className="text-center px-1">
                    <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">{rel.marca}</p>
                    <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-[#D30F30] transition-colors">{rel.nombre}</h4>
                    <p className="text-gray-900 font-black mt-auto text-sm">{rel.precio} Bs.</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}