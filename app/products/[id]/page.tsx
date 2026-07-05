"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductById, Product } from "../getProductById";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const zoomScaleLevel = Math.round((zoom - 1) * 4) * 25 + 100;
  const zoomScaleClass = `zoom-scale-${zoomScaleLevel}`;
  const imageRotateClass = `image-rotate-${normalizedRotation}`;

  useEffect(() => {
    async function fetchProduct() {
      const p = await getProductById(productId);
      setProduct(p);
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' && window.localStorage.getItem('wishlist');
      if (raw) {
        const list: string[] = JSON.parse(raw);
        setInWishlist(list.includes(productId));
      }
    } catch (e) {
      // ignore
    }
  }, [productId]);

  // Cross-tab sync for wishlist on product detail
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'wishlist') {
        try {
          const raw = e.newValue;
          const list: string[] = raw ? JSON.parse(raw) : [];
          setInWishlist(list.includes(productId));
          toast('Wishlist updated in another tab');
        } catch (err) {
          // ignore
        }
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', handler);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('storage', handler);
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-12 h-12 animate-spin text-green-700 mx-auto" />
        <p className="text-gray-600 ml-4">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products" className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const categoryLabels: Record<string, string> = {
    dairy: "Dairy Products",
    livestock: "Livestock",
    poultry: "Poultry",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-green-700">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-green-700">Products</Link>
            </li>
            <li>/</li>
            <li className="text-gray-800">{product.name}</li>
          </ol>
        </nav>

        {/* Product Main Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative bg-gray-100">
              <button
                type="button"
                onClick={() => setViewerOpen(true)}
                className="absolute z-10 top-4 right-4 bg-white/90 border border-gray-200 text-gray-800 px-3 py-2 rounded-full shadow-sm hover:bg-white transition"
              >
                View photo
              </button>
              {/* Prefer next/image for local uploads, fall back to img for external */}
              <div className="cursor-zoom-in" onClick={() => setViewerOpen(true)} aria-label="Open image viewer">
                {product.image && product.image.startsWith('/uploads') ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full min-h-100 object-cover"
                  />
                ) : (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full min-h-100 object-cover"
                  />
                )}
              </div>
              {product.category && (
                <span className="absolute top-4 left-4 bg-green-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {categoryLabels[product.category]}
                </span>
              )}
            </div>
            {/* Info */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-green-700 mb-6">KES {product.price.toLocaleString()}</p>
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-800 transition-colors mb-6 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
              <div className="mb-6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    try {
                      const raw = typeof window !== 'undefined' && window.localStorage.getItem('wishlist');
                      const list: string[] = raw ? JSON.parse(raw) : [];
                      let updated: string[];
                      if (list.includes(productId)) {
                        updated = list.filter((i) => i !== productId);
                        setInWishlist(false);
                        toast('Removed from wishlist');
                      } else {
                        updated = [productId, ...list];
                        setInWishlist(true);
                        toast('Added to wishlist');
                      }
                      window.localStorage.setItem('wishlist', JSON.stringify(updated));
                    } catch (err) {
                      // ignore
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-xl border ${inWishlist ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-200 text-gray-800'} hover:shadow-sm transition-colors text-sm font-semibold`}
                >
                  {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
              {/* Quick Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Farm Fresh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Description
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.features?.length ? (
              product.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))
            ) : null}
          </div>
        </div>

        {/* Characteristics */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Specifications &amp; Characteristics
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(product.characteristics ?? {}).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 w-1/3">{key}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back to Products */}
        <div className="mt-8 text-center">
          <Link href="/products" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Products
          </Link>
        </div>
      </div>

      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Image Viewer</h2>
                <p className="text-sm text-gray-500">Zoom and rotate the product image.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewerOpen(false);
                  setZoom(1);
                  setRotation(0);
                }}
                className="text-gray-500 hover:text-gray-900"
                aria-label="Close image viewer"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] p-6">
              <div className={`relative overflow-hidden rounded-3xl bg-gray-900 flex items-center justify-center min-h-105 ${imageRotateClass}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={`max-w-full max-h-full transition-transform duration-200 ${zoomScaleClass}`}
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Zoom</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                      className="rounded-full border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
                      aria-label="Zoom out"
                    >-</button>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                        <progress value={zoom} max={4} className="w-full h-2 rounded-full overflow-hidden accent-green-600" />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{zoom.toFixed(2)}×</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                      className="rounded-full border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
                      aria-label="Zoom in"
                    >+</button>
                  </div>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Rotate</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => r - 90)}
                      className="rounded-full border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
                      aria-label="Rotate left"
                    >⟲</button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => r + 90)}
                      className="rounded-full border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
                      aria-label="Rotate right"
                    >⟳</button>
                    <button
                      type="button"
                      onClick={() => setRotation(0)}
                      className="ml-auto rounded-full border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
                      aria-label="Reset rotation"
                    >Reset</button>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">Current rotation: {rotation % 360}°</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
