 "use client";

import { useCart } from "@/context/CartContext";
import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  requiresDelivery, 
  getDeliveryFee, 
  getDeliveryOptions,
  formatDeliveryOption 
} from "@/lib/delivery-utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { recordAnalyticsEvent } from "@/lib/analytics-store";

export default function CheckoutPage() {
  // NOTE: removed automatic WhatsApp redirect on page load — links/buttons open chat explicitly.
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "success">("cart");
  const [expandedSection, setExpandedSection] = useState<"summary" | "shipping" | "payment" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    county: "",
    deliveryOption: "",
  });

  // Calculate delivery fees dynamically
  const needsDelivery = useMemo(() => requiresDelivery(items), [items]);
  const deliveryFee = useMemo(() => getDeliveryFee(items, formData.county), [items, formData.county]);
  const deliveryOptions = useMemo(() => getDeliveryOptions(formData.county), [formData.county]);
  const finalTotal = total + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

const orderInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lastOrder') ?? 'null') : null;

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-8">Thank you for your order. Your payment has been confirmed.</p>
          <p className="text-green-700 font-semibold text-lg mb-8">Order Total: KES {finalTotal.toLocaleString()}</p>
          <div className="space-y-4 mb-12 text-left max-w-md mx-auto bg-gray-50 p-6 rounded-xl">
            <p><strong>Name:</strong> {formData.name || "Customer"}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Delivery:</strong> {formData.address}, {formData.county}</p>
            {needsDelivery && <p><strong>Delivery Option:</strong> {formData.deliveryOption}</p>}
            <p><strong>Product Total:</strong> KES {total.toLocaleString()}</p>
            {deliveryFee > 0 && <p><strong>Delivery Fee:</strong> KES {deliveryFee.toLocaleString()}</p>}
          </div>
          <Link href="/" className="inline-block bg-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors">
            Back to Home →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-xl p-4 shadow-sm">
          {["cart", "shipping", "payment"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => setStep(s as any)}
                className={`w-10 h-10 rounded-full font-semibold transition-all flex items-center justify-center ${
                  step === s
                    ? "bg-green-700 text-white shadow-lg"
                    : ["cart", "shipping", "payment"].indexOf(step) > i
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {i + 1}
              </button>
              {i < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    ["cart", "shipping", "payment"].indexOf(step) > i
                      ? "bg-green-700"
                      : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-4">
            {step === "cart" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 transition">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.type === "service" || item.type === "farm-visit" ? "Service" : "Product"}
                          </p>
                          <p className="text-green-700 font-semibold mt-2">KES {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="font-semibold">KES {item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setStep("shipping")}
                      className="w-full mt-6 bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition"
                    >
                      Continue to Shipping →
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === "shipping" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-400 cursor-text"
                      required
                    />
                    <input
                      name="phone"
                      placeholder="Phone Number (254...)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-400 cursor-text"
                      required
                    />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-400 cursor-text"
                    required
                  />
                  <input
                    name="address"
                    placeholder="Street Address *"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-400 cursor-text"
                    required
                  />
                  <input
                    name="county"
                    placeholder="County/Region *"
                    value={formData.county}
                    onChange={handleInputChange}
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-400 cursor-text"
                    required
                  />

                  {/* Delivery Options - Only show if items require delivery */}
                  {needsDelivery && (
                    <div className="mt-6 pt-6 border-t">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Delivery Method *
                      </label>
                      <div className="space-y-2">
                        {deliveryOptions.map((option) => (
                          <label key={option.name} className="flex items-center p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryOption"
                              value={option.name}
                              checked={formData.deliveryOption === option.name}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-green-700"
                              required
                            />
                            <span className="ml-3 font-medium text-gray-900">{formatDeliveryOption(option.name, option.fee)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep("cart")}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={async () => {
          // Create order in backend
          try {
            recordAnalyticsEvent('checkout_started', { total: finalTotal, items: items.length, county: formData.county });
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: items.map((item) => ({
                  productId: item.id,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                })),
                shippingInfo: formData,
              }),
            });
            if (!response.ok) throw new Error('Failed to create order');
            const data = await response.json();
            const waLink = buildWhatsAppLink(`Hello, I would like to confirm my order ${data.id || 'NEW'} with total KES ${finalTotal.toLocaleString()}`);
            recordAnalyticsEvent('whatsapp_click', { source: 'checkout', orderId: data.id || 'NEW' });
            window.location.href = waLink;
            clearCart();
            setStep('success');
          } catch (error) {
            console.error(error);
            (await import('react-hot-toast')).default.error('Unable to create order. Please try again.');
          }
        }}
                      disabled={!formData.name || !formData.phone || !formData.email || !formData.address || !formData.county || (needsDelivery && !formData.deliveryOption)}
                      className="flex-1 bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              </div>
            )}

           {step === "payment" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact via WhatsApp</h2>
                <p className="mb-4 text-gray-700">
                  To complete your order, please contact us on WhatsApp.
                </p>
                {orderInfo && (
                  <a
                    href={buildWhatsAppLink(`Hello, I would like to confirm my order ${orderInfo.id} with total KES ${orderInfo.total.toLocaleString()}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordAnalyticsEvent('whatsapp_click', { source: 'checkout', orderId: orderInfo.id })}
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    Open WhatsApp Chat
                  </a>
                )}
                {!orderInfo && (
                  <a
                    href={buildWhatsAppLink('Hello, I would like to confirm my order')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordAnalyticsEvent('whatsapp_click', { source: 'checkout' })}
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    Open WhatsApp Chat
                  </a>
                )}
                <button
                  onClick={() => setStep("shipping")}
                  className="w-full mt-6 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  ← Back to Shipping
                </button>
              </div>
            )}
            </div>

          {/* Right Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

              {/* Collapsible Cart Items */}
              <div className="mb-4">
                <button
                  onClick={() => setExpandedSection(expandedSection === "summary" ? null : "summary")}
                  className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-900"
                >
                  <span>Items</span>
                  <span className={`transition ${expandedSection === "summary" ? "rotate-180" : ""}`}>▼</span>
                </button>
                {expandedSection === "summary" && (
                  <div className="space-y-2 mt-2 pl-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-semibold">KES {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">KES {total.toLocaleString()}</span>
                </div>

                {needsDelivery && deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span className="font-semibold">KES {deliveryFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-green-700 border-t pt-2">
                  <span>Total</span>
                  <span>KES {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Collapsible Shipping Info */}
              {step !== "cart" && (
                <div className="mt-4">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "shipping" ? null : "shipping")}
                    className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-900"
                  >
                    <span>Shipping</span>
                    <span className={`transition ${expandedSection === "shipping" ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {expandedSection === "shipping" && (
                    <div className="space-y-1 mt-2 text-sm text-gray-600 pl-3">
                      <p><strong>Name:</strong> {formData.name || "—"}</p>
                      <p><strong>Phone:</strong> {formData.phone || "—"}</p>
                      <p><strong>Address:</strong> {formData.address || "—"}</p>
                      <p><strong>County:</strong> {formData.county || "—"}</p>
                      {needsDelivery && <p><strong>Method:</strong> {formData.deliveryOption || "—"}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

