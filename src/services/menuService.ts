import { MenuItem, DeliveryInfo } from '../types';
import rasgullaImage from '../assets/images/rasgulla_sweet_1789648884402.jpg';
import spriteImage from '../assets/images/sprite_cold_drink_1789649786782.jpg';

export const GOOGLE_SHEET_ENDPOINT = 'https://docs.google.com/spreadsheets/d/1qVLdRKkLlQHDKtC7iZr4O1E-wSpNAjXzEssM-Zsb4og/gviz/tq?tqx=out:json&sheet=Menudata';
export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHl-grnqg64pbYukq0WnDK73opMdgZ8n1WP7bxcdx7xO0NXJBw7jJPSX_aEnQtfFGLqA/exec';
export const CACHE_STORAGE_KEY = 'cafe_menu_cached_data_v1';
export const CACHE_TIME_KEY = 'cafe_menu_last_synced_v1';
export const DELIVERY_CACHE_KEY = 'cafe_delivery_info_v1';
export const TABLES_CACHE_KEY = 'cafe_tables_v1';

export function parseTablesFromGviz(rawText: string): string[] {
  const tables: string[] = [];
  try {
    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonString = rawText.substring(startIdx, endIdx + 1);
      const data = JSON.parse(jsonString);

      if (data?.table?.rows) {
        for (const row of data.table.rows) {
          if (!row.c) continue;
          const cellT = row.c[19]; // Col T is index 19 (A=0, ..., T=19)
          const valT = cellT
            ? cellT.f !== undefined && cellT.f !== null
              ? String(cellT.f)
              : cellT.v !== undefined && cellT.v !== null
              ? String(cellT.v)
              : ''
            : '';
          const trimmed = valT.trim();
          if (
            trimmed.length > 0 &&
            trimmed.toLowerCase() !== 'table' &&
            !tables.includes(trimmed)
          ) {
            tables.push(trimmed);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error parsing table list from sheet Column T:', err);
  }

  if (tables.length === 0) {
    return [
      'Table 1',
      'Table 2',
      'Table 3',
      'Table 4',
      'Table 5',
      'Table 6',
      'Table 7',
      'Table 8',
      'Table 9',
      'Table 10',
    ];
  }

  return tables;
}

export function parseFreeDeliveryThreshold(desc: string): number | null {
  if (!desc) return null;
  // Match patterns like "400 rupay", "500 ka item", "₹400", "orders above 400", "400+"
  const match = desc.match(
    /(?:above|over|more than|orders of|item|rupay|rs|₹)?\s*(\d{2,5})\s*(?:rupay|rs|₹|rupees|ka item|ka|ke|\+)?/i
  );
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val >= 50) return val;
  }
  return null;
}

export function parseDeliveryInfo(rawText: string): DeliveryInfo {
  let deliveryValue = 40;
  let deliveryDescription = '';

  try {
    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonString = rawText.substring(startIdx, endIdx + 1);
      const data = JSON.parse(jsonString);

      if (data?.table?.rows) {
        for (const row of data.table.rows) {
          if (!row.c) continue;
          const cellR = row.c[17]; // Col R: deliveryvalue
          const cellS = row.c[18]; // Col S: deliverydescription

          const valR = cellR ? (cellR.f !== undefined && cellR.f !== null ? String(cellR.f) : cellR.v !== undefined && cellR.v !== null ? String(cellR.v) : '') : '';
          const valS = cellS ? (cellS.f !== undefined && cellS.f !== null ? String(cellS.f) : cellS.v !== undefined && cellS.v !== null ? String(cellS.v) : '') : '';

          if (valR && !isNaN(Number(valR.replace(/[^\d.]/g, '')))) {
            const num = Number(valR.replace(/[^\d.]/g, ''));
            if (num > 0) deliveryValue = num;
          }
          if (valS && valS.trim().length > 0) {
            deliveryDescription = valS.trim();
          }
          if (deliveryDescription && deliveryValue) break;
        }
      }
    }
  } catch (err) {
    console.error('Error parsing delivery info from sheet:', err);
  }

  const freeDeliveryThreshold = parseFreeDeliveryThreshold(deliveryDescription) || 400;

  return {
    deliveryValue,
    deliveryDescription,
    freeDeliveryThreshold,
  };
}

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
    const rawHalfPrice = cleanPrice(getColValue(3));
    const rawFullPrice = cleanPrice(getColValue(4));
    const rawRegularPrice = cleanPrice(getColValue(5));
    const rawMediumPrice = cleanPrice(getColValue(6));
    const rawLargePrice = cleanPrice(getColValue(7));
    const notes = getColValue(8);

    // Sanitize prices: prevent dates like "01/10/2026" or accidentally overwritten values
    const isDate = (val: string | null) => Boolean(val && (val.includes('/') || (val.includes('-') && val.length > 5)));
    const isDrinks = category.toLowerCase().includes('drink') || category.toLowerCase().includes('beverage') || category.toLowerCase().includes('coffee');

    const halfPrice = isDrinks ? null : rawHalfPrice;
    const fullPrice = isDrinks ? null : rawFullPrice;
    const regularPrice = (isDrinks || rawRegularPrice === '0') ? null : rawRegularPrice;
    const mediumPrice = (isDate(rawMediumPrice) || isDrinks) ? null : rawMediumPrice;
    const largePrice = isDrinks ? null : rawLargePrice;

    // Column K index is 10 (A=0, B=1, ... K=10): Stockdeduct column in Excel / Google Sheet
    const rawStockK = getColValue(10);
    const parsedStockK = rawStockK !== null && !isNaN(Number(rawStockK)) ? Number(rawStockK) : undefined;

    // Column M index is 12 (A=0, B=1, ... M=12): Offers column (Owner promotional offers/discounts e.g. "67%off")
    const rawOffer = getColValue(12);
    const offer =
      rawOffer && rawOffer.trim().length > 0 && rawOffer.trim() !== '0'
        ? rawOffer.trim()
        : null;

    const videoUrl = getColValue(15);
    // Column Q index is 16 (A=0, B=1, ... Q=16)
    const rawImageUrl = getColValue(16);
    const imageUrl = rawImageUrl && rawImageUrl.trim().length > 0 ? rawImageUrl.trim() : null;

    items.push({
      id: `menu-item-${index + 1}`,
      category,
      name: itemName,
      stock: parsedStockK,
      offer,
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

export async function fetchMenuData(): Promise<{
  items: MenuItem[];
  timestamp: string;
  fromCache: boolean;
  deliveryInfo: DeliveryInfo;
  tables: string[];
}> {
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

    const deliveryInfo = parseDeliveryInfo(rawText);
    const tables = parseTablesFromGviz(rawText);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Cache the good data
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(CACHE_TIME_KEY, timestamp);
      localStorage.setItem(DELIVERY_CACHE_KEY, JSON.stringify(deliveryInfo));
      localStorage.setItem(TABLES_CACHE_KEY, JSON.stringify(tables));
    } catch {
      // localStorage may be unavailable in some iframe configurations
    }

    return { items, timestamp, fromCache: false, deliveryInfo, tables };
  } catch (error) {
    // 3. Fallback: Check localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_STORAGE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY) || 'Previously cached';
      let cachedDelivery: DeliveryInfo = {
        deliveryValue: 50,
        deliveryDescription: '',
        freeDeliveryThreshold: 400,
      };
      try {
        const dRaw = localStorage.getItem(DELIVERY_CACHE_KEY);
        if (dRaw) cachedDelivery = JSON.parse(dRaw);
      } catch {
        // ignore
      }

      let cachedTables: string[] = [];
      try {
        const tRaw = localStorage.getItem(TABLES_CACHE_KEY);
        if (tRaw) cachedTables = JSON.parse(tRaw);
      } catch {
        // ignore
      }
      if (cachedTables.length === 0) {
        cachedTables = [
          'Table 1',
          'Table 2',
          'Table 3',
          'Table 4',
          'Table 5',
          'Table 6',
          'Table 7',
          'Table 8',
          'Table 9',
          'Table 10',
        ];
      }

      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            items: parsed,
            timestamp: cachedTime,
            fromCache: true,
            deliveryInfo: cachedDelivery,
            tables: cachedTables,
          };
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
  'Pizza': '🍕',
  'Coffee': '☕',
  'Shakes': '🧋',
  'Lassi': '🥛',
  'Sweet': '🍮',
  'Chinese': '🥢',
  'Noodles': '🍜',
  'Chat': '🥘',
  'Burger': '🍔',
  'Sandwich': '🥪',
  'Pasta': '🍝',
  'Drinks': '🥤',
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
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
  'Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80',
  'Lassi': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
  'Sweet': rasgullaImage,
  'Chinese': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=400&q=80',
  'Noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
  'Chat': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80',
  'Drinks': spriteImage,
};

export function getItemImageUrl(item: MenuItem): string {
  if (item.imageUrl && item.imageUrl.trim().length > 0) {
    return item.imageUrl.trim();
  }
  return DEFAULT_CATEGORY_IMAGES[item.category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
}

export const CATEGORY_THUMBNAILS: Record<string, string> = {
  'All': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=240&q=80',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=240&q=80',
  'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=240&q=80',
  'Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=240&q=80',
  'Lassi': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=240&q=80',
  'Sweet': rasgullaImage,
  'Chinese': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=240&q=80',
  'Noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=80',
  'Chat': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=240&q=80',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=240&q=80',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=240&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=240&q=80',
  'Drinks': spriteImage,
};

export function getCategoryThumbnail(category: string): string {
  return CATEGORY_THUMBNAILS[category] || DEFAULT_CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=240&q=80';
}

/**
 * Sorts category list so that Pizza is always at position #1,
 * and Drink/Drinks is always at the very last position.
 */
export function sortCustomCategories(cats: string[]): string[] {
  const pizzaList: string[] = [];
  const drinksList: string[] = [];
  const middleList: string[] = [];

  cats.forEach((cat) => {
    const lower = cat.toLowerCase().trim();
    if (lower === 'pizza' || lower.includes('pizza')) {
      pizzaList.push(cat);
    } else if (lower === 'drinks' || lower === 'drink' || lower.includes('drink')) {
      drinksList.push(cat);
    } else {
      middleList.push(cat);
    }
  });

  return [...pizzaList, ...middleList, ...drinksList];
}

