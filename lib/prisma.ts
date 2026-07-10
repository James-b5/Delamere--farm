import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import getPrismaClientOptions from '../prisma/prisma.config';

const globalForPrisma = globalThis as unknown as { prisma?: any };
const isProduction = process.env.NODE_ENV === 'production';
const options = getPrismaClientOptions();

const FALLBACK_STORE_PATH = path.join(process.cwd(), 'data', 'prisma-fallback-store.json');

type FallbackStore = Record<string, any[]>;

function readFallbackStore(): FallbackStore {
  try {
    if (fs.existsSync(FALLBACK_STORE_PATH)) {
      const raw = fs.readFileSync(FALLBACK_STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as FallbackStore;
      }
    }
  } catch (error) {
    console.warn('Unable to read Prisma fallback store, starting fresh:', error);
  }

  return {};
}

function writeFallbackStore(store: FallbackStore) {
  try {
    fs.mkdirSync(path.dirname(FALLBACK_STORE_PATH), { recursive: true });
    fs.writeFileSync(FALLBACK_STORE_PATH, JSON.stringify(store, null, 2));
  } catch (error: any) {
    if (error && error.code === 'EROFS') {
      console.warn('Prisma fallback store write skipped: read-only filesystem', error.message);
      return;
    }
    console.warn('Unable to write Prisma fallback store, skipping:', error);
  }
}

function ensureModelStore(store: FallbackStore, model: string) {
  if (!store[model]) {
    store[model] = [];
  }
  return store[model];
}

function createId(model: string) {
  if (model === 'Media') {
    return Math.floor(Date.now() + Math.random() * 1000);
  }
  return `${model.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneRecord(record: any) {
  return JSON.parse(JSON.stringify(record));
}

function matchesWhere(record: any, where?: any): boolean {
  if (!where || typeof where !== 'object' || Array.isArray(where)) {
    return true;
  }

  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND' && Array.isArray(value)) {
      if (!value.every((part) => matchesWhere(record, part))) return false;
      continue;
    }

    if (key === 'OR' && Array.isArray(value)) {
      if (!value.some((part) => matchesWhere(record, part))) return false;
      continue;
    }

    const recordValue = record[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const comparisonValue = value as Record<string, any>;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'equals') && recordValue !== comparisonValue.equals) return false;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'not') && recordValue === comparisonValue.not) return false;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'in') && !comparisonValue.in.includes(recordValue)) return false;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'contains') && typeof recordValue === 'string' && !recordValue.includes(comparisonValue.contains)) return false;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'startsWith') && typeof recordValue === 'string' && !recordValue.startsWith(comparisonValue.startsWith)) return false;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'endsWith') && typeof recordValue === 'string' && !recordValue.endsWith(comparisonValue.endsWith)) return false;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'gte') && recordValue < comparisonValue.gte) return false;
      if (Object.prototype.hasOwnProperty.call(comparisonValue, 'lte') && recordValue > comparisonValue.lte) return false;
      continue;
    }

    if (recordValue !== value) {
      return false;
    }
  }

  return true;
}

function applyOrder(items: any[], orderBy?: any) {
  if (!orderBy || typeof orderBy !== 'object' || Array.isArray(orderBy)) {
    return items;
  }

  const entries = Object.entries(orderBy);
  if (!entries.length) return items;

  return [...items].sort((a, b) => {
    for (const [field, direction] of entries) {
      const aValue = a[field];
      const bValue = b[field];
      if (aValue === bValue) continue;
      const comparison = aValue > bValue ? 1 : -1;
      return direction === 'desc' ? -comparison : comparison;
    }
    return 0;
  });
}

function applySelect(record: any, select?: any) {
  if (!select || typeof select !== 'object' || Array.isArray(select)) {
    return record;
  }

  return Object.fromEntries(
    Object.entries(select)
      .filter(([, include]) => Boolean(include))
      .map(([key]) => [key, record[key]]),
  );
}

function seedFallbackStoreIfNeeded(store: FallbackStore) {
  ensureModelStore(store, 'product');
  ensureModelStore(store, 'media');
  ensureModelStore(store, 'blogPost');
  ensureModelStore(store, 'category');
  ensureModelStore(store, 'tag');

  const productSeedData = [
    {
      id: 'fallback-product-1',
      name: 'Fresh Jersey Milk',
      description: 'Premium dairy milk from Delamere Farm with rich cream and excellent freshness.',
      price: 3200,
      stock: 120,
      category: 'dairy',
      breed: 'Jersey',
      healthStatus: 'Vaccinated',
      ageOrWeight: '2 years',
      deleted: false,
      images: JSON.stringify(['/images/homepage4.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Dairy' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-2',
      name: 'Broiler Chickens',
      description: 'Healthy broiler chickens ready for delivery to farms and homes.',
      price: 2500,
      stock: 45,
      category: 'poultry',
      breed: 'Broiler',
      healthStatus: 'Vaccinated',
      ageOrWeight: '6 weeks',
      deleted: false,
      images: JSON.stringify(['/images/layer hens.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Poultry' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-3',
      name: 'Friesian Dairy Cow',
      description: 'High-producing Friesian dairy cow suited for commercial milk production.',
      price: 180000,
      stock: 8,
      category: 'dairy',
      breed: 'Friesian',
      healthStatus: 'Vaccinated',
      ageOrWeight: '3 years',
      deleted: false,
      images: JSON.stringify(['/images/FresiAN PEDIGREE.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Dairy' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-4',
      name: 'Ayrshire Heifer',
      description: 'Young Ayrshire heifer with strong growth potential and good dairy traits.',
      price: 95000,
      stock: 6,
      category: 'heifers',
      breed: 'Ayrshire',
      healthStatus: 'Vaccinated',
      ageOrWeight: '14 months',
      deleted: false,
      images: JSON.stringify(['/images/Jersey dairy cow.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Heifers' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-5',
      name: 'Charolais Beef Bull',
      description: 'Premium beef bull for improved growth, carcass quality, and herd performance.',
      price: 220000,
      stock: 4,
      category: 'bulls',
      breed: 'Charolais',
      healthStatus: 'Vaccinated',
      ageOrWeight: '2 years',
      deleted: false,
      images: JSON.stringify(['/images/Delamerefarm1.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Beef' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-6',
      name: 'Sahiwal Calf',
      description: 'Vigorous Sahiwal calf with strong adaptability and dual-purpose potential.',
      price: 60000,
      stock: 10,
      category: 'calves',
      breed: 'Sahiwal',
      healthStatus: 'Vaccinated',
      ageOrWeight: '4 months',
      deleted: false,
      images: JSON.stringify(['/images/homepage7.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Calves' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-7',
      name: 'Boer Goat Buck',
      description: 'Strong Boer goat buck for meat production and breeding programs.',
      price: 70000,
      stock: 5,
      category: 'goats',
      breed: 'Boer',
      healthStatus: 'Vaccinated',
      ageOrWeight: '18 months',
      deleted: false,
      images: JSON.stringify(['/images/boer goat.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Goats' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-8',
      name: 'Kuroiler Poultry Stock',
      description: 'Reliable Kuroiler birds for eggs and meat with good disease resilience.',
      price: 3500,
      stock: 50,
      category: 'poultry',
      breed: 'Kuroiler',
      healthStatus: 'Vaccinated',
      ageOrWeight: '8 weeks',
      deleted: false,
      images: JSON.stringify(['/images/kienyeji chicken 10.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Poultry' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-9',
      name: 'Beef Steer',
      description: 'Well-finished beef steer for meat production and farm diversification.',
      price: 140000,
      stock: 7,
      category: 'beef',
      breed: 'Crossbreed',
      healthStatus: 'Vaccinated',
      ageOrWeight: '20 months',
      deleted: false,
      images: JSON.stringify(['/images/farmgallery3.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Beef' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-10',
      name: 'Dorper Sheep',
      description: 'Hardy Dorper sheep suitable for meat production and efficient grazing systems.',
      price: 90000,
      stock: 12,
      category: 'sheep',
      breed: 'Dorper',
      healthStatus: 'Vaccinated',
      ageOrWeight: '12 months',
      deleted: false,
      images: JSON.stringify(['/images/farm gallery2.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Sheep' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-11',
      name: 'Rabbits for Breeding',
      description: 'Healthy rabbits for breeding and smallholder meat production projects.',
      price: 4000,
      stock: 20,
      category: 'rabbits',
      breed: 'New Zealand White',
      healthStatus: 'Vaccinated',
      ageOrWeight: '6 months',
      deleted: false,
      images: JSON.stringify(['/images/homepage1.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Rabbits' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-12',
      name: 'Breeding Stock Package',
      description: 'A curated starter package featuring proven breeding animals and support guidance.',
      price: 320000,
      stock: 3,
      category: 'breeding-stock',
      breed: 'Mixed',
      healthStatus: 'Vaccinated',
      ageOrWeight: 'Varies',
      deleted: false,
      images: JSON.stringify(['/images/homepage2.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Breeding Stock' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-13',
      name: 'Feed and Farm Supplies Kit',
      description: 'Essential feed, supplements, and farm supplies for livestock health and productivity.',
      price: 18000,
      stock: 30,
      category: 'feed-and-supplies',
      breed: 'Farm Supplies',
      healthStatus: 'Ready',
      ageOrWeight: 'N/A',
      deleted: false,
      images: JSON.stringify(['/images/homepage7.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Feed and Supplies' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fallback-product-14',
      name: 'Seasonal Livestock Bundle',
      description: 'A bundled offer with animals, feed, and veterinary support for seasonal farm setups.',
      price: 450000,
      stock: 2,
      category: 'seasonal-bundles',
      breed: 'Mixed',
      healthStatus: 'Vaccinated',
      ageOrWeight: 'Varies',
      deleted: false,
      images: JSON.stringify(['/images/Delamerefarm1.jpg']),
      videos: JSON.stringify([]),
      documents: JSON.stringify([]),
      specs: JSON.stringify({ category: 'Seasonal Bundles' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const existingProductNames = new Set((store.product as any[]).map((entry: any) => entry.name));
  for (const product of productSeedData) {
    if (!existingProductNames.has(product.name)) {
      store.product.push(product);
      existingProductNames.add(product.name);
    }
  }

  const mediaSeedData = [
    {
      id: 1,
      type: 'IMAGE',
      url: '/images/homepage4.jpg',
      title: 'Farm Overview',
      description: 'Welcome to Delamere Farm',
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'IMAGE',
      url: '/images/farm gallery1.jpg',
      title: 'Pasture and Farm Grounds',
      description: 'Open grazing land and farm scenery.',
      order: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      type: 'IMAGE',
      url: '/images/farmgallery3.jpg',
      title: 'Livestock Fields',
      description: 'Healthy livestock grazing in the fields.',
      order: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      type: 'IMAGE',
      url: '/images/JERSEY COW.jpg',
      title: 'Dairy Cow',
      description: 'High-producing Jersey cow on the farm.',
      order: 4,
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      type: 'IMAGE',
      url: '/images/SAANEN DAIRY GOAT.jpg',
      title: 'Dairy Goat',
      description: 'Saanen dairy goat in good health.',
      order: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: 6,
      type: 'IMAGE',
      url: '/images/layer hens.jpg',
      title: 'Layer Hens',
      description: 'Layer hens housed in a clean poultry area.',
      order: 6,
      createdAt: new Date().toISOString(),
    },
  ];

  const existingMediaUrls = new Set((store.media as any[]).map((entry: any) => entry.url));
  for (const media of mediaSeedData) {
    if (!existingMediaUrls.has(media.url)) {
      store.media.push(media);
      existingMediaUrls.add(media.url);
    }
  }

  if (!store.blogPost?.some((entry: any) => entry.slug === 'welcome-to-delamere-farm')) {
    store.blogPost.push({
      id: 'fallback-post-1',
      title: 'Welcome to Delamere Farm',
      slug: 'welcome-to-delamere-farm',
      excerpt: 'Fresh produce and healthy livestock from our farm.',
      content: 'This content is served from the local fallback store while the remote database is unavailable.',
      author: 'Delamere Farm Team',
      published: true,
      publishedAt: new Date().toISOString(),
      coverImage: '/images/homepage4.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (!store.category?.some((entry: any) => entry.slug === 'dairy')) {
    store.category.push({
      id: 'fallback-category-1',
      name: 'Dairy',
      slug: 'dairy',
      createdAt: new Date().toISOString(),
    });
  }

  if (!store.category?.some((entry: any) => entry.slug === 'beef')) {
    store.category.push({
      id: 'fallback-category-2',
      name: 'Beef',
      slug: 'beef',
      createdAt: new Date().toISOString(),
    });
  }

  if (!store.category?.some((entry: any) => entry.slug === 'poultry')) {
    store.category.push({
      id: 'fallback-category-3',
      name: 'Poultry',
      slug: 'poultry',
      createdAt: new Date().toISOString(),
    });
  }

  if (!store.tag?.some((entry: any) => entry.slug === 'farm-fresh')) {
    store.tag.push({
      id: 'fallback-tag-1',
      name: 'Farm Fresh',
      slug: 'farm-fresh',
    });
  }

  if (!store.tag?.some((entry: any) => entry.slug === 'livestock')) {
    store.tag.push({
      id: 'fallback-tag-2',
      name: 'Livestock',
      slug: 'livestock',
    });
  }
}

const DEFAULT_ADMIN_PASSWORD = 'password123';

export function seedFallbackPrismaStore() {
  const store = createFallbackStore();
  return store;
}

function createFallbackStore() {
  const store = readFallbackStore();
  seedFallbackStoreIfNeeded(store);

  const adminHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  const existingAdmin = store.user?.find((entry: any) => entry.email === 'admin@delamerefarm.co.ke');
  if (existingAdmin) {
    existingAdmin.passwordHash = adminHash;
    existingAdmin.role = 'ADMIN';
    existingAdmin.emailVerified = true;
  } else {
    store.user = [
      {
        id: 'fallback-admin-user',
        name: 'Admin User',
        email: 'admin@delamerefarm.co.ke',
        emailVerified: true,
        passwordHash: adminHash,
        role: 'ADMIN',
        permissions: [],
        isActive: true,
        phone: null,
        address: null,
        verificationToken: null,
        passwordResetToken: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...(store.user ?? []),
    ];
  }

  writeFallbackStore(store);
  return store;
}

function runFallbackOperation(store: FallbackStore, modelName: string, method: string, options?: any) {
  const model = modelName.toLowerCase();

  if (method === 'findMany') {
    const list = ensureModelStore(store, model);
    const filtered = list.filter((record) => matchesWhere(record, options?.where));
    const ordered = applyOrder(filtered, options?.orderBy);
    const skip = options?.skip ?? 0;
    const take = options?.take;
    const paged = ordered.slice(skip, take ? skip + take : undefined);
    return paged.map((record) => {
      if (options?.select) {
        return applySelect(record, options.select);
      }
      return cloneRecord(record);
    });
  }

  if (method === 'findFirst' || method === 'findUnique') {
    const list = ensureModelStore(store, model);
    const matches = list.filter((record) => matchesWhere(record, options?.where));
    const record = matches[0] ?? null;
    if (!record) return null;
    if (options?.select) {
      return applySelect(record, options.select);
    }
    return cloneRecord(record);
  }

  if (method === 'count') {
    const list = ensureModelStore(store, model);
    return list.filter((record) => matchesWhere(record, options?.where)).length;
  }

  if (method === 'create') {
    const data = options?.data ?? {};
    const list = ensureModelStore(store, model);
    const record = cloneRecord({ ...data, id: data.id ?? createId(modelName) });
    if (!record.createdAt) record.createdAt = new Date().toISOString();
    if (!record.updatedAt) record.updatedAt = record.createdAt;
    list.push(record);
    writeFallbackStore(store);
    return cloneRecord(record);
  }

  if (method === 'createMany') {
    const dataList = options?.data ?? [];
    const list = ensureModelStore(store, model);
    const created = dataList.map((data: any) => {
      const record = cloneRecord({ ...data, id: data.id ?? createId(modelName) });
      if (!record.createdAt) record.createdAt = new Date().toISOString();
      if (!record.updatedAt) record.updatedAt = record.createdAt;
      list.push(record);
      return record;
    });
    writeFallbackStore(store);
    return { count: created.length };
  }

  if (method === 'update') {
    const list = ensureModelStore(store, model);
    const target = list.find((record) => matchesWhere(record, options?.where));
    if (!target) {
      return null;
    }
    Object.assign(target, { ...options?.data, updatedAt: new Date().toISOString() });
    writeFallbackStore(store);
    return cloneRecord(target);
  }

  if (method === 'delete') {
    const list = ensureModelStore(store, model);
    const index = list.findIndex((record) => matchesWhere(record, options?.where));
    if (index === -1) return null;
    const [deleted] = list.splice(index, 1);
    writeFallbackStore(store);
    return cloneRecord(deleted);
  }

  if (method === 'upsert') {
    const list = ensureModelStore(store, model);
    const existing = list.find((record) => matchesWhere(record, options?.where));
    if (existing) {
      Object.assign(existing, { ...options?.update, updatedAt: new Date().toISOString() });
      writeFallbackStore(store);
      return cloneRecord(existing);
    }
    const created = cloneRecord({ ...options?.create, id: options?.create?.id ?? createId(modelName) });
    if (!created.createdAt) created.createdAt = new Date().toISOString();
    if (!created.updatedAt) created.updatedAt = created.createdAt;
    list.push(created);
    writeFallbackStore(store);
    return cloneRecord(created);
  }

  return null;
}

function createFallbackPrismaProxy(store: FallbackStore) {
  const createModelProxy = (modelName: string) => {
    const methodHandler = {
      get(_: any, method: string) {
        return async (...args: any[]) => runFallbackOperation(store, modelName, method, args[0]);
      },
    };

    return new Proxy({}, methodHandler as any);
  };

  const modelHandler = {
    get(_: any, model: string) {
      return createModelProxy(model);
    },
  };

  return new Proxy({}, modelHandler as any);
}

function createPrismaProxy(target: any) {
  return new Proxy(target, {
    get(targetValue: any, prop: PropertyKey, receiver: any) {
      if (typeof prop === 'symbol' || prop === 'then' || prop === 'inspect') {
        return Reflect.get(targetValue, prop, receiver);
      }

      const value = Reflect.get(targetValue, prop, receiver);
      if (typeof prop === 'string' && prop.startsWith('$')) {
        return value;
      }

      if (typeof value === 'function') {
        return value;
      }

      if (value && typeof value === 'object') {
        return new Proxy(value, {
          get(modelTarget: any, method: PropertyKey, modelReceiver: any) {
            if (typeof method === 'symbol' || method === 'then' || method === 'inspect') {
              return Reflect.get(modelTarget, method, modelReceiver);
            }

            const original = Reflect.get(modelTarget, method, modelReceiver);
            if (typeof original !== 'function') {
              return original;
            }

            // Do not silently fall back on per-query errors. Let errors propagate so
            // the application can surface and handle them. The fallback store is
            // only used when PrismaClient failed to initialize at startup.
            return async (...args: any[]) => {
              return await original(...args);
            };
          },
        });
      }

      return value;
    },
  });
}

let prismaInstance: any;
const fallbackStore = createFallbackStore();
const fallbackPrisma = createFallbackPrismaProxy(fallbackStore);

try {
  prismaInstance = globalForPrisma.prisma || new PrismaClient(options);
  if (!isProduction) {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (e: any) {
  if (isProduction) {
    throw e;
  }

  console.warn('Prisma failed to initialize; using a local fallback store so the backend keeps working:', e.message || e);
  prismaInstance = fallbackPrisma;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma: any = prismaInstance === fallbackPrisma ? fallbackPrisma : createPrismaProxy(prismaInstance);
export const isPrismaFallback = prismaInstance === fallbackPrisma;
