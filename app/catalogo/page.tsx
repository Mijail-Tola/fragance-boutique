"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import Image from 'next/image'

// COMPONENTE DE TARJETA (TU DISEÑO ORIGINAL + LÓGICA NUEVA)
const ProductoCard = ({ producto }: { producto: any }) => {
  const sinStockGeneral = Number(producto.stock) <= 0;
  
  // 1. LÓGICA PARA INSIGNIAS (Solo las que van sobre la foto)
  let insignias: {texto: string, color: string}[] = [];
  if (producto.etiquetas) {
    try {
      if (producto.etiquetas.startsWith('[')) {
        const parsed = JSON.parse(producto.etiquetas);
        insignias = parsed.filter((t: any) => t.tipo === 'insignia');
      } else {
        const oldTags = producto.etiquetas.split(',').map((t: string) => t.trim());
        oldTags.forEach((t: string) => {
          const low = t.toLowerCase();
          if (low === 'top' || low === 'top ventas') insignias.push({texto: 'TOP', color: 'bg-black text-white'});
          else if (t.includes('%')) insignias.push({texto: t, color: 'bg-[#e50000] text-white'});
        });
      }
    } catch(e) {}
  }

  // 2. LÓGICA PARA TAMAÑOS (Precios y Variantes Agotadas)
  let variantes: {nombre: string, agotado: boolean}[] = [];
  let minPrecio = Number(producto.precio) || 0;
  let maxPrecio = minPrecio;
  
  // Variable crucial: ¿Están ABSOLUTAMENTE TODOS los tamaños agotados?
  let todosTamanosAgotados = false; 

  if (producto.tamano) {
    try {
      let parsedVars: any[] = [];
      if (producto.tamano.startsWith('[')) {
        parsedVars = JSON.parse(producto.tamano);
      } else if (producto.tamano.includes(':')) {
        parsedVars = producto.tamano.split(',').map((item: string) => {
          const [nombre, precio] = item.split(':');
          return { nombre: nombre?.trim(), precio: Number(precio?.trim()), agotado: false };
        }).filter((v: any) => v.nombre && !isNaN(v.precio));
      } else {
        parsedVars = producto.tamano.split(',').map((t: string) => ({nombre: t.trim(), precio: Number(producto.precio), agotado: false})).filter((v:any) => v.nombre);
      }

      if (parsedVars.length > 0) {
        variantes = parsedVars.map((v: any) => ({nombre: v.nombre, agotado: v.agotado || false}));
        
        // Calculamos rango de precios SOLO de los que NO están agotados (opcional, pero buena práctica)
        const preciosDisponibles = parsedVars.filter((v:any) => !v.agotado && v.precio > 0).map((v: any) => v.precio);
        
        if (preciosDisponibles.length > 0) {
          minPrecio = Math.min(...preciosDisponibles);
          maxPrecio = Math.max(...preciosDisponibles);
        } else {
           // Si llega aquí, significa que hay variantes, pero TODAS están marcadas como agotadas
           todosTamanosAgotados = true;
           // En este caso, mostramos el rango original aunque estén agotadas para que sepan cuánto costaba
           const todosPrecios = parsedVars.filter((v:any) => v.precio > 0).map((v: any) => v.precio);
           if(todosPrecios.length > 0) {
              minPrecio = Math.min(...todosPrecios);
              maxPrecio = Math.max(...todosPrecios);
           }
        }
      }
    } catch(e) {}
  }

  // El producto se considera "Agotado" en la portada si el stock general es 0, o si TODAS sus variantes están agotadas.
  // Si solo 1 de 3 variantes está agotada, la portada NO muestra el cartel gigante de agotado.
  const mostrarAgotadoEnPortada = sinStockGeneral || todosTamanosAgotados;

  const mostrarRango = minPrecio > 0 && maxPrecio > 0 && minPrecio !== maxPrecio;
  const precioActual = mostrarRango ? `${minPrecio}Bs. - ${maxPrecio}Bs.` : `${producto.precio}Bs.`;

  const imagenPrincipal = producto.imagen_url;
  const imagenSecundaria = producto.galeria && producto.galeria.length > 1 ? producto.galeria[1] : producto.imagen_url;
  const tieneHover = imagenPrincipal !== imagenSecundaria && !mostrarAgotadoEnPortada;

  return (
    <div className="flex flex-col group">
      <Link href={`/producto/${producto.id}`} className="flex-1 flex flex-col relative">
        <div className="absolute top-2 left-2 z-20 flex flex-col shadow-sm gap-[1px]">
          {insignias.map((ins, idx) => (
            <div key={idx} className={`${ins.color || 'bg-black text-white'} text-[10px] font-bold px-2 py-1 uppercase tracking-widest text-center`}>
              {ins.texto}
            </div>
          ))}
        </div>
        
        <div className="relative h-64 md:h-72 w-full bg-white mb-4 overflow-hidden">
          <Image 
            src={imagenPrincipal} 
            alt={producto.nombre} 
            fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized
            className={`object-contain transition-all duration-700 ease-in-out p-2 ${mostrarAgotadoEnPortada ? 'opacity-40' : tieneHover ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} 
          />
          {tieneHover && (
            <Image 
              src={imagenSecundaria} 
              alt={`${producto.nombre} alternativa`} 
              fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized
              className="object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out p-2" 
            />
          )}
          {mostrarAgotadoEnPortada && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40">
              <span className="font-bold text-gray-900 tracking-widest text-sm px-2 py-2 bg-white/90 w-full text-center">AGOTADO</span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 text-left px-1">
          <p className="text-[11px] text-gray-700 uppercase tracking-widest mb-1 font-medium">{producto.marca}</p>
          <h4 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-rose-600 transition-colors leading-snug">
            {producto.nombre}
          </h4>
          <div className="mt-auto pt-3 border-t border-gray-100">
            <span className={`inline-block text-sm md:text-base font-bold px-3 py-1.5 rounded-sm tracking-wide ${mostrarAgotadoEnPortada ? 'bg-gray-50 text-gray-400' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors'}`}>
              {precioActual}
            </span>
          </div>
        </div>
      </Link>

      {/* VARIANTES COMPACTAS EN PORTADA */}
      {!mostrarAgotadoEnPortada && variantes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 px-1">
          {variantes.map(v => (
            <Link
              key={v.nombre}
              href={`/producto/${producto.id}?tamano=${encodeURIComponent(v.nombre)}`}
              // Si la variante individual está agotada, se dibuja pero atenuada y tachada
              className={`px-2 py-1 border text-xs transition-colors ${
                 v.agotado 
                 ? 'border-gray-100 text-gray-300 bg-gray-50/50 line-through pointer-events-none' 
                 : 'border-gray-200 text-gray-700 hover:border-gray-900 bg-white'
              }`}
            >
              {v.nombre}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// PÁGINA PRINCIPAL DEL CATÁLOGO
export default function CatalogoPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [busquedaFiltro, setBusquedaFiltro] = useState<string>('') 
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const [marcaFiltro, setMarcaFiltro] = useState<string>('Todas')
  const [ordenFiltro, setOrdenFiltro] = useState<string>('destacados') 
  
  // ESTADOS DE LA PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1)
  const PRODUCTOS_POR_PAGINA = 12 

  useEffect(() => {
    async function fetchProductos() {
      const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
      if (error) console.error('Error:', error)
      if (data) setProductos(data)
    }
    fetchProductos()
  }, [])

  useEffect(() => {
    setPaginaActual(1)
  }, [busquedaFiltro, categoriaFiltro, marcaFiltro, ordenFiltro])

  const categoriasList = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))
  const marcasList = Array.from(new Set(productos.map(p => p.marca).filter(Boolean)))

  const getCountCategoria = (cat: string) => productos.filter(p => p.categoria === cat).length
  const getCountMarca = (marca: string) => productos.filter(p => p.marca === marca).length

  // FILTRADO
  let productosFiltrados = productos.filter(producto => {
    const pasaCategoria = categoriaFiltro === 'Todas' || producto.categoria === categoriaFiltro
    const pasaMarca = marcaFiltro === 'Todas' || producto.marca === marcaFiltro
    
    const termino = busquedaFiltro.toLowerCase().trim()
    const pasaBusqueda = termino === '' || 
                         producto.nombre.toLowerCase().includes(termino) || 
                         (producto.marca && producto.marca.toLowerCase().includes(termino))
                         
    return pasaCategoria && pasaMarca && pasaBusqueda
  })

  // HELPER PARA OBTENER PRECIO MÍNIMO (Soporta JSON)
  const getMinPrice = (producto: any) => {
    if (producto.tamano) {
      try {
        if (producto.tamano.startsWith('[')) {
          const vars = JSON.parse(producto.tamano);
          const precios = vars.map((v: any) => v.precio).filter((p: number) => p > 0);
          if (precios.length > 0) return Math.min(...precios);
        } else if (producto.tamano.includes(':')) {
          const precios = producto.tamano.split(',').map((item: string) => Number(item.split(':')[1]?.trim())).filter((p: number) => !isNaN(p));
          if (precios.length > 0) return Math.min(...precios);
        }
      } catch(e) {}
    }
    return Number(producto.precio) || 0;
  }

  // ORDENAMIENTO
  let productosOrdenados = [...productosFiltrados];
  switch (ordenFiltro) {
    case 'destacados':
      productosOrdenados.sort((a, b) => {
        const aTop = a.etiquetas && (a.etiquetas.toLowerCase().includes('top') || a.etiquetas.includes('"texto":"TOP"')) ? 1 : 0;
        const bTop = b.etiquetas && (b.etiquetas.toLowerCase().includes('top') || b.etiquetas.includes('"texto":"TOP"')) ? 1 : 0;
        return bTop - aTop; 
      });
      break;
    case 'precio_asc':
      productosOrdenados.sort((a, b) => getMinPrice(a) - getMinPrice(b));
      break;
    case 'precio_desc':
      productosOrdenados.sort((a, b) => getMinPrice(b) - getMinPrice(a));
      break;
    case 'az':
      productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'za':
      productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
  }

  // PAGINACIÓN
  const totalPaginas = Math.ceil(productosOrdenados.length / PRODUCTOS_POR_PAGINA)
  const productosPaginados = productosOrdenados.slice(
    (paginaActual - 1) * PRODUCTOS_POR_PAGINA, 
    paginaActual * PRODUCTOS_POR_PAGINA
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="max-w-7xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-12">
        
        {/* BARRA LATERAL (Filtros) */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <div className="text-sm text-gray-500 mb-10 tracking-wide">
              <Link href="/" className="hover:underline">INICIO</Link> <span className="mx-2">/</span> <span className="font-bold text-gray-900">CATÁLOGO</span>
            </div>

            <div className="mb-10">
              <h4 className="font-bold text-gray-800 tracking-wider uppercase text-sm">Marca</h4>
              <div className="w-8 h-0.5 bg-gray-300 mt-3 mb-5"></div>
              <select className="w-full border border-gray-300 rounded-md p-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 cursor-pointer" value={marcaFiltro} onChange={(e) => setMarcaFiltro(e.target.value)}>
                <option value="Todas">Selecciona una marca</option>
                {marcasList.map(marca => <option key={marca} value={marca}>{marca} ({getCountMarca(marca)})</option>)}
              </select>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 tracking-wider uppercase text-sm">Categoría</h4>
              <div className="w-8 h-0.5 bg-gray-300 mt-3 mb-5 md:mb-2"></div>
              
              <select 
                className="block md:hidden w-full border border-gray-300 rounded-md p-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 cursor-pointer mb-6"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="Todas">Todos ({productos.length})</option>
                {categoriasList.map(cat => (
                  <option key={cat} value={cat}>{cat} ({getCountCategoria(cat)})</option>
                ))}
              </select>

              <div className="hidden md:flex flex-col">
                <button onClick={() => setCategoriaFiltro('Todas')} className={`flex justify-between items-center py-3 border-b border-gray-100 last:border-0 transition-colors ${categoriaFiltro === 'Todas' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                  <span>Todos</span><span className="text-xs">({productos.length})</span>
                </button>
                {categoriasList.map(cat => (
                  <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`flex justify-between items-center py-3 border-b border-gray-100 last:border-0 text-left transition-colors ${categoriaFiltro === cat ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                    <span>{cat}</span><span className="text-xs shrink-0 ml-2">({getCountCategoria(cat)})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ZONA PRINCIPAL */}
        <div className="flex-1">
          
          {/* BARRA DE BÚSQUEDA PREMIUM */}
          <div className="group flex w-full bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-200 mb-8 overflow-hidden focus-within:border-black focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="pl-6 flex items-center justify-center text-gray-400 group-focus-within:text-black transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="¿Qué perfume estás buscando hoy?" 
              value={busquedaFiltro}
              onChange={(e) => setBusquedaFiltro(e.target.value)}
              className="flex-1 px-4 py-4 md:py-5 outline-none text-gray-800 placeholder-gray-400 text-base md:text-lg bg-transparent"
            />
            <button className="bg-black text-white px-8 md:px-12 flex items-center justify-center hover:bg-[#e3000f] hover:text-white transition-colors uppercase font-bold tracking-widest text-xs md:text-sm">
              Buscar
            </button>
          </div>

          {/* BARRA SUPERIOR DE ORDENAMIENTO */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-8 gap-4">
            <p className="text-gray-500 text-sm font-medium">
              Mostrando <span className="text-gray-900 font-bold">{productosOrdenados.length}</span> productos
              {busquedaFiltro && <span> para "{busquedaFiltro}"</span>}
            </p>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Ordenar por:</span>
              <select 
                value={ordenFiltro} 
                onChange={(e) => setOrdenFiltro(e.target.value)}
                className="border border-gray-300 rounded-md py-2 px-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer font-medium text-gray-700"
              >
                <option value="destacados">Destacados & Novedades</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="az">Alfabético: A - Z</option>
                <option value="za">Alfabético: Z - A</option>
              </select>
            </div>
          </div>

          {/* GRID DE PRODUCTOS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {productosPaginados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-16 border-t pt-8">
              <button 
                onClick={() => {
                  setPaginaActual(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={paginaActual === 1}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-black hover:border-black disabled:opacity-30 transition-colors"
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPaginas }).map((_, i) => {
                const pagina = i + 1;
                if (pagina === 1 || pagina === totalPaginas || (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)) {
                  return (
                    <button 
                      key={pagina}
                      onClick={() => {
                        setPaginaActual(pagina);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors ${
                        paginaActual === pagina 
                        ? 'bg-black text-white border-black shadow-md' 
                        : 'border border-gray-300 text-gray-700 hover:border-black'
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
                  return <span key={pagina} className="w-6 text-center text-gray-400">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => {
                  setPaginaActual(p => Math.min(totalPaginas, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={paginaActual === totalPaginas}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-black hover:border-black disabled:opacity-30 transition-colors"
              >
                &gt;
              </button>
            </div>
          )}

          {/* MENSAJE SI NO HAY RESULTADOS */}
          {productosOrdenados.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-100 shadow-sm mt-8">
              <p className="text-gray-500 text-lg mb-4">No encontramos productos que coincidan con tu búsqueda.</p>
              <button 
                onClick={() => { setCategoriaFiltro('Todas'); setMarcaFiltro('Todas'); setBusquedaFiltro(''); setOrdenFiltro('destacados'); }} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition font-medium"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          )}
        </div>

      </section>
    </main>
  )
}