"use client";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund & Return Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Our Commitment</h2>
            <p>
              At Delamere Farm, we stand behind the quality of our products and services. We want you to be completely satisfied 
              with your purchase. This policy outlines our approach to returns, refunds, and customer satisfaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Dairy Products (Milk, Yogurt, Butter, Cheese)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.1 Returns</h3>
                <p>
                  Dairy products are perishable and must be used quickly. Due to health and safety regulations, we cannot accept 
                  returns of opened or partially used dairy products. Unopened products may be returned within 24 hours of delivery 
                  if there are quality issues.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.2 Refunds for Quality Issues</h3>
                <p>
                  If you receive a dairy product that is damaged, expired, or of poor quality, contact us immediately (within 24 hours) 
                  with photos and documentation. We will offer:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Full refund</li>
                  <li>Replacement product</li>
                  <li>Store credit</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Livestock (Cattle, Goats, Poultry)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Health Guarantee Period</h3>
                <p>
                  All livestock are sold with a 7-day health guarantee from delivery date. During this period, if the animal shows 
                  signs of health issues:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Contact us immediately with veterinary documentation</li>
                  <li>We will arrange a veterinary inspection</li>
                  <li>If health issue is pre-existing, we offer replacement or full refund</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Genetic Defects</h3>
                <p>
                  Animals sold for breeding purposes include a 30-day genetic viability guarantee. If the animal has genetic issues 
                  affecting breeding:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Veterinary documentation is required</li>
                  <li>Full refund or replacement available</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Shipping Losses</h3>
                <p>
                  If an animal dies during transit and this is documented by the transport company, we will arrange:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Full refund</li>
                  <li>Replacement (upon availability)</li>
                  <li>Reshipment at no additional cost</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Training Programs & Services</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.1 Cancellations</h3>
                <p>
                  Training programs and farm visits can be cancelled with the following notice:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li><strong>30+ days before:</strong> Full refund</li>
                  <li><strong>14-29 days before:</strong> 80% refund</li>
                  <li><strong>7-13 days before:</strong> 50% refund</li>
                  <li><strong>Less than 7 days:</strong> No refund (may reschedule)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.2 Postponement</h3>
                <p>
                  Programs can be rescheduled to a later date at no additional cost if cancelled with 14+ days notice.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Non-Returnable Items</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Opened or used dairy products</li>
              <li>Animals held beyond 7-day health guarantee period</li>
              <li>Customized or special order items</li>
              <li>Digital content and downloadable materials</li>
              <li>Items purchased from third parties through our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. How to Request a Refund</h2>
            <ol className="list-decimal pl-6 space-y-3 mt-4">
              <li>
                <strong>Contact us immediately</strong>
                <p className="text-sm">Email: contact@delamerefarm.co.ke or WhatsApp: +254 75 141 445</p>
              </li>
              <li>
                <strong>Provide documentation</strong>
                <p className="text-sm">Photos, veterinary reports, or proof of quality issues</p>
              </li>
              <li>
                <strong>Await assessment</strong>
                <p className="text-sm">We will review your claim within 48 hours</p>
              </li>
              <li>
                <strong>Receive resolution</strong>
                <p className="text-sm">Refund processed within 5-7 business days</p>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Refund Processing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds are processed to the original payment method</li>
              <li>Processing takes 5-7 business days</li>
              <li>Shipping costs are non-refundable unless error is ours</li>
              <li>If we arranged pickup, no deduction for return transport</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Warranty on Livestock</h2>
            <div className="space-y-3 mt-4">
              <p>
                <strong>Health Warranty:</strong> 7 days from delivery date. Animal must be examined by licensed veterinarian 
                within this period if any health concerns arise.
              </p>
              <p>
                <strong>Genetic Warranty:</strong> 30 days for breeding animals. Genetic issues must be documented by veterinarian.
              </p>
              <p>
                <strong>Transport Warranty:</strong> Full coverage for animal loss during transit with transport company documentation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. What We're Not Responsible For</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Improper care after delivery (nutrition, housing, handling)</li>
              <li>Illness caused by customer's negligence or poor conditions</li>
              <li>Natural deaths after the health guarantee period</li>
              <li>Accidents or injuries to animals in customer's care</li>
              <li>Changes in animal size/weight due to customer care</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Customer Care Recommendations</h2>
            <div className="bg-blue-50 p-6 rounded-lg mt-4 space-y-3">
              <h3 className="font-semibold text-gray-900">To ensure animal health and satisfaction:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide proper housing and space</li>
                <li>Feed quality, clean, age-appropriate feed</li>
                <li>Provide clean, fresh water at all times</li>
                <li>Follow vaccination and deworming schedules</li>
                <li>Maintain regular veterinary checkups</li>
                <li>Handle animals with care and gentleness</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p><strong>For refund or return inquiries:</strong></p>
              <p>Email: contact@delamerefarm.co.ke</p>
              <p>Phone: +254 75 141 445</p>
              <p>WhatsApp: +254 75 141 445</p>
              <p>Business Hours: Monday - Saturday, 8:00 AM - 5:00 PM EAT</p>
            </div>
          </section>

          <section className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <strong>Last Updated:</strong> May 17, 2026
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
