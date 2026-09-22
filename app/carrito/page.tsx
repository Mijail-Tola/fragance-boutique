"use client"

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  
  // Calculamos el total de forma directa y nativa
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  
  const [cliente, setCliente] = useState({
    nombre: '', telefono: '', ciudad: 'Cochabamba', direccion: '', notas: ''
  })

  const [mostrarQR, setMostrarQR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codigoOrden, setCodigoOrden] = useState('')

  const procesarPedido = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const pedidoId = crypto.randomUUID()
    const codigoGenerado = 'FB-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error: errorPedido } = await supabase
      .from('pedidos')
      .insert([{
        id: pedidoId,
        codigo_orden: codigoGenerado,
        cliente_nombre: cliente.nombre,
        cliente_telefono: cliente.telefono,
        ciudad: cliente.ciudad,
        direccion: 'Por coordinar por WhatsApp', // <-- CÁMBIALO A ESTO
        metodo_envio: 'Delivery local',
        total: total,
        estado: 'pendiente'
      }])

    if (errorPedido) {
      alert("Hubo un error al procesar tu pedido. Intenta nuevamente.")
      setLoading(false)
      return
    }

    const itemsParaGuardar = items.map(item => ({
      pedido_id: pedidoId,
      producto_id: item.producto_id, // Usamos el ID original del producto para la BD
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      // Si quieres guardar el tamaño en la BD en el futuro, podrías enviarlo aquí
    }))

    await supabase.from('pedido_items').insert(itemsParaGuardar)

    setCodigoOrden(codigoGenerado)
    setLoading(false)
    setMostrarQR(true)
  }

  const enviarAWhatsApp = () => {
    const numeroWhatsApp = "59163993851"
    
    let mensaje = `¡Hola Fragance Boutique!\n`
    mensaje += `Quiero confirmar mi pedido *#${codigoOrden}*\n\n`
    
    mensaje += `*DETALLE DEL PEDIDO*\n`
    mensaje += `--------------------------------------\n`
    items.forEach(item => {
      const tamanoTxt = item.tamano ? ` [${item.tamano}]` : '';
      mensaje += `- ${item.cantidad}x ${item.nombre}${tamanoTxt} (Bs. ${item.precio})\n`
      mensaje += `   _Subtotal: Bs. ${item.precio * item.cantidad}_\n`
    })
    mensaje += `--------------------------------------\n`
    mensaje += `*TOTAL A PAGAR: Bs. ${total}*\n\n`
    
    mensaje += `*DATOS DEL CLIENTE*\n`
    mensaje += `* Cliente: ${cliente.nombre}\n`
    mensaje += `* Ciudad: ${cliente.ciudad}\n`
    mensaje += `* Teléfono: ${cliente.telefono}\n`
    
    if (cliente.notas) {
      mensaje += `* Notas: ${cliente.notas}\n`
    }
    
    mensaje += `\n_Ya realicé el pago por transferencia QR. Aquí adjunto mi comprobante._`

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
    clearCart()
  }

  if (items.length === 0 && !mostrarQR) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu carrito está vacío</h2>
          <Link href="/catalogo" className="bg-black text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-rose-600 transition">
            Volver al Catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Finalizar Compra</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            {mostrarQR ? 'Paso 2: Pago Seguro' : 'Paso 1: Detalles de Envío'}
          </p>
        </div>
      </div>

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <section className="lg:col-span-7">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-200 pb-4 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Precio</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                    
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      {/* El botón de eliminar ahora solo necesita item.id */}
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition text-xl">×</button>
                      <img src={item.imagen_url} alt={item.nombre} className="w-20 h-20 object-cover rounded-md bg-gray-100 border border-gray-200" />
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{item.nombre}</h4>
                        {item.tamano && <p className="text-sm text-gray-500 mt-1">Tamaño: {item.tamano}</p>}
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 text-gray-600 md:text-center hidden md:block">
                      Bs. {item.precio}
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                      {!mostrarQR ? (
                        <div className="flex items-center border border-gray-300 rounded-sm">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))} className="px-3 py-1 hover:bg-gray-100 text-gray-900 transition font-bold">-</button>
                          <span className="px-3 py-1 text-sm font-bold text-gray-900 border-x border-gray-300 w-10 text-center">{item.cantidad}</span>
                          <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-900 transition font-bold">+</button>
                        </div>
                      ) : (
                        <span className="text-gray-900 font-bold">Cant: {item.cantidad}</span>
                      )}
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 text-right font-bold text-gray-900">
                      Bs. {item.precio * item.cantidad}
                    </div>
                  </div>
                ))}
              </div>

              {!mostrarQR && (
                <div className="flex items-center pt-4 border-t border-gray-200">
                  <Link href="/catalogo" className="border-2 border-black text-black px-6 py-3 font-bold text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                    <span>←</span> Seguir Comprando
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-5">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 sticky top-24">
              
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6 uppercase tracking-wider">
                Resumen del Pedido
              </h3>

              <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                <span>Subtotal</span>
                <span>Bs. {total}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                <span>Envío</span>
                <span className="text-rose-600 font-medium">Por coordinar</span>
              </div>
              
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t border-gray-200 pt-4 mb-8">
                <span>Total</span>
                <span>Bs. {total}</span>
              </div>

              {!mostrarQR ? (
                <form onSubmit={procesarPedido} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nombre Completo *</label>
                      <input required type="text" className="w-full border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-black outline-none text-gray-900 font-medium placeholder-gray-400" value={cliente.nombre} onChange={(e) => setCliente({...cliente, nombre: e.target.value})} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Teléfono *</label>
                      <input required type="tel" className="w-full border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-black outline-none text-gray-900 font-medium placeholder-gray-400" value={cliente.telefono} onChange={(e) => setCliente({...cliente, telefono: e.target.value})} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Ciudad *</label>
                      <select className="w-full border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-black outline-none bg-white text-gray-900 font-medium" value={cliente.ciudad} onChange={(e) => setCliente({...cliente, ciudad: e.target.value})}>
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="La Paz">La Paz</option>
                        <option value="Otras">Otra (Coordinar)</option>
                      </select>
                    </div>
                    {/* 👇 EL CAMPO DE DIRECCIÓN FUE ELIMINADO DE AQUÍ 👇 */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Notas del pedido (Opcional)</label>
                      <textarea rows={2} placeholder="Notas sobre tu pedido, referencias o indicaciones para la entrega." className="w-full border border-gray-300 rounded-sm p-2 focus:ring-1 focus:ring-black outline-none text-sm text-gray-900 font-medium placeholder-gray-400" value={cliente.notas} onChange={(e) => setCliente({...cliente, notas: e.target.value})} />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 border border-gray-200 mt-6 text-sm text-gray-600">
                    <strong className="block text-gray-900 mb-1">Transferencia bancaria QR</strong>
                    Realiza tu pago directamente mediante el código QR que se generará a continuación. Tu pedido no se procesará hasta que envíes el comprobante.
                  </div>

                  <button type="submit" disabled={loading} className={`w-full text-white py-4 font-bold text-lg transition tracking-wider ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-[#e3000f] hover:bg-red-700'}`}>
                    {loading ? 'PROCESANDO...' : 'REALIZAR EL PEDIDO'}
                  </button>
                </form>
              ) : (
                <div className="text-center animate-in fade-in zoom-in duration-500">
                  <div className="bg-green-50 border border-green-200 text-green-800 p-3 mb-6 font-medium text-sm">
                    Orden #{codigoOrden} registrada.
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">Escanea el código QR desde tu app bancaria.</p>
                  
                  <div className="bg-white p-4 inline-block mb-6 border border-gray-200 shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR de Pago" className="w-48 h-48 mx-auto" />
                  </div>

                  <button onClick={enviarAWhatsApp} className="w-full bg-[#25D366] text-white py-4 font-bold text-lg hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-md">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.656.69 5.2 1.996 7.458L.357 24l4.675-1.57c2.158 1.155 4.596 1.764 7.001 1.764 6.646 0 12.03-5.385 12.03-12.03S18.676 0 12.031 0zm0 22.215c-2.25 0-4.453-.604-6.388-1.751l-.458-.278-3.324 1.116.885-3.24-.306-.487C1.258 15.422.585 13.76.585 12.031c0-6.323 5.143-11.466 11.446-11.466 6.324 0 11.446 5.143 11.446 11.466s-5.122 11.466-11.446 11.466zM17.58 14.5c-.302-.15-1.785-.882-2.062-.982-.277-.101-.48-.15-.683.15-.203.303-.781.982-.958 1.183-.176.202-.353.226-.655.076-2.14-1.07-3.415-2.22-4.664-4.385-.175-.302-.018-.466.133-.616.136-.136.302-.353.453-.53.15-.176.203-.302.302-.504.101-.202.05-.378-.025-.53-.075-.15-.683-1.644-.935-2.25-.246-.593-.496-.513-.683-.521-.176-.009-.378-.009-.581-.009-.202 0-.53.076-.807.378-.278.303-1.058 1.034-1.058 2.522 0 1.488 1.084 2.925 1.235 3.127.15.202 2.134 3.256 5.166 4.562 2.135.918 2.87.807 3.398.681.603-.143 1.785-.731 2.037-1.437.252-.706.252-1.311.176-1.437-.076-.126-.277-.202-.58-.353z"/></svg>
                    Compra por WhatsApp
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}