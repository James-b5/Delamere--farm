"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";

import { Trash2, CheckCircle } from "lucide-react";
import AdminPageLayout from '@/components/AdminPageLayout';
import toast from "react-hot-toast";
import { useConfirm } from '@/components/ConfirmProvider';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminMessages() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [search, setSearch] = useState('');
  const confirm = useConfirm();

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await authenticatedFetch("/api/admin/messages");
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else {
          toast.error("Failed to load messages");
        }
      } catch {
        console.error("Failed to fetch messages");
        toast.error("Error fetching messages");
      } finally {
        setLoading(false);
      }
    }
    if (user?.role === "ADMIN") {
      fetchMessages();
    }
  }, [user]);

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(search.toLowerCase()) ||
    msg.email.toLowerCase().includes(search.toLowerCase()) ||
    (msg.subject && msg.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const markAsRead = async (id: string) => {
    try {
      const res = await authenticatedFetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "READ" }),
      });

      if (res.ok) {
        const updated = await res.json();
        setMessages(messages.map(m => (m.id === id ? updated : m)));
        setSelectedMessage(updated);
        toast.success("Marked as read");
      } else {
        toast.error("Failed to update message");
      }
    } catch {
      toast.error("Error updating message");
    }
  };

  const deleteMessage = async (id: string) => {
    const ok = await confirm('Delete this message?');
    if (!ok) return;
    try {
      const res = await authenticatedFetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        setSelectedMessage(null);
        toast.success("Message deleted");
      } else {
        toast.error("Failed to delete message");
      }
    } catch {
      toast.error("Error deleting message");
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminPageLayout
      title="Contact Messages"
      addLink="/admin/messages"
      addLabel="Add New Message"
      search={search}
      setSearch={setSearch}
      loading={loading}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredMessages.map(msg => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-left p-6 hover:bg-gray-50 transition-colors border-l-4 ${
                  selectedMessage?.id === msg.id
                    ? "border-l-green-600 bg-green-50"
                    : msg.status === "UNREAD"
                    ? "border-l-blue-600 bg-blue-50"
                    : "border-l-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 flex-1">{msg.name}</h3>
                  {msg.status === "UNREAD" && (
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{msg.email}</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {msg.subject || "No subject"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedMessage.subject || "No subject"}</h3>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-500">FROM</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMessage.name}</p>
                  <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-gray-500">DATE</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500">STATUS</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedMessage.status === "UNREAD"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">MESSAGE</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex gap-2">
                {selectedMessage.status === "UNREAD" && (
                  <button
                    onClick={() => markAsRead(selectedMessage.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}
