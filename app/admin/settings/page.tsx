"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Settings, Database, Lock, Bell, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Delamere Farm",
    adminEmail: "admin@delamere.com",
    maintenanceMode: false,
    enableNotifications: true,
    maxUploadSize: 10,
    sessionTimeout: 30,
  });

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real scenario, this would save to an admin_settings table
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          </div>
          <p className="text-gray-600">Configure your administrative preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  id="siteName"
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  placeholder="Enter site name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 cursor-text"
                />
              </div>
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  name="adminEmail"
                  value={settings.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 cursor-text"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Security Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  id="sessionTimeout"
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  placeholder="30"
                  min="5"
                  max="480"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 cursor-text"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long a session stays active without interaction
                </p>
              </div>
              <div>
                <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Max File Upload Size (MB)
                </label>
                <input
                  id="maxUploadSize"
                  type="number"
                  name="maxUploadSize"
                  value={settings.maxUploadSize}
                  onChange={handleChange}
                  placeholder="50"
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 cursor-text"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <input
                  id="maintenanceMode"
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium text-red-900 cursor-pointer">
                  Enable Maintenance Mode (Disables public access)
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              Notification Settings
            </h2>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                id="enableNotifications"
                type="checkbox"
                name="enableNotifications"
                checked={settings.enableNotifications}
                onChange={handleChange}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="enableNotifications" className="text-sm font-medium text-blue-900 cursor-pointer">
                Enable Email Notifications for new orders and messages
              </label>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Admin User</p>
                <p className="font-semibold text-gray-900">{user?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user?.email || "Unknown"}</p>
              </div>
              <div>
                <p className="text-gray-600">Application Version</p>
                <p className="font-semibold text-gray-900">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-600">Database</p>
                <p className="font-semibold text-gray-900">PostgreSQL</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
