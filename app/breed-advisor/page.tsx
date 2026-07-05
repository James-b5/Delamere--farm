"use client";

import { useState } from "react";

type AnimalType = "cattle" | "goat" | "poultry";
type Purpose = "dairy" | "meat" | "dual";

interface Breed {
  name: string;
  description: string;
  characteristics: string[];
  priceRange: string;
}

const breedsData: Record<AnimalType, Record<Purpose, Breed[]>> = {
  cattle: {
    dairy: [
      {
        name: "Friesian",
        description: "High-producing dairy breed known for excellent milk yield",
        characteristics: ["High milk production", "Black and white markings", "Docile temperament"],
        priceRange: "KES 150,000 - KES 250,000",
      },
      {
        name: "Jersey",
        description: "Compact dairy breed producing rich, creamy milk",
        characteristics: ["High butterfat content", "Brown color", "Feed efficient"],
        priceRange: "KES 120,000 - KES 200,000",
      },
      {
        name: "Saanen",
        description: "Swiss dairy breed, one of the largest dairy breeds",
        characteristics: ["White or cream color", "High milk yield", "Docile nature"],
        priceRange: "KES 130,000 - KES 220,000",
      },
    ],
    meat: [
      {
        name: "Charolais",
        description: "French beef breed known for muscular build",
        characteristics: ["Large frame", "White or cream color", "Fast growth"],
        priceRange: "KES 180,000 - KES 300,000",
      },
      {
        name: "Hereford",
        description: "Hardy British beef breed with excellent foraging ability",
        characteristics: ["Red body with white face", "Good meat quality", "Adaptable"],
        priceRange: "KES 150,000 - KES 250,000",
      },
      {
        name: "Brahman",
        description: "Heat-tolerant beef breed ideal for tropical climates",
        characteristics: ["Heat resistant", "Disease tolerant", "Good mothering"],
        priceRange: "KES 120,000 - KES 200,000",
      },
    ],
    dual: [
      {
        name: "Sahiwal",
        description: "Indian breed known for both milk and meat production",
        characteristics: ["Good milk yield", "Heat tolerant", "Dual purpose"],
        priceRange: "KES 100,000 - KES 180,000",
      },
      {
        name: "Red Poll",
        description: "English breed balanced for milk and beef production",
        characteristics: ["Red color", "Polled (hornless)", "Good maternal traits"],
        priceRange: "KES 110,000 - KES 190,000",
      },
    ],
  },
  goat: {
    dairy: [
      {
        name: "Saanen",
        description: "Leading dairy goat breed from Switzerland",
        characteristics: ["White or cream", "High milk production", "Docile"],
        priceRange: "KES 25,000 - KES 45,000",
      },
      {
        name: "Alpine",
        description: "Medium to large dairy goat with varied colors",
        characteristics: ["Good milk yield", "Hardy", "Adaptable"],
        priceRange: "KES 20,000 - KES 40,000",
      },
      {
        name: "Nubian",
        description: "Dairy breed known for high butterfat milk",
        characteristics: ["Long ears", "High butterfat", "Distinctive appearance"],
        priceRange: "KES 22,000 - KES 42,000",
      },
    ],
    meat: [
      {
        name: "Boer",
        description: "South African breed specifically for meat production",
        characteristics: ["Fast growth", "High meat yield", "White body with red head"],
        priceRange: "KES 30,000 - KES 55,000",
      },
      {
        name: "Kiko",
        description: "Hardy American meat breed",
        characteristics: ["Fast growing", "Good mothering", "Low maintenance"],
        priceRange: "KES 25,000 - KES 45,000",
      },
      {
        name: "Spanish",
        description: "Heritage meat breed from Spain",
        characteristics: ["Good foraging ability", "Hardy", "Good meat quality"],
        priceRange: "KES 20,000 - KES 38,000",
      },
    ],
    dual: [
      {
        name: "Nigerian Dwarf",
        description: "Small dual-purpose breed for milk and meat",
        characteristics: ["Small size", "High butterfat milk", "Colorful"],
        priceRange: "KES 18,000 - KES 35,000",
      },
      {
        name: "Sabelsi",
        description: "African breed suitable for milk and meat",
        characteristics: ["Adapted to harsh climates", "Good milk yield", "Meat producing"],
        priceRange: "KES 15,000 - KES 30,000",
      },
    ],
  },
  poultry: {
    dairy: [],
    meat: [
      {
        name: "Broiler",
        description: "Fast-growing chicken breed for meat production",
        characteristics: ["Rapid growth", "High meat yield", "White feathers"],
        priceRange: "KES 150 - KES 300 per bird",
      },
      {
        name: "Cobb 500",
        description: "Commercial broiler breed",
        characteristics: ["Excellent feed conversion", "Fast growth", "High viability"],
        priceRange: "KES 180 - KES 350 per bird",
      },
      {
        name: "Ross 308",
        description: "Premium broiler breed for meat production",
        characteristics: ["Superior growth rate", "Good meat quality", "Feed efficient"],
        priceRange: "KES 200 - KES 400 per bird",
      },
    ],
    dual: [
      {
        name: "Rhode Island Red",
        description: "American breed for eggs and meat",
        characteristics: ["Good egg production", "Brown eggs", "Hardy"],
        priceRange: "KES 200 - KES 400 per bird",
      },
      {
        name: "Plymouth Rock",
        description: "Heritage breed with good egg and meat production",
        characteristics: ["Barred feathers", "Docile", "Good layers"],
        priceRange: "KES 180 - KES 350 per bird",
      },
      {
        name: "Barred Rock",
        description: "Popular dual-purpose breed",
        characteristics: ["Gray and white bars", "Cold hardy", "Good egg layers"],
        priceRange: "KES 150 - KES 300 per bird",
      },
    ],
  },
};

export default function BreedAdvisorPage() {
  const [animalType, setAnimalType] = useState<AnimalType | "">("");
  const [purpose, setPurpose] = useState<Purpose | "">("");

  const recommendations = animalType && purpose 
    ? breedsData[animalType][purpose].filter(breed => breed.name)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Breed Advisor
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Choose the best livestock breeds for your climate, goals, and management style with guidance tailored to Kenyan farmers.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                What type of animal are you interested in?
              </label>
              <select
                value={animalType}
                onChange={(e) => {
                  setAnimalType(e.target.value as AnimalType);
                  setPurpose("");
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
                title="Select the type of animal you're interested in"
              >
                <option value="">Select Animal Type</option>
                <option value="cattle">Cattle</option>
                <option value="goat">Goat</option>
                <option value="poultry">Poultry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                What is your primary purpose?
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as Purpose)}
                disabled={!animalType}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 text-gray-800"
                title="Select your primary purpose for raising the animal"
              >
                <option value="">Select Purpose</option>
                <option value="dairy">Dairy</option>
                <option value="meat">Meat</option>
                <option value="dual">Dual Purpose</option>
              </select>
            </div>
          </div>
        </div>

        {animalType && purpose && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Recommended {animalType.charAt(0).toUpperCase() + animalType.slice(1)} Breeds for {purpose.charAt(0).toUpperCase() + purpose.slice(1)} Production
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                These options balance milk yield, growth rate, climate resilience, and ease of management for most small and medium farms.
              </p>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {recommendations.map((breed, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-green-800 mb-2">
                        {breed.name}
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {breed.description}
                      </p>
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Characteristics:</h4>
                        <div className="flex flex-wrap gap-2">
                          {breed.characteristics.map((char, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <p className="font-semibold text-gray-800">
                          Price Range: <span className="text-green-700 font-bold">{breed.priceRange}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
                <p className="text-gray-700">
                  No breeds available for this combination. Please try a different selection.
                </p>
              </div>
            )}

            <div className="text-center mt-8">
              <a
                href="/products"
                className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold"
              >
                View All Products
              </a>
            </div>
          </div>
        )}

        {!animalType && !purpose && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-md">
            <p className="text-lg text-gray-700">
              Select an animal type and purpose above to see breed recommendations tailored to your farm.
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Why this matters</h3>
            <p className="text-gray-700 mb-4">The right breed improves milk output, fertility, disease resilience, and long-term profitability.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Match breeds to your climate and feed resources</li>
              <li>• Plan for housing, health, and breeding goals</li>
              <li>• Reduce risk with proven breeds and expert support</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Related Articles</h3>
            <p className="text-gray-700 mb-4">Browse our blog for in-depth guides on breeds, care, and farm management.</p>
            <a href="/blog" className="font-semibold text-green-700">Read our Articles →</a>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Request a Breeding Consultation</h3>
            <p className="text-gray-700 mb-4">Get personalized advice from our farm experts about selecting and managing the right breeds for your goals.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/bookings" className="rounded-lg bg-green-700 px-4 py-2 text-white">Book Consultation</a>
              <a href="/contact" className="rounded-lg border border-gray-300 px-4 py-2">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
