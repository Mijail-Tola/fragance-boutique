"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import Image from 'next/image'

// COMPONENTE DE TARJETA ESTILO iPHONE PREMIUM
const ProductoCard = ({ producto }: { producto: any }) => {
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
        const oldTags = producto.etiquetas.split(',').map((t: string) => t.trim());
        oldTags.forEach((t: string) => {
          const low = t.toLowerCase();
          if (low === 'top' || low === 'top ventas') insignias.push({texto: 'TOP', color: 'bg-black text-white'});
          else if (t.includes('%')) {
            insignias.push({texto: t, color: 'bg-[#e50000] text-white'});
            const match = t.match(/\d+/);
            if (match) descuentoPorcentaje = Math.max(descuentoPorcentaje, parseInt(match[0]));
          }
        });
      }
    } catch(e) {}
  }

  let variantes: {nombre: string, agotado: boolean}[] = [];
  let minPrecio = Number(producto.precio) || 0;
  let maxPrecio = minPrecio;
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
        const preciosDisponibles = parsedVars.filter((v:any) => !v.agotado && v.precio > 0).map((v: any) => v.precio);
        
        if (preciosDisponibles.length > 0) {
          minPrecio = Math.min(...preciosDisponibles);
          maxPrecio = Math.max(...preciosDisponibles);
        } else {
           todosTamanosAgotados = true;
           const todosPrecios = parsedVars.filter((v:any) => v.precio > 0).map((v: any) => v.precio);
           if(todosPrecios.length > 0) {
              minPrecio = Math.min(...todosPrecios);
              maxPrecio = Math.max(...todosPrecios);
           }
        }
      }
    } catch(e) {}
  }

  const factorDescuento = descuentoPorcentaje > 0 ? (1 - descuentoPorcentaje / 100) : 1;
  const minPrecioFinal = Math.round(minPrecio * factorDescuento);
  const maxPrecioFinal = Math.round(maxPrecio * factorDescuento);

  const mostrarAgotadoEnPortada = sinStockGeneral || todosTamanosAgotados;
  const mostrarRango = minPrecio > 0 && maxPrecio > 0 && minPrecio !== maxPrecio;
  
  const precioOriginalTxt = mostrarRango ? `${minPrecio}Bs. - ${maxPrecio}Bs.` : `${minPrecio}Bs.`;
  const precioFinalTxt = mostrarRango ? `${minPrecioFinal}Bs. - ${maxPrecioFinal}Bs.` : `${minPrecioFinal}Bs.`;

  const imagenPrincipal = producto.imagen_url;
  const imagenSecundaria = producto.galeria && producto.galeria.length > 1 ? producto.galeria[1] : producto.imagen_url;
  const tieneHover = imagenPrincipal !== imagenSecundaria && !mostrarAgotadoEnPortada;

  return (
    <div className="flex flex-col group h-full relative bg-white p-3 md:p-5 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgb(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 ease-out">
      
      <Link href={`/producto/${producto.id}`} className="absolute inset-0 z-10" aria-label={`Ver producto ${producto.nombre}`} />

      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        {insignias.map((ins, idx) => (
          <div key={idx} className={`${ins.color || 'bg-black text-white'} text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-center shadow-sm backdrop-blur-sm bg-opacity-90`}>
            {ins.texto}
          </div>
        ))}
      </div>
      
      <div className="relative h-48 md:h-64 w-full bg-[#F8F9FA] rounded-[1.25rem] mb-4 overflow-hidden flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-500 pointer-events-none">
        <Image 
          src={imagenPrincipal} 
          alt={producto.nombre} 
          fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized
          className={`object-contain transition-all duration-700 ease-out p-4 md:p-6 ${mostrarAgotadoEnPortada ? 'opacity-40' : tieneHover ? 'group-hover:opacity-0' : 'group-hover:scale-110 group-hover:rotate-1'}`} 
        />
        {tieneHover && (
          <Image 
            src={imagenSecundaria} 
            alt={`${producto.nombre} alternativa`} 
            fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized
            className="object-contain absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out p-4 md:p-6" 
          />
        )}
        {mostrarAgotadoEnPortada && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <span className="font-bold text-gray-900 tracking-widest text-[10px] md:text-xs px-4 py-2 bg-white shadow-lg rounded-full">AGOTADO</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 text-center px-1 pointer-events-none">
        <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">{producto.marca}</p>
        <h4 className="font-bold text-gray-900 text-sm md:text-base mb-2 group-hover:text-[#D30F30] transition-colors leading-snug line-clamp-2">
          {producto.nombre}
        </h4>
        <div className="mt-auto pt-2 flex flex-col items-center justify-end min-h-[3rem]">
          {descuentoPorcentaje > 0 && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through decoration-gray-400 mb-0.5">
              {precioOriginalTxt}
            </span>
          )}
          <span className={`inline-block text-base md:text-lg font-black tracking-tight ${mostrarAgotadoEnPortada ? 'text-gray-400' : 'text-gray-900 group-hover:text-[#D30F30] transition-colors'}`}>
            {precioFinalTxt}
          </span>
        </div>
      </div>

      {!mostrarAgotadoEnPortada && variantes.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-4 pt-4 border-t border-gray-50 relative z-20">
          {variantes.map(v => (
            <Link
              key={v.nombre}
              href={`/producto/${producto.id}?tamano=${encodeURIComponent(v.nombre)}`}
              className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-colors ${
                 v.agotado 
                 ? 'border border-gray-100 text-gray-300 bg-gray-50/50 line-through pointer-events-none' 
                 : 'border border-gray-200 text-gray-600 bg-white hover:border-black hover:text-black'
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

export default function CatalogoPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [busquedaFiltro, setBusquedaFiltro] = useState<string>('') 
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const [marcaFiltro, setMarcaFiltro] = useState<string>('Todas')
  const [ordenFiltro, setOrdenFiltro] = useState<string>('destacados') 
  
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

  let productosFiltrados = productos.filter(producto => {
    const pasaCategoria = categoriaFiltro === 'Todas' || producto.categoria === categoriaFiltro
    const pasaMarca = marcaFiltro === 'Todas' || producto.marca === marcaFiltro
    
    const termino = busquedaFiltro.toLowerCase().trim()
    const pasaBusqueda = termino === '' || 
                         producto.nombre.toLowerCase().includes(termino) || 
                         (producto.marca && producto.marca.toLowerCase().includes(termino))
                         
    return pasaCategoria && pasaMarca && pasaBusqueda
  })

  const getMinPriceWithDiscount = (producto: any) => {
    let minP = Number(producto.precio) || 0;
    if (producto.tamano) {
      try {
        if (producto.tamano.startsWith('[')) {
          const vars = JSON.parse(producto.tamano);
          const precios = vars.map((v: any) => v.precio).filter((p: number) => p > 0);
          if (precios.length > 0) minP = Math.min(...precios);
        } else if (producto.tamano.includes(':')) {
          const precios = producto.tamano.split(',').map((item: string) => Number(item.split(':')[1]?.trim())).filter((p: number) => !isNaN(p));
          if (precios.length > 0) minP = Math.min(...precios);
        }
      } catch(e) {}
    }
    let desc = 0;
    if (producto.etiquetas) {
       try {
         if (producto.etiquetas.startsWith('[')) {
            JSON.parse(producto.etiquetas).forEach((t: any) => {
               if (t.tipo === 'descuento' && t.valor) desc = Math.max(desc, Number(t.valor));
            });
         }
       } catch(e){}
    }
    return Math.round(minP * (1 - desc / 100));
  }

  let productosOrdenados = [...productosFiltrados];
  switch (ordenFiltro) {
    case 'destacados':
      productosOrdenados.sort((a, b) => {
        const aTop = a.etiquetas && (a.etiquetas.toLowerCase().includes('"tipo":"top"') || a.etiquetas.includes('TOP')) ? 1 : 0;
        const bTop = b.etiquetas && (b.etiquetas.toLowerCase().includes('"tipo":"top"') || b.etiquetas.includes('TOP')) ? 1 : 0;
        return bTop - aTop; 
      });
      break;
    case 'precio_asc':
      productosOrdenados.sort((a, b) => getMinPriceWithDiscount(a) - getMinPriceWithDiscount(b));
      break;
    case 'precio_desc':
      productosOrdenados.sort((a, b) => getMinPriceWithDiscount(b) - getMinPriceWithDiscount(a));
      break;
    case 'az':
      productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'za':
      productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
  }

  const totalPaginas = Math.ceil(productosOrdenados.length / PRODUCTOS_POR_PAGINA)
  const productosPaginados = productosOrdenados.slice(
    (paginaActual - 1) * PRODUCTOS_POR_PAGINA, 
    paginaActual * PRODUCTOS_POR_PAGINA
  )

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <section className="max-w-7xl mx-auto py-8 md:py-16 px-4 flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16">
        
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="sticky top-24">
            <div className="text-[10px] md:text-xs text-gray-400 mb-8 md:mb-12 tracking-[0.2em] uppercase font-bold">
              <Link href="/" className="hover:text-black transition-colors">INICIO</Link> <span className="mx-2">/</span> <span className="text-gray-900">CATÁLOGO</span>
            </div>

            <div className="mb-10 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
              <h4 className="font-black text-gray-900 tracking-wider uppercase text-sm mb-4">Marca</h4>
              <select className="w-full border-0 bg-gray-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-700 cursor-pointer font-medium" value={marcaFiltro} onChange={(e) => setMarcaFiltro(e.target.value)}>
                <option value="Todas">Todas las marcas</option>
                {marcasList.map(marca => <option key={marca} value={marca}>{marca} ({getCountMarca(marca)})</option>)}
              </select>
            </div>

            <div className="bg-white p-6 md:p-0 md:bg-transparent md:border-0 md:shadow-none rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
              <h4 className="font-black text-gray-900 tracking-wider uppercase text-sm mb-4 md:mb-6">Categoría</h4>
              
              <select 
                className="block md:hidden w-full border-0 bg-gray-50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-700 cursor-pointer"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="Todas">Todos ({productos.length})</option>
                {categoriasList.map(cat => (
                  <option key={cat} value={cat}>{cat} ({getCountCategoria(cat)})</option>
                ))}
              </select>

              <div className="hidden md:flex flex-col gap-1.5">
                <button 
                  onClick={() => setCategoriaFiltro('Todas')} 
                  className={`group flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-300 ${categoriaFiltro === 'Todas' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <span className="font-bold text-sm">Todas</span>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${categoriaFiltro === 'Todas' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900'}`}>{productos.length}</span>
                </button>
                {categoriasList.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setCategoriaFiltro(cat)} 
                    className={`group flex justify-between items-center px-4 py-3 rounded-xl text-left transition-all duration-300 ${categoriaFiltro === cat ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <span className="font-bold text-sm">{cat}</span>
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 ml-2 ${categoriaFiltro === cat ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900'}`}>{getCountCategoria(cat)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="group flex w-full bg-white rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 overflow-hidden focus-within:border-gray-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-1.5">
            <div className="pl-5 md:pl-6 flex items-center justify-center text-gray-400 group-focus-within:text-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="¿Qué perfume estás buscando hoy?" 
              value={busquedaFiltro}
              onChange={(e) => setBusquedaFiltro(e.target.value)}
              className="flex-1 px-4 py-3.5 md:py-4 outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base bg-transparent font-medium"
            />
            <button className="bg-black text-white px-6 md:px-10 rounded-full flex items-center justify-center hover:bg-[#D30F30] hover:shadow-lg transition-all uppercase font-black tracking-widest text-[10px] md:text-xs">
              Buscar
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent py-2 mb-8 gap-4 px-2">
            <p className="text-gray-500 text-xs md:text-sm font-medium tracking-wide">
              Mostrando <span className="text-gray-900 font-black">{productosOrdenados.length}</span> productos
              {busquedaFiltro && <span> para "{busquedaFiltro}"</span>}
            </p>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:inline">Ordenar:</span>
              <select 
                value={ordenFiltro} 
                onChange={(e) => setOrdenFiltro(e.target.value)}
                className="border-0 bg-gray-50 rounded-full py-2.5 px-5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer font-bold text-gray-800 shadow-sm"
              >
                <option value="destacados">Destacados & Novedades</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="az">Alfabético: A - Z</option>
                <option value="za">Alfabético: Z - A</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
            {productosPaginados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-16 md:mt-20 pt-8 border-t border-gray-100">
              <button 
                onClick={() => {
                  setPaginaActual(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={paginaActual === 1}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-black disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
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
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-black text-sm flex items-center justify-center transition-all ${
                        paginaActual === pagina 
                        ? 'bg-black text-white shadow-lg transform scale-105' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black shadow-sm'
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
                  return <span key={pagina} className="w-8 text-center text-gray-300 font-bold tracking-widest">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => {
                  setPaginaActual(p => Math.min(totalPaginas, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={paginaActual === totalPaginas}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black hover:border-black disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}

          {productosOrdenados.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)] mt-8">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-gray-500 text-lg font-medium mb-6">No encontramos la esencia que buscas.</p>
              <button 
                onClick={() => { setCategoriaFiltro('Todas'); setMarcaFiltro('Todas'); setBusquedaFiltro(''); setOrdenFiltro('destacados'); }} 
                className="bg-black text-white hover:bg-[#D30F30] px-8 py-3.5 rounded-full transition-all font-bold tracking-widest uppercase text-xs shadow-lg"
              >
                Ver todo el catálogo
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}