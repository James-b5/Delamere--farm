import Image from "next/image"
import Link from "next/link"
import Newsletter from "@/components/Newsletter"
import Testimonials from "@/components/Testimonials"
import ImageWrapper from "@/components/ImageWrapper"
import FarmWeather from "@/components/FarmWeather";
import MediaCarousel from "@/components/MediaCarousel";

export default function Home() {
  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
      : "https://wa.me/254700000000");
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-green-800 to-green-700 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full animate-pulse-slow delay-300"></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Delamere Farm — Fresh Dairy & Pedigree Breeds
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
            From pasture to product — fresh milk, artisan butter & yoghurt, plus healthy pedigree cattle. Trusted by farmers across Kenya and beyond.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 animate-fade-in-up delay-400 mb-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-block px-8 py-4 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                View Products
              </Link>
              <Link
                href="/services"
                className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 hover:scale-105 hover:shadow-lg transition-all duration-300 border border-green-500"
              >
                Our Services
              </Link>
            </div>
            
            <div className="hidden md:block">
              <FarmWeather />
            </div>
          </div>
        </div>
      </section>

      {/* Animated Homepage Images - Marquee Style */}
      <section className="bg-gray-900 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <h2 className="text-2xl font-bold text-white text-center">Explore Our Farm</h2>
        </div>
        <div className="marquee-container">
          <div className="marquee-content flex animate-marquee">
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage1.jpg" alt="Delamere Farm" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage2.jpg" alt="Dairy Products" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage4.jpg" alt="Livestock" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage7.jpg" alt="Farm Life" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/farmhomepage.jpg" alt="Farm View" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            {/* Duplicate for continuous scroll effect */}
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage1.jpg" alt="Delamere Farm" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage2.jpg" alt="Dairy Products" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage4.jpg" alt="Livestock" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/homepage7.jpg" alt="Farm Life" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <div className="shrink-0 mx-4">
              <div className="w-72 h-48 rounded-lg overflow-hidden shadow-xl border-2 border-green-500">
                <ImageWrapper src="/images/farmhomepage.jpg" alt="Farm View" fill className="hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Marquee */}
      <section className="bg-green-800 text-white py-3 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content flex animate-marquee">
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">📰</span>
              <strong>New:</strong> Fresh artisan butter now available - KES 350/250g
            </span>
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">🐄</span>
              <strong>New Arrival:</strong> Premium Friesian cows in stock - Starting KES 150,000
            </span>
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">🎉</span>
              <strong>Offer:</strong> Free veterinary checkup with every livestock purchase
            </span>
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">🚛</span>
              <strong>Service:</strong> Now offering nationwide livestock transport
            </span>
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">📰</span>
              <strong>New:</strong> Fresh artisan butter now available - KES 350/250g
            </span>
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">🐄</span>
              <strong>New Arrival:</strong> Premium Friesian cows in stock - Starting KES 150,000
            </span>
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">🎉</span>
              <strong>Offer:</strong> Free veterinary checkup with every livestock purchase
            </span>
            <span className="mx-8 flex items-center gap-2">
              <span className="text-yellow-400">🚛</span>
              <strong>Service:</strong> Now offering nationwide livestock transport
            </span>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base font-medium text-gray-700">
            <div className="flex items-center gap-2 animate-fade-in-up hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Vaccinated Stock</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in-up delay-100 hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>Pedigree Verified</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in-up delay-200 hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              <span>Kenya-wide Delivery</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in-up delay-300 hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
              <span>Quick WhatsApp Chat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 animate-fade-in-up hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2 animate-bounce-slow">800+</div>
              <div className="text-gray-600 font-medium">Livestock Sold</div>
            </div>
            <div className="p-6 animate-fade-in-up delay-100 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2 animate-bounce-slow delay-100">150+</div>
              <div className="text-gray-600 font-medium">Repeat Clients</div>
            </div>
            <div className="p-6 animate-fade-in-up delay-200 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2 animate-bounce-slow delay-200">97,000</div>
              <div className="text-gray-600 font-medium">Litres/Day</div>
            </div>
            <div className="p-6 animate-fade-in-up delay-300 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2">Mon-Sat</div>
              <div className="text-gray-600 font-medium">8am-5pm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/products" className="block p-8 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up">
              <h3 className="text-2xl font-bold mb-3">View Products</h3>
              <p className="text-green-100 mb-4">Browse our selection of fresh dairy products, pedigree cattle, goats, and young stock.</p>
              <span className="inline-flex items-center font-semibold group-hover:translate-x-2 transition-transform">
                Shop Now →
              </span>
            </Link>
            <Link href="/services" className="block p-8 bg-white border-2 border-green-700 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up delay-200">
              <h3 className="text-2xl font-bold mb-3">Our Services</h3>
              <p className="text-gray-600 mb-4">Discover our comprehensive farm services including milk processing, livestock sales, transport, and veterinary care.</p>
              <span className="inline-flex items-center font-semibold">
                Learn More →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Farm Gallery Preview */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-fade-in">Our Farm</h2>
            <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Take a glimpse into life at Delamere Farm — where quality livestock and fresh dairy products come from happy, healthy animals.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 animate-fade-in-up">
              <ImageWrapper src="/images/farm gallery1.jpg" alt="Farm View 1" fill className="rounded-lg" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-100">
              <ImageWrapper src="/images/farm gallery2.jpg" alt="Farm View 2" fill className="rounded-lg" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-200">
              <ImageWrapper src="/images/farmgall1.jpg" alt="Dairy Barn" fill className="rounded-lg" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-300">
              <ImageWrapper src="/images/farmgallery3.jpg" alt="Pastures" fill className="rounded-lg" />
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/gallery" className="inline-block px-6 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-lg hover:bg-green-700 hover:text-white transition-all duration-300 hover:scale-105">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

        <MediaCarousel />

      {/* Featured Products Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-fade-in">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Browse our most popular dairy products and livestock available for sale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up">
              <div className="h-48 relative overflow-hidden">
                <ImageWrapper src="/images/delamere one litre.jpg" alt="Fresh Milk" fill className="hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Fresh Milk</h3>
                <p className="text-green-700 font-bold">KES 120/L</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up delay-200">
              <div className="h-48 relative overflow-hidden">
                <ImageWrapper src="/images/FresiAN PEDIGREE.jpg" alt="Friesian Cow" fill className="hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Friesian Cow (Mature)</h3>
                <p className="text-green-700 font-bold">KES 200,000</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up delay-400">
              <div className="h-48 relative overflow-hidden">
                <ImageWrapper src="/images/SAANEN DAIRY GOAT.jpg" alt="Saanen Dairy Goat" fill className="hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Saanen Dairy Goat</h3>
                <p className="text-green-700 font-bold">KES 30,000</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/products" className="inline-block px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-all duration-300 hover:scale-105">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">Ready to Get Started?</h2>
          <p className="text-xl text-green-100 mb-8 animate-fade-in-up delay-200">
            Contact us today for inquiries about our products and services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <a
              href={whatsappHref}
              className="inline-block px-8 py-4 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-all duration-300 hover:scale-105"
            >
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-all duration-300 hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  )
}
