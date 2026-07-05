"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface SearchResult {
  title: string;
  url: string;
  category: string;
}

const searchableContent: SearchResult[] = [
  { title: "Home", url: "/", category: "Pages" },
  { title: "Products", url: "/products", category: "Pages" },
  { title: "Fresh Milk", url: "/products", category: "Products" },
  { title: "Yogurt", url: "/products", category: "Products" },
  { title: "Butter", url: "/products", category: "Products" },
  { title: "Cattle", url: "/products", category: "Livestock" },
  { title: "Goats", url: "/products", category: "Livestock" },
  { title: "Poultry", url: "/products", category: "Livestock" },
  { title: "Services", url: "/services", category: "Pages" },
  { title: "Milk Processing", url: "/services", category: "Services" },
  { title: "Livestock Sales", url: "/services", category: "Services" },
  { title: "Transport", url: "/services", category: "Services" },
  { title: "Bookings", url: "/bookings", category: "Pages" },
  { title: "Training Programs", url: "/bookings", category: "Services" },
  { title: "Farm Tours", url: "/bookings", category: "Services" },
  { title: "Breed Advisor", url: "/breed-advisor", category: "Pages" },
  { title: "Dairy Breeds", url: "/breed-advisor", category: "Breeds" },
  { title: "Meat Breeds", url: "/breed-advisor", category: "Breeds" },
  { title: "About Us", url: "/about", category: "Pages" },
  { title: "Blog / Articles", url: "/blog", category: "Pages" },
  { title: "FAQ", url: "/faq", category: "Pages" },
  { title: "Contact Us", url: "/contact", category: "Pages" },
];

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchableContent.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 8));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-green-700 transition-colors"
        aria-label="Search"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="p-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pl-10 placeholder-gray-400 cursor-text"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                title="Close search"
                aria-label="Close search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={result.url}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="block px-4 py-2 hover:bg-green-50 rounded-lg"
                  >
                    <div className="font-medium text-gray-900">{result.title}</div>
                    <div className="text-xs text-green-600">{result.category}</div>
                  </Link>
                ))}
              </div>
            )}

            {query.length > 0 && results.length === 0 && (
              <div className="mt-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
