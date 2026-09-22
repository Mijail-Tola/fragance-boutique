import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Definimos la estructura de un producto en el carrito
export interface CartItem {
  id: string
  producto_id: string
  nombre: string
  marca?: string
  precio: number
  cantidad: number
  tamano?: string
  imagen_url: string
}

// Definimos las funciones de nuestro carrito
interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, cantidad: number) => void
  clearCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false, // El estado de si la barra lateral está abierta o cerrada

      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          // Si el producto ya está, solo sumamos la cantidad
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, cantidad: i.cantidad + item.cantidad } : i
            ),
          })
        } else {
          // Si es nuevo, lo agregamos a la lista
          set({ items: [...items, item] })
        }
      },

      removeItem: (id) => 
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, cantidad } : i)),
        })),

      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'fragance-boutique-cart', // 💾 Este es el nombre del archivo en la memoria del navegador
      partialize: (state) => ({ items: state.items }), // 🧠 SOLO guardamos los productos, no guardamos si el panel lateral quedó abierto
    }
  )
)