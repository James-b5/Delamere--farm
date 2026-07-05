'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdminPageLayout from '@/components/AdminPageLayout';
import { BulkActionBar } from '@/components/BulkActionBar';
import { AdminTable } from '@/components/AdminTable';
import { CreateEditModal } from '@/components/CreateEditModal';
import { authenticatedFetch } from '@/lib/fetch-helper';
import { useConfirm } from '@/components/ConfirmProvider';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const confirm = useConfirm();

  // Explicit role-based access control at component level
  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error('Unauthorized: Admin access required');
      router.replace('/login');
    }
  }, [user, isAdmin, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('/api/admin/products', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchProducts();
  }, [user, isAdmin]);

  const handleCreate = async (values: Record<string, any>) => {
    const res = await authenticatedFetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error('Create failed');
    await fetchProducts();
    toast.success('Product created');
  };

  const handleUpdate = async (id: string, values: Record<string, any>) => {
    const res = await authenticatedFetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error('Update failed');
    await fetchProducts();
    toast.success('Product updated');
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm('Delete this product?');
    if (!ok) return;
    const res = await authenticatedFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const columns = [
    { header: 'Name', accessor: (p: Product) => p.name },
    { header: 'Price', accessor: (p: Product) => `$${p.price.toFixed(2)}` },
    { header: 'Stock', accessor: (p: Product) => p.stock },
    { header: 'Category', accessor: (p: Product) => p.category ?? '—' },
    { header: 'Status', accessor: (p: Product) => p.isActive ? 'Active' : 'Inactive' },
  ];

  const renderActions = (p: Product) => (
    <>
      <button 
        onClick={() => openEdit(p)} 
        className="text-blue-600 hover:underline mr-3"
        title="Edit product details"
        disabled={!isAdmin}
      >
        Edit
      </button>
      <button 
        onClick={() => handleDelete(p.id)} 
        className="text-red-600 hover:underline"
        title="Remove product from inventory"
        disabled={!isAdmin}
      >
        Delete
      </button>
    </>
  );

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // Only render if user is authenticated and is admin
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminPageLayout
      title="Products"
      addLink="/admin/products/new"
      addLabel="Add New Product"
      search={search}
      setSearch={setSearch}
      loading={loading}
    >
      {/* Bulk actions are handled by the table via `onBulkAction` */}
      <AdminTable<Product>
        data={filtered}
        columns={columns}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
        rowActions={renderActions}
        onBulkAction={async (action: string) => {
          if (action === 'delete') {
            const ok = await confirm('Delete selected products?');
            if (!ok) return;
            const res = await authenticatedFetch('/api/admin/products/bulk-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedIds }),
            });
            if (!res.ok) {
              toast.error('Bulk delete failed');
            } else {
              toast.success('Products deleted');
              setSelectedIds([]);
              fetchProducts();
            }
          } else if (action === 'export') {
            const params = selectedIds.length ? `?ids=${selectedIds.join(',')}` : '';
            const link = document.createElement('a');
            link.href = `/api/admin/products/export${params}`;
            link.download = 'products.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
        loading={loading}
      />
      <CreateEditModal
        open={modalOpen}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        onSubmit={async values => {
          if (editingProduct) {
            await handleUpdate(editingProduct.id, values);
          } else {
            await handleCreate(values);
          }
        }}
        initialValues={editingProduct ?? { name: '', description: '', price: 0, stock: 0, category: '', isActive: true }}
        fields={[
          { name: 'name', label: 'Name', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'price', label: 'Price', type: 'number', required: true },
          { name: 'stock', label: 'Stock', type: 'number', required: true },
          { name: 'category', label: 'Category' },
          { name: 'isActive', label: 'Active', type: 'checkbox' },
        ]}
      />
    </AdminPageLayout>
  );
}
