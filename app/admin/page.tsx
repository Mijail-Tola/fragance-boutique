"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function parseExcelCSV(text: string) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const delimiter = text.indexOf(';') !== -1 ? ';' : ',';
  let p = '', row = [''], ret = [row], i = 0, r = 0, s = true, l;
  for (l of text) {
    if ('"' === l) {
      if (s && l === p) row[i] += l;
      s = !s;
    } else if (delimiter === l && s) l = row[++i] = '';
    else if ('\n' === l && s) {
      if ('\r' === p) row[i] = row[i].slice(0, -1);
      row = ret[++r] = [(l = '')]; i = 0;
    } else row[i] += l;
    p = l;
  }
  return ret.filter(r => r.join('').trim() !== '');
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [productos, setProductos] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingImagenes, setUploadingImagenes] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  
  // SISTEMA DE TOASTS
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' | 'warning' }>({ show: false, message: '', type: 'success' })

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500)
  }
  
  const formularioVacio = {
    nombre: '', marca: '', categoria: 'Perfumes de diseñador', precio: '', 
    descripcion: '', imagen_url: '', stock: '10', galeria: [],
    tamano: '', etiquetas: ''
  }
  const [formData, setFormData] = useState<{
    nombre: string; marca: string; categoria: string; precio: string;
    descripcion: string; imagen_url: string; stock: string; galeria: string[];
    tamano: string; etiquetas: string;
  }>(formularioVacio)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        document.cookie = "fragance_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        window.location.href = '/login'
      } else {
        setSession(session)
        cargarProductos()
      }
      setAuthLoading(false)
    })
  }, [])

  const cargarProductos = async () => {
    const { data } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
    if (data) setProductos(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = "fragance_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = '/login'
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)
    
    const galeriaActual = (formData.galeria || []).filter(url => !url.includes('FALTA+FOTO'))
    if (galeriaActual.length + files.length > 4) {
      return showToast("Puedes tener máximo 4 fotos por producto", 'warning')
    }

    setUploadingImagenes(true)
    const urlsGeneradas: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error } = await supabase.storage.from('productos').upload(fileName, file)
      if (!error) {
        const { data } = supabase.storage.from('productos').getPublicUrl(fileName)
        urlsGeneradas.push(data.publicUrl)
      } else {
        showToast("Error subiendo una imagen", 'error')
      }
    }

    if (urlsGeneradas.length > 0) {
      const nuevaGaleria = [...galeriaActual, ...urlsGeneradas]
      setFormData({
        ...formData,
        imagen_url: nuevaGaleria[0],
        galeria: nuevaGaleria
      })
      showToast("Imágenes agregadas correctamente", 'success')
    }
    setUploadingImagenes(false)
  }

  const eliminarFoto = (index: number) => {
    const nuevaGaleria = formData.galeria.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      galeria: nuevaGaleria,
      imagen_url: nuevaGaleria.length > 0 ? nuevaGaleria[0] : 'https://via.placeholder.com/400x400.png?text=FALTA+FOTO'
    })
  }

  // LÓGICA DE DRAG & DROP
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (indexDrop: number) => {
    if (draggedIndex === null || draggedIndex === indexDrop) return
    const nuevaGaleria = [...formData.galeria]
    const [fotoArrastrada] = nuevaGaleria.splice(draggedIndex, 1)
    nuevaGaleria.splice(indexDrop, 0, fotoArrastrada)
    
    setFormData({
      ...formData,
      galeria: nuevaGaleria,
      imagen_url: nuevaGaleria.length > 0 ? nuevaGaleria[0] : 'https://via.placeholder.com/400x400.png?text=FALTA+FOTO'
    })
    setDraggedIndex(null)
  }

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.imagen_url) return showToast("Debes subir al menos una foto", 'warning')

    if (editingId) {
      const { error } = await supabase.from('productos').update(formData).eq('id', editingId)
      if (error) showToast(`Error: ${error.message}`, 'error')
      else { 
        showToast("Producto actualizado", 'success'); 
        setEditingId(null); 
      }
    } else {
      const { error } = await supabase.from('productos').insert([formData])
      if (error) showToast(`Error: ${error.message}`, 'error')
      else showToast("Producto añadido al catálogo", 'success')
    }
    setFormData(formularioVacio)
    cargarProductos()
  }

  const editarProducto = (prod: any) => {
    setEditingId(prod.id)
    setFormData({
      nombre: prod.nombre || '',
      marca: prod.marca || '',
      categoria: prod.categoria || 'Perfumes de diseñador',
      precio: prod.precio || '',
      descripcion: prod.descripcion || '',
      imagen_url: prod.imagen_url || '',
      stock: prod.stock || '10',
      galeria: prod.galeria && prod.galeria.length > 0 ? prod.galeria : [prod.imagen_url],
      tamano: prod.tamano || '',
      etiquetas: prod.etiquetas || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const eliminarProducto = async (id: string, nombre: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (!error) {
        showToast("Producto eliminado", 'success')
        cargarProductos()
      } else {
        showToast(`Error al eliminar: ${error.message}`, 'error')
      }
    }
  }

  const toggleStockRapido = async (id: string, stockActual: number) => {
    const nuevoStock = stockActual > 0 ? 0 : 10;
    const { error } = await supabase.from('productos').update({ stock: nuevoStock.toString() }).eq('id', id)
    if (!error) {
      showToast(nuevoStock === 0 ? "Marcado como agotado" : "Stock repuesto", 'success')
      cargarProductos()
    }
  }

  const exportarCSV = () => {
    const cabeceras = ['nombre', 'marca', 'categoria', 'precio', 'stock', 'tamano', 'etiquetas', 'imagen_url'];
    const filas = productos.map(p => cabeceras.map(cab => `"${(p[cab] || '').toString().replace(/"/g, '""')}"`).join(';'));
    const csvContent = [cabeceras.join(';'), ...filas].join('\n');
    
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Inventario_Fragance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Inventario exportado", 'success');
  }

  const descargarPlantilla = () => {
    const cabeceras = ['nombre', 'marca', 'categoria', 'precio', 'stock', 'tamano', 'etiquetas', 'imagen_url'];
    const ejemplo = ['"Odyssey Mandarin"', '"Armaf"', '"Árabe"', '"350"', '"10"', '"2 ml:35, 100 ml:350"', '"Top Ventas"', '""'];
    const csvContent = [cabeceras.join(';'), ejemplo.join(';')].join('\n');
    
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Plantilla_Productos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const importarCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const texto = event.target?.result as string;
        const filas = parseExcelCSV(texto);
        
        if (filas.length < 2) return showToast("El archivo está vacío", 'warning');
        
        const cabeceras = filas[0].map(h => h.toLowerCase().trim());
        const nuevosProductos = [];

        for (let i = 1; i < filas.length; i++) {
          const row = filas[i];
          const obj: any = {};
          cabeceras.forEach((cab, index) => obj[cab] = row[index]);
          
          if (obj.nombre && obj.precio) {
            nuevosProductos.push({
              nombre: obj.nombre,
              marca: obj.marca || '',
              categoria: obj.categoria || 'Perfumes de diseñador',
              precio: Number(obj.precio) || 0,
              stock: obj.stock ? obj.stock.toString() : '10',
              tamano: obj.tamano || '',
              etiquetas: obj.etiquetas || '',
              descripcion: '...',
              imagen_url: obj.imagen_url || 'https://via.placeholder.com/400x400.png?text=FALTA+FOTO',
              galeria: []
            });
          }
        }

        if (nuevosProductos.length === 0) return showToast("No hay productos válidos", 'error');
        
        const confirmacion = window.confirm(`Subiendo ${nuevosProductos.length} productos. ¿Continuar?`);
        if (!confirmacion) return;

        const { error } = await supabase.from('productos').insert(nuevosProductos);
        if (error) showToast(`Error: ${error.message}`, 'error');
        else {
          showToast(`¡${nuevosProductos.length} productos importados!`, 'success');
          cargarProductos();
        }
      } catch (err) {
        showToast("Error leyendo el archivo", 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  if (authLoading) return <div className="min-h-screen flex justify-center items-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl text-white font-bold tracking-wider uppercase text-sm transition-all duration-300 animate-in slide-in-from-bottom-5 ${toast.type === 'error' ? 'bg-[#e3000f]' : toast.type === 'warning' ? 'bg-orange-500' : 'bg-green-600'}`}>
          {toast.message}
        </div>
      )}

      <nav className="bg-black text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-bold uppercase tracking-widest">Panel de Control</span>
          <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 text-sm font-bold">Cerrar Sesión</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ZONA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h2 className="text-lg font-bold mb-6 border-b pb-2 uppercase">{editingId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
            
            <form onSubmit={guardarProducto} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Fotos del Producto *</label>
                
                <div className={`border-2 border-dashed border-gray-300 p-6 text-center rounded-lg cursor-pointer relative transition bg-white ${formData.imagen_url.includes('FALTA+FOTO') ? 'border-yellow-400 bg-yellow-50' : 'hover:bg-gray-50'}`}>
                  <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploadingImagenes} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {uploadingImagenes ? (
                    <p className="text-rose-600 font-bold animate-pulse">Subiendo...</p>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📸</div>
                      {formData.galeria && formData.galeria.length > 0 && !formData.imagen_url.includes('FALTA+FOTO') 
                        ? <p className="text-blue-600 text-sm font-bold">➕ Agregar MÁS fotos</p> 
                        : <p className="text-gray-600 text-sm font-medium">Toca o arrastra aquí</p>
                      }
                    </div>
                  )}
                </div>

                {/* Galería con Drag & Drop */}
                {formData.galeria && formData.galeria.length > 0 && !formData.imagen_url.includes('FALTA+FOTO') && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {formData.galeria.map((url, i) => (
                      <div 
                        key={url}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(i)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`relative w-24 h-24 rounded-lg border-2 overflow-hidden shadow-sm shrink-0 group cursor-grab active:cursor-grabbing transition-all duration-300 ${i === 0 ? 'border-black' : 'border-transparent'} ${draggedIndex === i ? 'opacity-40 scale-95 border-dashed border-gray-400' : 'opacity-100'}`}
                      >
                        <img src={url} alt={`Foto ${i}`} className="w-full h-full object-cover bg-gray-50 pointer-events-none" />
                        
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                            Portada
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => eliminarFoto(i)} className="bg-rose-600 text-white hover:bg-rose-700 w-8 h-8 rounded-full flex items-center justify-center shadow text-sm transition-transform hover:scale-110 z-20" title="Eliminar Foto">
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nombre *</label>
                <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:ring-1 focus:ring-black text-gray-900 font-medium" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Marca</label>
                  <input type="text" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:ring-1 focus:ring-black text-gray-900 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Categoría *</label>
                  <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full border border-gray-300 p-2 rounded bg-white outline-none focus:ring-1 focus:ring-black text-gray-900 font-medium">
                    <option value="Árabe">Árabe</option>
                    <option value="Perfumes de diseñador">Perfumes de diseñador</option>
                    <option value="Perfumes de Cartera">Perfumes de Cartera</option>
                    <option value="Cosméticos">Cosméticos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Tamaño/Precios</label>
                  <input type="text" placeholder="Ej: 2 ml:35" value={formData.tamano} onChange={e => setFormData({...formData, tamano: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:ring-1 focus:ring-black text-gray-900 font-medium text-sm placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Etiquetas</label>
                  <input type="text" placeholder="Ej: Top, -20%" value={formData.etiquetas} onChange={e => setFormData({...formData, etiquetas: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:ring-1 focus:ring-black text-gray-900 font-medium text-sm placeholder-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Precio Base *</label>
                  <input required type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:ring-1 focus:ring-black text-gray-900 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Stock *</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-300 p-2 rounded outline-none focus:ring-1 focus:ring-black text-gray-900 font-medium" />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button type="submit" disabled={uploadingImagenes} className="flex-1 bg-black text-white py-3 rounded font-bold uppercase tracking-wider hover:bg-gray-800 transition">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setFormData(formularioVacio); }} className="px-4 border border-gray-300 bg-white text-gray-600 rounded font-bold text-xs uppercase hover:bg-gray-100 transition">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ZONA DERECHA: INVENTARIO */}
        <div className="lg:col-span-8">
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold uppercase text-gray-800 flex items-center gap-2">📦 Inventario ({productos.length})</h2>
            
            <div className="flex gap-2 flex-wrap">
              <button onClick={descargarPlantilla} className="px-3 py-2 text-xs font-bold border border-gray-300 text-gray-600 rounded hover:bg-gray-50 flex items-center gap-1 transition">
                📄 Plantilla
              </button>
              
              <div className="relative">
                <input type="file" accept=".csv" onChange={importarCSV} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <button className="px-3 py-2 text-xs font-bold border border-blue-300 bg-blue-50 text-blue-700 rounded flex items-center gap-1 transition pointer-events-none">
                  ⬆️ Importar CSV
                </button>
              </div>

              <button onClick={exportarCSV} className="px-3 py-2 text-xs font-bold border border-green-300 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-1 transition">
                ⬇️ Exportar CSV
              </button>
            </div>
          </div>

          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-2">
              {productos.map(prod => {
                const faltaFoto = prod.imagen_url.includes('FALTA+FOTO');
                
                return (
                  <div key={prod.id} className={`flex items-center gap-4 p-4 border rounded transition-colors ${faltaFoto ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-gray-50'}`}>
                    <img src={prod.imagen_url} className="w-16 h-16 rounded object-cover border bg-white" alt={prod.nombre} />
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        {prod.nombre}
                        {faltaFoto && <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">⚠️ Falta Foto</span>}
                      </h3>
                      <p className="text-xs text-gray-500">{prod.marca ? `${prod.marca} • ` : ''}{prod.categoria}</p>
                      <p className="text-rose-600 font-bold mt-1">Bs. {prod.precio}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <div className="flex flex-col gap-2">
                        <button onClick={() => editarProducto(prod)} className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition ${faltaFoto ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                          {faltaFoto ? 'Subir Foto' : 'Editar'}
                        </button>
                        
                        <button 
                          onClick={() => toggleStockRapido(prod.id, Number(prod.stock))} 
                          className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${Number(prod.stock) > 0 ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                        >
                          {Number(prod.stock) > 0 ? 'Agotar' : 'Reponer'}
                        </button>
                      </div>

                      <button 
                        onClick={() => eliminarProducto(prod.id, prod.nombre)} 
                        className="px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors bg-red-50 text-red-700 hover:bg-red-100 flex items-center justify-center h-full"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}