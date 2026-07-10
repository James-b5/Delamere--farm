"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BulkActionBar } from '@/components/BulkActionBar';
import AdminPageLayout from '@/components/AdminPageLayout';
import { CreateEditModal } from '@/components/CreateEditModal';
import { authenticatedFetch } from '@/lib/fetch-helper';
import { useConfirm } from '@/components/ConfirmProvider';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const filtered = users.filter(u => (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));
  const confirm = useConfirm();

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleEditSubmit = async (updates: Partial<User>) => {
    if (!editingUser) return;
    await updateUser(editingUser.id, updates);
    closeModal();
  };


  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await authenticatedFetch('/api/admin/users', { method: 'GET' });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch {
        toast.error('Error loading users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const res = await authenticatedFetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      toast.success('User updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateUser(id, { isActive: !current });
  };

  const deleteUser = async (id: string) => {
    const ok = await confirm('Are you sure you want to delete this user?');
    if (!ok) return;
    try {
      const res = await authenticatedFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (!user || user.role !== 'ADMIN') {
    // Redirect handled by RequireAdmin wrapper
    return null;
  }

  return (
    <AdminPageLayout
      title="User Management"
      addLink="/admin/users/new"
      addLabel="Add New User"
      search={search}
      setSearch={setSearch}
      loading={loading}
    >
      <BulkActionBar
        selectedIds={selectedIds}
        onAction={async (action) => {
          if (action === 'delete') {
            const ok = await confirm('Delete selected users?');
            if (!ok) return;
            const res = await authenticatedFetch('/api/admin/users/bulk-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedIds }),
            });
            if (!res.ok) {
              toast.error('Bulk delete failed');
            } else {
              toast.success('Users deleted');
              setSelectedIds([]);
              // refetch users
              const refreshed = await authenticatedFetch('/api/admin/users', { method: 'GET' });
              const data = await refreshed.json();
              setUsers(data);
            }
          } else if (action === 'export') {
            const params = selectedIds.length ? `?ids=${selectedIds.join(',')}` : '';
            const link = document.createElement('a');
            link.href = `/api/admin/users/export${params}`;
            link.download = 'users.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
        disabled={loading}
      />
      {/* Users Table */}
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        aria-label={`Select user ${u.name ?? u.email}`}
                        checked={selectedIds.includes(u.id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setSelectedIds(prev =>
                            checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                          );
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label htmlFor={`role-select-${u.id}`} className="sr-only">User role for {u.name}</label>
                      <select
                        id={`role-select-${u.id}`}
                        value={u.role}
                        onChange={e => updateUser(u.id, { role: e.target.value })}
                        className="border rounded px-2 py-1 text-sm"
                        aria-label={`Role for user ${u.name}`}
                      >
                        <option value="USER">User</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleActive(u.id, u.isActive)}
                          className={`px-2 py-1 rounded text-sm ${u.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                          aria-label={`${u.isActive ? 'Deactivate' : 'Activate'} user ${u.email}`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <span className="text-sm text-gray-600">{u.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => openEditModal(u)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CreateEditModal
            open={modalOpen}
            title={`Edit ${editingUser?.name ?? 'User'}`}
            onClose={closeModal}
            onSubmit={handleEditSubmit}
            initialValues={{
              name: editingUser?.name ?? '',
              role: editingUser?.role ?? 'USER',
              isActive: editingUser?.isActive ?? true,
            }}
            fields={[
              { name: 'name', label: 'Name' },
              { name: 'role', label: 'Role', type: 'select', options: ['USER', 'MODERATOR', 'ADMIN'] },
              { name: 'isActive', label: 'Active', type: 'checkbox' },
            ]}
          />
        </>
      )}
    </AdminPageLayout>
  );
}
