import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { CartItem } from '@prisma/client';
import axios from 'axios';

type Cart = CartItem[];

type CartContextType = {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<Cart>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const local = localStorage.getItem('cart');
    if (local) {
      setCart(JSON.parse(local));
    }
    setLoading(false);
  }, []);

  // Sync to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // If user logged in, sync with server
  useEffect(() => {
    if (session?.user) {
      // fetch server cart
      axios.get('/api/cart')
        .then(res => setCart(res.data))
        .catch(err => console.error('Failed to load server cart', err));
    }
  }, [session]);

  const addItem = async (item: any) => {
    // optimistic UI update
    const tempId = Math.random().toString(36).substring(2, 9);
    const newItem: CartItem = { ...item, id: tempId, createdAt: new Date(), updatedAt: new Date() } as any;
    setCart(prev => [...prev, newItem]);
    try {
      const res = await axios.post('/api/cart', item);
      // replace temp item with persisted one
      setCart(prev => prev.map(i => (i.id === tempId ? res.data : i)));
    } catch (e) {
      console.error(e);
      // rollback
      setCart(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const removeItem = async (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    try {
      await axios.delete(`/api/cart/${id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      await axios.delete('/api/cart');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
