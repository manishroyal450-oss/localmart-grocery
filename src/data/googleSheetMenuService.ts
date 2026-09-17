import Papa from 'papaparse';
import { MenuItem } from '../types';
import { RESTAURANT_MENU_ITEMS } from './restaurantMenu';

export const DEFAULT_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1Bd9xQ2BTnxARhGstlfxJIYzMJCmgZbGUV5CVFs8CL64/gviz/tq?tqx=out:csv';

const CATEGORY_IMAGE_MAP: { [key: string]: string } = {
  'PIZZA': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'BURGER': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'MOMOS': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80',
  'NOODLES': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  'CHINESE STARTER': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
  'SOUTH INDIAN EXPRESS': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
  'CHAAT KA CHASKA': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  'GOLGAPPE': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  'GRILLED SANDWICH': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'DESSERT': 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
  'PASTRY': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  'BEVERAGES': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
  'FAST FOOD': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  'PASTA': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281216?auto=format&fit=crop&w=800&q=80',
  'RICE \'N\' MAGGIE': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  'SOUP': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  'KATHI ROLL': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
};

const getItemImage = (name: string, category: string, rawImageUrl?: string): string => {
  if (rawImageUrl && rawImageUrl.startsWith('http')) {
    return rawImageUrl;
  }

  const nameLower = name.toLowerCase();
  if (nameLower.includes('tea') || nameLower.includes('chai')) return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('coffee')) return 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('lassi')) return 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('momo')) return 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('dosa')) return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('chole') || nameLower.includes('bhature')) return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('gulab jamun') || nameLower.includes('rasgulla') || nameLower.includes('rasmalai')) return 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('noodle') || nameLower.includes('chowmein')) return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80';
  if (nameLower.includes('fries') || nameLower.includes('manchurian')) return 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80';

  const catUpper = category.toUpperCase().trim();
  return CATEGORY_IMAGE_MAP[catUpper] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
};

const parsePriceNumber = (priceStr: string | number | undefined): number => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  
  const clean = String(priceStr).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  if (!isNaN(parsed) && parsed > 0) return parsed;
  
  if (String(priceStr).toUpperCase().includes('MRP')) return 20;
  return 0;
};

export const sheetItemsRegistry: { [id: string]: MenuItem } = {};

export interface FetchMenuResult {
  items: MenuItem[];
  categories: string[];
  source: 'sheet' | 'fallback';
  error?: string;
}

export async function fetchGoogleSheetMenu(url: string = DEFAULT_SHEET_CSV_URL): Promise<FetchMenuResult> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: false, // Parse as raw 2D array first to handle multi-line header title rows
        skipEmptyLines: true,
        complete: (results) => {
          const rawRows = results.data as string[][];
          
          if (!rawRows || rawRows.length === 0) {
            resolve({
              items: RESTAURANT_MENU_ITEMS,
              categories: ['All Dishes'],
              source: 'fallback',
              error: 'CSV empty'
            });
            return;
          }

          // Look for column header row (contains 'Category' or 'Item Name' or 'Item')
          let headerIndex = -1;
          for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
            const rowStr = rawRows[i].join(' ').toLowerCase();
            if (rowStr.includes('category') || rowStr.includes('item name') || rowStr.includes('item_name')) {
              headerIndex = i;
              break;
            }
          }

          const items: MenuItem[] = [];
          const categoriesSet = new Set<string>();

          if (headerIndex !== -1) {
            const headers = rawRows[headerIndex].map((h) => h.trim().toLowerCase());
            
            const catCol = headers.findIndex((h) => h.includes('category'));
            const nameCol = headers.findIndex((h) => h.includes('item name') || h.includes('item_name') || h.includes('item'));
            const descCol = headers.findIndex((h) => h.includes('description') || h.includes('portion'));
            const halfPriceCol = headers.findIndex((h) => h.includes('half') || h.includes('single price'));
            const fullPriceCol = headers.findIndex((h) => h.includes('full') || h.includes('double price') || h.includes('price'));
            const imageCol = headers.findIndex((h) => h.includes('image'));

            for (let i = headerIndex + 1; i < rawRows.length; i++) {
              const row = rawRows[i];
              if (!row || row.length < 2) continue;

              const categoryRaw = catCol !== -1 && row[catCol] ? row[catCol].trim() : 'General Menu';
              const itemName = nameCol !== -1 && row[nameCol] ? row[nameCol].trim() : '';

              if (!itemName || itemName.toLowerCase().includes('category') || itemName.toLowerCase().includes('item name')) {
                continue;
              }

              const descPortion = descCol !== -1 && row[descCol] ? row[descCol].trim() : '';
              const halfPriceRaw = halfPriceCol !== -1 && row[halfPriceCol] ? row[halfPriceCol].trim() : '';
              const fullPriceRaw = fullPriceCol !== -1 && row[fullPriceCol] ? row[fullPriceCol].trim() : '';
              const imageRaw = imageCol !== -1 && row[imageCol] ? row[imageCol].trim() : '';

              const fullPriceNum = parsePriceNumber(fullPriceRaw);
              const halfPriceNum = parsePriceNumber(halfPriceRaw);

              const finalPrice = fullPriceNum > 0 ? fullPriceNum : (halfPriceNum > 0 ? halfPriceNum : 100);
              const originalPrice = Math.round(finalPrice * 1.2);

              let unit = '1 Portion';
              if (descPortion && descPortion !== '-' && descPortion.toLowerCase() !== 'half / full') {
                unit = descPortion;
              } else if (halfPriceNum > 0 && fullPriceNum > 0) {
                unit = `Half: ₹${halfPriceNum} / Full: ₹${fullPriceNum}`;
              }

              const categoryFormatted = categoryRaw.charAt(0).toUpperCase() + categoryRaw.slice(1);
              categoriesSet.add(categoryFormatted);

              const id = `sheet-${i}-${itemName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              const menuItem: MenuItem = {
                id,
                name: itemName,
                category: categoryFormatted,
                price: finalPrice,
                originalPrice: originalPrice,
                unit: unit,
                stock: 50,
                image: getItemImage(itemName, categoryRaw, imageRaw),
                description: descPortion && descPortion !== '-' ? `${descPortion}. Freshly cooked to order in Quality Restaurant & Cafe.` : `Delicious ${itemName} prepared fresh daily in Quality Restaurant & Cafe kitchen.`,
                isAvailable: true,
                isVeg: true,
                spicyLevel: itemName.toLowerCase().includes('spicy') || categoryRaw.toLowerCase().includes('chinese') ? 'Spicy' : 'Medium',
                prepTime: '10-20 mins',
                rating: 4.8,
                reviewsCount: 150 + (i * 3) % 200,
                isChefSpecial: itemName.toLowerCase().includes('special') || i % 5 === 0
              };

              items.push(menuItem);
              sheetItemsRegistry[id] = menuItem;
            }
          } else {
            // Fallback parsing if headers row isn't found
            for (let i = 0; i < rawRows.length; i++) {
              const row = rawRows[i];
              if (!row || row.length < 2) continue;

              const categoryRaw = row[0] ? row[0].trim() : 'General Menu';
              const itemName = row[1] ? row[1].trim() : '';

              if (!itemName || itemName.toLowerCase().includes('item name') || itemName.toLowerCase().includes('quality restaurant')) continue;

              const descPortion = row[2] ? row[2].trim() : '';
              const halfPriceRaw = row[3] ? row[3].trim() : '';
              const fullPriceRaw = row[4] ? row[4].trim() : '';

              const fullPriceNum = parsePriceNumber(fullPriceRaw);
              const halfPriceNum = parsePriceNumber(halfPriceRaw);
              const finalPrice = fullPriceNum > 0 ? fullPriceNum : (halfPriceNum > 0 ? halfPriceNum : 100);

              categoriesSet.add(categoryRaw);

              const id = `sheet-fallback-${i}`;
              const item: MenuItem = {
                id,
                name: itemName,
                category: categoryRaw,
                price: finalPrice,
                originalPrice: Math.round(finalPrice * 1.25),
                unit: descPortion && descPortion !== '-' ? descPortion : '1 Portion',
                stock: 50,
                image: getItemImage(itemName, categoryRaw),
                description: descPortion && descPortion !== '-' ? descPortion : `Freshly prepared ${itemName}`,
                isAvailable: true,
                isVeg: true,
                spicyLevel: 'Medium',
                prepTime: '15 mins',
                rating: 4.8,
                reviewsCount: 120,
                isChefSpecial: itemName.toLowerCase().includes('special')
              };
              items.push(item);
              sheetItemsRegistry[id] = item;
            }
          }

          if (items.length > 0) {
            resolve({
              items,
              categories: ['All Dishes', ...Array.from(categoriesSet)],
              source: 'sheet'
            });
          } else {
            resolve({
              items: RESTAURANT_MENU_ITEMS,
              categories: ['All Dishes', 'Thalis & Meals', 'Fast Food & Chinese', 'Snacks & Chaat', 'South Indian', 'Beverages & Shakes', 'Desserts & Sweets'],
              source: 'fallback',
              error: 'No valid items found in CSV'
            });
          }
        },
        error: (err) => {
          resolve({
            items: RESTAURANT_MENU_ITEMS,
            categories: ['All Dishes', 'Thalis & Meals', 'Fast Food & Chinese', 'Snacks & Chaat', 'South Indian', 'Beverages & Shakes', 'Desserts & Sweets'],
            source: 'fallback',
            error: err.message
          });
        }
      });
    });
  } catch (err: any) {
    return {
      items: RESTAURANT_MENU_ITEMS,
      categories: ['All Dishes', 'Thalis & Meals', 'Fast Food & Chinese', 'Snacks & Chaat', 'South Indian', 'Beverages & Shakes', 'Desserts & Sweets'],
      source: 'fallback',
      error: err?.message || 'Failed to fetch Google Sheet'
    };
  }
}
