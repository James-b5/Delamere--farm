"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Booking {
  id: string;
  userId: string;
  user?: { name?: string; email: string };
  bookingDate: string;
  type: string;
  numberOfPeople?: number;
  status: string;
  createdAt: string;
  notes?: string;
}

export default function ModeratorBookings() {
  const { user, isModerator, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "PENDING", notes: "" });
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", bookingDate: "", numberOfPeople: "1", notes: "", status: "PENDING" });

  useEffect(() => {
    if (!authLoading && (!user || (!isModerator && !isAdmin))) {
      router.push("/login");
    }
  }, [authLoading, user, isModerator, isAdmin, router]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await authenticatedFetch("/api/admin/bookings");
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        } else {
          toast.error("Failed to load bookings");
        }
      } catch {
        console.error("Failed to fetch bookings");
        toast.error("Error fetching bookings");
      } finally {
        setIsLoading(false);
      }
    }
    if (isModerator || isAdmin) {
      fetchBookings();
    }
  }, [user]);

  const filteredBookings = filterStatus === "all" ? bookings : bookings.filter((b) => b.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startEdit = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setEditForm({ status: booking.status || "PENDING", notes: booking.notes || "" });
  };

  const createBooking = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          phone: createForm.phone,
          bookingDate: createForm.bookingDate,
          numberOfPeople: Number(createForm.numberOfPeople),
          notes: createForm.notes,
          status: createForm.status,
        }),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      const created = await res.json();
      setBookings((curr) => [created, ...curr]);
      setCreateForm({ name: "", email: "", phone: "", bookingDate: "", numberOfPeople: "1", notes: "", status: "PENDING" });
      setShowCreateForm(false);
      toast.success("Booking created");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create booking");
    }
  };

  const saveEdit = async (bookingId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: editForm.status, notes: editForm.notes }),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      const updated = await res.json();
      setBookings((curr) => curr.map((item) => (item.id === bookingId ? { ...item, ...updated } : item)));
      setEditingBookingId(null);
      toast.success("Booking updated");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to update booking");
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/bookings`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: bookingId }) });
      if (!res.ok) throw new Error("Failed to delete booking");
      setBookings((curr) => curr.filter((item) => item.id !== bookingId));
      toast.success("Booking deleted");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete booking");
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
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            </div>
            <button type="button" onClick={() => setShowCreateForm((cur) => !cur)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="w-4 h-4" /> {showCreateForm ? "Hide Form" : "Add Booking"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === status ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
            >
              {status === "all" ? "All Bookings" : status}
            </button>
          ))}
        </div>

        {showCreateForm ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 text-sm font-semibold text-blue-900">Create booking</div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <input value={createForm.name} onChange={(e) => setCreateForm((cur) => ({ ...cur, name: e.target.value }))} className="rounded border px-3 py-2" placeholder="Customer name" />
              <input value={createForm.email} onChange={(e) => setCreateForm((cur) => ({ ...cur, email: e.target.value }))} className="rounded border px-3 py-2" placeholder="Email" />
              <input value={createForm.phone} onChange={(e) => setCreateForm((cur) => ({ ...cur, phone: e.target.value }))} className="rounded border px-3 py-2" placeholder="Phone" />
              <input type="date" value={createForm.bookingDate} onChange={(e) => setCreateForm((cur) => ({ ...cur, bookingDate: e.target.value }))} className="rounded border px-3 py-2" />
              <input type="number" value={createForm.numberOfPeople} onChange={(e) => setCreateForm((cur) => ({ ...cur, numberOfPeople: e.target.value }))} className="rounded border px-3 py-2" placeholder="People" />
              <select value={createForm.status} onChange={(e) => setCreateForm((cur) => ({ ...cur, status: e.target.value }))} className="rounded border px-3 py-2">
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <input value={createForm.notes} onChange={(e) => setCreateForm((cur) => ({ ...cur, notes: e.target.value }))} className="rounded border px-3 py-2 md:col-span-2 xl:col-span-3" placeholder="Notes" />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void createBooking()} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => { setShowCreateForm(false); setCreateForm({ name: "", email: "", phone: "", bookingDate: "", numberOfPeople: "1", notes: "", status: "PENDING" }); }} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Booking Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">People</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <Fragment key={booking.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">{booking.user?.name || "Unknown"}</div>
                            <div className="text-sm text-gray-500">{booking.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.numberOfPeople || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(booking)} className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button type="button" onClick={() => void deleteBooking(booking.id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingBookingId === booking.id && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 px-6 py-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <select value={editForm.status} onChange={(e) => setEditForm((cur) => ({ ...cur, status: e.target.value }))} className="rounded border px-3 py-2">
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <input value={editForm.notes} onChange={(e) => setEditForm((cur) => ({ ...cur, notes: e.target.value }))} className="rounded border px-3 py-2" placeholder="Notes" />
                            <div className="flex gap-2 md:col-span-2">
                              <button type="button" onClick={() => void saveEdit(booking.id)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                              <button type="button" onClick={() => setEditingBookingId(null)} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
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
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
