"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";

interface OrderTrend {
  date: string;
  totalAmount: number;
  count: number;
}

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  orderTrends?: OrderTrend[];
}

export default function ModeratorAnalytics() {
  const { user, isModerator } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [trends, setTrends] = useState<OrderTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isModerator) {
      router.push("/login");
    }
  }, [user, isModerator, router]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [analyticsRes, trendsRes] = await Promise.all([
          authenticatedFetch("/api/admin/analytics"),
          authenticatedFetch("/api/admin/analytics/orders"),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (trendsRes.ok) {
          const trendData = await trendsRes.json();
          setTrends(trendData);
        }
      } catch (err) {
        console.error("Failed to fetch analytics");
        toast.error("Error fetching analytics");
      } finally {
        setIsLoading(false);
      }
    }

    if (isModerator) {
      fetchAnalytics();
    }
  }, [user]);

  if (!user || !isModerator) {
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
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalUsers}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.activeUsers}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalOrders}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalProducts}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  KES {Math.round(analytics.totalRevenue).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Order Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Order Trends (Last 7 Days)
              </h2>

              {trends.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Orders Count</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Avg Order Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trends.map((trend, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(trend.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{trend.count}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            KES {Math.round(trend.totalAmount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            KES {Math.round(trend.totalAmount / (trend.count || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No order data available</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
