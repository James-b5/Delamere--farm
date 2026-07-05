export default function AboutPage() {
  const galleryImages = [
    { id: 1, src: "/images/Delamerefarm1.jpg", alt: "Delamere Farm Overview" },
    { id: 2, src: "/images/JERSEY COW.jpg", alt: "Dairy Cow Herd" },
    { id: 3, src: "/images/dairygoat1.jpg", alt: "Milking Parlor" },
    { id: 4, src: "/images/delamere one litre.jpg", alt: "Fresh Milk Products" },
    { id: 5, src: "/images/SAANEN DAIRY GOAT.jpg", alt: "Goat Farming" },
    { id: 6, src: "/images/farm gallery1.jpg", alt: "Farm Equipment" },
  ];

  const timeline = [
    {
      year: "1980s",
      title: "Our Beginning",
      description: "Delamere Farm started with a vision to provide high-quality dairy products and pedigree livestock to Kenyan farmers."
    },
    {
      year: "1990s",
      title: "Expansion Phase",
      description: "We expanded our operations to include livestock sales, establishing ourselves as a trusted source for pedigree cattle and goats."
    },
    {
      year: "2000s",
      title: "Modernization",
      description: "Invested in state-of-the-art milk processing equipment and veterinary facilities to serve our clients better."
    },
    {
      year: "Present",
      title: "Leading Provider",
      description: "Today, Delamere Farm is recognized as one of Kenya's premier dairy and livestock providers, serving over 150 clients across the country."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Delamere Farm
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            A legacy of quality dairy and livestock farming in Nakuru, Kenya
          </p>
        </div>
      </div>

      {/* History Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our History</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            For over four decades, Delamere Farm has been committed to excellence in dairy production and livestock breeding. 
            Our journey began with a simple mission: to provide Kenyan farmers with access to quality dairy products and pedigree livestock.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-green-200"></div>
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="flex-1"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-2 border-white"></div>
                <div className="flex-1 bg-white rounded-lg shadow-md p-6 ml-8 mr-8">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Farm Gallery */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Farm Gallery</h2>
            <p className="text-lg text-gray-600">
              Take a visual tour of our facilities and operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <div 
                key={image.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-700 font-medium">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">800+</div>
              <div className="text-green-100">Livestock</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-green-100">Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">97,000</div>
              <div className="text-green-100">Litres/Day</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">40+</div>
              <div className="text-green-100">Years Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Visit Us Today
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience our farm firsthand. Contact us to schedule a visit or learn more about our products and services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact"
              className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-colors text-lg font-semibold"
            >
              Contact Us
            </a>
            <a 
              href="/products"
              className="border-2 border-green-700 text-green-700 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors text-lg font-semibold"
            >
              View Products
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
