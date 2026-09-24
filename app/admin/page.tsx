"use client"

import { useEffect, useState, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORIAS_PREDETERMINADAS = [
  "Árabe",
  "Perfumes de diseñador",
  "Perfumes de Cartera",
  "Cosméticos",
  "Perfumes Nicho"
]

export default function PanelInventarioSaaS() {
  const [productos, setProductos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  
  // ESTADOS DE BUSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [filtroStock, setFiltroStock] = useState('Todos')
  
  // ESTADOS DE UI
  const [toast, setToast] = useState<{mensaje: string, tipo: 'exito' | 'error'} | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  async function fetchProductos() {
    setCargando(true)
    const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
    if (error) mostrarToast('Error al cargar inventario', 'error')
    if (data) setProductos(data)
    setCargando(false)
  }

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const pasaBusqueda = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.marca && p.marca.toLowerCase().includes(busqueda.toLowerCase()));
      const pasaCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
      let pasaStock = true;
      const stock = Number(p.stock) || 0;
      const minStock = Number(p.stock_minimo) || 3;
      if (filtroStock === 'Agotado') pasaStock = stock <= 0;
      if (filtroStock === 'Bajo') pasaStock = stock > 0 && stock <= minStock;
      if (filtroStock === 'Óptimo') pasaStock = stock > minStock;
      return pasaBusqueda && pasaCategoria && pasaStock;
    })
  }, [productos, busqueda, filtroCategoria, filtroStock])

  const metricas = useMemo(() => {
    let valorTotal = 0, stockBajo = 0, agotados = 0;
    productos.forEach(p => {
      const stock = Number(p.stock) || 0, precio = Number(p.precio) || 0, minStock = Number(p.stock_minimo) || 3;
      valorTotal += (stock * precio);
      if (stock <= 0) agotados++;
      else if (stock <= minStock) stockBajo++;
    });
    return { total: productos.length, valorTotal, stockBajo, agotados }
  }, [productos])

  const categoriasUnicas = ['Todas', ...CATEGORIAS_PREDETERMINADAS]

  // 3. EXPORTAR CSV
  const exportarCSV = () => {
    const cabeceras = ['id', 'nombre', 'marca', 'categoria', 'precio', 'costo', 'stock', 'stock_minimo', 'descripcion', 'tamano', 'etiquetas', 'imagen_url'];
    const filas = productosFiltrados.map(p => {
      return cabeceras.map(cab => {
        let val = p[cab] === null || p[cab] === undefined ? '' : String(p[cab]);
        val = val.replace(/"/g, '""'); 
        return `"${val}"`; 
      }).join(';');
    });
    
    const csvContent = '\uFEFF' + [cabeceras.join(';'), ...filas].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarToast('Inventario exportado con éxito');
  }

  // 4. DESCARGAR PLANTILLA
  const descargarPlantilla = () => {
    const cabeceras = ['nombre', 'marca', 'categoria', 'precio', 'costo', 'stock', 'stock_minimo', 'descripcion', 'tamano', 'etiquetas', 'imagen_url'];
    const ejemplo = `"Perfume Ejemplo";"Dior";"Perfumes de diseñador";"1200";"800";"10";"3";"Una descripción breve";"[{""nombre"":""100ml"",""precio"":1200,""agotado"":false}]";"[{""texto"":""TOP"",""color"":""bg-black text-white"",""tipo"":""insignia""}]";""`;
    
    const csvContent = '\uFEFF' + [cabeceras.join(';'), ejemplo].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'plantilla_inventario.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 5. IMPORTAR CSV
  const importarCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const rows = text.split('\n').filter(r => r.trim())
      const headers = rows[0].split(';').map(h => h.replace(/"/g, '').replace(/\uFEFF/g, '').trim())
      const nuevosProductos = []
      
      for(let i = 1; i < rows.length; i++) {
        const valores = rows[i].split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"\vert{}"$/g, '').replace(/""/g, '"').trim())
        const obj: any = {}
        headers.forEach((h, idx) => { obj[h] = valores[idx] || '' })
        
        nuevosProductos.push({
          nombre: obj.nombre || 'Sin nombre',
          marca: obj.marca || '',
          categoria: obj.categoria || CATEGORIAS_PREDETERMINADAS[0],
          descripcion: obj.descripcion || '',
          precio: Number(obj.precio) || 0,
          costo: Number(obj.costo) || 0,
          stock: Number(obj.stock) || 0,
          stock_minimo: Number(obj.stock_minimo) || 3,
          tamano: obj.tamano || null,
          etiquetas: obj.etiquetas || null,
          imagen_url: obj.imagen_url || '',
          galeria: obj.imagen_url ? [obj.imagen_url] : []
        })
      }
      
      if (nuevosProductos.length === 0) throw new Error("Archivo vacío o formato incorrecto")
      const { error } = await supabase.from('productos').insert(nuevosProductos)
      if (error) throw new Error(error.message)

      mostrarToast(`${nuevosProductos.length} productos importados`)
      fetchProductos()
    } catch (error: any) {
      mostrarToast('Error al importar CSV: Verifica que el separador sea punto y coma (;)', 'error')
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  const ajustarStock = async (id: string, nuevoStock: number) => {
    if (nuevoStock < 0) return;
    const { error } = await supabase.from('productos').update({ stock: nuevoStock }).eq('id', id);
    if (!error) {
      setProductos(productos.map(p => p.id === id ? { ...p, stock: nuevoStock } : p));
    } else {
      mostrarToast('Error al actualizar', 'error');
    }
  }

  // BOTÓN RÁPIDO DE AGOTAR (Usado en PC y Celular)
  const agotarProducto = async (id: string) => {
    ajustarStock(id, 0);
  }

  const eliminarProducto = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) {
      setProductos(productos.filter(p => p.id !== id));
      mostrarToast('Producto eliminado correctamente');
    } else {
      mostrarToast('Error al eliminar', 'error');
    }
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    document.cookie = "fragance_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/portal-staff';
  }

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] text-gray-500 tracking-widest uppercase text-sm font-bold">Cargando sistema...</div>

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-sans text-gray-900 pb-16 md:pb-0 overflow-hidden">
      
      {/* TOAST FLOTANTE (Optimizado para no tapar el menú en celular) */}
      {toast && (
        <div className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-6 py-3 rounded-md shadow-lg font-medium text-sm flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toast.tipo === 'exito' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
          {toast.mensaje}
        </div>
      )}

      {/* SIDEBAR OSCURO (Solo Escritorio) */}
      <aside className="w-full md:w-64 bg-[#0B0F19] flex flex-col hidden md:flex z-10 shrink-0 h-screen sticky top-0">
        <div className="p-8 border-b border-gray-800/50">
          <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">Fragance</h2>
          <h2 className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mt-1">Control Panel</h2>
        </div>
        <div className="flex flex-col justify-between h-full px-4 py-6">
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-lg text-sm font-semibold border border-white/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
              Inventario
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Ir a la Tienda
            </Link>
          </nav>
          <button onClick={cerrarSesion} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL RESPONSIVO */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
        {/* HEADER (Reestructurado para Celular) */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0 sticky top-0 z-20 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 text-center md:text-left">Dashboard</h1>
          
          {/* Botones de Acción (Grid en Celular, Flex en PC) */}
          <div className="grid grid-cols-3 md:flex gap-2 md:gap-3 w-full md:w-auto">
            {/* Plantilla */}
            <button onClick={descargarPlantilla} className="col-span-1 px-2 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-100 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="text-[10px] md:text-sm font-medium">Plantilla</span>
            </button>
            
            {/* Importar */}
            <label className="col-span-1 cursor-pointer px-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-[10px] md:text-sm font-medium">Importar</span>
              <input type="file" accept=".csv" onChange={importarCSV} ref={csvInputRef} className="hidden" />
            </label>
            
            {/* Exportar */}
            <button onClick={exportarCSV} className="col-span-1 px-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="text-[10px] md:text-sm font-medium">Exportar</span>
            </button>

            {/* Crear Producto (Ancho completo en celular en la 2da fila del grid) */}
            <Link href="/admin/nuevo" className="col-span-3 md:col-span-1 px-4 py-3 md:py-2.5 bg-black text-white rounded-md text-sm font-semibold hover:bg-gray-800 flex items-center justify-center gap-2 shadow-sm mt-1 md:mt-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Crear Producto
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8">
          
          {/* TARJETAS DE MÉTRICAS (2 Columnas en Móvil) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] md:text-sm font-medium text-gray-500 mb-0.5 md:mb-1 leading-tight">Total Productos</p>
              <p className="text-xl md:text-3xl font-black text-gray-900">{metricas.total}</p>
            </div>
            <div className="bg-white p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] md:text-sm font-medium text-gray-500 mb-0.5 md:mb-1 leading-tight">Valor Inventario</p>
              <p className="text-xl md:text-3xl font-black text-gray-900 truncate">{metricas.valorTotal} Bs.</p>
            </div>
            <div className="bg-white p-3 md:p-5 rounded-xl border border-amber-200 shadow-sm bg-amber-50 flex flex-col justify-center">
              <p className="text-[10px] md:text-sm font-medium text-amber-700 mb-0.5 md:mb-1 leading-tight">Stock Bajo</p>
              <p className="text-xl md:text-3xl font-black text-amber-700">{metricas.stockBajo}</p>
            </div>
            <div className="bg-white p-3 md:p-5 rounded-xl border border-rose-200 shadow-sm bg-rose-50 flex flex-col justify-center">
              <p className="text-[10px] md:text-sm font-medium text-rose-600 mb-0.5 md:mb-1 leading-tight">Agotados</p>
              <p className="text-xl md:text-3xl font-black text-rose-600">{metricas.agotados}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            
            {/* BUSCADOR Y FILTROS (Organizado para Móvil) */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
              <div className="relative w-full">
                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o marca..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-2 md:flex gap-3">
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="w-full md:w-auto px-3 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black">
                  {categoriasUnicas.map(cat => <option key={cat as string} value={cat as string}>{cat}</option>)}
                </select>
                <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)} className="w-full md:w-auto px-3 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="Todos">Stock: Todos</option>
                  <option value="Óptimo">Óptimo</option>
                  <option value="Bajo">Stock Bajo</option>
                  <option value="Agotado">Agotados</option>
                </select>
              </div>
            </div>

            {/* VISTA DE ESCRITORIO (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6">Producto</th>
                    <th className="py-4 px-6">PVP</th>
                    <th className="py-4 px-6">Costo / Margen</th>
                    <th className="py-4 px-6 text-center">Stock</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productosFiltrados.map((prod) => {
                    const precio = Number(prod.precio) || 0, costo = Number(prod.costo) || 0, stock = Number(prod.stock) || 0, minStock = Number(prod.stock_minimo) || 3;
                    const margen = precio > 0 && costo > 0 ? (((precio - costo) / precio) * 100).toFixed(1) : '0';
                    let estado = 'Óptimo', badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (stock <= 0) { estado = 'Agotado'; badgeColor = 'bg-rose-50 text-rose-700 border-rose-200'; } 
                    else if (stock <= minStock) { estado = 'Bajo'; badgeColor = 'bg-amber-50 text-amber-700 border-amber-200'; }

                    return (
                      <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-3 px-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 relative overflow-hidden p-1">
                            {prod.imagen_url ? (
                              <Image src={prod.imagen_url} alt={prod.nombre} fill className="object-contain" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold">NO IMG</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 truncate max-w-[220px]">{prod.nombre}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{prod.marca || 'GENÉRICO'}</p>
                          </div>
                        </td>
                        
                        <td className="py-3 px-6"><span className="font-black text-gray-900">{precio} Bs.</span></td>
                        
                        <td className="py-3 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600">{costo > 0 ? `${costo} Bs.` : 'No dif.'}</span>
                            {costo > 0 && <span className="text-[10px] font-black text-emerald-600 mt-0.5">+{margen}%</span>}
                          </div>
                        </td>
                        
                        <td className="py-3 px-6">
                          <div className="flex justify-center">
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md w-fit p-0.5 shadow-sm">
                              <button onClick={() => ajustarStock(prod.id, stock - 1)} className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold transition-colors">-</button>
                              <span className="w-8 text-center font-bold text-sm text-gray-900">{stock}</span>
                              <button onClick={() => ajustarStock(prod.id, stock + 1)} className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold transition-colors">+</button>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                            {estado}
                          </span>
                        </td>
                        
                        {/* ACCIONES DE PC (Aquí añadí el botón Agotar para Computadora) */}
                        <td className="py-3 px-6 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {stock > 0 && (
                              <button onClick={() => agotarProducto(prod.id)} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100">
                                Agotar
                              </button>
                            )}
                            <Link href={`/admin/editar/${prod.id}`} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-gray-200 opacity-100 md:opacity-0 group-hover:opacity-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </Link>
                            <button onClick={() => eliminarProducto(prod.id, prod.nombre)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-100 opacity-100 md:opacity-0 group-hover:opacity-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* VISTA DE CELULAR (Tarjetas Optimizadas) */}
            <div className="md:hidden divide-y divide-gray-100 bg-gray-50">
              {productosFiltrados.map((prod) => {
                const stock = Number(prod.stock) || 0;
                return (
                  <div key={`mob-${prod.id}`} className="p-4 bg-white flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg border border-gray-200 relative p-1 shrink-0 bg-gray-50">
                        {prod.imagen_url ? (
                          <Image src={prod.imagen_url} alt={prod.nombre} fill className="object-contain" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold">NO IMG</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight text-gray-900 truncate">{prod.nombre}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 truncate">{prod.marca || 'Genérico'}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="font-black text-rose-600 text-sm">{prod.precio} Bs.</p>
                          {stock <= 0 && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-wider rounded border border-rose-100">Agotado</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Controles y Acciones Móviles */}
                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-100">
                      
                      {/* Botones +/- */}
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1 shrink-0">
                        <button onClick={() => ajustarStock(prod.id, stock - 1)} className="w-8 h-8 flex items-center justify-center font-bold text-xl text-gray-700 bg-white rounded shadow-sm active:bg-gray-100">-</button>
                        <span className="font-black text-base w-8 text-center">{stock}</span>
                        <button onClick={() => ajustarStock(prod.id, stock + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-xl text-gray-700 bg-white rounded shadow-sm active:bg-gray-100">+</button>
                      </div>
                      
                      {/* Botones de Acción (Agotar y Editar) */}
                      <div className="flex gap-2 shrink-0">
                        {stock > 0 && (
                          <button onClick={() => agotarProducto(prod.id)} className="px-3 h-10 rounded bg-white border border-rose-200 text-rose-600 text-[10px] font-bold uppercase tracking-wider active:bg-rose-50">
                            Agotar
                          </button>
                        )}
                        <Link href={`/admin/editar/${prod.id}`} className="flex items-center justify-center px-4 h-10 rounded bg-black text-white text-[10px] font-bold uppercase tracking-wider active:bg-gray-800">
                          Editar
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mensaje Sin Resultados */}
            {productosFiltrados.length === 0 && (
              <div className="p-10 md:p-16 text-center flex flex-col items-center bg-gray-50/50">
                <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p className="text-gray-500 font-medium text-sm">No se encontraron productos.</p>
                <button onClick={() => {setBusqueda(''); setFiltroCategoria('Todas'); setFiltroStock('Todos')}} className="mt-3 text-xs text-black underline font-bold hover:text-gray-700">Limpiar todos los filtros</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MENÚ INFERIOR PARA CELULARES */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#0B0F19] text-gray-400 flex justify-around items-center h-16 z-50 border-t border-gray-800 pb-safe">
         <Link href="/admin" className="flex flex-col items-center gap-1 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
            <span className="text-[9px] font-bold tracking-widest uppercase">Panel</span>
         </Link>
         <Link href="/" className="flex flex-col items-center gap-1 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="text-[9px] font-bold tracking-widest uppercase">Tienda</span>
         </Link>
         <button onClick={cerrarSesion} className="flex flex-col items-center gap-1 hover:text-rose-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-[9px] font-bold tracking-widest uppercase">Salir</span>
         </button>
      </nav>

    </div>
  )
}