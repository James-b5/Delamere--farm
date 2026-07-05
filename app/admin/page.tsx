"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { BarChart3, Package, ShoppingCart, Users, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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
    if (user?.role === "ADMIN") {
      fetchAnalytics();
    }
  }, [user]);

  if (!user || !isAdmin) {
    return null;
  }

  const adminStats = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || "0",
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-blue-500",
    },
    {
      title: "Products",
      value: stats?.totalProducts || "0",
      icon: Package,
      href: "/admin/products",
      color: "bg-green-500",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || "0",
      icon: Users,
      href: "/admin/users",
      color: "bg-pink-500",
    },
    {
      title: "Revenue",
      value: stats?.totalRevenue ? `KES ${stats.totalRevenue.toLocaleString()}` : "0",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}! 👋</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin w-8 h-8 text-green-600" />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {adminStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                href={stat.href}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium text-sm">{stat.title}</h3>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </Link>
            );
          })}
        </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Most used actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Link href="/admin/users" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-colors hover:bg-emerald-100">
              <h3 className="font-semibold text-emerald-800">Manage users</h3>
              <p className="mt-1 text-sm text-emerald-700">View, edit, and delete user accounts.</p>
            </Link>
            <Link href="/admin/products" className="rounded-xl border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100">
              <h3 className="font-semibold text-blue-800">Manage products</h3>
              <p className="mt-1 text-sm text-blue-700">Update inventory and pricing quickly.</p>
            </Link>
            <Link href="/admin/bookings" className="rounded-xl border border-violet-200 bg-violet-50 p-4 transition-colors hover:bg-violet-100">
              <h3 className="font-semibold text-violet-800">Manage bookings</h3>
              <p className="mt-1 text-sm text-violet-700">Confirm, update, or remove bookings.</p>
            </Link>
            <Link href="/admin/orders" className="rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100">
              <h3 className="font-semibold text-amber-800">Review orders</h3>
              <p className="mt-1 text-sm text-amber-700">Keep track of customer purchases.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
