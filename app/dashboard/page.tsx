"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWishlist } from '@/hooks/useWishlist';
import { useAddresses } from '@/hooks/useAddresses';
import Link from "next/link";
import { authenticatedFetch } from '@/lib/fetch-helper';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout, isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const tab: string = ""; // No tab handling in this build
  const { items: wishlist, toggle: toggleWishlist } = useWishlist();
  const { addresses, add: addAddress, update: updateAddress, remove: removeAddressHook, reorder } = useAddresses();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const removeFromWishlist = (id: string) => {
    toggleWishlist(id);
  };

  const removeAddressLocal = (id: string) => {
    removeAddressHook(id);
  };

  // Address form state
  const [addrLabel, setAddrLabel] = useState('');
  const [addrText, setAddrText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveAddress = () => {
    if (!addrLabel.trim() || !addrText.trim()) return;
    if (editingId) {
      updateAddress({ id: editingId, label: addrLabel, address: addrText, isDefault: false });
      setEditingId(null);
      setAddrLabel('');
      setAddrText('');
      return;
    }
    addAddress(addrLabel, addrText).then(() => { setAddrLabel(''); setAddrText(''); });
  };

  const setDefaultAddress = (id: string) => {
    updateAddress({ id, isDefault: true });
  };

  const moveAddress = (id: string, direction: 'up' | 'down') => {
    const idx = addresses.findIndex(a => a.id === id);
    if (idx === -1) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= addresses.length) return;
    reorder(idx, swapWith);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const confirmDelete = (id: string) => setConfirmDeleteId(id);
  const doDeleteConfirmed = () => {
    if (!confirmDeleteId) return;
    removeAddressLocal(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const startEdit = (id: string) => {
    const a = addresses.find(x => x.id === id);
    if (!a) return;
    setEditingId(id);
    setAddrLabel(a.label);
    setAddrText(a.address);
  };

  // Drag state for simple HTML5 DnD
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    reorder(dragIndex, idx);
    setDragIndex(null);
  };

  const initialOrders = [
    { id: "ORD-9432", date: "2024-04-20", status: "Delivered", amount: 1500, items: "Fresh Milk 1L (x10), Butter (x1)" },
    { id: "ORD-9451", date: "2024-04-23", status: "Processing", amount: 35000, items: "Boer Goat (Male)" },
  ];
  const [orders, setOrders] = useState(initialOrders);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function handleDeleteConfirmed(id: string) {
    try {
      const res = await authenticatedFetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Order deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete order');
    } finally {
      setDeleteConfirmId(null);
    }
  }

  if (!user) return null; // Prevent flash of content before redirect

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              Welcome back, {user.name}! 👋
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 text-green-700 text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-1">{user?.name || 'User'}</h3>
            <p className="text-gray-500 text-center mb-6">{user.email}</p>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center text-gray-600">
                <span className="w-5 h-5 mr-3">📞</span>
                {user.phone || "No phone added"}
              </div>
              <div className="flex items-center text-gray-600">
                <span className="w-5 h-5 mr-3">📍</span>
                {user.address || "No address added"}
              </div>
            </div>
            <button className="mt-6 w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200">
              Edit Profile
            </button>

            {/* Admin Badge */}
            {(isAdmin || isModerator) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                  <span className="text-lg">👑</span>
                    <span className="text-sm font-semibold text-purple-700">
                    {isAdmin ? "Admin" : "Other"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            {/* Orders Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Orders & Bookings</h3>
                <Link href="/products" className="text-sm text-green-600 font-medium hover:text-green-700">Shop again →</Link>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div />
                {(isAdmin || isModerator) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/api/admin/orders?format=csv';
                        link.download = 'orders.csv';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-1 bg-white border rounded text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Export CSV
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-green-200 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-gray-900">{order.id}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{order.items}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="font-bold text-gray-900">KES {order.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{order.date}</div>
                      {(isAdmin || isModerator) && (
                        <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => setDeleteConfirmId(order.id)}
                                  className="px-3 py-1 bg-red-50 text-red-700 border rounded text-sm hover:bg-red-100"
                                >
                                  Delete
                                </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Dashboard Section */}
            {(isAdmin || isModerator) && (
              <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-sm border border-purple-200">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="text-xl font-bold text-gray-900">Admin Dashboard</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/moderator/users" className="bg-white p-4 rounded-xl hover:shadow-md transition-all border border-purple-100 hover:border-purple-300 group">
                    <div className="text-xl mb-2">👥</div>
                    <h4 className="font-bold text-sm text-gray-900">Manage Users</h4>
                    <p className="text-xs text-gray-500">View & manage users</p>
                  </Link>
                  <Link href="/moderator/payments" className="bg-white p-4 rounded-xl hover:shadow-md transition-all border border-purple-100 hover:border-purple-300 group">
                    <div className="text-xl mb-2">💳</div>
                    <h4 className="font-bold text-sm text-gray-900">Payments</h4>
                    <p className="text-xs text-gray-500">Track transactions</p>
                  </Link>
                  <Link href="/moderator/orders" className="bg-white p-4 rounded-xl hover:shadow-md transition-all border border-purple-100 hover:border-purple-300 group">
                    <div className="text-xl mb-2">📦</div>
                    <h4 className="font-bold text-sm text-gray-900">All Orders</h4>
                    <p className="text-xs text-gray-500">Review all orders</p>
                  </Link>
                  <Link href="/moderator/articles/new" className="bg-white p-4 rounded-xl hover:shadow-md transition-all border border-purple-100 hover:border-purple-300 group">
                    <div className="text-xl mb-2">📰</div>
                    <h4 className="font-bold text-sm text-gray-900">Create Article</h4>
                    <p className="text-xs text-gray-500">Add a blog article or announcement</p>
                  </Link>
                  <Link href="/moderator/bookings" className="bg-white p-4 rounded-xl hover:shadow-md transition-all border border-purple-100 hover:border-purple-300 group">
                    <div className="text-xl mb-2">📋</div>
                    <h4 className="font-bold text-sm text-gray-900">Bookings</h4>
                    <p className="text-xs text-gray-500">Manage bookings</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/bookings" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📅</div>
                <h4 className="font-bold text-gray-900 mb-1">My Bookings</h4>
                <p className="text-sm text-gray-500">Manage your farm tours and training</p>
              </Link>

              {/* Dashboard tab links: show inline sections when ?tab=wishlist or ?tab=addresses */}
              {tab === "wishlist" ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4">My Wishlist</h4>
                  {wishlist.length === 0 ? (
                    <p className="text-sm text-gray-500">You have no items in your wishlist.</p>
                  ) : (
                    <ul className="space-y-2">
                      {wishlist.map((id) => (
                        <li key={id} className="flex items-center justify-between border p-3 rounded-lg">
                          <span className="text-sm text-gray-800">Product ID: {id}</span>
                          <button onClick={() => removeFromWishlist(id)} className="text-sm text-red-600">Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : tab === "addresses" ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4">Saved Addresses</h4>

                  {/* Add / Edit form */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                      <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="Label (e.g., Home, Farm)" className="p-2 border border-gray-200 rounded-lg col-span-1 sm:col-span-1" />
                      <input value={addrText} onChange={(e) => setAddrText(e.target.value)} placeholder="Address details" className="p-2 border border-gray-200 rounded-lg col-span-1 sm:col-span-2" />
                      <div className="flex gap-2 col-span-1">
                        <button onClick={saveAddress} className="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold">{editingId ? 'Save' : 'Add'}</button>
                        {editingId && <button onClick={() => { setEditingId(null); setAddrLabel(''); setAddrText(''); }} className="px-3 py-2 bg-gray-100 rounded-lg">Cancel</button>}
                      </div>
                    </div>
            
                    {/* More Quick Actions */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Link href="/services" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group">
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🛠️</div>
                        <h4 className="font-bold text-gray-900 mb-1">Services</h4>
                        <p className="text-sm text-gray-500">Explore our farm services and support</p>
                      </Link>

                      <Link href="/breed-advisor" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🐐</div>
                        <h4 className="font-bold text-gray-900 mb-1">Breed Advisor</h4>
                        <p className="text-sm text-gray-500">Get guidance for selecting the right breeds</p>
                      </Link>
                    </div>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="text-sm text-gray-500">No saved addresses yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {addresses.map((a, idx) => (
                        <li key={a.id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, idx)} className="flex items-center justify-between border p-3 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-800">{a.label}</div>
                              {a.isDefault && <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</div>}
                            </div>
                            <div className="text-sm text-gray-500">{a.address}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setDefaultAddress(a.id)} className="text-sm text-green-600">Set Default</button>
                            <button onClick={() => moveAddress(a.id, 'up')} disabled={idx===0} className="text-sm text-gray-600">↑</button>
                            <button onClick={() => moveAddress(a.id, 'down')} disabled={idx===addresses.length-1} className="text-sm text-gray-600">↓</button>
                            <button onClick={() => startEdit(a.id)} className="text-sm text-blue-600">Edit</button>
                            <button onClick={() => confirmDelete(a.id)} className="text-sm text-red-600">Delete</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link href="/products" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">❤️</div>
                  <h4 className="font-bold text-gray-900 mb-1">Wishlist</h4>
                  <p className="text-sm text-gray-500">View saved livestock and products</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Confirm Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-slate-50 border border-slate-200 shadow-2xl shadow-black/10 rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Order</h3>
            <p className="text-sm text-slate-700 mb-4">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition">Cancel</button>
              <button onClick={() => deleteConfirmId && handleDeleteConfirmed(deleteConfirmId)} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-slate-50 border border-slate-200 shadow-2xl shadow-black/10 rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Address</h3>
            <p className="text-sm text-slate-700 mb-4">Are you sure you want to delete this address? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition">Cancel</button>
              <button onClick={doDeleteConfirmed} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

