"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Loader, AlertCircle } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
  breed?: string;
  healthStatus?: string;
  ageOrWeight?: string;
  images: string[];
  videos: string[];
  documents: string[];
  stock: number;
  createdAt: string;
}

const categories: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "All Products", icon: "🛍️" },
  { id: "dairy", label: "Dairy", icon: "🥛" },
  { id: "livestock", label: "Livestock", icon: "🐄" },
  { id: "poultry", label: "Poultry", icon: "🐔" },
  { id: "vegetables", label: "Vegetables", icon: "🥕" },
];

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<"all" | "under-5k" | "5k-50k" | "over-50k">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Deduplicate products by id to avoid React duplicate key warnings
        const seen = new Set<string>();
        const unique = [] as Product[];
        for (const p of data as Product[]) {
          if (!p || !p.id) continue;
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          unique.push(p);
        }
        setProducts(unique);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, priceRange]);

  const filteredProducts = products.filter((product) => {
    const productCategory = product.category?.toLowerCase() || 'other';
    const matchesCategory = activeCategory === "all" || productCategory === activeCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (priceRange === "under-5k") matchesPrice = product.price < 5000;
    else if (priceRange === "5k-50k") matchesPrice = product.price >= 5000 && product.price <= 50000;
    else if (priceRange === "over-50k") matchesPrice = product.price > 50000;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Map database product to component product interface
  const formatProductForCard = (product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    category: product.category,
    images: product.images,
    // Prefer local uploads when available, otherwise use first image or placeholder
    image: (product.images || []).find((i) => typeof i === 'string' && i.startsWith('/uploads'))
      || product.images?.[0]
      || '/images/placeholder.jpg',
    features: [],
    characteristics: {
      ...(product.breed && { Breed: product.breed }),
      ...(product.healthStatus && { "Health Status": product.healthStatus }),
      ...(product.ageOrWeight && { "Age/Weight": product.ageOrWeight }),
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            Our Products
          </h1>
          <p className="text-lg text-gray-600">
            Premium quality products from Delamere Farm - fresh, healthy, and delivered with excellence
          </p>
        </div>

        {/* Featured Livestock */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Livestock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { title: 'Jersey Dairy Cow', image: '/images/JERSEY COW.jpg', href: '/products/featured-jersey' },
              { title: 'Friesian Herd', image: '/images/homepage4.jpg', href: '/products/featured-friesian' },
              { title: 'Boer Goat Does', image: '/images/boer goat.jpg', href: '/products/featured-boer' },
              { title: 'Layer Hens', image: '/images/layer hens.jpg', href: '/products/featured-layers' },
            ].map((f) => (
              <a key={f.title} href={f.href} className="block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-44 bg-gray-50 overflow-hidden">
                  <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
              <input 
                type="text" 
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-400 cursor-text"
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 ${
                      activeCategory === category.id
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-green-100"
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label htmlFor="price-filter" className="block text-sm font-medium text-gray-900 mb-2">Price Range</label>
              <select 
                id="price-filter"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="all">All Prices</option>
                <option value="under-5k">Under KES 5,000 (Dairy/Poultry)</option>
                <option value="5k-50k">KES 5,000 - 50,000 (Goats/Poultry)</option>
                <option value="over-50k">Over KES 50,000 (Cattle)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-green-700 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Products</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {paginatedProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={formatProductForCard(product) as any}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                            currentPage === i + 1 
                              ? "bg-green-700 text-white shadow-md" 
                              : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Product Count */}
                <div className="text-center mt-8 text-sm font-medium text-gray-500">
                  Showing {paginatedProducts.length} of {filteredProducts.length} results
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-lg mb-6">
                  Try adjusting your filters or search query.
                </p>
                <button 
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                    setPriceRange("all");
                  }}
                  className="px-6 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
