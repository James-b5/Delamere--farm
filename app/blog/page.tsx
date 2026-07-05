import Link from "next/link";
import SocialShare from "@/components/SocialShare";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function Blog() {
  const articles = [
    {
      id: 1,
      title: "Essential Tips for Caring for Your Dairy Cattle",
      image: '/images/SAANEN%20DAIRY%20GOAT.jpg',
      excerpt: "Learn the best practices for maintaining healthy and productive dairy cattle, from nutrition to daily care routines.",
      category: "Cattle Care",
      date: "January 15, 2025",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "The Benefits of Fresh Farm Milk",
      image: '/images/delamere%20one%20litre.jpg',
      excerpt: "Discover why fresh, locally-sourced milk is healthier and more nutritious than store-bought alternatives.",
      category: "Dairy Products",
      date: "January 10, 2025",
      readTime: "3 min read",
    },
    {
      id: 3,
      title: "Choosing the Right Breed for Your Farm",
      image: '/images/FresiAN%20PEDIGREE.jpg',
      excerpt: "A comprehensive guide to selecting the best cattle and goat breeds for dairy production in Kenya.",
      category: "Breed Advisor",
      date: "January 5, 2025",
      readTime: "7 min read",
    },
    {
      id: 4,
      title: "Sustainable Farming Practices at Delamere Farm",
      image: '/images/farmhomepage.jpg',
      excerpt: "Learn how we implement eco-friendly farming methods to ensure sustainable livestock management.",
      category: "Farm Life",
      date: "December 28, 2024",
      readTime: "4 min read",
    },
    {
      id: 5,
      title: "Understanding Pedigree Certifications",
      image: '/images/SAANEN%20DAIRY%20GOAT.jpg',
      excerpt: "What pedigree verification means and why it matters when purchasing livestock.",
      category: "Cattle Care",
      date: "December 20, 2024",
      readTime: "6 min read",
    },
    {
      id: 6,
      title: "From Pasture to Product: Our Milk Processing Journey",
      image: '/images/homepage4.jpg',
      excerpt: "Take a behind-the-scenes look at how our fresh milk becomes artisan butter and yogurt.",
      category: "Dairy Products",
      date: "December 15, 2024",
      readTime: "5 min read",
    },
    {
      id: 7,
      title: "Goat Farming in Kenya: A Complete Guide",
      image: '/images/SAANEN%20DAIRY%20GOAT.jpg',
      excerpt: "Everything you need to know about starting and maintaining a successful goat farming operation.",
      category: "Livestock",
      date: "December 10, 2024",
      readTime: "8 min read",
    },
    {
      id: 8,
      title: "The Art of Making Artisan Butter",
      image: '/images/homepage2.jpg',
      excerpt: "Learn about our traditional butter-making process and what makes Delamere butter special.",
      category: "Dairy Products",
      date: "December 5, 2024",
      readTime: "4 min read",
    },
    {
      id: 9,
      title: "Poultry Farming Best Practices",
      image: '/images/homepage7.jpg',
      excerpt: "Tips for raising healthy chickens and maximizing egg production on your farm.",
      category: "Poultry",
      date: "November 28, 2024",
      readTime: "6 min read",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-green-800 to-green-700 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full animate-pulse-slow delay-300"></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Farm Blog & Articles
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Stay updated with the latest news, tips, and insights from Delamere Farm
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article
                key={article.id} 
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 article-card`}
                data-index={index}
              >
                <div className="h-48 bg-linear-to-br from-green-600 to-green-800 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-green-600 font-medium">{article.category}</span>
                    <span className="text-sm text-gray-500">{article.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-green-700 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.date}</span>
                    <Link 
                      href="#" 
                      className="text-green-600 font-semibold hover:text-green-700 transition-colors inline-flex items-center"
                    >
                      Read More 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  <SocialShare title={article.title} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 animate-fade-in-up">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Get the latest farm updates, tips, and exclusive offers delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto animate-fade-in-up delay-400">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-colors placeholder-gray-400 cursor-text"
            />
            <button 
              type="submit"
              className="px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-all duration-300 hover:scale-105"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">
            Have Questions About Our Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8 animate-fade-in-up delay-200">
            Our team is here to help with any inquiries about our products and services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <a
              href={buildWhatsAppLink()}
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
    </div>
  );
}
