"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, Trash2, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { CreateEditModal } from "@/components/CreateEditModal";
import { useConfirm } from '@/components/ConfirmProvider';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bookingDate: string;
  numberOfPeople: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export default function AdminBookings() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const confirm = useConfirm();

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingBooking(null);
    setModalOpen(false);
  };

  const handleBookingEdit = async (updates: Partial<Booking>) => {
    if (!editingBooking) return;
    await updateBooking(editingBooking.id, updates);
    closeModal();
  };

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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
        setLoading(false);
      }
    }
    if (user?.role === "ADMIN") {
      fetchBookings();
    }
  }, [user]);

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const res = await authenticatedFetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings(bookings.map(b => (b.id === id ? updated : b)));
        toast.success("Booking updated");
      } else {
        toast.error("Failed to update booking");
      }
    } catch {
      toast.error("Error updating booking");
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await updateBooking(id, { status });
  };

  const deleteBooking = async (id: string) => {
    const ok = await confirm('Delete this booking?');
    if (!ok) return;
    try {
      const res = await authenticatedFetch("/api/admin/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== id));
        toast.success("Booking deleted");
      } else {
        toast.error("Failed to delete booking");
      }
    } catch {
      toast.error("Error deleting booking");
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === "all") return true;
    return b.status.toLowerCase() === filter.toLowerCase();
  });

  if (!user || !isAdmin) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          href="/admin"
          className="flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Admin
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Bookings Management</h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(["all", "pending", "confirmed", "cancelled"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin w-8 h-8 text-green-600" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Bookings</h2>
            <p className="text-gray-600">
              {filter === "all"
                ? "No farm visit bookings yet"
                : `No ${filter} bookings`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Visitors</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{booking.phone || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.numberOfPeople}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {booking.status !== "CONFIRMED" && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                              className="text-green-600 hover:text-green-700"
                              title="Confirm booking"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {booking.status !== "CANCELLED" && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                              className="text-red-600 hover:text-red-700"
                              title="Cancel booking"
                            >
                              <Clock className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(booking)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit booking"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete booking"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <CreateEditModal
          open={modalOpen}
          title={`Edit booking for ${editingBooking?.name ?? 'Booking'}`}
          onClose={closeModal}
          onSubmit={handleBookingEdit}
          initialValues={{
            name: editingBooking?.name ?? '',
            email: editingBooking?.email ?? '',
            phone: editingBooking?.phone ?? '',
            bookingDate: editingBooking ? new Date(editingBooking.bookingDate).toISOString().slice(0, 10) : '',
            numberOfPeople: editingBooking?.numberOfPeople ?? 1,
            notes: editingBooking?.notes ?? '',
            status: editingBooking?.status ?? 'PENDING',
          }}
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone' },
            { name: 'bookingDate', label: 'Booking Date', type: 'date', required: true },
            { name: 'numberOfPeople', label: 'Visitors', type: 'number', required: true },
            { name: 'notes', label: 'Notes', type: 'textarea' },
            { name: 'status', label: 'Status', type: 'select', options: ['PENDING', 'CONFIRMED', 'CANCELLED'] },
          ]}
        />
      </div>
    </div>
  );
}

