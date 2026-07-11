"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, Package, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ProductUploadForm from "@/components/ProductUploadForm";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
  createdAt: string;
}

export default function ModeratorProducts() {
  const { user, isModerator, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", stock: "" });

  useEffect(() => {
    if (!authLoading && (!user || (!isModerator && !isAdmin))) {
      router.push("/login");
    }
  }, [authLoading, user, isModerator, isAdmin, router]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await authenticatedFetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          toast.error("Failed to load products");
        }
      } catch {
        console.error("Failed to fetch products");
        toast.error("Error fetching products");
      } finally {
        setIsLoading(false);
      }
    }
    if (isModerator || isAdmin) {
      fetchProducts();
    }
  }, [user, isModerator, isAdmin]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
    });
  };

  const saveEdit = async (productId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update product");
      }

      const updated = await res.json();
      setProducts((curr) => curr.map((item) => (item.id === productId ? { ...item, ...updated } : item)));
      setEditingProductId(null);
      toast.success("Product updated");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to update product");
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((curr) => curr.filter((item) => item.id !== productId));
      toast.success("Product deleted");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  if (authLoading || !user || (!isModerator && !isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/moderator" className="text-blue-600 hover:text-blue-700 mr-4">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            </div>
            <button type="button" onClick={() => setShowCreateForm((cur) => !cur)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="w-4 h-4" /> {showCreateForm ? "Hide Form" : "Add Product"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 cursor-text"
          />
        </div>

        {showCreateForm ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 text-sm font-semibold text-blue-900">Create product</div>
            <ProductUploadForm />
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <Fragment key={product.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.description.substring(0, 50)}...</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">KES {product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(product.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(product)} className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button type="button" onClick={() => void deleteProduct(product.id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingProductId === product.id && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 px-6 py-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <input value={editForm.name} onChange={(e) => setEditForm((cur) => ({ ...cur, name: e.target.value }))} className="rounded border px-3 py-2" placeholder="Name" />
                            <input value={editForm.description} onChange={(e) => setEditForm((cur) => ({ ...cur, description: e.target.value }))} className="rounded border px-3 py-2" placeholder="Description" />
                            <input type="number" value={editForm.price} onChange={(e) => setEditForm((cur) => ({ ...cur, price: e.target.value }))} className="rounded border px-3 py-2" placeholder="Price" />
                            <input type="number" value={editForm.stock} onChange={(e) => setEditForm((cur) => ({ ...cur, stock: e.target.value }))} className="rounded border px-3 py-2" placeholder="Stock" />
                            <div className="flex gap-2 md:col-span-2">
                              <button type="button" onClick={() => void saveEdit(product.id)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                              <button type="button" onClick={() => setEditingProductId(null)} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                            </div>
                          </div>

                          {(product.images?.length || product.videos?.length || product.documents?.length) ? (
                            <div className="mt-6 space-y-4">
                              {product.images?.length ? (
                                <div>
                                  <div className="mb-2 text-sm font-semibold text-gray-800">Existing images</div>
                                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                    {product.images.map((src, index) => (
                                      <img key={`img-${index}`} src={src} alt={`Product image ${index + 1}`} className="h-28 w-full rounded border object-cover" />
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                              {product.videos?.length ? (
                                <div>
                                  <div className="mb-2 text-sm font-semibold text-gray-800">Existing videos</div>
                                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {product.videos.map((video, index) => (
                                      <div key={`video-${index}`} className="rounded border bg-black/5 p-2">
                                        {video.startsWith('http') ? (
                                          <a href={video} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                                            View video {index + 1}
                                          </a>
                                        ) : (
                                          <video controls className="w-full rounded">
                                            <source src={video} />
                                            Your browser does not support the video tag.
                                          </video>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                              {product.documents?.length ? (
                                <div>
                                  <div className="mb-2 text-sm font-semibold text-gray-800">Existing documents</div>
                                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {product.documents.map((doc, index) => (
                                      <a key={`doc-${index}`} href={doc} target="_blank" rel="noreferrer" className="rounded border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        Document {index + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
