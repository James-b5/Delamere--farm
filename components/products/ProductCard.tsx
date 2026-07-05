"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  features?: string[];
  characteristics?: Record<string, string>;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, updateQuantity, items } = useCart();
  const [qty, setQty] = useState(1);
  const { items: wishlistItems, toggle } = useWishlist();
  const inWishlist = wishlistItems.includes(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop Link propagation
    
    // Check if item already exists in cart to update its quantity appropriately
    const existingItem = items.find(i => i.id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + qty);
    } else {
      // Add multiple times to simulate initial quantity, or we can just use a modified addItem
      // Since our Context addItem adds 1 by default, let's just loop or modify Context.
      // Wait, our CartContext's addItem only takes the item. We should update the Context, but to avoid breaking changes,
      // We can just add the item once, then update its quantity immediately.
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      if (qty > 1) {
        updateQuantity(product.id, qty);
      }
    }
    
    // Show toast notification
    toast.success(`Added ${qty} ${qty > 1 ? 'items' : 'item'} to your cart!`, {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      iconTheme: {
        primary: '#4ade80',
        secondary: '#fff',
      },
    });
    
    // Reset qty back to 1
    setQty(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden transition-all duration-300 h-full flex flex-col group relative">
      {/* Quick Badge */}
      {product.category && (
        <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md text-green-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          {product.category.toUpperCase()}
        </span>
      )}
      
      <Link href={`/products/${product.id}`} className="block grow relative">
        <div className="relative overflow-hidden h-56 bg-gray-50">
          {product.image && product.image.startsWith('/') ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-6 flex flex-col grow">
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
            {product.name}
          </h2>
          <div className="flex flex-col mb-4">
            <p className="text-2xl font-black text-green-700">
              KES {(product.price * qty).toLocaleString()}
            </p>
            {qty > 1 && (
              <p className="text-xs text-gray-400 font-medium mt-1">
                (KES {product.price.toLocaleString()} per unit)
              </p>
            )}
          </div>
        </div>
      </Link>
      <div className="p-5 pt-0 mt-auto space-y-4">
        {/* Modern Quantity Selector */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-1.5">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(Math.max(1, qty - 1)); }}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 hover:text-green-600 transition-colors font-bold text-lg"
          >
            -
          </button>
          <span className="font-bold text-gray-900 text-lg w-12 text-center">{qty}</span>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(qty + 1); }}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 hover:text-green-600 transition-colors font-bold text-lg"
          >
            +
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href={`/products/${product.id}`} className="block w-full">
            <button className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl hover:bg-blue-100 transition-colors text-sm font-bold flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Details
            </button>
          </Link>
          <button 
            onClick={handleAddToCart}
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors text-sm font-bold shadow-md shadow-green-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Add
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <button onClick={toggleWishlist} aria-label="Toggle wishlist" className="p-2 rounded-full bg-white/90 hover:bg-white shadow-sm">
            {inWishlist ? (
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.13 2.44h1.74C14.09 5 15.76 4 17.5 4 20 4 22 6 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"></path></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
