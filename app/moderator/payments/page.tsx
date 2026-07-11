"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, CreditCard, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Payment {
  id: string;
  orderId?: string;
  userId: string;
  user?: { name?: string; email: string };
  provider: string;
  amount: number;
  status: string;
  transactionId?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function ModeratorPayments() {
  const { user, isModerator, isAdmin } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "PENDING", provider: "UNKNOWN" });
  const [createForm, setCreateForm] = useState({ userId: "", provider: "UNKNOWN", amount: "", status: "PENDING", transactionId: "" });

  useEffect(() => {
    if (!user || (!isModerator && !isAdmin)) {
      router.push("/login");
    }
  }, [user, isModerator, isAdmin, router]);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await authenticatedFetch("/api/admin/payments");
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        } else if (res.status === 404) {
          setPayments([]);
        } else {
          toast.error("Failed to load payments");
        }
      } catch {
        console.error("Failed to fetch payments");
        toast.error("Error fetching payments");
      } finally {
        setIsLoading(false);
      }
    }
    if (isModerator || isAdmin) {
      fetchPayments();
    }
  }, [user]);

  const filteredPayments = filterStatus === "all" ? payments : payments.filter((p) => p.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "PAYSTACK":
        return "bg-blue-50 text-blue-700";
      case "INTASEND":
        return "bg-orange-50 text-orange-700";
      case "PAYPAL":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const startEdit = (payment: Payment) => {
    setEditingPaymentId(payment.id);
    setEditForm({ status: payment.status, provider: payment.provider });
  };

  const createPayment = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: createForm.userId || null, provider: createForm.provider, amount: Number(createForm.amount), status: createForm.status, transactionId: createForm.transactionId || null }),
      });
      if (!res.ok) throw new Error("Failed to create payment");
      const created = await res.json();
      setPayments((curr) => [created, ...curr]);
      setCreateForm({ userId: "", provider: "UNKNOWN", amount: "", status: "PENDING", transactionId: "" });
      setShowCreateForm(false);
      toast.success("Payment created");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create payment");
    }
  };

  const saveEdit = async (paymentId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/payments`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: paymentId, status: editForm.status, provider: editForm.provider }) });
      if (!res.ok) throw new Error("Failed to update payment");
      const updated = await res.json();
      setPayments((curr) => curr.map((item) => (item.id === paymentId ? { ...item, ...updated } : item)));
      setEditingPaymentId(null);
      toast.success("Payment updated");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to update payment");
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/payments?id=${paymentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete payment");
      setPayments((curr) => curr.filter((item) => item.id !== paymentId));
      toast.success("Payment deleted");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete payment");
    }
  };

  if (!user || (!isModerator && !isAdmin)) {
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
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            </div>
            <button type="button" onClick={() => setShowCreateForm((cur) => !cur)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="w-4 h-4" /> {showCreateForm ? "Hide Form" : "Add Payment"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Payment Transactions</p>
            <p className="text-sm text-blue-700">View and manage payment records from the moderator panel.</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "COMPLETED", "PENDING", "FAILED"].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === status ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>
              {status === "all" ? "All Payments" : status}
            </button>
          ))}
        </div>

        {showCreateForm ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 text-sm font-semibold text-blue-900">Create payment</div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input value={createForm.userId} onChange={(e) => setCreateForm((cur) => ({ ...cur, userId: e.target.value }))} className="rounded border px-3 py-2" placeholder="User ID" />
              <select value={createForm.provider} onChange={(e) => setCreateForm((cur) => ({ ...cur, provider: e.target.value }))} className="rounded border px-3 py-2">
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="PAYSTACK">PAYSTACK</option>
                <option value="INTASEND">INTASEND</option>
                <option value="PAYPAL">PAYPAL</option>
              </select>
              <input type="number" value={createForm.amount} onChange={(e) => setCreateForm((cur) => ({ ...cur, amount: e.target.value }))} className="rounded border px-3 py-2" placeholder="Amount" />
              <select value={createForm.status} onChange={(e) => setCreateForm((cur) => ({ ...cur, status: e.target.value }))} className="rounded border px-3 py-2">
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <input value={createForm.transactionId} onChange={(e) => setCreateForm((cur) => ({ ...cur, transactionId: e.target.value }))} className="rounded border px-3 py-2 xl:col-span-4" placeholder="Transaction ID" />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void createPayment()} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => { setShowCreateForm(false); setCreateForm({ userId: "", provider: "UNKNOWN", amount: "", status: "PENDING", transactionId: "" }); }} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <Fragment key={payment.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">{payment.user?.name || "Unknown"}</div>
                            <div className="text-sm text-gray-500">{payment.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProviderColor(payment.provider)}`}>{payment.provider}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">KES {payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>{payment.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(payment)} className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button type="button" onClick={() => void deletePayment(payment.id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingPaymentId === payment.id && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 px-6 py-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <select value={editForm.status} onChange={(e) => setEditForm((cur) => ({ ...cur, status: e.target.value }))} className="rounded border px-3 py-2">
                              <option value="PENDING">PENDING</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="FAILED">FAILED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                            <select value={editForm.provider} onChange={(e) => setEditForm((cur) => ({ ...cur, provider: e.target.value }))} className="rounded border px-3 py-2">
                              <option value="UNKNOWN">UNKNOWN</option>
                              <option value="PAYSTACK">PAYSTACK</option>
                              <option value="INTASEND">INTASEND</option>
                              <option value="PAYPAL">PAYPAL</option>
                            </select>
                            <div className="flex gap-2 md:col-span-2">
                              <button type="button" onClick={() => void saveEdit(payment.id)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                              <button type="button" onClick={() => setEditingPaymentId(null)} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
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
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
