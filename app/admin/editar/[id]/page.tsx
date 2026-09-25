"use client"

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const CATEGORIAS_PREDETERMINADAS = [
  "Árabe",
  "Perfumes de diseñador",
  "Perfumes de Cartera",
  "Cosméticos",
  "Perfumes Nicho"
]

const COLORES_TAGS = [
  { nombre: 'Gris (Neutro)', clase: 'bg-gray-100 text-gray-700 border border-gray-200' },
  { nombre: 'Negro (Elegante)', clase: 'bg-black text-white' },
  { nombre: 'Dorado (Premium)', clase: 'bg-amber-500 text-white' },
  { nombre: 'Verde (Fresco)', clase: 'bg-emerald-500 text-white' },
  { nombre: 'Azul (Acuático)', clase: 'bg-blue-500 text-white' }
]

type FotoUnificada = { id_local: string; esNueva: boolean; urlPreview: string; file?: File; }

export default function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <EditarPerfume id={resolvedParams.id} />
}

function EditarPerfume({ id }: { id: string }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<{mensaje: string, tipo: 'exito' | 'error'} | null>(null)
  
  const [fotos, setFotos] = useState<FotoUnificada[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [variantesVisibles, setVariantesVisibles] = useState<{nombre: string, precio: number, agotado: boolean}[]>([])
  const [nuevaVarianteNombre, setNuevaVarianteNombre] = useState('')
  const [nuevaVariantePrecio, setNuevaVariantePrecio] = useState('')

  // ESTADOS DEL PANEL DE MARKETING
  const [esTop, setEsTop] = useState(false)
  const [descuento, setDescuento] = useState<number | ''>('')
  const [tags, setTags] = useState<{texto: string, color: string}[]>([])
  const [nuevoTag, setNuevoTag] = useState('')
  const [nuevoTagColor, setNuevoTagColor] = useState(COLORES_TAGS[0].clase)

  const [form, setForm] = useState({
    nombre: '', marca: '', categoria: CATEGORIAS_PREDETERMINADAS[0], descripcion: '',
    precio: '', costo: '', stock: '', stock_minimo: '',
  })

  useEffect(() => {
    async function fetchProducto() {
      const { data, error } = await supabase.from('productos').select('*').eq('id', id).single()
      
      if (error) {
        mostrarToast('Error al cargar el producto', 'error')
      } else if (data) {
        setForm({
          nombre: data.nombre || '', marca: data.marca || '', categoria: data.categoria || CATEGORIAS_PREDETERMINADAS[0],
          descripcion: data.descripcion || '', precio: data.precio?.toString() || '', costo: data.costo?.toString() || '',
          stock: data.stock?.toString() || '', stock_minimo: data.stock_minimo?.toString() || '3',
        })
        
        let galeriaBd: string[] = []
        if (data.galeria && Array.isArray(data.galeria)) galeriaBd = data.galeria
        else if (data.imagen_url) galeriaBd = [data.imagen_url]
        setFotos(galeriaBd.map((url, i) => ({ id_local: `bd-${i}-${Date.now()}`, esNueva: false, urlPreview: url })))

        if (data.tamano) {
          try {
             if (data.tamano.startsWith('[')) setVariantesVisibles(JSON.parse(data.tamano))
             else setVariantesVisibles(data.tamano.split(',').map((item: string) => { const [n, p] = item.split(':'); return { nombre: n?.trim(), precio: Number(p?.trim()) || 0, agotado: false } }).filter((v: any) => v.nombre))
          } catch(e) {}
        }

        // LÓGICA CORREGIDA PARA LEER ETIQUETAS, TOPS Y DESCUENTOS
        if (data.etiquetas) {
          try {
            let parsed: any[] = [];
            if (data.etiquetas.startsWith('[')) {
              parsed = JSON.parse(data.etiquetas);
            } else {
              // Convertir formato antiguo a formato nuevo para que se lea correctamente
              const rawTags = data.etiquetas.split(',').map((t: string) => t.trim());
              parsed = rawTags.map((t: string) => {
                const lower = t.toLowerCase();
                if (lower === 'top' || lower === 'top ventas') return { tipo: 'top', texto: 'TOP' };
                if (t.includes('%')) {
                   const match = t.match(/\d+/);
                   if (match) return { tipo: 'descuento', valor: Number(match[0]) };
                }
                return { tipo: 'tag', texto: t, color: COLORES_TAGS[0].clase };
              });
            }

            const tagsAdicionales: {texto: string, color: string}[] = [];
            let encontradoTop = false;
            let encontradoDescuento: number | '' = '';

            parsed.forEach((t: any) => {
              const textUpper = (t.texto || '').toUpperCase();
              
              if (t.tipo === 'top' || textUpper === 'TOP' || textUpper === 'TOP VENTAS') {
                encontradoTop = true;
              } 
              else if (t.tipo === 'descuento' || t.tipo === 'insignia') {
                // Buscamos si hay un número en el texto o si tiene la propiedad valor
                if (t.valor) encontradoDescuento = Number(t.valor);
                else {
                  const match = textUpper.match(/\d+/);
                  if (match) encontradoDescuento = Number(match[0]);
                }
              } 
              else if (t.tipo === 'tag') {
                if (textUpper && textUpper !== 'TOP' && !textUpper.includes('%')) {
                  tagsAdicionales.push({ texto: t.texto, color: t.color || COLORES_TAGS[0].clase });
                }
              }
            });

            setEsTop(encontradoTop);
            setDescuento(encontradoDescuento);
            setTags(tagsAdicionales);

          } catch(e) {
            console.error("Error leyendo etiquetas", e);
          }
        }
      }
      setCargando(false)
    }
    fetchProducto()
  }, [id])

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => { setToast({ mensaje, tipo }); setTimeout(() => setToast(null), 3000) }
  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAgregarImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const nuevas = Array.from(e.target.files).map((file, i) => ({ id_local: `new-${i}-${Date.now()}`, esNueva: true, urlPreview: URL.createObjectURL(file), file: file }))
      setFotos(prev => [...prev, ...nuevas])
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = 'move' }
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault(); if (draggedIndex === null || draggedIndex === index) return;
    const items = [...fotos]; const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1); items.splice(index, 0, draggedItem);
    setFotos(items); setDraggedIndex(null);
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const agregarVariante = () => {
    if (!nuevaVarianteNombre) return
    setVariantesVisibles([...variantesVisibles, { nombre: nuevaVarianteNombre, precio: Number(nuevaVariantePrecio) || 0, agotado: false }])
    setNuevaVarianteNombre(''); setNuevaVariantePrecio('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (fotos.length === 0) return mostrarToast('Debes dejar al menos una imagen.', 'error')
    setGuardando(true)

    try {
      let urlsFinales: string[] = []
      for (const foto of fotos) {
        if (!foto.esNueva) urlsFinales.push(foto.urlPreview)
        else if (foto.file) {
          const ext = foto.file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
          const { error: uploadError } = await supabase.storage.from('productos').upload(`perfumes/${fileName}`, foto.file)
          if (uploadError) throw new Error('Error al subir imagen nueva')
          const { data } = supabase.storage.from('productos').getPublicUrl(`perfumes/${fileName}`)
          urlsFinales.push(data.publicUrl)
        }
      }
      
      // CONSTRUIMOS EL JSON PARA GUARDAR
      const etiquetasCombinadas: any[] = [...tags.map(t => ({ ...t, tipo: 'tag' }))]
      if (esTop) etiquetasCombinadas.unshift({ tipo: 'top', texto: 'TOP', color: 'bg-black text-white' })
      if (typeof descuento === 'number' && descuento > 0) etiquetasCombinadas.push({ tipo: 'descuento', valor: descuento, texto: `-${descuento}% OFF`, color: 'bg-[#e50000] text-white' })

      const { error: dbError } = await supabase.from('productos').update({
        nombre: form.nombre, marca: form.marca, categoria: form.categoria, descripcion: form.descripcion,
        precio: Number(form.precio) || 0, costo: Number(form.costo) || 0, stock: Number(form.stock) || 0, stock_minimo: Number(form.stock_minimo) || 3,
        tamano: variantesVisibles.length > 0 ? JSON.stringify(variantesVisibles) : null,
        etiquetas: etiquetasCombinadas.length > 0 ? JSON.stringify(etiquetasCombinadas) : null,
        imagen_url: urlsFinales[0], galeria: urlsFinales
      }).eq('id', id)

      if (dbError) throw new Error(dbError.message)

      mostrarToast('Cambios guardados', 'exito')
      setTimeout(() => { window.location.href = '/admin' }, 1000)

    } catch (error: any) {
      mostrarToast(error.message, 'error')
      setGuardando(false)
    }
  }

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] uppercase text-sm font-bold text-gray-500">Cargando...</div>

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row font-sans text-gray-900">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-md shadow-lg font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-5 ${toast.tipo === 'exito' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
          {toast.mensaje}
        </div>
      )}

      <aside className="w-full md:w-64 bg-[#0B0F19] flex flex-col hidden md:flex z-10 shrink-0 h-screen sticky top-0">
        <div className="p-8 border-b border-gray-800/50">
          <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">Fragance</h2>
          <h2 className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mt-1">Control Panel</h2>
        </div>
        <div className="flex flex-col justify-between h-full px-4 py-6">
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-lg text-sm font-semibold border border-white/5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>Inventario</Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Ir a la Tienda</Link>
          </nav>
          <button onClick={async () => { await supabase.auth.signOut(); document.cookie = "fragance_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; window.location.href = '/portal-staff'; }} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg text-sm font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Editar Perfume</h1>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => window.location.href = '/admin'} className="px-6 py-2.5 rounded-md text-sm font-bold tracking-wider uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={guardando} className="bg-black text-white px-8 py-2.5 rounded-md text-sm font-bold tracking-wider uppercase hover:bg-gray-800 disabled:opacity-50 transition-colors">{guardando ? 'Guardando...' : 'Actualizar'}</button>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          <form className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b pb-3">General y Finanzas</h2>
                <div className="space-y-4">
                  <input required type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del Perfume *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="marca" value={form.marca} onChange={handleChange} placeholder="Marca" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                      {CATEGORIAS_PREDETERMINADAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Descripción" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none"></textarea>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">PVP (Bs) *</label><input required type="number" name="precio" value={form.precio} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-rose-600 font-bold focus:outline-none focus:ring-1 focus:ring-black" /></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Costo (Bs)</label><input type="number" name="costo" value={form.costo} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" /></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Stock *</label><input required type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" /></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Min. Stock</label><input type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" /></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b pb-3">Tamaños / Presentaciones</h2>
                <div className="mb-4 flex flex-col gap-2">
                  {variantesVisibles.map((v, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded border ${v.agotado ? 'bg-gray-50 opacity-60 border-gray-200' : 'bg-white border-gray-300'}`}>
                      <div className="flex gap-4"><span className="font-bold text-sm">{v.nombre}</span><span className="text-rose-600 text-sm">{v.precio > 0 ? `${v.precio} Bs.` : 'Mismo precio'}</span></div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => {const n = [...variantesVisibles]; n[i].agotado = !n[i].agotado; setVariantesVisibles(n)}} className="text-xs border border-gray-300 px-2 py-1 rounded">{v.agotado ? 'Activar' : 'Agotar'}</button>
                        <button type="button" onClick={() => setVariantesVisibles(variantesVisibles.filter((_, idx) => idx !== i))} className="text-xs text-red-500 border border-red-100 px-2 py-1 rounded">Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={nuevaVarianteNombre} onChange={e => setNuevaVarianteNombre(e.target.value)} placeholder="Ej. 100ml" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                  <input type="number" value={nuevaVariantePrecio} onChange={e => setNuevaVariantePrecio(e.target.value)} placeholder="Precio" className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                  <button type="button" onClick={agregarVariante} className="px-4 bg-black text-white rounded text-sm font-bold">Añadir</button>
                </div>
              </div>

              {/* PANEL DE MARKETING */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b pb-3">Marketing y Etiquetas</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${esTop ? 'bg-gray-900 border-black' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <input type="checkbox" checked={esTop} onChange={e => setEsTop(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                    <div className="flex-1">
                      <span className={`block font-bold ${esTop ? 'text-white' : 'text-gray-900'}`}>Producto TOP</span>
                      <span className={`text-[10px] ${esTop ? 'text-gray-300' : 'text-gray-500'}`}>Aparecerá insignia negra</span>
                    </div>
                    {esTop && <span className="bg-white text-black text-[10px] font-black px-2 py-1 rounded uppercase">TOP</span>}
                  </label>

                  <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${typeof descuento === 'number' && descuento > 0 ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex-1">
                      <span className="block font-bold text-gray-900 mb-1">% Descuento</span>
                      <input type="number" min="0" max="99" value={descuento} onChange={e => setDescuento(e.target.value ? Number(e.target.value) : '')} placeholder="Ej. 20" className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    {typeof descuento === 'number' && descuento > 0 && <span className="bg-[#e50000] text-white text-[10px] font-black px-2 py-1 rounded uppercase mt-5">-{descuento}% OFF</span>}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-3">Etiquetas Adicionales</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, i) => (
                      <div key={i} className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tag.color}`}>
                        {tag.texto}
                        <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="ml-1.5 opacity-70 hover:opacity-100 font-bold">x</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input type="text" value={nuevoTag} onChange={e => setNuevoTag(e.target.value)} placeholder="Ej. Amaderado, Dulce..." className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                    <select value={nuevoTagColor} onChange={e => setNuevoTagColor(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black">
                      {COLORES_TAGS.map(c => <option key={c.nombre} value={c.clase}>{c.nombre}</option>)}
                    </select>
                    <button type="button" onClick={() => { if(nuevoTag.trim()) { setTags([...tags, {texto: nuevoTag.trim(), color: nuevoTagColor}]); setNuevoTag(''); } }} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold text-sm rounded hover:bg-gray-300 transition-colors">Añadir</button>
                  </div>
                </div>
              </div>

            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-2 border-b pb-3">Galería Visual</h2>
                <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-wider">Arrastra para ordenar. La primera será la portada.</p>
                <div className="grid grid-cols-2 gap-3">
                  {fotos.map((foto, index) => (
                    <div key={foto.id_local} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} className={`relative bg-gray-50 rounded-lg border-2 overflow-hidden group h-32 cursor-grab active:cursor-grabbing transition-colors ${index === 0 ? 'border-black' : (foto.esNueva ? 'border-amber-400 border-dashed bg-amber-50/20' : 'border-gray-200')}`}>
                      {index === 0 && <span className="absolute top-1 left-1 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 z-10 pointer-events-none">PORTADA</span>}
                      {foto.esNueva && index !== 0 && <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 z-10 pointer-events-none">NUEVA</span>}
                      <Image src={foto.urlPreview} alt={`Foto ${index}`} fill className="object-contain p-2 pointer-events-none" unoptimized={!foto.esNueva} />
                      <button type="button" onClick={(e) => { e.stopPropagation(); if(!foto.esNueva) { if(!window.confirm('¿Borrar foto de la base de datos?')) return; } setFotos(fotos.filter((_, i) => i !== index)); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                  ))}
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 h-32 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <span className="text-xl text-gray-400 mb-1">+</span><span className="text-xs font-bold text-gray-500">Añadir Foto</span>
                    <input type="file" accept="image/*" multiple onChange={handleAgregarImagenes} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}