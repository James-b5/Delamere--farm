"use client";

import { useState } from "react";

export default function IntaSendCheckoutButton({
  config,
  onSuccess,
  onClose,
  disabled,
}: {
  config: {
    phone_number: string;
    amount: number;
    narrative: string;
    email: string;
    name: string;
    address: string;
  };
  onSuccess: (reference: any) => void;
  onClose: () => void;
  disabled: boolean;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call your backend API to initialize IntaSend STK push
      const response = await fetch("/api/payments/intasend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.message || data.error || "Payment initialization failed";
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data.request_id) {
        console.error("Invalid response from server:", data);
        throw new Error(
          "Invalid payment response. Please try again or contact support."
        );
      }

      // Store the request ID for webhook verification
      localStorage.setItem("intasend_request_id", data.request_id);

      // Show success message
      // Use toast instead of alert for non-blocking UI
      (await import('react-hot-toast')).default.success(`STK Push sent to ${config.phone_number}. Enter your M-Pesa PIN to complete payment.`);

      // Poll for payment status (in production, use webhooks)
      pollPaymentStatus(data.request_id, onSuccess);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      console.error("IntaSend payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = (requestId: string, callback: (data: any) => void) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/intasend/status/${requestId}`);
        const data = await response.json();

        if (data.status === "COMPLETED") {
          callback(data);
        } else if (data.status === "FAILED") {
          setError("Payment failed. Please try again.");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    };

    // Start polling after 3 seconds
    setTimeout(poll, 3000);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
      >
        {isProcessing ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending M-Pesa PIN...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Pay with M-Pesa
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 text-center">
        You'll receive an M-Pesa PIN prompt on your phone
      </p>
    </div>
  );
}
