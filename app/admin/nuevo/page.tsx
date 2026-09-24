"use client"

import { useState } from 'react'
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

const COLORES_INSIGNIAS = [
  { nombre: 'Negro (Elegante)', clase: 'bg-black text-white' },
  { nombre: 'Rojo (Oferta/Urgencia)', clase: 'bg-[#e50000] text-white' },
  { nombre: 'Dorado (Premium)', clase: 'bg-amber-500 text-white' }
]

export default function NuevoPerfume() {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<{mensaje: string, tipo: 'exito' | 'error'} | null>(null)
  
  const [imagenes, setImagenes] = useState<{file: File, preview: string}[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [variantesVisibles, setVariantesVisibles] = useState<{nombre: string, precio: number, agotado: boolean}[]>([])
  const [nuevaVarianteNombre, setNuevaVarianteNombre] = useState('')
  const [nuevaVariantePrecio, setNuevaVariantePrecio] = useState('')

  const [insignias, setInsignias] = useState<{texto: string, color: string}[]>([])
  const [nuevaInsigniaTexto, setNuevaInsigniaTexto] = useState('')
  const [nuevaInsigniaColor, setNuevaInsigniaColor] = useState(COLORES_INSIGNIAS[0].clase)

  const [tags, setTags] = useState<string[]>([])
  const [nuevoTag, setNuevoTag] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    marca: '',
    categoria: CATEGORIAS_PREDETERMINADAS[0],
    descripcion: '',
    precio: '',
    costo: '',
    stock: '',
    stock_minimo: '3',
  })

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAgregarImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const nuevas = Array.from(e.target.files).map(file => ({ file, preview: URL.createObjectURL(file) }))
      setImagenes(prev => [...prev, ...nuevas])
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const items = [...imagenes]
    const draggedItem = items[draggedIndex]
    items.splice(draggedIndex, 1)
    items.splice(index, 0, draggedItem)
    setImagenes(items)
    setDraggedIndex(index)
  }

  const agregarVariante = () => {
    if (!nuevaVarianteNombre) return
    setVariantesVisibles([...variantesVisibles, { nombre: nuevaVarianteNombre, precio: Number(nuevaVariantePrecio) || 0, agotado: false }])
    setNuevaVarianteNombre(''); setNuevaVariantePrecio('')
  }

  const agregarInsignia = () => {
    if (!nuevaInsigniaTexto) return
    setInsignias([...insignias, { texto: nuevaInsigniaTexto, color: nuevaInsigniaColor }])
    setNuevaInsigniaTexto('')
  }

  const agregarTag = () => {
    if (!nuevoTag) return
    setTags([...tags, nuevoTag])
    setNuevoTag('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (imagenes.length === 0) return mostrarToast('Añade al menos una foto.', 'error')

    setGuardando(true)
    try {
      let urlsFinales: string[] = []
      
      for (const item of imagenes) {
        const fileExt = item.file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('productos').upload(`perfumes/${fileName}`, item.file)
        if (uploadError) throw new Error('Error subiendo imágenes')
        const { data } = supabase.storage.from('productos').getPublicUrl(`perfumes/${fileName}`)
        urlsFinales.push(data.publicUrl)
      }

      const etiquetasCombinadas = [
        ...insignias.map(i => ({ ...i, tipo: 'insignia' })),
        ...tags.map(t => ({ texto: t, tipo: 'tag' }))
      ]

      const { error: dbError } = await supabase.from('productos').insert([{
        nombre: form.nombre,
        marca: form.marca,
        categoria: form.categoria,
        descripcion: form.descripcion,
        precio: Number(form.precio) || 0,
        costo: Number(form.costo) || 0,
        stock: Number(form.stock) || 0,
        stock_minimo: Number(form.stock_minimo) || 3,
        tamano: variantesVisibles.length > 0 ? JSON.stringify(variantesVisibles) : null,
        etiquetas: etiquetasCombinadas.length > 0 ? JSON.stringify(etiquetasCombinadas) : null,
        imagen_url: urlsFinales[0],
        galeria: urlsFinales
      }])

      if (dbError) throw new Error(dbError.message)

      mostrarToast('Producto creado con éxito', 'exito')
      setTimeout(() => router.push('/admin'), 1000)

    } catch (error: any) {
      mostrarToast(error.message || 'Hubo un error', 'error')
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row font-sans text-gray-900">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-md shadow-lg font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-5 ${toast.tipo === 'exito' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
          {toast.mensaje}
        </div>
      )}

      {/* SIDEBAR OSCURO HÍBRIDO */}
      <aside className="w-full md:w-64 bg-[#0B0F19] flex flex-col hidden md:flex z-10 shrink-0 h-screen sticky top-0">
        <div className="p-8 border-b border-gray-800/50">
          <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">Fragance</h2>
          <h2 className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mt-1">Control Panel</h2>
        </div>
        
        {/* Usamos h-full y flex-col justify-between para asegurar que el botón vaya abajo */}
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

          {/* BOTÓN CERRAR SESIÓN */}
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              document.cookie = "fragance_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              // AHORA REDIRIGE A TU URL SECRETA (O al inicio '/')
              window.location.href = '/portal-staff'; 
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Nuevo Perfume</h1>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-2.5 rounded-md text-sm font-bold tracking-wider uppercase text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={guardando} 
              className="bg-black text-white px-8 py-2.5 rounded-md text-sm font-bold tracking-wider uppercase hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {guardando ? 'Guardando...' : 'Crear Producto'}
            </button>
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
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">PVP (Bs) *</label>
                      <input required type="number" name="precio" value={form.precio} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-rose-600 font-bold focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Costo (Bs)</label>
                      <input type="number" name="costo" value={form.costo} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Stock *</label>
                      <input required type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Min. Stock</label>
                      <input type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b pb-3">Estructura del Producto</h2>
                
                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-3">Tamaños / Presentaciones</label>
                  <div className="flex flex-col gap-2 mb-3">
                    {variantesVisibles.map((v, i) => (
                      <div key={i} className={`flex items-center justify-between p-2 rounded border ${v.agotado ? 'bg-gray-50 opacity-60 border-gray-200' : 'bg-white border-gray-300'}`}>
                        <div className="flex gap-4"><span className="font-bold text-sm">{v.nombre}</span><span className="text-rose-600 text-sm">{v.precio > 0 ? `${v.precio} Bs.` : 'Mismo precio'}</span></div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => {const n = [...variantesVisibles]; n[i].agotado = !n[i].agotado; setVariantesVisibles(n)}} className="text-xs border border-gray-300 px-2 py-1 rounded">
                            {v.agotado ? 'Activar' : 'Agotar'}
                          </button>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-3">Insignias (Sobre foto)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {insignias.map((ins, i) => (
                        <div key={i} className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${ins.color}`}>
                          {ins.texto}
                          <button type="button" onClick={() => setInsignias(insignias.filter((_, idx) => idx !== i))} className="ml-1 opacity-70 hover:opacity-100">x</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input type="text" value={nuevaInsigniaTexto} onChange={e => setNuevaInsigniaTexto(e.target.value)} placeholder="Ej. TOP, %25" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                      <select value={nuevaInsigniaColor} onChange={e => setNuevaInsigniaColor(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black">
                        {COLORES_INSIGNIAS.map(c => <option key={c.nombre} value={c.clase}>{c.nombre}</option>)}
                      </select>
                      <button type="button" onClick={agregarInsignia} className="w-full py-2 border-2 border-black text-black font-bold text-sm rounded hover:bg-black hover:text-white transition-colors">Añadir Insignia</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-3">Tags (Info Abajo)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tags.map((tag, i) => (
                        <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {tag}
                          <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="ml-1 opacity-60 hover:text-red-500">x</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input type="text" value={nuevoTag} onChange={e => setNuevoTag(e.target.value)} placeholder="Ej. Mujer, Amaderado" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black" />
                      <button type="button" onClick={agregarTag} className="w-full py-2 bg-gray-100 border border-gray-300 text-gray-700 font-bold text-sm rounded hover:bg-gray-200 transition-colors">Añadir Tag</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-2 border-b pb-3">Galería Visual</h2>
                <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-wider">Arrastra para ordenar.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {imagenes.map((item, index) => (
                    <div key={`img-${index}`} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} className={`relative bg-gray-50 rounded-lg border-2 overflow-hidden group h-32 cursor-grab active:cursor-grabbing ${index === 0 ? 'border-black' : 'border-gray-200'}`}>
                      {index === 0 && <span className="absolute top-1 left-1 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 z-10 pointer-events-none">PORTADA</span>}
                      <Image src={item.preview} alt={`Foto ${index}`} fill className="object-contain p-2 pointer-events-none" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImagenes(imagenes.filter((_, i) => i !== index)); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
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