"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              Delamere Farm ("we," "us," "our," or "Company") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you visit our website delamerefarm.co.ke and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
                <p>When you register, place an order, or contact us, we may collect:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information</li>
                  <li>User preferences and interests</li>
                  <li>Communications and correspondence</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.2 Automatic Information</h3>
                <p>When you visit our website, we automatically collect:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>IP address and browser type</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Cookies and tracking technologies</li>
                  <li>Device information (OS, screen resolution)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfill your orders and bookings</li>
              <li>Send order confirmations and updates</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send newsletters and marketing communications (with consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze website usage and trends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Sharing of Information</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Payment Processors:</strong> Paystack, IntaSend, and PayPal to process payments</li>
              <li><strong>Delivery Partners:</strong> For shipping and logistics</li>
              <li><strong>Service Providers:</strong> Email services and analytics providers</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information 
              from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-4">To exercise these rights, contact us at contact@delamerefarm.co.ke</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h2>
            <p>
              Our website uses cookies to enhance your experience. You can control cookie settings through your 
              browser preferences. Disabling cookies may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for their privacy practices. 
              We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The date of the last update will be indicated at the 
              bottom of this page. Your continued use of the website constitutes your acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p><strong>Delamere Farm</strong></p>
              <p>Email: contact@delamerefarm.co.ke</p>
              <p>Phone: +254 75 141 445</p>
              <p>WhatsApp: +254 75 141 445</p>
              <p>Location: Nakuru, Kenya</p>
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
