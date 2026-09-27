// app/(public)/producto/[id]/page.tsx
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ProductoClient from './ProductoClient'
import { Producto } from '@/types'

// 🔥 CACHÉ DE 1 HORA: Velocidad extrema y ahorro de recursos
export const revalidate = 3600; 

type Props = {
  params: Promise<{ id: string }> 
}

// 1. GENERAMOS EL SEO PARA WHATSAPP Y FACEBOOK
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params 
  const { data: producto } = await supabase.from('productos').select('*').eq('id', resolvedParams.id).single()
    
  if (!producto) {
    return {
      title: 'Producto no encontrado | Fragance Boutique',
      description: 'El perfume que buscas no está disponible.',
    }
  }

  const marca = producto.marca ? `${producto.marca} - ` : ''
  const titulo = `${producto.nombre} | ${marca}Fragance Boutique`
  const descripcion = producto.descripcion 
    ? producto.descripcion.substring(0, 150) + '...'
    : `Adquiere ${producto.nombre} al mejor precio en Bolivia. ¡Compra segura con envío local!`

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      url: `https://tudominio.com/producto/${producto.id}`, // Cambiar en Vercel
      siteName: 'Fragance Boutique',
      images: [
        {
          url: producto.imagen_url || '/placeholder.png', 
          width: 800,
          height: 800,
          alt: producto.nombre,
        },
      ],
      locale: 'es_BO',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      images: [producto.imagen_url || '/placeholder.png'],
    },
  }
}

// 2. EL SERVIDOR DESCARGA LOS DATOS Y SE LOS PASA AL CLIENTE
export default async function ProductoPage({ params }: Props) {
  const resolvedParams = await params 
  
  // Obtenemos el producto principal
  const { data: productoData } = await supabase.from('productos').select('*').eq('id', resolvedParams.id).single()
  
  if (!productoData) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh] text-gray-500 tracking-widest uppercase font-bold text-sm">
          Producto no encontrado
        </div>
      </main>
    )
  }

  // Obtenemos los productos relacionados de la misma marca
  let relacionadosData: Producto[] = []
  if (productoData.marca) {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('marca', productoData.marca)
      .neq('id', resolvedParams.id)
      .limit(4)
    
    if (data) relacionadosData = data as Producto[]
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ProductoClient producto={productoData as Producto} relacionados={relacionadosData} />
    </main>
  )
}