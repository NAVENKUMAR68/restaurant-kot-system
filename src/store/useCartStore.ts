import { create } from 'zustand';

export interface CartItem {
    id: string; // MenuItem ID
    name: string;
    price: number;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    total: 0,
    addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === newItem.id);

        if (existingItem) {
            set({
                items: items.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({ items: [...items, { ...newItem, quantity: 1 }] });
        }
        // Recalculate total
        const updatedItems = get().items;
        set({ total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) });
    },
    removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
        const updatedItems = get().items;
        set({ total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) });
    },
    updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
            get().removeItem(id);
            return;
        }
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
            ),
        }));
        const updatedItems = get().items;
        set({ total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) });
    },
    clearCart: () => set({ items: [], total: 0 }),
}));
