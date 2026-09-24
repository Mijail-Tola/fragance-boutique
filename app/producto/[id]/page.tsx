"use client"

// 1. Añadimos 'use' a la importación de React
import { useEffect, useState, Suspense, use } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

// 2. Le decimos a TypeScript que params es una Promesa
export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  // 3. Desenvolvemos la promesa con React.use()
  const resolvedParams = use(params)

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 tracking-widest uppercase">Cargando esencia...</div>}>
      {/* 4. Usamos el ID ya resuelto */}
      <ProductoDetalle id={resolvedParams.id} />
    </Suspense>
  )
}

function ProductoDetalle({ id }: { id: string }) {
  const searchParams = useSearchParams()
  const tamanoURL = searchParams.get('tamano')
  
  const [producto, setProducto] = useState<any>(null)
  const [imagenActiva, setImagenActiva] = useState<string>('')
  
  // NUEVO TIPO DE VARIANTE: Ahora incluye la propiedad "agotado"
  const [variantes, setVariantes] = useState<{nombre: string, precio: number, agotado?: boolean}[]>([])
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<{nombre: string, precio: number, agotado?: boolean} | null>(null)
  
  const [cantidad, setCantidad] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const [productosRelacionados, setProductosRelacionados] = useState<any[]>([])

  useEffect(() => {
    async function fetchProductoYRelacionados() {
      // 1. Buscamos el producto actual
      const { data } = await supabase.from('productos').select('*').eq('id', id).single()
      if (data) {
        setProducto(data)
        setImagenActiva(data.imagen_url)
        
        // PARSEO DE TAMAÑOS COMPATIBLE CON EL NUEVO PANEL DE ADMINISTRADOR
        if (data.tamano) {
          try {
            let parsedVars: any[] = [];
            
            if (data.tamano.startsWith('[')) {
              // Si viene del nuevo panel (formato JSON)
              parsedVars = JSON.parse(data.tamano);
            } else if (data.tamano.includes(':')) {
              // Si es el formato viejo "100ml:2100"
              parsedVars = data.tamano.split(',').map((item: string) => {
                const [nombre, precio] = item.split(':')
                return { nombre: nombre?.trim(), precio: Number(precio?.trim()) || 0, agotado: false }
              });
            } else {
              // Si es el formato muy viejo "100ml, 50ml"
              parsedVars = data.tamano.split(',').map((item: string) => {
                return { nombre: item.trim(), precio: Number(data.precio), agotado: false }
              });
            }

            const validVars = parsedVars.filter((v: any) => v.nombre && !isNaN(v.precio));
            setVariantes(validVars);
            
            if (validVars.length > 0) {
              // Intenta seleccionar el de la URL, si no, el primero que NO esté agotado, si no, el primero.
              const varianteInit = validVars.find((v: any) => v.nombre === tamanoURL) 
                || validVars.find((v: any) => !v.agotado) 
                || validVars[0];
              setVarianteSeleccionada(varianteInit)
            }
          } catch(e) {
            console.error("Error leyendo tamaños:", e);
          }
        }

        // 2. Buscamos otros perfumes de la misma MARCA (excluyendo el actual)
        if (data.marca) {
          const { data: relacionados } = await supabase
            .from('productos')
            .select('*')
            .eq('marca', data.marca)
            .neq('id', id)
            .limit(4) // Máximo 4 para no saturar la página
          
          if (relacionados) setProductosRelacionados(relacionados)
        }
      }
    }
    fetchProductoYRelacionados()
  }, [id, tamanoURL])

  if (!producto) return <div className="min-h-screen flex items-center justify-center text-gray-500 tracking-widest uppercase">Cargando esencia...</div>

  // Lógica de Stock Bloqueado
  const sinStockGeneral = Number(producto.stock) <= 0
  const varianteAgotada = varianteSeleccionada?.agotado === true
  const botonBloqueado = sinStockGeneral || varianteAgotada
  const precioMostrar = varianteSeleccionada ? varianteSeleccionada.precio : producto.precio

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        
        {/* BREADCRUMBS */}
        <div className="text-xs text-gray-500 mb-8 tracking-wider uppercase font-medium">
          <Link href="/" className="hover:text-black transition">Inicio</Link> 
          <span className="mx-3">/</span> 
          <Link href="/catalogo" className="hover:text-black transition">Catálogo</Link> 
          <span className="mx-3">/</span> 
          <span className="text-gray-900 font-bold">{producto.marca}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* ZONA IZQUIERDA: GALERÍA DE IMÁGENES */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-[350px] md:h-[550px] bg-gray-50 rounded-sm overflow-hidden flex items-center justify-center">
              <Image 
                src={imagenActiva || producto.imagen_url} 
                alt={producto.nombre} 
                fill
                priority 
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain p-4 md:p-8 transition-opacity duration-300 ${sinStockGeneral ? 'opacity-50' : ''}`}
                unoptimized
              />
              
              {sinStockGeneral && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                  <span className="font-bold text-gray-900 tracking-widest text-2xl px-6 py-4 bg-white/90 shadow-sm">
                    AGOTADO
                  </span>
                </div>
              )}

              {producto.galeria && producto.galeria.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const currentIndex = producto.galeria.indexOf(imagenActiva || producto.imagen_url);
                      const prevIndex = (currentIndex - 1 + producto.galeria.length) % producto.galeria.length;
                      setImagenActiva(producto.galeria[prevIndex]);
                    }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 text-black rounded-full shadow-md hover:bg-black hover:text-white transition-colors z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const currentIndex = producto.galeria.indexOf(imagenActiva || producto.imagen_url);
                      const nextIndex = (currentIndex + 1) % producto.galeria.length;
                      setImagenActiva(producto.galeria[nextIndex]);
                    }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 text-black rounded-full shadow-md hover:bg-black hover:text-white transition-colors z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Miniaturas Inferiores Estilo Botón */}
            {producto.galeria && producto.galeria.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {producto.galeria.map((img: string, idx: number) => {
                  const isActive = (imagenActiva || producto.imagen_url) === img;
                  return (
                    <button 
                      key={`miniatura-${idx}`} 
                      onClick={() => setImagenActiva(img)}
                      className={`relative h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-sm overflow-hidden snap-center transition-all duration-200 border-2 ${isActive ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <Image src={img} alt={`Miniatura ${idx + 1}`} fill sizes="100px" className="object-cover bg-gray-50" unoptimized />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ZONA DERECHA: INFORMACIÓN DEL PRODUCTO */}
          <div className="flex flex-col pt-2 md:pt-10">
            <h2 className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold mb-2">{producto.marca}</h2>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{producto.nombre}</h1>
            
            <p className="text-2xl font-bold text-rose-600 mb-8">
              {precioMostrar} Bs.
            </p>

            {/* SELECTOR DE VARIANTES (TAMAÑOS) */}
            {!sinStockGeneral && variantes.length > 0 && (
              <div className="mb-8">
                <span className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Selecciona un tamaño:</span>
                <div className="flex flex-wrap gap-3">
                  {variantes.map((v, index) => {
                    const isSelected = varianteSeleccionada?.nombre === v.nombre;
                    return (
                      <button
                        key={`${v.nombre}-${index}`} // Llave única segura
                        disabled={v.agotado}
                        onClick={() => setVarianteSeleccionada(v)}
                        // Lógica de diseño para "Agotado" (Difuminado y tachado) vs "Disponible"
                        className={`px-6 py-2.5 font-medium text-sm tracking-wide transition-all duration-300 border ${
                          v.agotado 
                            ? 'opacity-30 cursor-not-allowed bg-transparent text-gray-800 border-gray-200 line-through' 
                            : isSelected 
                              ? 'border-black bg-black text-white shadow-md' 
                              : 'border-gray-200 text-gray-800 bg-white hover:border-black'
                        }`}
                      >
                        {v.nombre}
                      </button>
                    )
                  })}
                </div>
                {varianteSeleccionada?.agotado && (
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mt-3">Este tamaño está temporalmente agotado.</p>
                )}
              </div>
            )}

            {/* SELECTOR DE CANTIDAD Y BOTONES */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-gray-300 h-14 w-full sm:w-32">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-4 text-gray-500 hover:text-black transition text-xl font-light">-</button>
                <span className="flex-1 text-center font-bold text-gray-900">{cantidad}</span>
                <button onClick={() => setCantidad(cantidad + 1)} className="px-4 text-gray-500 hover:text-black transition text-xl font-light">+</button>
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
                    imagen_url: imagenActiva || producto.imagen_url
                  })
                  // EL ALERT FUE ELIMINADO EXITOSAMENTE
                }}
                className={`flex-1 h-14 font-bold uppercase tracking-widest text-sm transition-all shadow-lg active:scale-[0.98] ${
                  botonBloqueado 
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none' 
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {sinStockGeneral ? 'Agotado' : (varianteAgotada ? 'Tamaño no disponible' : 'Agregar al Carrito')}
              </button>
            </div>
            {/* DESCRIPCIÓN MINIMALISTA */}
            <div className="border-t border-gray-200 pt-8 mt-4 space-y-4">
              {producto.descripcion && producto.descripcion !== '...' && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Descripción</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{producto.descripcion}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Categoría</span>
                  <span className="font-medium text-gray-900">{producto.categoria}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Estado</span>
                  {sinStockGeneral ? (
                    <span className="text-rose-600 font-bold uppercase tracking-wider">AGOTADO</span>
                  ) : (
                    <span className="text-green-600 font-bold uppercase tracking-wider">DISPONIBLE</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECCIÓN DE ETIQUETAS (TAGS) INVISIBLES EN CARA PRINCIPAL */}
        {producto.etiquetas && (
          (() => {
            let etiquetasLimpias: string[] = [];
            try {
              if (producto.etiquetas.startsWith('[')) {
                // Del nuevo admin: Solo extraer las de tipo "tag" (Descriptivas)
                const parsed = JSON.parse(producto.etiquetas);
                etiquetasLimpias = parsed.filter((t: any) => t.tipo === 'tag').map((t: any) => t.texto);
              } else {
                // Del viejo panel: Filtrar todo lo que no sea 'top' o '%'
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
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {etiquetasLimpias.map((tag: string, index: number) => (
                    <span key={`tag-${index}`} className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded-sm hover:border-black hover:text-black transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()
        )}
        
        {/* SECCIÓN DE PRODUCTOS RELACIONADOS */}
        {productosRelacionados.length > 0 && (
          <div className="mt-20">
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-8 border-b pb-4">
              Más de {producto.marca}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productosRelacionados.map(rel => (
                <Link href={`/producto/${rel.id}`} key={rel.id} className="group flex flex-col bg-white border border-gray-100 rounded-md p-4 hover:shadow-lg transition-shadow">
                  <div className="relative h-40 mb-4 bg-gray-50 overflow-hidden">
                    <Image 
                      src={rel.imagen_url} 
                      alt={rel.nombre} 
                      fill 
                      sizes="25vw"
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                      unoptimized
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{rel.marca}</p>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 mb-2">{rel.nombre}</h4>
                  <p className="text-rose-600 font-bold mt-auto text-sm">{rel.precio} Bs.</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}