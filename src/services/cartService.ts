import { MenuItem, CafeCartItem } from '../types';

const CART_STORAGE_KEY = 'friends4ever_cafe_cart_v1';

export interface VariantOption {
  label: string;
  price: number;
}

/**
 * Returns available variant options for an item (e.g. Regular/Medium/Large or Half/Full)
 */
export function getAvailableVariants(item: MenuItem): VariantOption[] {
  const variants: VariantOption[] = [];

  // 1. Pizza / Beverage sizes
  if (item.regularPrice && !isNaN(Number(item.regularPrice))) {
    variants.push({ label: 'Regular', price: Number(item.regularPrice) });
  }
  if (item.mediumPrice && !isNaN(Number(item.mediumPrice))) {
    variants.push({ label: 'Medium', price: Number(item.mediumPrice) });
  }
  if (item.largePrice && !isNaN(Number(item.largePrice))) {
    variants.push({ label: 'Large', price: Number(item.largePrice) });
  }

  // 2. Half / Full portions
  if (variants.length === 0) {
    if (item.halfPrice && !isNaN(Number(item.halfPrice))) {
      variants.push({ label: 'Half', price: Number(item.halfPrice) });
    }
    if (item.fullPrice && !isNaN(Number(item.fullPrice))) {
      variants.push({ label: 'Full', price: Number(item.fullPrice) });
    }
  }

  // 3. Fallback to standard price or price
  if (variants.length === 0) {
    const p = Number(item.standardPrice || item.price || 0);
    variants.push({ label: 'Standard', price: p > 0 ? p : 99 });
  }

  return variants;
}

/**
 * Get base price for an item
 */
export function getItemBasePrice(item: MenuItem, variantLabel?: string): number {
  const variants = getAvailableVariants(item);
  if (variantLabel) {
    const found = variants.find((v) => v.label.toLowerCase() === variantLabel.toLowerCase());
    if (found) return found.price;
  }
  // Default to first variant
  return variants[0]?.price || 99;
}

/**
 * Generate a unique ID for a cart entry
 */
export function getCartItemId(itemId: string | number, variantLabel?: string): string {
  const cleanId = String(itemId).replace(/\s+/g, '-');
  return variantLabel ? `${cleanId}_${variantLabel.toLowerCase()}` : `${cleanId}_std`;
}

/**
 * Load cart from localStorage
 */
export function loadCartFromStorage(): CafeCartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && item.item && item.quantity > 0);
    }
  } catch (err) {
    console.error('Error loading cart from storage:', err);
  }
  return [];
}

/**
 * Save cart to localStorage
 */
export function saveCartToStorage(cartItems: CafeCartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (err) {
    console.error('Error saving cart to storage:', err);
  }
}

/**
 * Calculate totals for cart
 */
export function calculateCartSummary(cartItems: CafeCartItem[]) {
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const deliveryCharge = 0; // Free delivery for cafe
  const packagingCharge = 0; // Free packaging
  const grandTotal = subtotal + deliveryCharge + packagingCharge;

  return {
    totalItems,
    subtotal,
    deliveryCharge,
    packagingCharge,
    grandTotal,
  };
}
