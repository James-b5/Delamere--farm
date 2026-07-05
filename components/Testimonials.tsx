"use client";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "John Mwangi",
    role: "Dairy Farmer",
    location: "Naivasha, Nakuru",
    content: "Delamere Farm's training program transformed my dairy operation. My milk production increased by 40% after implementing what I learned.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Kamau",
    role: "Livestock Owner",
    location: "Molo, Nakuru",
    content: "Purchased two Saanen goats and they have been excellent producers. The team provided great support and follow-up care.",
    rating: 5,
  },
  {
    id: 3,
    name: "David Ochieng",
    role: "Agricultural Extension Officer",
    location: "Nakuru County",
    content: "I regularly refer farmers to Delamere Farm for quality livestock and expert advice. Their breeding stock is among the best in the region.",
    rating: 5,
  },
  {
    id: 4,
    name: "Grace Wanjiku",
    role: "Small-scale Farmer",
    location: "Gilgil, Nakuru",
    content: "The breed advisor tool helped me choose the perfect cattle for my farm's needs. Excellent customer service and after-sales support!",
    rating: 4,
  },
  {
    id: 5,
    name: "Peter Njoroge",
    role: "Commercial Farmer",
    location: "Njoro, Nakuru",
    content: "We've been buying dairy products from Delamere Farm for over 5 years. The quality is consistently excellent and delivery is reliable.",
    rating: 5,
  },
  {
    id: 6,
    name: "Mary Akinyi",
    role: "Poultry Farmer",
    location: "Kuresoi, Nakuru",
    content: "Started my poultry business with birds from Delamere Farm. The layer hens are highly productive and the technical support is invaluable.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from farmers who have transformed their operations with Delamere Farm
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-green-600 font-medium">{testimonial.role}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
