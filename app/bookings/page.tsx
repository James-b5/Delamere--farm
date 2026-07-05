"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { format } from "date-fns";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function BookingsPage() {
  const whatsappHref = buildWhatsAppLink();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookingType: "",
    program: "",
    bookingDate: "",
    numberOfPeople: 1,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Helper to produce a local YYYY-MM-DD string (avoids UTC timezone shifts)
  const getTodayLocalISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const trainingPrograms = [
    {
      id: "dairy-farming",
      title: "Dairy Farming Basics",
      description: "Learn the fundamentals of dairy farming, from cow selection to milk production.",
      duration: "1 Day",
      price: 5000,
      features: [
        "Cow selection and breeding",
        "Feeding and nutrition",
        "Milking techniques",
        "Milk handling and storage",
        "Basic herd management"
      ],
      icon: "🥛",
      popular: false
    },
    {
      id: "advanced-dairy",
      title: "Advanced Dairy Management",
      description: "Comprehensive training for experienced farmers looking to optimize production.",
      duration: "2 Days",
      price: 10000,
      features: [
        "Advanced breeding techniques",
        "Feed formulation",
        "Milk quality optimization",
        "Disease prevention",
        "Record keeping systems",
        "Farm economics"
      ],
      icon: "🐄",
      popular: true
    },
    {
      id: "goat-keeping",
      title: "Dairy Goat Keeping",
      description: "Master the art of raising Saanen and other dairy goat breeds.",
      duration: "1 Day",
      price: 4500,
      features: [
        "Breed selection",
        "Housing requirements",
        "Feeding programs",
        "Milking procedures",
        "Kid management",
        "Health care basics"
      ],
      icon: "🐐",
      popular: false
    },
    {
      id: "livestock-management",
      title: "Livestock Management",
      description: "Complete training on managing various livestock on your farm.",
      duration: "2 Days",
      price: 12000,
      features: [
        "Multi-species management",
        "Pasture management",
        "Water and infrastructure",
        "Health programs",
        "Breeding strategies",
        "Marketing your products"
      ],
      icon: "🏡",
      popular: false
    }
  ];

  const farmGuides = [
    {
      id: "farm-tour",
      title: "Farm Tour",
      description: "Guided tour of Delamere Farm facilities",
      duration: "2-3 Hours",
      price: 2000,
      features: [
        "Milk processing facility",
        "Livestock housing",
        "Pasture fields",
        "Q&A with experts"
      ],
      icon: "🚜"
    },
    {
      id: "farm-experience",
      title: "Farm Experience Day",
      description: "Full day immersive farm experience",
      duration: "Full Day",
      price: 5000,
      features: [
        "Complete farm tour",
        "Hands-on activities",
        "Lunch included",
        "Take-home materials",
        "Certificate of completion"
      ],
      icon: "🌟"
    },
    {
      id: "consultation",
      title: "Farm Consultation",
      description: "One-on-one consultation for your farm",
      duration: "4 Hours",
      price: 8000,
      features: [
        "Farm assessment",
        "Custom recommendations",
        "Business planning",
        "Follow-up support"
      ],
      icon: "📋"
    }
  ];

  const offers = [
    {
      id: "group-discount",
      title: "Group Discount",
      description: "Book training for 3 or more people and get 15% off",
      discount: "15% OFF",
      icon: "👥"
    },
    {
      id: "combo-package",
      title: "Combo Package",
      description: "Book any training + farm tour and save KES 1,000",
      savings: "KES 1,000 OFF",
      icon: "🎁"
    },
    {
      id: "referral",
      title: "Refer a Friend",
      description: "Get KES 2,000 off your next booking when you refer a friend",
      savings: "KES 2,000 OFF",
      icon: "🤝"
    }
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus({});

    const selectedProgram = formData.program
      ? trainingPrograms.find((p) => p.id === formData.program)
      : undefined;

    if (selectedProgram) {
      const uniqueId = `service-${selectedProgram.id}-${Date.now()}`;
      const qty = formData.numberOfPeople || 1;
      addItem(
        {
          id: uniqueId,
          name: selectedProgram.title,
          price: selectedProgram.price,
          image: "/images/service-placeholder.jpg",
          type: "service" as const,
        },
        qty
      );
      router.push("/checkout?booking=" + encodeURIComponent(JSON.stringify(formData)));
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          bookingDate: formData.bookingDate,
          numberOfPeople: formData.numberOfPeople,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: "Booking saved successfully! We'll contact you within 24 hours to confirm.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          bookingType: "",
          program: "",
          bookingDate: "",
          numberOfPeople: 1,
          notes: "",
        });
      } else {
        setSubmitStatus({
          success: false,
          message: data.error || "Failed to submit booking. Please try again.",
        });
      }
    } catch (error) {
      console.error("Booking submit error:", error);
      setSubmitStatus({
        success: false,
        message: "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Book a Visit or Training
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Schedule a farm visit, book a training program, or get expert consultation for your farm.
          </p>
        </div>
      </div>

      {/* Appointment Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 sm:p-8" id="book-now">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Book an Appointment</h2>
            
            {submitStatus.message && (
              <div
                className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                  submitStatus.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {submitStatus.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
              <div>
                <label htmlFor="bookingType" className="mb-2 block text-sm font-semibold text-slate-700">
                  Booking Type *
                </label>
                <select
                  id="bookingType"
                  name="bookingType"
                  value={formData.bookingType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select booking type</option>
                  <option value="farm-visit">Farm Visit</option>
                  <option value="training">Training Program</option>
                  <option value="consultation">Farm Consultation</option>
                  <option value="group">Group Booking</option>
                </select>
              </div>
              <div>
                <label htmlFor="program" className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Program (Optional)
                </label>
                <select
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select a program</option>
                  <option value="dairy-farming">Dairy Farming Basics - KES 5,000</option>
                  <option value="advanced-dairy">Advanced Dairy Management - KES 10,000</option>
                  <option value="goat-keeping">Dairy Goat Keeping - KES 4,500</option>
                  <option value="livestock-management">Livestock Management - KES 12,000</option>
                  <option value="farm-tour">Farm Tour - KES 2,000</option>
                  <option value="farm-experience">Farm Experience Day - KES 5,000</option>
                  <option value="consultation">Farm Consultation - KES 8,000</option>
                </select>
              </div>
              <div>
                <label htmlFor="bookingDate" className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred Date *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="bookingDate"
                    name="bookingDate"
                    title="Choose booking date"
                    required
                    min={getTodayLocalISO()}
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 shadow-sm transition-colors hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                {formData.bookingDate && (
                  <p className="mt-3 text-sm text-green-700 font-bold flex items-center gap-1 bg-green-50 px-3 py-2 rounded-lg border border-green-100 w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Selected: {format(new Date(formData.bookingDate + 'T00:00:00'), 'PPPP')}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="numberOfPeople" className="mb-2 block text-sm font-semibold text-slate-700">
                  Number of Participants
                </label>
                <input
                  type="number"
                  id="numberOfPeople"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="1"
                />
              </div>
              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-slate-700">
                  Additional Information
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="Tell us more about your requirements..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {isSubmitting ? "Processing..." : formData.program ? `Proceed to Checkout (KES ${((trainingPrograms.find(p => p.id === formData.program)?.price || 0) * (formData.numberOfPeople || 1)).toLocaleString()})` : "Book Now"}
              </button>
            </form>
          </div>

          {/* Booking Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Train With Us?</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-2xl mr-4">🏆</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Expert Trainers</h3>
                    <p className="text-gray-600">Learn from experienced farmers with decades of hands-on experience</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-4">📚</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hands-on Learning</h3>
                    <p className="text-gray-600">Practical sessions that give you real skills you can apply immediately</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-4">📜</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Certification</h3>
                    <p className="text-gray-600">Get certified upon completion of any training program</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-4">🤝</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ongoing Support</h3>
                    <p className="text-gray-600">Continue receiving guidance even after your training ends</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact for Bookings</h2>
              <p className="text-gray-600 mb-6">
                Prefer to book directly? Contact us through WhatsApp for quick responses!
              </p>
              <a 
                href={whatsappHref}
                className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <span className="mr-2">💬</span>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Training Programs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive training programs designed for farmers of all experience levels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trainingPrograms.map((program) => (
              <div 
                key={program.id} 
                className={`bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative ${program.popular ? 'ring-2 ring-green-500' : ''}`}
              >
                {program.popular && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <div className="p-6">
                  <div className="text-4xl mb-4">{program.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {program.description}
                  </p>
                  <div className="flex items-center mb-4">
                    <span className="text-sm text-gray-500 mr-4">⏱️ {program.duration}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 mb-4">
                    KES {program.price.toLocaleString()}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {program.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
        <button 
                    onClick={() => {
                      const service = trainingPrograms.find(p => p.id === program.id);
                      if (service) {
                        const qty = formData.numberOfPeople || 1;
                        // Add service with quantity = participants
                        const serviceItem = {
                          id: `service-${program.id}-${Date.now()}`,
                          name: service.title,
                          price: service.price,
                          image: '/images/service-placeholder.jpg',
                          type: 'service' as const
                        };
                        addItem(serviceItem, qty);
                        router.push('/checkout?booking=' + encodeURIComponent(JSON.stringify(formData)));
                      }
                    }}
                    className="block w-full bg-green-700 text-white text-center py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold"
                  >
                    Book Now (KES {(program.price * (formData.numberOfPeople || 1)).toLocaleString()})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Farm Guide Services Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Farm Guide Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience our farm firsthand with guided tours and personalized consultation services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {farmGuides.map((guide) => (
              <div 
                key={guide.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-8">
                  <div className="text-5xl mb-4">{guide.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {guide.description}
                  </p>
                  <div className="flex items-center mb-4">
                    <span className="text-sm text-gray-500 mr-4">⏱️ {guide.duration}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 mb-4">
                    KES {guide.price.toLocaleString()}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {guide.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a 
                    href="#book-now"
                    className="block w-full bg-green-700 text-white text-center py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="bg-green-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Special Offers
            </h2>
            <p className="text-green-100 max-w-2xl mx-auto">
              Take advantage of our special offers and save on your bookings!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div 
                key={offer.id} 
                className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-5xl mb-4">{offer.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {offer.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {offer.description}
                </p>
                <div className="text-2xl font-bold text-green-700">
                  {offer.discount || offer.savings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Farming Journey?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Book a visit or training today and take your farming to the next level!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={whatsappHref}
              className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-colors text-lg font-semibold"
            >
              WhatsApp Us
            </a>
            <a 
              href="/contact"
              className="border-2 border-green-700 text-green-700 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors text-lg font-semibold"
            >
              Contact Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
