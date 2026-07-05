"use client";

import { useEffect, useMemo, useState } from 'react';
import RequireAdmin from '@/components/RequireAdmin';
import { authenticatedFetch } from '@/lib/fetch-helper';
import toast from 'react-hot-toast';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  checkoutStarted: number;
  checkoutCompleted: number;
  whatsappClicks: number;
  conversionRate: number;
  ordersOverTime: Array<{
    date: string;
    total: number;
    count: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const analyticsRes = await authenticatedFetch('/api/admin/analytics');
        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
        const analyticsJson = await analyticsRes.json();
        setData(analyticsJson);
      } catch (err) {
        toast.error('Unable to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) return [];

    const currency = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    });

    return [
      { title: 'Total Users', value: data.totalUsers.toLocaleString(), accent: 'from-indigo-600 to-indigo-500', detail: 'Registered accounts' },
      { title: 'Active Users', value: data.activeUsers.toLocaleString(), accent: 'from-emerald-600 to-green-500', detail: 'Currently active' },
      { title: 'Orders', value: data.totalOrders.toLocaleString(), accent: 'from-sky-600 to-blue-500', detail: 'Placed so far' },
      { title: 'Products', value: data.totalProducts.toLocaleString(), accent: 'from-violet-600 to-purple-500', detail: 'Live listings' },
      { title: 'Revenue', value: currency.format(data.totalRevenue), accent: 'from-amber-500 to-yellow-500', detail: 'Gross sales' },
      { title: 'Conversion', value: `${data.conversionRate.toFixed(1)}%`, accent: 'from-rose-600 to-pink-500', detail: 'Checkout completion' },
    ];
  }, [data]);

  const recentActivity = useMemo(() => {
    if (!data?.ordersOverTime?.length) return [];
    return [...data.ordersOverTime].slice(-6).reverse();
  }, [data]);

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </RequireAdmin>
    );
  }

  if (!data) {
    return (
      <RequireAdmin>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">No analytics data available.</p>
        </div>
      </RequireAdmin>
    );
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Operations overview</p>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Checkout completion rate is currently <span className="font-semibold">{data.conversionRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`h-1.5 w-20 rounded-full bg-linear-to-r ${card.accent}`} />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Checkout activity</h2>
                  <p className="text-sm text-slate-500">Track how visitors progress from browse to order confirmation.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Started</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{data.checkoutStarted}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Completed</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{data.checkoutCompleted}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">WhatsApp clicks</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{data.whatsappClicks}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Recent order activity</h2>
              <p className="mt-1 text-sm text-slate-500">A lightweight view of daily sales momentum.</p>
              <div className="mt-5 space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((item) => (
                  <div key={item.date} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.date}</p>
                      <p className="text-xs text-slate-500">{item.count} orders</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">KES {Number(item.total).toLocaleString()}</p>
                  </div>
                )) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                    No recent order activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
