import { create } from 'zustand'

export interface CartItem {
  id: string; // Usaremos productoId + tamaño para diferenciar (Ej: 123-100ml vs 123-2ml)
  producto_id: string;
  nombre: string;
  marca: string;
  precio: number;
  cantidad: number;
  tamano: string;
  imagen_url: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // Controla si el panel lateral está abierto o cerrado
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false,
  
  addItem: (newItem) => set((state) => {
    // Verificamos si EXACTAMENTE ese producto y tamaño ya está en el carrito
    const existingItem = state.items.find(i => i.id === newItem.id);
    if (existingItem) {
      // Si ya existe, solo sumamos la cantidad
      return { items: state.items.map(i => i.id === newItem.id ? { ...i, cantidad: i.cantidad + newItem.cantidad } : i), isOpen: true }
    }
    // Si es nuevo, lo agregamos a la lista y abrimos el carrito automáticamente
    return { items: [...state.items, newItem], isOpen: true }
  }),
  
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  
  updateQuantity: (id, cantidad) => set((state) => ({ items: state.items.map(i => i.id === id ? { ...i, cantidad } : i) })),
  
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  clearCart: () => set({ items: [] })
}))