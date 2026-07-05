"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminPageLayout from "@/components/AdminPageLayout";
import { AdminTable } from "@/components/AdminTable";
import { CreateEditModal } from "@/components/CreateEditModal";
import { authenticatedFetch } from "@/lib/fetch-helper";
import { useConfirm } from '@/components/ConfirmProvider';

interface LivestockProduct {
  id: string;
  name: string;
  category: string;
  breed?: string;
  healthStatus?: string;
  ageOrWeight?: string;
  price: number;
  stock: number;
  description: string;
}

const LIVESTOCK_CATEGORIES = ["Cattle", "Goats", "Poultry", "Sheep", "Pigs"];

export default function AdminLivestockPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [livestockItems, setLivestockItems] = useState<LivestockProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LivestockProduct | null>(null);
  const confirm = useConfirm();

  // Role-based access control
  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error("Unauthorized: Admin access required");
      router.replace("/login");
    }
  }, [user, isAdmin, router]);

  const fetchLivestock = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/admin/products", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch livestock");
      const data = await res.json();

      // Filter only livestock categories
      const filtered = data.filter((p: LivestockProduct) =>
        LIVESTOCK_CATEGORIES.includes(p.category)
      );
      setLivestockItems(filtered);
    } catch (e) {
      toast.error("Error loading livestock inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchLivestock();
  }, [user, isAdmin]);

  const handleCreate = async (values: Record<string, any>) => {
    try {
      // Ensure category is a livestock type
      if (!LIVESTOCK_CATEGORIES.includes(values.category)) {
        throw new Error("Please select a livestock category");
      }

      const res = await authenticatedFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Create failed");
      await fetchLivestock();
      toast.success("Livestock added successfully");
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create livestock");
    }
  };

  const handleUpdate = async (id: string, values: Record<string, any>) => {
    try {
      if (!LIVESTOCK_CATEGORIES.includes(values.category)) {
        throw new Error("Please select a valid livestock category");
      }

      const res = await authenticatedFetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchLivestock();
      toast.success("Livestock updated successfully");
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update livestock");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm('Delete this livestock item?');
    if (!ok) return;
    try {
      const res = await authenticatedFetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setLivestockItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Livestock deleted");
    } catch (error) {
      toast.error("Failed to delete livestock");
    }
  };

  const openEdit = (item: LivestockProduct) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const columns = [
    { header: "Livestock Name", accessor: (p: LivestockProduct) => p.name },
    { header: "Category", accessor: (p: LivestockProduct) => p.category },
    { header: "Breed", accessor: (p: LivestockProduct) => p.breed ?? "—" },
    { header: "Health Status", accessor: (p: LivestockProduct) => p.healthStatus ?? "—" },
    { header: "Price (KES)", accessor: (p: LivestockProduct) => `${p.price.toLocaleString()}` },
    { header: "Stock", accessor: (p: LivestockProduct) => p.stock },
  ];

  const renderActions = (p: LivestockProduct) => (
    <>
      <button
        onClick={() => openEdit(p)}
        className="text-blue-600 hover:underline mr-3"
        title="Edit livestock details"
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(p.id)}
        className="text-red-600 hover:underline"
        title="Remove livestock from inventory"
      >
        Delete
      </button>
    </>
  );

  const filtered = livestockItems.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.breed?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminPageLayout
      title="Livestock Management"
      addLink="/admin/livestock"
      addLabel="Add Livestock"
      search={search}
      setSearch={setSearch}
      loading={loading}
    >
      <AdminTable<LivestockProduct>
        data={filtered}
        columns={columns}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
        rowActions={renderActions}
          onBulkAction={async (action: string) => {
          if (action === "delete") {
            const ok = await confirm('Delete selected livestock items?');
            if (!ok) return;
            try {
              const res = await authenticatedFetch("/api/admin/products/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
              });
              if (!res.ok) {
                toast.error("Bulk delete failed");
              } else {
                toast.success("Livestock items deleted");
                setSelectedIds([]);
                fetchLivestock();
              }
            } catch (e) {
              toast.error("Error during bulk delete");
            }
          } else if (action === "export") {
            const params = selectedIds.length ? `?ids=${selectedIds.join(",")}` : "";
            const link = document.createElement("a");
            link.href = `/api/admin/products/export${params}`;
            link.download = "livestock_inventory.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
        loading={loading}
      />

      <CreateEditModal
        open={modalOpen}
        title={editingItem ? "Edit Livestock" : "Add Livestock"}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={async (values) => {
          if (editingItem) {
            await handleUpdate(editingItem.id, values);
          } else {
            await handleCreate(values);
          }
        }}
        initialValues={
          editingItem ?? {
            name: "",
            category: "Cattle",
            breed: "",
            healthStatus: "Healthy",
            ageOrWeight: "",
            price: 0,
            stock: 0,
            description: "",
          }
        }
        fields={[
          { name: "name", label: "Livestock Name", required: true },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: LIVESTOCK_CATEGORIES,
            required: true,
          },
          { name: "breed", label: "Breed" },
          { name: "healthStatus", label: "Health Status" },
          { name: "ageOrWeight", label: "Age/Weight" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "price", label: "Price (KES)", type: "number", required: true },
          { name: "stock", label: "Available Stock", type: "number", required: true },
        ]}
      />
    </AdminPageLayout>
  );
}
