// app/(public)/catalogo/page.tsx
import Navbar from '@/components/Navbar'
import CatalogoClient from './CatalogoClient'
import { supabase } from '@/lib/supabase'
import { Producto } from '@/types'

// 🔥 CACHÉ DE NIVEL EMPRESARIAL: Se actualiza en el servidor cada 1 hora
export const revalidate = 3600; 

export default async function CatalogoPage() {
  const camposBase = 'id, nombre, marca, categoria, precio, tamano, etiquetas, imagen_url, galeria, stock';
  
  const { data, error } = await supabase
    .from('productos')
    .select(camposBase)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando catálogo:', error);
  }

  const productosCacheados = (data || []) as Producto[];

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      {/* Pasamos los datos cacheados al componente de cliente */}
      <CatalogoClient productosIniciales={productosCacheados} />
    </main>
  );
}