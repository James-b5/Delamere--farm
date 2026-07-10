"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { LogOut, LayoutDashboard, MapPin, Heart, Settings } from "lucide-react";

export default function ProfileDropdown() {
  const { user, isAdmin, isModerator, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      logout();
      setIsOpen(false);
    } catch {
      toast.error("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-900 px-3 py-1.5 rounded-full text-sm font-semibold hover:border-green-300 hover:bg-green-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="User menu"
      >
        <span className="w-6 h-6 flex items-center justify-center bg-green-700 text-white rounded-full text-xs font-bold shadow-sm">
          {((user.name && user.name.charAt(0)) || user.email?.charAt(0) || 'U').toUpperCase()}
        </span>
        <span className="max-w-25 truncate">{user.name || user.email}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          {/* User Info */}
          <div className="px-4 py-3 bg-linear-to-b from-green-50 to-blue-50 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
            {(isAdmin || isModerator) && (
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                {isAdmin ? 'Admin' : 'Moderator'}
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* My Dashboard */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">My Dashboard</span>
            </Link>

            {/* Saved Addresses */}
            <Link
              href="/dashboard?tab=addresses"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Saved Addresses</span>
            </Link>

            {/* My Wishlist */}
            <Link
              href="/dashboard?tab=wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">My Wishlist</span>
            </Link>

            {/* Admin/Moderator Panel */}
            {(isAdmin || isModerator) && (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <Link
                  href={isAdmin ? "/admin" : "/moderator"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">{isAdmin ? 'Admin' : 'Moderator'} Panel</span>
                </Link>
              </>
            )}

            {/* Logout */}
            <div className="border-t border-gray-100 my-2"></div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">{isLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
