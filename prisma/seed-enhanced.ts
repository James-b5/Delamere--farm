import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌾 Starting Delamere Farm Database Seeding...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.product.deleteMany({});
  // console.log('✅ Cleared existing products\n');

  // 🐄 CATTLE
  const cattleProducts = [
    {
      name: 'Jersey Dairy Cow - Premium Milk Producer',
      description: 'High-producing Jersey dairy cow with excellent genetics. Known for rich, creamy milk. Vaccinated and health certified.',
      price: 150000,
      stock: 2,
      category: 'Cattle',
      breed: 'Jersey',
      healthStatus: 'Vaccinated, Health Certified, Disease Free',
      ageOrWeight: '3 years old, 400kg',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1500595046891-cd5c457799f7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1535632066927-ab7eeef4d2fe?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1541897489551-c7887adc8fe8?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      ]),
      documents: JSON.stringify([
        'Health Certificate 2024',
        'Breeding Records',
        'Vaccination Records'
      ]),
    },
    {
      name: 'Angus Beef Cattle - Prime Breeding Stock',
      description: 'Premium Angus bulls for breeding. Excellent meat quality genetics. Calm temperament, suitable for commercial breeding programs.',
      price: 250000,
      stock: 1,
      category: 'Cattle',
      breed: 'Angus',
      healthStatus: 'Vaccinated, Certified Breeding Bull',
      ageOrWeight: '4 years old, 850kg',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1612720694546-e62edc87b08d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1559489676-04b3979b6929?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551958219-acbc608c6c4d?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=cattle-breeding-guide',
      ]),
      documents: JSON.stringify([
        'Pedigree Certificate',
        'Fertility Test Results',
        'Show Awards'
      ]),
    },
    {
      name: 'Friesian Dairy Herd - 5 Cows Package',
      description: 'Five Friesian dairy cows for commercial dairy farming. High milk yield, excellent herd health. Ready for immediate milking.',
      price: 600000,
      stock: 1,
      category: 'Cattle',
      breed: 'Friesian',
      healthStatus: 'All vaccinated, TB tested negative, Brucellosis free',
      ageOrWeight: '2-4 years old average, 450-500kg each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1484633634112-64e8b2b14cb8?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1535890822f66a9f26f5ebf99e6e85fe?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=friesian-dairy-farm',
      ]),
      documents: JSON.stringify([
        'Herd Health Certificate',
        'Milk Production Records',
        'Disease Testing Certificates'
      ]),
    },
  ];

  // 🐔 POULTRY
  const poultryProducts = [
    {
      name: 'Broiler Chicks - Day Old (1000 birds)',
      description: 'Day-old broiler chicks (Cobb 500 strain). Ready for growing to market size. Guaranteed 99% hatchability. Professional support included.',
      price: 50000,
      stock: 5,
      category: 'Poultry',
      breed: 'Cobb 500',
      healthStatus: 'From certified hatchery, vaccinated for Marek\'s disease',
      ageOrWeight: 'Day old, ~40g each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627873649417-af36141e5b1f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1606214174585-fe31f6c22a3e?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=broiler-care-guide',
      ]),
      documents: JSON.stringify([
        'Hatchery Certificate',
        'Health Records',
        'Care Guide'
      ]),
    },
    {
      name: 'Layers - Point of Lay Pullets (500 birds)',
      description: 'Ready-to-lay pullets for egg production. 16-18 weeks old, about to start laying. Brown and white varieties available. Premium genetics.',
      price: 75000,
      stock: 3,
      category: 'Poultry',
      breed: 'Hybrid Layers (Brown & White)',
      healthStatus: 'Disease checked, Newcastle & Gumboro vaccinated',
      ageOrWeight: '16-18 weeks old, ~1.2kg each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1589999921657-5d7b19e0cd4e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1554618149-3ba30e1c4643?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1598070875829-90fb3e70a73d?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=layer-production-guide',
      ]),
      documents: JSON.stringify([
        'Health Certificate',
        'Expected Production Records',
        'Nutrition Guide'
      ]),
    },
    {
      name: 'Turkey Poults - Premium Breeding Stock',
      description: 'Large Tom turkeys for breeding or meat production. Broad Breasted White turkeys. 8 weeks old, ready for fattening.',
      price: 12000,
      stock: 20,
      category: 'Poultry',
      breed: 'Broad Breasted White',
      healthStatus: 'Vaccinated against common poultry diseases',
      ageOrWeight: '8 weeks old, 4-5kg each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=turkey-production',
      ]),
      documents: JSON.stringify([
        'Health Records',
        'Breeding Guide',
        'Feeding Schedule'
      ]),
    },
  ];

  // 🐐 GOATS
  const goatProducts = [
    {
      name: 'Dairy Goats - Boer Goat Does (5 animals)',
      description: 'Proven dairy producers. African Boer goats selected for milk production. Excellent mothering ability. Ideal for dairy farming.',
      price: 200000,
      stock: 1,
      category: 'Goats',
      breed: 'Boer Goat',
      healthStatus: 'Vaccinated, dewormed, parasite free',
      ageOrWeight: '2-3 years old, 60-70kg each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1588089073390-86754b1c3d87?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1589999921657-5d7b19e0cd4e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=goat-dairy-farm',
      ]),
      documents: JSON.stringify([
        'Pedigree Certificate',
        'Production Records',
        'Health Certificate'
      ]),
    },
    {
      name: 'Meat Goats - Finishing Kids (50 animals)',
      description: 'Young goats ready for final fattening. Strong growth potential. Average weight 20-25kg. Ready for market in 4-6 weeks.',
      price: 8000,
      stock: 50,
      category: 'Goats',
      breed: 'Mixed Meat Type',
      healthStatus: 'Vaccinated against CDT and common parasites',
      ageOrWeight: '8-10 weeks old, 20-25kg average',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1570543886519-bb4dc4b3d882?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1583307829213-92f0857e243e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1617589632873-f9c41eb1f893?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=goat-fattening-guide',
      ]),
      documents: JSON.stringify([
        'Health Certificate',
        'Weight Records',
        'Feeding Plan'
      ]),
    },
  ];

  // 🐑 SHEEP
  const sheepProducts = [
    {
      name: 'Dairy Sheep - Awassi Ewes (10 animals)',
      description: 'Premium Awassi sheep for dairy production. High milk yield with excellent butterfat. Popular for cheese production.',
      price: 300000,
      stock: 1,
      category: 'Sheep',
      breed: 'Awassi',
      healthStatus: 'Vaccinated, parasiticide treated, disease tested',
      ageOrWeight: '3-4 years old, 60kg average',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551013328-e6b610b1d4f4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1552747284-5a774fadc13d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1537747363735-cf133ecc431e?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=sheep-dairy-production',
      ]),
      documents: JSON.stringify([
        'Breed Certificate',
        'Milk Production Records',
        'Veterinary Health Certificate'
      ]),
    },
    {
      name: 'Wool Sheep - Merino Rams (5 animals)',
      description: 'Premium Merino rams for breeding wool sheep. Excellent fleece quality and fineness. Superior genetics for commercial wool production.',
      price: 150000,
      stock: 1,
      category: 'Sheep',
      breed: 'Merino',
      healthStatus: 'Vaccinated, disease resistant strain',
      ageOrWeight: '2-3 years old, 80-90kg each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1563630010-af16cf90154e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=merino-sheep-breeding',
      ]),
      documents: JSON.stringify([
        'Pedigree Records',
        'Fleece Quality Report',
        'Breeding Performance'
      ]),
    },
  ];

  // 🐷 PIGS
  const pigProducts = [
    {
      name: 'Meat Pigs - Finishing Porkers (20 animals)',
      description: 'Young pigs ready for final fattening. Strong genetics for fast growth and excellent meat quality. 8-10 weeks old.',
      price: 5000,
      stock: 20,
      category: 'Pigs',
      breed: 'Hybrid Commercial Type',
      healthStatus: 'Vaccinated against swine fever and common diseases',
      ageOrWeight: '8-10 weeks old, 25-30kg each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1614504509338-36d56d5fa7a0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1598070875829-90fb3e70a73d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=pig-fattening-guide',
      ]),
      documents: JSON.stringify([
        'Health Certificate',
        'Weight Records',
        'Feed Recommendations'
      ]),
    },
    {
      name: 'Breeding Sows - Gilts (8 animals)',
      description: 'Quality breeding gilts for commercial pig farming. Proven genetics for litter size and milk production. Ready to breed.',
      price: 35000,
      stock: 1,
      category: 'Pigs',
      breed: 'Commercial Hybrid',
      healthStatus: 'Vaccinated, pregnant status available on request',
      ageOrWeight: '6-8 months old, 100-120kg each',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1599599810694-cb0d0df67ff4?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=pig-breeding-program',
      ]),
      documents: JSON.stringify([
        'Breeding History',
        'Genetic Assessment',
        'Fertility Report'
      ]),
    },
  ];

  // 🌾 EQUIPMENT & SUPPLIES
  const equipmentProducts = [
    {
      name: 'Milking Machine - Portable 4-Cow Unit',
      description: 'Portable electric milking machine suitable for 4 cows. Easy to operate and maintain. Includes vacuum pump, hoses, and cleaning supplies.',
      price: 120000,
      stock: 2,
      category: 'Equipment',
      breed: '',
      healthStatus: '',
      ageOrWeight: '',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=milking-machine-demo',
      ]),
      documents: JSON.stringify([
        'User Manual',
        'Technical Specifications',
        'Warranty Card'
      ]),
    },
    {
      name: 'Water Trough System - Automated 200L',
      description: 'Automated water trough with float valve. Capacity 200 liters. Suitable for all livestock types. Durable steel construction.',
      price: 15000,
      stock: 10,
      category: 'Equipment',
      breed: '',
      healthStatus: '',
      ageOrWeight: '',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=water-system-installation',
      ]),
      documents: JSON.stringify([
        'Installation Guide',
        'Specifications',
        'Maintenance Schedule'
      ]),
    },
    {
      name: 'Premium Livestock Feed - 50kg Bag (Multiple Types)',
      description: 'Specialized livestock feed formulations: Dairy mix, broiler starter, grower, finisher. Balanced nutrition with vitamins and minerals.',
      price: 2500,
      stock: 100,
      category: 'Feed',
      breed: '',
      healthStatus: '',
      ageOrWeight: '50kg per bag',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=livestock-nutrition-guide',
      ]),
      documents: JSON.stringify([
        'Nutritional Analysis',
        'Feeding Recommendations',
        'Quality Certification'
      ]),
    },
  ];

  // 🎓 SERVICES
  const serviceProducts = [
    {
      name: 'Farm Consultation Service - Monthly Package',
      description: 'Expert farm management consultation. Includes animal health assessment, nutrition planning, breeding advice, and disease prevention strategies.',
      price: 50000,
      stock: 5,
      category: 'Services',
      breed: '',
      healthStatus: '',
      ageOrWeight: '',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=farm-consulting-video',
      ]),
      documents: JSON.stringify([
        'Service Agreement',
        'Consultant Bio',
        'Testimonials'
      ]),
    },
    {
      name: 'Veterinary Health Check & Vaccination',
      description: 'Complete health assessment and vaccination program for livestock. Includes physical examination, parasite screening, vaccination, and health certificate.',
      price: 5000,
      stock: 0,
      category: 'Services',
      breed: '',
      healthStatus: '',
      ageOrWeight: 'Per animal',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
      ]),
      videos: JSON.stringify([
        'https://www.youtube.com/watch?v=veterinary-services',
      ]),
      documents: JSON.stringify([
        'Service Description',
        'Veterinary Credentials',
        'Health Certificate Template'
      ]),
    },
  ];

  // Combine all products
  const allProducts = [
    ...cattleProducts,
    ...poultryProducts,
    ...goatProducts,
    ...sheepProducts,
    ...pigProducts,
    ...equipmentProducts,
    ...serviceProducts,
  ];

  console.log(`📦 Seeding ${allProducts.length} products...\n`);

  // Create all products
  let created = 0;
  for (const product of allProducts) {
    try {
      await prisma.product.create({
        data: {
          id: `seed-product-${Date.now()}-${created + 1}`,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          images: product.images,
          videos: product.videos,
          specs: JSON.stringify({
            category: product.category,
            breed: product.breed || null,
            healthStatus: product.healthStatus || null,
            ageOrWeight: product.ageOrWeight || null,
            documents: product.documents || [],
          }),
        },
      });
      created++;
      console.log(`✅ ${created}. ${product.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to create "${product.name}": ${error.message}`);
    }
  }

  console.log(`\n🎉 Successfully created ${created}/${allProducts.length} products!\n`);

  // Summary by category
  const categoryCount = new Map<string, number>();
  allProducts.forEach(p => {
    const count = categoryCount.get(p.category) || 0;
    categoryCount.set(p.category, count + 1);
  });

  console.log('📊 Product Summary by Category:\n');
  categoryCount.forEach((count, category) => {
    console.log(`  ${category}: ${count} products`);
  });

  console.log('\n✨ Database seeding completed!');
  console.log('🚀 Ready to display farm products on the website!\n');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
