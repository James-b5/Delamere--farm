"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { BarChart3, Package, ShoppingCart, Users, AlertCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export default function OtherDashboard() {
  const { user, isModerator, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (!isModerator && !isAdmin)) {
      router.push("/login");
    }
  }, [user, isModerator, isAdmin, router]);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await authenticatedFetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        toast.error("Unable to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    if (user?.role === "OTHER" || user?.role === "ADMIN") {
      fetchAnalytics();
    }
  }, [user]);

  if (!user || (!isModerator && !isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Other Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">Welcome, {user.name || "Other"}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Permission Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Limited Access</p>
            <p className="text-sm text-blue-700">As an Other, you can view and manage products, orders, and user accounts.</p>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-orange-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">KES {Math.round(stats.totalRevenue).toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-red-500 opacity-20" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/other/products"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Package className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Manage Products</h3>
            <p className="text-sm text-gray-600 mt-1">View and manage product listings</p>
          </Link>

          <Link
            href="/other/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <ShoppingCart className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">View Orders</h3>
            <p className="text-sm text-gray-600 mt-1">Review and manage customer orders</p>
          </Link>

          <Link
            href="/other/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600 mt-1">View and manage user accounts</p>
          </Link>

          <Link
            href="/other/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <BarChart3 className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">View dashboard analytics and reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
