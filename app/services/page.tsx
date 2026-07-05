export default function ServicesPage() {
  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
      : "https://wa.me/254700000000");
  const services = [
    {
      id: "milk-processing",
      title: "Milk Processing",
      description: "We process fresh, high-quality milk into a variety of dairy products including pasteurized milk, yogurt, butter, and cream. Our state-of-the-art facilities ensure the highest quality standards.",
      features: [
        "Fresh pasteurized milk",
        "Artisan yogurt",
        "Quality butter",
        "Fresh cream",
        "Custom processing options"
      ],
      icon: "🥛"
    },
    {
      id: "livestock-sales",
      title: "Livestock Sales",
      description: "We offer premium pedigree livestock including Friesian dairy cows, Saanen dairy goats, and layer hens. All our animals are health-checked and comes with veterinary documentation.",
      features: [
        "Friesian Dairy Cows",
        "Saanen Dairy Goats",
        "Layer Hens",
        "Breeding stock available",
        "Health certification"
      ],
      icon: "🐄"
    },
    {
      id: "transport",
      title: "Transport Service",
      description: "We provide reliable transport services for livestock and dairy products across Kenya. Our fleet is equipped to ensure safe and timely delivery of your purchases.",
      features: [
        "Livestock transport",
        "Dairy product delivery",
        "Nationwide coverage",
        "Temperature-controlled vehicles",
        "Scheduled deliveries"
      ],
      icon: "🚛"
    },
    {
      id: "veterinary",
      title: "Veterinary Services",
      description: "Our experienced veterinarians provide comprehensive healthcare services for your livestock, including vaccinations, health checks, and emergency care.",
      features: [
        "Vaccination programs",
        "Health examinations",
        "Emergency veterinary care",
        "Nutrition consultation",
        "Breeding advice"
      ],
      icon: "🏥"
    }
    ,
    {
      id: "breeding-consult",
      title: "Breeding Consultation",
      description: "One-on-one consultations to help you choose the best breeding strategy and select appropriate stock for your goals.",
      features: [
        "Herd assessment",
        "Breeding program design",
        "Genetics and pedigree advice",
        "Cost and ROI estimation",
      ],
      icon: "🧑‍🌾"
    },
    {
      id: "on-site-training",
      title: "On-site Training",
      description: "Practical training sessions at your farm covering animal husbandry, milking routines, and biosecurity practices.",
      features: [
        "Hands-on workshops",
        "Staff training",
        "Husbandry best practices",
        "Follow-up support",
      ],
      icon: "🎓"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Services
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Comprehensive dairy and livestock services for farmers across Kenya, from premium products to expert field support.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Trusted support for every stage of your farm</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-700">
            Whether you are buying livestock, improving your herd, or need on-farm guidance, our specialist team is ready to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>
                <h3 className="font-semibold text-gray-800 mb-3">What we offer:</h3>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <a 
                    href={whatsappHref}
                    className="inline-block bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Inquire Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900">Rapid response support</h3>
          <p className="mt-2 text-sm text-gray-600">We respond quickly to farm inquiries, bookings, and urgent veterinary support needs.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900">Practical training</h3>
          <p className="mt-2 text-sm text-gray-600">Our experts deliver hands-on guidance for better feeding, milking, breeding, and herd care.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900">Flexible bookings</h3>
          <p className="mt-2 text-sm text-gray-600">Schedule consultations, farm visits, and training sessions at a time that works for you.</p>
        </div>
      </div>

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Need More Information?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is ready to help you with any questions about our services. 
            Contact us today for personalized assistance.
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
