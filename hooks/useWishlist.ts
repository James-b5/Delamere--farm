"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useWishlist() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
        if (token) {
          const res = await fetch('/api/user/wishlist', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            const ids = (data || []).map((w: any) => w.productId || w.product?.id || w.id);
            setItems(ids);
            window.localStorage.setItem('wishlist', JSON.stringify(ids));
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      // fallback to localStorage
      try {
        const raw = typeof window !== 'undefined' && window.localStorage.getItem('wishlist');
        if (raw) setItems(JSON.parse(raw));
      } catch (e) {}
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'wishlist') {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(parsed);
          toast('Wishlist updated in another tab');
        } catch (err) {}
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', handler);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('storage', handler); };
  }, []);

  const toggle = useCallback(async (productId: string) => {
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
        if (token) {
          const res = await fetch('/api/user/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId }) });
          if (res.ok) {
            const data = await res.json();
          // server returns removed:true or created item
          let newItems: string[];
          if (data.removed) {
            newItems = items.filter(i => i !== productId);
            toast.success('Removed from wishlist');
          } else {
            newItems = [productId, ...items.filter(i => i !== productId)];
            toast.success('Added to wishlist');
          }
          setItems(newItems);
          window.localStorage.setItem('wishlist', JSON.stringify(newItems));
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // fallback local
    const raw = typeof window !== 'undefined' && window.localStorage.getItem('wishlist');
    const list: string[] = raw ? JSON.parse(raw) : [];
    let updated: string[];
    if (list.includes(productId)) {
      updated = list.filter(i => i !== productId);
      toast.success('Removed from wishlist');
    } else {
      updated = [productId, ...list];
      toast.success('Added to wishlist');
    }
    setItems(updated);
    window.localStorage.setItem('wishlist', JSON.stringify(updated));
  }, [items]);

  return { items, toggle };
}
