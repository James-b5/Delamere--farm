export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  category?: string;
  features?: string[];
  characteristics?: Record<string, string>;
}

/**
 * Fetch a product by its ID.
 * This utility abstracts the API call used in the product detail page.
 * It returns a Product object or null if the product is not found.
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) {
      // Try a fallback: maybe the route used a slug (e.g. "featured-jersey")
      if (res.status === 404) {
        try {
          const listRes = await fetch('/api/products');
          if (!listRes.ok) return null;
          const list = await listRes.json();
          const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const found = (list as any[]).find(p => p.id === productId || slugify(p.name || '') === productId);
          if (found) return found as Product;
        } catch (e) {
          // fallthrough
        }
      }
      console.debug('Failed to fetch product', res.status, 'id:', productId);
      return null;
    }
    const data = await res.json();
    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
