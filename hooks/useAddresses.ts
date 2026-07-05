"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface Address {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
        if (token) {
          const res = await fetch('/api/user/addresses');
          if (res.ok) {
            const data = await res.json();
            setAddresses(data || []);
            window.localStorage.setItem('addresses', JSON.stringify(data || []));
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      try {
        const raw = typeof window !== 'undefined' && window.localStorage.getItem('addresses');
        if (raw) setAddresses(JSON.parse(raw));
      } catch (e) {}
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'addresses') {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setAddresses(parsed);
          toast('Addresses updated in another tab');
        } catch (err) {}
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', handler);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('storage', handler); };
  }, []);

  const add = useCallback(async (label: string, addressText: string) => {
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (token) {
        const res = await fetch('/api/user/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, address: addressText }) });
        if (res.ok) {
          const created = await res.json();
          setAddresses(prev => [created, ...prev]);
          window.localStorage.setItem('addresses', JSON.stringify([created, ...addresses]));
          toast.success('Address saved');
          return created;
        }
      }
    } catch (e) {}

    const id = `addr-${Date.now()}`;
    const created = { id, label, address: addressText, isDefault: addresses.length === 0 };
    setAddresses(prev => [created, ...prev]);
    window.localStorage.setItem('addresses', JSON.stringify([created, ...addresses]));
    toast.success('Address saved (local)');
    return created;
  }, [addresses]);

  const update = useCallback(async (payload: Partial<Address> & { id: string }) => {
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (token) {
        const res = await fetch('/api/user/addresses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const updated = await res.json();
          setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a));
          window.localStorage.setItem('addresses', JSON.stringify(addresses.map(a => a.id === updated.id ? updated : a)));
          toast.success('Address updated');
          return updated;
        }
      }
    } catch (e) {}

    setAddresses(prev => prev.map(a => a.id === payload.id ? { ...a, ...payload } : a));
    window.localStorage.setItem('addresses', JSON.stringify(addresses.map(a => a.id === payload.id ? { ...a, ...payload } : a)));
    toast.success('Address updated (local)');
    return payload;
  }, [addresses]);

  const remove = useCallback(async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (token) {
        const res = await fetch(`/api/user/addresses?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) {
          setAddresses(prev => prev.filter(a => a.id !== id));
          const newArr = addresses.filter(a => a.id !== id);
          window.localStorage.setItem('addresses', JSON.stringify(newArr));
          toast.success('Address removed');
          return;
        }
      }
    } catch (e) {}

    const newArr = addresses.filter(a => a.id !== id);
    setAddresses(newArr);
    window.localStorage.setItem('addresses', JSON.stringify(newArr));
    toast.success('Address removed (local)');
  }, [addresses]);

  const reorder = useCallback(async (fromIndex: number, toIndex: number) => {
    const copy = [...addresses];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setAddresses(copy);
    window.localStorage.setItem('addresses', JSON.stringify(copy));
    // Persist order to server by updating each item's order where available
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (token) {
        await Promise.all(copy.map((a, idx) => fetch('/api/user/addresses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id, order: idx }) })));
      }
    } catch (e) {}
  }, [addresses]);

  return { addresses, add, update, remove, reorder };
}
