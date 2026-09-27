// types/index.ts

// 1. Tipos de la Base de Datos (Supabase)
export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  costo: number;
  stock: number;
  stock_minimo: number;
  descripcion?: string;
  tamano?: string;      // Guardado como string (JSON o formato texto)
  etiquetas?: string;   // Guardado como string (JSON o formato texto)
  imagen_url?: string;
  galeria?: string[];
  created_at?: string;
}

export interface Pedido {
  id: string;
  codigo_orden: string;
  cliente_nombre: string;
  cliente_telefono: string;
  ciudad: string;
  direccion: string;
  metodo_envio: string;
  total: number;
  estado: string; // 'pendiente', 'pagado', 'enviado', etc.
  notas?: string;
  created_at?: string;
}

export interface PedidoItem {
  id?: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

// 2. Tipos del Estado Global (Zustand / Carrito)
export interface CartItem {
  id: string; // ID único para el carrito (puede combinar id del producto + tamaño)
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url: string;
  tamano?: string;
}