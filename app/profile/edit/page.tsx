"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ProfileEditPage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update locally via context; server sync can be implemented later
      updateProfile({ name: name || null, phone: phone || null, address: address || null });
      toast.success("Profile updated");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-3 border border-gray-200 rounded-lg" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full p-3 border border-gray-200 rounded-lg" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Address</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full p-3 border border-gray-200 rounded-lg" />
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
