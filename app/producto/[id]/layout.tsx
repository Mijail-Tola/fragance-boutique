import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

// 1. Interceptamos el ID de la URL antes de que cargue la página
type Props = {
  params: Promise<{ id: string }> // Lo declaramos como Promesa
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params // Desenvolvemos con await
  
  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('id', resolvedParams.id) // Usamos el id resuelto
    .single()
    
  // Si alguien pone un link falso, mostramos esto
  if (!producto) {
    return {
      title: 'Producto no encontrado | Fragance Boutique',
      description: 'El perfume que buscas no está disponible.',
    }
  }

  // Preparamos el título y la descripción
  const marca = producto.marca ? `${producto.marca} - ` : ''
  const titulo = `${producto.nombre} | ${marca}Fragance Boutique`
  const descripcion = producto.descripcion 
    ? producto.descripcion.substring(0, 150) + '...' // Cortamos a 150 caracteres para WhatsApp
    : `Adquiere ${producto.nombre} al mejor precio en Bolivia. ¡Compra segura con envío local!`

  // 3. Retornamos las etiquetas oficiales de Facebook/WhatsApp
  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      url: `https://tudominio.com/producto/${producto.id}`, // Cambiarás "tudominio.com" cuando la subas
      siteName: 'Fragance Boutique',
      images: [
        {
          url: producto.imagen_url, // ¡Esta es la magia! Pone la foto del perfume en WhatsApp
          width: 800,
          height: 800,
          alt: producto.nombre,
        },
      ],
      locale: 'es_BO', // Le dice a Google que es una tienda de Bolivia
      type: 'website',
    },
    // Twitter (X) también usa este formato
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      images: [producto.imagen_url],
    },
  }
}

// 4. Renderizamos la página interactiva que ya tenías adentro
export default function ProductoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}