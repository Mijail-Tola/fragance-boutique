"use client"

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Image from 'next/image'

export default function CarritoPage() {
  // LÓGICA INTACTA
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  
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
        direccion: 'Por coordinar por WhatsApp', 
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
      producto_id: item.producto_id, 
      cantidad: item.cantidad,
      precio_unitario: item.precio,
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

  // VISTA: CARRITO VACÍO (DISEÑO PREMIUM)
  if (items.length === 0 && !mostrarQR) {
    return (
      <main className="min-h-screen bg-[#FDFDFD] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="w-32 h-32 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-8 shadow-inner border border-gray-100">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase">Tu bolsa está vacía</h2>
          <p className="text-gray-500 mb-10 font-medium text-sm md:text-base">Aún no has seleccionado ninguna esencia para tu colección.</p>
          <Link href="/catalogo" className="bg-black text-white hover:bg-[#D30F30] px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(211,15,48,0.3)] hover:-translate-y-1">
            Explorar Catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        
        {/* CABECERA */}
        <div className="mb-10 md:mb-16 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-3">
            Finalizar Compra
          </h1>
          <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
            {mostrarQR ? 'Paso 2: Pago Seguro' : 'Paso 1: Detalles de Envío'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* COLUMNA IZQUIERDA: LISTA DE PRODUCTOS */}
          <section className="lg:col-span-7 flex flex-col gap-5">
            
            {!mostrarQR && (
              <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Precio</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 items-center bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] group hover:shadow-[0_10px_30px_rgb(0,0,0,0.06)] transition-all">
                  
                  {/* Foto y Título */}
                  <div className="md:col-span-6 flex items-center gap-4">
                    {!mostrarQR && (
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors p-2 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                    <div className="w-20 h-20 bg-[#F8F9FA] rounded-2xl relative shrink-0 p-2 border border-gray-50 overflow-hidden">
                      <Image src={item.imagen_url || '/placeholder.png'} alt={item.nombre} fill className="object-contain" unoptimized />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{item.nombre}</h4>
                      {item.tamano && <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-1.5 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full inline-block">{item.tamano}</p>}
                    </div>
                  </div>
                  
                  {/* Precio (Oculto en móvil) */}
                  <div className="hidden md:block md:col-span-2 text-center text-gray-500 font-bold text-sm">
                    {item.precio} Bs.
                  </div>
                  
                  {/* Selector de Cantidad */}
                  <div className="md:col-span-2 flex justify-between md:justify-center items-center mt-2 md:mt-0">
                    <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest">Cantidad:</span>
                    {!mostrarQR ? (
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full h-10 px-1 shadow-inner">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-full transition-colors text-lg font-light shadow-sm">-</button>
                        <span className="w-8 text-center font-bold text-sm text-gray-900">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-full transition-colors text-lg font-light shadow-sm">+</button>
                      </div>
                    ) : (
                      <span className="font-black text-gray-900 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">{item.cantidad} und.</span>
                    )}
                  </div>
                  
                  {/* Subtotal */}
                  <div className="md:col-span-2 flex justify-between md:justify-end items-center mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-50">
                    <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal:</span>
                    <span className="font-black text-gray-900 text-base">{item.precio * item.cantidad} Bs.</span>
                  </div>
                </div>
              ))}
            </div>

            {!mostrarQR && (
              <div className="mt-4 text-center md:text-left">
                <Link href="/catalogo" className="inline-flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-black tracking-widest uppercase transition-colors px-8 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Seguir Comprando
                </Link>
              </div>
            )}
          </section>

          {/* COLUMNA DERECHA: RESUMEN Y FORMULARIO / QR (Estilo Tarjeta Flotante) */}
          <section className="lg:col-span-5">
            <div className="bg-[#F8F9FA] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_15px_40px_rgb(0,0,0,0.04)] lg:sticky lg:top-28">
              
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6 pb-6 border-b border-gray-200">
                Resumen del Pedido
              </h3>

              <div className="flex flex-col gap-5 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="font-black text-gray-900">Bs. {total}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Envío</span>
                  <span className="font-black text-[#D30F30]">Por coordinar</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-6 border-y border-gray-200 mb-8 bg-white -mx-6 md:-mx-8 px-6 md:px-8">
                <span className="text-xl font-black uppercase tracking-wider text-gray-900">Total</span>
                <span className="text-3xl font-black text-[#D30F30] tracking-tight">Bs. {total}</span>
              </div>

              {/* FORMULARIO DE ENVÍO */}
              {!mostrarQR ? (
                <form onSubmit={procesarPedido} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-2">Nombre Completo *</label>
                    <input required type="text" className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium shadow-sm placeholder-gray-300 text-gray-900" placeholder="Ej. Juan Pérez" value={cliente.nombre} onChange={(e) => setCliente({...cliente, nombre: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-2">Teléfono *</label>
                      <input required type="tel" className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium shadow-sm placeholder-gray-300 text-gray-900" placeholder="Ej. 70012345" value={cliente.telefono} onChange={(e) => setCliente({...cliente, telefono: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-2">Ciudad *</label>
                      <select className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-bold text-gray-900 shadow-sm cursor-pointer" value={cliente.ciudad} onChange={(e) => setCliente({...cliente, ciudad: e.target.value})}>
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="La Paz">La Paz</option>
                        <option value="Otras">Otra (Coordinar)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 pl-2">Notas del pedido (Opcional)</label>
                    <textarea rows={2} placeholder="Referencias para la entrega..." className="w-full bg-white border border-gray-200 rounded-[1.5rem] px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium resize-none shadow-sm placeholder-gray-300 text-gray-900" value={cliente.notas} onChange={(e) => setCliente({...cliente, notas: e.target.value})} />
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-200 mt-2 text-xs text-gray-500 font-medium leading-relaxed shadow-sm">
                    <strong className="block text-gray-900 mb-1 font-black">Transferencia bancaria QR</strong>
                    Generaremos un código QR seguro para que realices tu pago. El pedido se procesará al enviar el comprobante.
                  </div>

                  <button type="submit" disabled={loading} className={`w-full text-white px-8 py-5 rounded-full font-black uppercase tracking-widest text-[11px] transition-all shadow-lg mt-2 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#D30F30] hover:bg-black hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1'}`}>
                    {loading ? 'PROCESANDO...' : 'REALIZAR EL PEDIDO'}
                  </button>
                </form>

              ) : (

                /* VISTA DEL CÓDIGO QR Y WHATSAPP (DISEÑO TICKET PREMIUM) */
                <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                  
                  <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-5 mb-8 text-center shadow-sm">
                    <p className="font-black text-emerald-600 uppercase tracking-widest text-xs mb-1">¡Orden #{codigoOrden} registrada!</p>
                    <p className="text-xs text-emerald-800 font-medium">Realiza el pago para coordinar el envío.</p>
                  </div>
                  
                  <p className="text-gray-500 text-sm font-medium text-center px-4 mb-6 leading-relaxed">
                    Escanea este código QR desde tu App Bancaria por el monto exacto de <br/> <span className="font-black text-2xl text-gray-900 mt-2 inline-block">Bs. {total}</span>
                  </p>
                  
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm mb-8 relative">
                    {/* Borde dashed decorativo interno */}
                    <div className="absolute inset-4 border-2 border-dashed border-gray-100 rounded-[1.5rem] pointer-events-none"></div>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                      alt="QR de Pago Fragance Boutique" 
                      className="w-48 h-48 mx-auto relative z-10" 
                    />
                    <p className="text-[9px] text-gray-400 mt-6 font-black tracking-[0.2em] uppercase text-center relative z-10">Fragance Boutique SRL</p>
                  </div>

                  <button onClick={enviarAWhatsApp} className="w-full bg-[#25D366] text-white py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.656.69 5.2 1.996 7.458L.357 24l4.675-1.57c2.158 1.155 4.596 1.764 7.001 1.764 6.646 0 12.03-5.385 12.03-12.03S18.676 0 12.031 0zm0 22.215c-2.25 0-4.453-.604-6.388-1.751l-.458-.278-3.324 1.116.885-3.24-.306-.487C1.258 15.422.585 13.76.585 12.031c0-6.323 5.143-11.466 11.446-11.466 6.324 0 11.446 5.143 11.446 11.466s-5.122 11.466-11.446 11.466zM17.58 14.5c-.302-.15-1.785-.882-2.062-.982-.277-.101-.48-.15-.683.15-.203.303-.781.982-.958 1.183-.176.202-.353.226-.655.076-2.14-1.07-3.415-2.22-4.664-4.385-.175-.302-.018-.466.133-.616.136-.136.302-.353.453-.53.15-.176.203-.302.302-.504.101-.202.05-.378-.025-.53-.075-.15-.683-1.644-.935-2.25-.246-.593-.496-.513-.683-.521-.176-.009-.378-.009-.581-.009-.202 0-.53.076-.807.378-.278.303-1.058 1.034-1.058 2.522 0 1.488 1.084 2.925 1.235 3.127.15.202 2.134 3.256 5.166 4.562 2.135.918 2.87.807 3.398.681.603-.143 1.785-.731 2.037-1.437.252-.706.252-1.311.176-1.437-.076-.126-.277-.202-.58-.353z"/></svg>
                    Confirmar por WhatsApp
                  </button>
                  <p className="text-[10px] text-gray-400 mt-5 font-medium tracking-wide">Se abrirá WhatsApp para que envíes tu comprobante.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}