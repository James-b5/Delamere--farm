"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function Cart() {
  const { items, total, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Close cart when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close cart on route change (navigation)
  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative" ref={cartRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-green-700 transition-colors"
        aria-label="Shopping cart"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-90 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden transform origin-top-right transition-all">
          <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Your Cart
            </h3>
            
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <button onClick={() => setIsOpen(false)} className="mt-4 text-green-600 text-sm font-bold hover:underline">Continue Shopping</button>
              </div>
            ) : (
              <>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-green-200 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-gray-400 shrink-0 overflow-hidden shadow-sm">
                        {item.image ? (
                          // prefer Next.js Image for local uploads
                          item.image.startsWith('/uploads') ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-green-700 font-bold text-sm">KES {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 mt-5 pt-5 bg-white">
                  <div className="flex justify-between items-center mb-5 bg-green-50 p-3 rounded-lg border border-green-100">
                    <span className="font-bold text-green-900">Subtotal:</span>
                    <span className="text-xl font-black text-green-700">KES {total.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={clearCart}
                      className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                    >
                      Clear
                    </button>
                    {user ? (
                      <a
                        href={buildWhatsAppLink("Hello I'd like to inquire about my order")}
                        onClick={(e) => {
                          e.preventDefault();
                          const url = buildWhatsAppLink("Hello I'd like to inquire about my order");
                          window.open(url, "_blank");
                          setIsOpen(false);
                        }}
                        rel="noopener noreferrer"
                        className="py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold shadow-md shadow-green-200 text-sm flex items-center justify-center gap-2"
                      >
                        Checkout via WhatsApp
                      </a>
                    ) : (
                      <a
                        href={buildWhatsAppLink('Hello I would like to inquire about my order')}
                        onClick={(e) => {
                          e.preventDefault();
                          const url = buildWhatsAppLink('Hello I would like to inquire about my order');
                          window.open(url, "_blank");
                          setIsOpen(false);
                        }}
                        rel="noopener noreferrer"
                        className="py-3 px-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors font-bold shadow-md text-sm flex items-center justify-center gap-2"
                      >
                        Login to Checkout via WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
