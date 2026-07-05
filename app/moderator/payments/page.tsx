"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, CreditCard, AlertCircle } from "lucide-react";
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
          // Payments endpoint might not exist yet
          console.log("Payments API not yet implemented");
          setPayments([]);
        } else {
          toast.error("Failed to load payments");
        }
      } catch (err) {
        console.error("Failed to fetch payments");
        toast.error("Error fetching payments");
      } finally {
        setIsLoading(false);
      }
    }
    if (user?.role === "OTHER" || user?.role === "ADMIN") {
      fetchPayments();
    }
  }, [user]);

  const filteredPayments = filterStatus === "all"
    ? payments
    : payments.filter(p => p.status === filterStatus);

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

  if (!user || (!isModerator && !isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/moderator"
                className="text-blue-600 hover:text-blue-700 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Permission Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Payment Transactions</p>
            <p className="text-sm text-blue-700">View all payment transactions and their status.</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "COMPLETED", "PENDING", "FAILED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status === "all" ? "All Payments" : status}
            </button>
          ))}
        </div>

        {/* Payments Table */}
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
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProviderColor(payment.provider)}`}>
                        {payment.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">KES {payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
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
