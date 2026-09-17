import { MenuItem } from '../types';
import rasgullaImage from '../assets/images/rasgulla_sweet_1789648884402.jpg';
import spriteImage from '../assets/images/sprite_cold_drink_1789649786782.jpg';

export const GOOGLE_SHEET_ENDPOINT = 'https://docs.google.com/spreadsheets/d/1qVLdRKkLlQHDKtC7iZr4O1E-wSpNAjXzEssM-Zsb4og/gviz/tq?tqx=out:json&sheet=Menudata';
export const CACHE_STORAGE_KEY = 'cafe_menu_cached_data_v1';
export const CACHE_TIME_KEY = 'cafe_menu_last_synced_v1';

export function parseGvizData(rawText: string): MenuItem[] {
  const startIdx = rawText.indexOf('{');
  const endIdx = rawText.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Invalid Google Sheet response format received.');
  }

  const jsonString = rawText.substring(startIdx, endIdx + 1);
  const data = JSON.parse(jsonString);

  if (!data?.table?.rows) {
    throw new Error('No menu table rows found in Google Sheet response.');
  }

  const items: MenuItem[] = [];

  data.table.rows.forEach((row: any, index: number) => {
    const c = row.c || [];

    const getColValue = (colIndex: number): string | null => {
      if (!c[colIndex]) return null;
      const cell = c[colIndex];
      // Check formatted string 'f' first, then value 'v'
      const val = cell.f !== undefined && cell.f !== null ? cell.f : cell.v;
      if (val === null || val === undefined) return null;
      const trimmed = String(val).trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const cleanPrice = (val: string | null): string | null => {
      if (!val) return null;
      // Remove any trailing .0 or whitespace
      let p = val.replace(/\.0+$/, '').replace(/^₹\s*/, '').trim();
      return p.length > 0 ? p : null;
    };

    const category = getColValue(0);
    const itemName = getColValue(1);

    // Skip empty or header rows
    if (!itemName || !category || itemName.toLowerCase() === 'item name') {
      return;
    }

    const standardPrice = cleanPrice(getColValue(2));
    const halfPrice = cleanPrice(getColValue(3));
    const fullPrice = cleanPrice(getColValue(4));
    const regularPrice = cleanPrice(getColValue(5));
    const mediumPrice = cleanPrice(getColValue(6));
    const largePrice = cleanPrice(getColValue(7));
    const notes = getColValue(8);
    const videoUrl = getColValue(15);
    // Column Q index is 16 (A=0, B=1, ... Q=16)
    const rawImageUrl = getColValue(16);
    const imageUrl = rawImageUrl && rawImageUrl.trim().length > 0 ? rawImageUrl.trim() : null;

    items.push({
      id: `menu-item-${index + 1}`,
      category,
      name: itemName,
      standardPrice,
      halfPrice,
      fullPrice,
      regularPrice,
      mediumPrice,
      largePrice,
      notes,
      videoUrl,
      imageUrl,
      isVeg: true,
    });
  });

  return items;
}

export async function fetchMenuData(): Promise<{ items: MenuItem[]; timestamp: string; fromCache: boolean }> {
  let rawText = '';
  let fromCache = false;

  try {
    // 1. First attempt: Direct fetch to Google Visualization endpoint
    try {
      const response = await fetch(GOOGLE_SHEET_ENDPOINT, { cache: 'no-cache' });
      if (response.ok) {
        rawText = await response.text();
      } else {
        throw new Error(`Google API status: ${response.status}`);
      }
    } catch (directErr) {
      // 2. Second attempt: Local server proxy (/api/menu)
      console.warn('Direct Google Sheet fetch encountered an error, trying /api/menu proxy...', directErr);
      const proxyRes = await fetch('/api/menu');
      if (proxyRes.ok) {
        rawText = await proxyRes.text();
      } else {
        throw new Error('Both direct and proxy fetch failed.');
      }
    }

    const items = parseGvizData(rawText);
    if (items.length === 0) {
      throw new Error('Google Sheet returned 0 menu items.');
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Cache the good data
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(CACHE_TIME_KEY, timestamp);
    } catch {
      // localStorage may be unavailable in some iframe configurations
    }

    return { items, timestamp, fromCache: false };
  } catch (error) {
    // 3. Fallback: Check localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_STORAGE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY) || 'Previously cached';
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { items: parsed, timestamp: cachedTime, fromCache: true };
        }
      }
    } catch {
      // ignore
    }

    throw error;
  }
}

export const CATEGORY_ICONS: Record<string, string> = {
  'All': '✨',
  'Drinks': '🥤',
  'Coffee': '☕',
  'Shakes': '🧋',
  'Lassi': '🥛',
  'Sweet': '🍮',
  'Chinese': '🥢',
  'Noodles': '🍜',
  'Chat': '🥘',
  'Burger': '🍔',
  'Sandwich': '🥪',
  'Pizza': '🍕',
  'Pasta': '🍝',
};

export function getCategoryIcon(category: string): string {
  if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key.toLowerCase())) return icon;
  }
  return '🍽️';
}

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'Drinks': spriteImage,
  'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
  'Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80',
  'Lassi': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
  'Sweet': rasgullaImage,
  'Chinese': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=400&q=80',
  'Noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
  'Chat': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80',
};

export function getItemImageUrl(item: MenuItem): string {
  if (item.imageUrl && item.imageUrl.trim().length > 0) {
    return item.imageUrl.trim();
  }
  return DEFAULT_CATEGORY_IMAGES[item.category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
}

export const CATEGORY_THUMBNAILS: Record<string, string> = {
  'All': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=240&q=80',
  'Drinks': spriteImage,
  'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=240&q=80',
  'Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=240&q=80',
  'Lassi': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=240&q=80',
  'Sweet': rasgullaImage,
  'Chinese': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=240&q=80',
  'Noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=80',
  'Chat': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=240&q=80',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=240&q=80',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=240&q=80',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=240&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=240&q=80',
};

export function getCategoryThumbnail(category: string): string {
  return CATEGORY_THUMBNAILS[category] || DEFAULT_CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=240&q=80';
}

