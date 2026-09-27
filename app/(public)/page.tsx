// app/(public)/page.tsx
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'
import Navbar from '@/components/Navbar'
import HomeClient from './HomeClient'

// 🔥 CACHÉ DE 1 HORA: Tu portada cargará a la velocidad de la luz
export const revalidate = 3600; 

export default async function HomePage() {
  // Añadimos 'categoria' a los campos base por si acaso
  const camposBase = 'id, nombre, marca, precio, tamano, etiquetas, imagen_url, stock, categoria';

  // 1. EL SERVIDOR DESCARGA LOS DATOS PARA LA PORTADA
  const [recData, tendData, catData, bestiaData] = await Promise.all([
    supabase.from('productos').select(camposBase).order('created_at', { ascending: false }).limit(8),
    supabase.from('productos').select(camposBase).order('precio', { ascending: false }).limit(8),
    supabase.from('productos').select('id, nombre, marca, imagen_url').limit(15),
    // 🔥 MAGIA: Buscamos específicamente el último perfume de la categoría 'Árabe'
    supabase.from('productos').select(camposBase).eq('categoria', 'Árabe').order('created_at', { ascending: false }).limit(1)
  ]);

  const productosRecientes = (recData.data || []) as Producto[];
  const productosTendencia = (tendData.data || []) as Producto[];
  const productoModoBestia = (bestiaData.data && bestiaData.data.length > 0) ? (bestiaData.data[0] as Producto) : null;
  
  // 2. PREPARAMOS EL ARRAY GIGANTE PARA EL CARRUSEL (x4 para efecto infinito continuo)
  let itemsMarquee = (catData.data || []) as Producto[];
  if (itemsMarquee.length > 0) {
    itemsMarquee = [...itemsMarquee, ...itemsMarquee, ...itemsMarquee, ...itemsMarquee];
  }

  return (
    <>
      <Navbar />
      {/* 3. PASAMOS LOS DATOS CACHEADOS AL COMPONENTE VISUAL */}
      <HomeClient 
        productosRecientes={productosRecientes} 
        productosTendencia={productosTendencia} 
        itemsMarquee={itemsMarquee}
        productoModoBestia={productoModoBestia} // Pasamos el perfume Árabe
      />
    </>
  );
}