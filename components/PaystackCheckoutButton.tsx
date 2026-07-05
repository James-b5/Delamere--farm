"use client";

import React, { forwardRef, useState } from "react";
import { usePaystackPayment } from "react-paystack";

export interface PaystackButtonProps {
  /** Paystack configuration object */
  config: any;
  /** Called with the Paystack reference on successful payment */
  onSuccess: (reference: string) => void;
  /** Optional callback when the payment modal is closed */
  onClose?: () => void;
  /** Disable the button */
  disabled?: boolean;
}

/** Paystack checkout button component */
const PaystackCheckoutButton = forwardRef<HTMLButtonElement, PaystackButtonProps>(
  ({ config, onSuccess, onClose, disabled = false }, ref) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const initializePayment = usePaystackPayment(config);

    const handlePayment = () => {
      setIsProcessing(true);
      initializePayment(
        (reference: string) => {
          setIsProcessing(false);
          onSuccess(reference);
        },
        () => {
          setIsProcessing(false);
          if (onClose) onClose();
        }
      );
    };

    return (
      <button
        ref={ref}
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        aria-label="Pay Now"
        className="flex-1 bg-green-700 text-white py-4 rounded-xl font-semibold hover:bg-green-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    );
  }
);

export default PaystackCheckoutButton;
