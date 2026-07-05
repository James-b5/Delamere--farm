"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What are your operating hours?",
    answer: "We are open Monday through Saturday from 8:00 AM to 5:00 PM. We are closed on Sundays and public holidays.",
  },
  {
    question: "How can I purchase livestock from Delamere Farm?",
    answer: "You can purchase livestock by visiting our farm directly, contacting us through WhatsApp, or filling out the booking form on our website. We recommend scheduling an appointment to ensure the best selection.",
  },
  {
    question: "Do you offer delivery services?",
    answer: "Yes, we offer transport services within Nakuru and the surrounding areas. Delivery costs depend on the distance and number of animals. Contact us for a quote.",
  },
  {
    question: "What training programs do you offer?",
    answer: "We offer Dairy Farming Basics, Advanced Dairy Management, Dairy Goat Keeping, and Livestock Management training programs. Visit our Bookings page for detailed information on pricing and schedules.",
  },
  {
    question: "Can I visit the farm before making a purchase?",
    answer: "Absolutely! We encourage prospective buyers to visit our farm. You can book a farm tour or farm experience day through our Bookings page.",
  },
  {
    question: "What breeds of cattle do you offer?",
    answer: "We offer Friesian, Jersey, Saanen, Charolais, Hereford, Brahman, Sahiwal, and Red Poll breeds. Visit our Breed Advisor tool to find the perfect match for your needs.",
  },
  {
    question: "Do you provide veterinary services?",
    answer: "Yes, we provide basic veterinary consultations and can connect you with qualified veterinarians for comprehensive health care services.",
  },
  {
    question: "What is your return or exchange policy?",
    answer: "We stand by the quality of our animals. If you encounter any health issues within the first week of purchase, please contact us immediately to discuss options.",
  },
  {
    question: "Do you offer financing or payment plans?",
    answer: "We offer flexible payment options for large purchases. Contact us to discuss payment plans that work for your budget.",
  },
  {
    question: "How do I book a training session?",
    answer: "You can book a training session through our Bookings page, by contacting us via WhatsApp, or by calling our office. We recommend booking at least one week in advance.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">{item.question}</span>
            <svg
              className={`w-5 h-5 text-green-600 transition-transform ${
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
              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
