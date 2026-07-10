"use client";

import Link from "next/link";
import { useState } from "react";
import Search from "./Search";
import Cart from "./Cart";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "@/context/AuthContext";

interface HeaderFooterProps {
  children: React.ReactNode;
}

export default function HeaderFooter({ children }: HeaderFooterProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
    { href: "/bookings", label: "Bookings" },
    { href: "/breed-advisor", label: "Breed Advisor" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Articles" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
      : "https://wa.me/254700000000");

  const socialLinks = [
    {
      name: "WhatsApp",
      href: whatsappHref,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      )
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/17shPucibm/",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@delamerefarm-z3g",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.499 6.203a2.99 2.99 0 00-2.11-2.117C19.63 3.5 12 3.5 12 3.5s-7.63 0-9.389.586A2.99 2.99 0 00.5 6.203C0 8.01 0 12 0 12s0 3.99.5 5.797a2.99 2.99 0 002.111 2.117C4.37 20.5 12 20.5 12 20.5s7.63 0 9.389-.586a2.99 2.99 0 002.11-2.117C24 15.99 24 12 24 12s0-3.99-.501-5.797zM9.75 15.02V8.98l6.25 3.02-6.25 3.02z"/>
        </svg>
      )
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@delameredairyfarm254",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      name: "X",
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Navigation Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl leading-none">D</span>
              </div>
              <Link href="/" className="text-2xl font-black tracking-tight text-gray-900 hover:text-green-700 transition-colors">
                Delamere<span className="text-green-700">Farm</span>
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions & Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <Search />
              </div>
              <div className="text-gray-600 hover:text-green-700 transition-colors">
                <Cart />
              </div>
              
              {user ? (
                <ProfileDropdown />
              ) : (
                <Link href="/login" className="hidden sm:flex items-center gap-1.5 text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 border border-gray-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-6 bg-white border-t border-gray-100 px-4 absolute w-full left-0 shadow-xl">
              <div className="flex flex-col space-y-1 pt-4">
                <div className="mb-4 sm:hidden">
                  <Search />
                </div>
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 rounded-xl text-gray-700 font-semibold hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile Profile Section */}
                {user && (
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="px-4 py-2 mb-3">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <Link 
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-sm"
                    >
                      My Dashboard
                    </Link>
                    <Link 
                      href="/dashboard?tab=addresses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-sm"
                    >
                      Saved Addresses
                    </Link>
                    <Link 
                      href="/dashboard?tab=wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-sm"
                    >
                      My Wishlist
                    </Link>
                  </div>
                )}
                
                {/* Mobile Auth Link */}
                {!user && (
                  <Link 
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 rounded-xl font-bold bg-green-700 text-white hover:bg-green-800 transition-colors mt-4 text-center shadow-md shadow-green-200"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About Column */}
            <div>
              <h3 className="text-xl font-bold mb-4">Delamere Farm</h3>
              <p className="text-gray-300">
                Premium Dairy & Pedigree Livestock in Nakuru, Kenya. Trusted by farmers across Kenya and beyond.
              </p>
              {/* Social Links */}
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors p-2 bg-gray-700 rounded-full hover:bg-green-600"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-gray-300 hover:text-white transition-colors">Products</Link></li>
                <li><Link href="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/bookings" className="text-gray-300 hover:text-white transition-colors">Bookings</Link></li>
                <li><Link href="/breed-advisor" className="text-gray-300 hover:text-white transition-colors">Breed Advisor</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li className="text-gray-300">Milk Processing</li>
                <li className="text-gray-300">Livestock Sales</li>
                <li className="text-gray-300">Transport</li>
                <li className="text-gray-300">Veterinary Services</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Nakuru, Kenya</li>
                <li>Mon-Sat: 8am-5pm</li>
                <li>
                  <a href={`tel:0751741445`} className="hover:text-white">
                    Phone: 0751741445
                  </a>
                </li>
                <li>
                  <a href={`mailto:delameredairyfarm254@gmail.com`} className="hover:text-white">
                    Email: delameredairyfarm254@gmail.com
                  </a>
                </li>
                <li>
                  <a href={whatsappHref} className="hover:text-white">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Delamere Farm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
