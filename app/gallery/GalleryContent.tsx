"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  images: string[];
  videos: string[];
  // other fields omitted
}

export default function GalleryContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading gallery...</p>
      </div>
    );
  }

  const allImages = products.flatMap((p) => (p.images ?? []).map((src, i) => ({ src, alt: `${p.name} image ${i + 1}` })));
  const allVideos = products.flatMap((p) => (p.videos ?? []).map((src, i) => ({ src, title: `${p.name} video ${i + 1}` })));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Farm Gallery</h1>
        {allImages.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Images</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {allImages.map((img, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-64 relative overflow-hidden">
                    <Image src={img.src} alt={img.alt} fill className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {allVideos.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Videos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {allVideos.map((vid, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-4">
                  <video src={vid.src} controls className="w-full h-64 object-cover" preload="metadata" />
                </div>
              ))}
            </div>
          </>
        )}
        <div className="text-center mt-8">
          <Link href="/" className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
