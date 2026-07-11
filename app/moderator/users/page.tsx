"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, Users, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export default function ModeratorUsers() {
  const { user, isModerator, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "USER", isActive: true });
  const [createForm, setCreateForm] = useState({ name: "", email: "", role: "USER", isActive: true });

  useEffect(() => {
    if (!authLoading && (!user || (!isModerator && !isAdmin))) {
      router.push("/login");
    }
  }, [authLoading, user, isModerator, isAdmin, router]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await authenticatedFetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          toast.error("Failed to load users");
        }
      } catch {
        console.error("Failed to fetch users");
        toast.error("Error fetching users");
      } finally {
        setIsLoading(false);
      }
    }
    if (isModerator || isAdmin) {
      fetchUsers();
    }
  }, [user]);

  const filteredUsers = users.filter(
    (u) => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MODERATOR":
        return "bg-blue-100 text-blue-800";
      case "USER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startEdit = (target: User) => {
    setEditingUserId(target.id);
    setEditForm({ name: target.name || "", role: target.role, isActive: Boolean(target.isActive) });
  };

  const createUser = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createForm.name, email: createForm.email, role: createForm.role, isActive: createForm.isActive }),
      });
      if (!res.ok) throw new Error("Failed to create user");
      const created = await res.json();
      setUsers((curr) => [created, ...curr]);
      setCreateForm({ name: "", email: "", role: isModerator ? "USER" : "USER", isActive: true });
      setShowCreateForm(false);
      toast.success("User created");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    }
  };

  const saveEdit = async (userId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, role: editForm.role, isActive: editForm.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updated = await res.json();
      setUsers((curr) => curr.map((item) => (item.id === userId ? { ...item, ...updated } : item)));
      setEditingUserId(null);
      toast.success("User updated");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((curr) => curr.filter((item) => item.id !== userId));
      toast.success("User deleted");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
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
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            </div>
            <button type="button" onClick={() => setShowCreateForm((cur) => !cur)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="w-4 h-4" /> {showCreateForm ? "Hide Form" : "Add User"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isModerator ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Limited Access</p>
              <p className="text-sm text-blue-700">You can manage non-admin accounts and create new users, but admin accounts remain protected.</p>
            </div>
          </div>
        ) : null}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 cursor-text"
          />
        </div>

        {showCreateForm ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 text-sm font-semibold text-blue-900">Create user</div>
            <div className="grid gap-3 md:grid-cols-3">
              <input value={createForm.name} onChange={(e) => setCreateForm((cur) => ({ ...cur, name: e.target.value }))} className="rounded border px-3 py-2" placeholder="Name" />
              <input value={createForm.email} onChange={(e) => setCreateForm((cur) => ({ ...cur, email: e.target.value }))} className="rounded border px-3 py-2" placeholder="Email" />
              <select value={createForm.role} onChange={(e) => setCreateForm((cur) => ({ ...cur, role: e.target.value }))} className="rounded border px-3 py-2">
                <option value="USER">USER</option>
                <option value="MODERATOR">MODERATOR</option>
                {isAdmin ? <option value="ADMIN">ADMIN</option> : null}
              </select>
              <select value={createForm.isActive ? "active" : "inactive"} onChange={(e) => setCreateForm((cur) => ({ ...cur, isActive: e.target.value === "active" }))} className="rounded border px-3 py-2">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void createUser()} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => { setShowCreateForm(false); setCreateForm({ name: "", email: "", role: isModerator ? "USER" : "USER", isActive: true }); }} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userItem) => (
                  <Fragment key={userItem.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{userItem.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{userItem.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userItem.role)}`}>{userItem.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${userItem.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {userItem.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(userItem)} className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button type="button" onClick={() => void deleteUser(userItem.id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingUserId === userItem.id && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 px-6 py-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <input value={editForm.name} onChange={(e) => setEditForm((cur) => ({ ...cur, name: e.target.value }))} className="rounded border px-3 py-2" placeholder="Name" />
                            <select value={editForm.role} onChange={(e) => setEditForm((cur) => ({ ...cur, role: e.target.value }))} className="rounded border px-3 py-2">
                              <option value="USER">USER</option>
                              <option value="MODERATOR">MODERATOR</option>
                              {isAdmin ? <option value="ADMIN">ADMIN</option> : null}
                            </select>
                            <select value={editForm.isActive ? "active" : "inactive"} onChange={(e) => setEditForm((cur) => ({ ...cur, isActive: e.target.value === "active" }))} className="rounded border px-3 py-2">
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <div className="flex gap-2 md:col-span-3">
                              <button type="button" onClick={() => void saveEdit(userItem.id)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                              <button type="button" onClick={() => setEditingUserId(null)} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                            </div>
                          </div>
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
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
