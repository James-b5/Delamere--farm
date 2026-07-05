"use client";

import { useState } from "react";
import Link from "next/link";

type FAQCategory = "all" | "products" | "purchasing" | "services" | "support";

interface FAQItem {
  question: string;
  answer: string;
  category: FAQCategory;
}

const faqs: FAQItem[] = [
  // Products
  {
    question: "What products do you offer at Delamere Farm?",
    answer: "We offer a wide range of dairy products including fresh milk, yogurt, butter, and cream. We also sell pedigree livestock such as Friesian dairy cows, Saanen dairy goats, and layer hens.",
    category: "products"
  },
  {
    question: "What breeds of cattle do you offer?",
    answer: "We offer Friesian, Jersey, Saanen, Charolais, Hereford, Brahman, Sahiwal, and Red Poll breeds. Visit our Breed Advisor tool to find the perfect match for your needs.",
    category: "products"
  },
  {
    question: "Are your dairy products fresh and of high quality?",
    answer: "Yes, we take pride in producing fresh, high-quality dairy products. Our milk is processed using modern equipment and follows strict quality standards.",
    category: "products"
  },
  // Purchasing
  {
    question: "How can I purchase livestock from Delamere Farm?",
    answer: "You can purchase livestock by visiting our farm in Nakuru, contacting us through WhatsApp, or filling out the booking form on our website. All our animals come with health certification and veterinary documentation.",
    category: "purchasing"
  },
  {
    question: "Can I visit the farm before making a purchase?",
    answer: "Absolutely! We encourage potential customers to visit our farm in Nakuru. Please contact us to schedule a visit.",
    category: "purchasing"
  },
  {
    question: "Do you offer bulk orders for businesses?",
    answer: "Yes, we offer bulk orders for businesses including restaurants, hotels, and cafes. Contact us to discuss your specific requirements.",
    category: "purchasing"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, mobile money (M-Pesa), and bank transfers. For large purchases, we also offer payment plans.",
    category: "purchasing"
  },
  // Services
  {
    question: "Do you offer delivery services for products and livestock?",
    answer: "Yes, we provide transport services across Kenya for both our dairy products and livestock. Our fleet is equipped to ensure safe and timely delivery.",
    category: "services"
  },
  {
    question: "What veterinary services do you provide?",
    answer: "Our experienced veterinarians offer vaccination programs, health examinations, emergency veterinary care, nutrition consultation, and breeding advice for all types of livestock.",
    category: "services"
  },
  {
    question: "What training programs do you offer?",
    answer: "We offer Dairy Farming Basics, Advanced Dairy Management, Dairy Goat Keeping, and Livestock Management training programs. Visit our Bookings page for detailed information on pricing and schedules.",
    category: "services"
  },
  // Support
  {
    question: "What are your business hours?",
    answer: "We are open Monday through Saturday from 8:00 AM to 5:00 PM. We are closed on Sundays.",
    category: "support"
  },
  {
    question: "Do you offer after-sales support for livestock?",
    answer: "Yes, we provide ongoing support for all livestock purchases including veterinary consultations, feeding guidance, and breeding advice.",
    category: "support"
  },
  {
    question: "What is your return or exchange policy?",
    answer: "We stand by the quality of our animals. If you encounter any health issues within the first week of purchase, please contact us immediately to discuss options.",
    category: "support"
  },
  {
    question: "Do you offer financing or payment plans?",
    answer: "We offer flexible payment options for large purchases. Contact us to discuss payment plans that work for your budget.",
    category: "support"
  },
];

const categories: { id: FAQCategory; label: string }[] = [
  { id: "all", label: "All Questions" },
  { id: "products", label: "Products" },
  { id: "purchasing", label: "Purchasing" },
  { id: "services", label: "Services" },
  { id: "support", label: "Support" },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
      : "https://wa.me/254700000000");

  const filteredFaqs = activeCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Find answers to common questions about our products and services
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm border-b sticky top-16 md:top-20 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-green-600 transition-transform shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No FAQs found in this category.</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-green-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-colors font-semibold"
            >
              Contact Us
            </Link>
            <a 
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
