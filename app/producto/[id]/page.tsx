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
  const [variantes, setVariantes] = useState<{nombre: string, precio: number}[]>([])
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<{nombre: string, precio: number} | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  useEffect(() => {
    async function fetchProducto() {
      const { data } = await supabase.from('productos').select('*').eq('id', id).single()
      if (data) {
        setProducto(data)
        setImagenActiva(data.imagen_url)
        
        // Lógica para leer los tamaños y precios (Ej: "2 ml:35, 100 ml:540")
        if (data.tamano && data.tamano.includes(':')) {
          const parsed = data.tamano.split(',').map((item: string) => {
            const [nombre, precio] = item.split(':')
            return { nombre: nombre?.trim(), precio: Number(precio?.trim()) }
          }).filter((v: any) => v.nombre && !isNaN(v.precio))
          
          setVariantes(parsed)
          
          if (parsed.length > 0) {
            // Si vino un tamaño desde el catálogo, lo selecciona. Si no, selecciona el primero.
            const varianteInit = parsed.find((v: any) => v.nombre === tamanoURL) || parsed[0]
            setVarianteSeleccionada(varianteInit)
          }
        }
      }
    }
    fetchProducto()
  }, [id, tamanoURL])

  if (!producto) return <div className="min-h-screen flex items-center justify-center text-gray-500 tracking-widest uppercase">Cargando esencia...</div>

  const sinStock = Number(producto.stock) <= 0
  const precioMostrar = varianteSeleccionada ? varianteSeleccionada.precio : producto.precio

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        
        {/* BREADCRUMBS (Ruta de navegación limpia) */}
        <div className="text-xs text-gray-500 mb-8 tracking-wider uppercase font-medium">
          <Link href="/" className="hover:text-black transition">Inicio</Link> 
          <span className="mx-3">/</span> 
          <Link href="/catalogo" className="hover:text-black transition">Catálogo</Link> 
          <span className="mx-3">/</span> 
          <span className="text-gray-900 font-bold">{producto.nombre}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* ZONA IZQUIERDA: GALERÍA DE IMÁGENES */}
          <div className="flex flex-col md:flex-row-reverse gap-4">
            {/* Imagen Principal */}
            <div className="flex-1 bg-gray-50 p-6 md:p-10 flex items-center justify-center relative h-[450px] md:h-[600px] overflow-hidden group">
               <Image 
                src={imagenActiva || producto.imagen_url} 
                alt={producto.nombre} 
                fill
                priority 
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain transition-transform duration-700 p-8 ${sinStock ? 'opacity-50' : 'group-hover:scale-105'}`}
                unoptimized
              />
              {sinStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                  <span className="font-bold text-gray-900 tracking-widest text-2xl px-6 py-4 bg-white/90 shadow-sm">
                    AGOTADO
                  </span>
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            {producto.galeria && producto.galeria.length > 1 && (
              <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 shrink-0 pb-2 md:pb-0">
                {producto.galeria.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setImagenActiva(img)}
                    className={`relative h-24 w-24 md:w-full md:h-28 overflow-hidden shrink-0 transition-all duration-300 ${imagenActiva === img || (!imagenActiva && idx === 0) ? 'border-b-2 border-black opacity-100' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <Image 
                      src={img} 
                      alt={`Miniatura ${idx + 1}`} 
                      fill 
                      sizes="100px"
                      className="object-cover bg-gray-50 p-2" 
                      unoptimized
                    />
                  </button>
                ))}
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

            {/* SELECTOR DE VARIANTES (ESTILO PÍLDORAS) */}
            {!sinStock && variantes.length > 0 && (
              <div className="mb-8">
                <span className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Selecciona un tamaño:</span>
                <div className="flex flex-wrap gap-3">
                  {variantes.map(v => (
                    <button
                      key={v.nombre}
                      onClick={() => setVarianteSeleccionada(v)}
                      className={`px-6 py-3 border font-medium text-sm tracking-wide transition-all duration-300 ${
                        varianteSeleccionada?.nombre === v.nombre 
                        ? 'border-black bg-black text-white shadow-md' 
                        : 'border-gray-200 text-gray-600 bg-white hover:border-gray-900'
                      }`}
                    >
                      {v.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SELECTOR DE CANTIDAD Y BOTONES */}
            {!sinStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center border border-gray-300 h-14 w-full sm:w-32">
                  <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-4 text-gray-500 hover:text-black transition text-xl font-light">-</button>
                  <span className="flex-1 text-center font-bold text-gray-900">{cantidad}</span>
                  <button onClick={() => setCantidad(cantidad + 1)} className="px-4 text-gray-500 hover:text-black transition text-xl font-light">+</button>
                </div>
                
                <button 
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
                  }}
                  className="flex-1 bg-black text-white h-14 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]"
                >
                  Agregar al Carrito
                </button>
              </div>
            )}

            {/* ACORDEÓN / DESCRIPCIÓN MINIMALISTA */}
            <div className="border-t border-gray-200 pt-8 mt-4 space-y-4">
              {producto.descripcion && producto.descripcion !== '...' && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Descripción</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{producto.descripcion}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Categoría</span>
                  <span className="font-medium text-gray-900">{producto.categoria}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Estado</span>
                  {sinStock ? (
                    <span className="text-rose-600 font-bold uppercase tracking-wider">AGOTADO</span>
                  ) : (
                    <span className="text-green-600 font-bold uppercase tracking-wider">DISPONIBLE</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}