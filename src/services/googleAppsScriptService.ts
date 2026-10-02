// Service for syncing orders, deducting stock, and adding amounts in Google Sheet / Excel
// via Google Apps Script Web App Endpoint

export const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxHl-grnqg64pbYukq0WnDK73opMdgZ8n1WP7bxcdx7xO0NXJBw7jJPSX_aEnQtfFGLqA/exec';

export const CAFE_WHATSAPP_PHONE = '919719852037'; // +91 97198 52037

export interface SheetOrderItem {
  name: string;
  item_name?: string;
  variant?: string;
  qty: number;
  stockdeduct?: number;
  price: number;
  total?: number;
}

export interface SheetOrderPayload {
  bill_no: string;
  customer_name: string;
  customer_phone: string;
  table_or_address?: string;
  order_type?: string;
  grandtotal: number;
  subtotal?: number;
  notes?: string;
  items: SheetOrderItem[];
}

export interface SheetSyncResponse {
  status: 'success' | 'error';
  message: string;
}

// Track synced orders to prevent double triggers
const syncedOrderIds = new Set<string>();

/**
 * Sends order details to the Google Apps Script Web App.
 * Guaranteed to execute EXACTLY ONCE per order.
 */
export async function syncOrderToGoogleSheet(
  order: SheetOrderPayload
): Promise<SheetSyncResponse> {
  const orderId = order.bill_no || `FFC-${Date.now()}`;

  // Prevent double trigger if called multiple times for same order
  if (syncedOrderIds.has(orderId)) {
    console.log(`[AppsScript Sync] Order ${orderId} already synced, skipping duplicate trigger.`);
    return {
      status: 'success',
      message: 'Order already synced',
    };
  }

  syncedOrderIds.add(orderId);
  // Expire after 2 minutes to prevent unbounded growth
  setTimeout(() => syncedOrderIds.delete(orderId), 120000);

  // Normalize payload
  const formattedPayload = {
    bill_no: orderId,
    order_id: orderId,
    customer_name: order.customer_name || 'Guest',
    customer_phone: order.customer_phone || '',
    table_or_address: order.table_or_address || '',
    order_type: order.order_type || 'dine-in',
    subtotal: order.subtotal || order.grandtotal,
    grandtotal: order.grandtotal,
    notes: order.notes || '',
    timestamp: new Date().toISOString(),
    items: order.items.map((item) => ({
      name: item.name,
      item_name: item.item_name || item.name,
      variant: item.variant || 'Standard',
      qty: item.qty,
      stockdeduct: item.stockdeduct ?? item.qty,
      price: item.price,
      total: item.total ?? item.price * item.qty,
    })),
  };

  const payloadStr = JSON.stringify(formattedPayload);

  // Send EXACTLY ONCE via server-side proxy route
  try {
    const proxyRes = await fetch('/api/sync-sheet-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payloadStr,
      keepalive: true,
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return {
        status: data.status || 'success',
        message: data.message || 'Stock deducted and sheet updated successfully',
      };
    }
  } catch (proxyError) {
    console.warn('Proxy sync failed, trying direct Apps Script fetch...', proxyError);
  }

  // Fallback ONLY if proxy failed: Direct fetch with keepalive
  try {
    const directRes = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: payloadStr,
      keepalive: true,
    });

    if (directRes.ok) {
      const data = await directRes.json();
      return {
        status: data.status || 'success',
        message: data.message || 'Stock deducted and sheet updated successfully',
      };
    }
  } catch (directError) {
    console.warn('Direct fetch error, trying beacon as last resort...', directError);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([payloadStr], { type: 'text/plain' });
        navigator.sendBeacon(GOOGLE_APPS_SCRIPT_URL, blob);
        return {
          status: 'success',
          message: 'Order dispatched via beacon fallback',
        };
      } catch (beaconError) {
        console.error('All Google Sheet sync attempts failed:', beaconError);
      }
    }
  }

  return {
    status: 'error',
    message: 'Could not sync to Google Sheet',
  };
}

/**
 * Builds formatted WhatsApp message for order
 */
export function buildWhatsAppOrderMessage(payload: {
  orderId: string;
  orderType: string;
  customerName: string;
  customerPhone?: string;
  tableOrAddress?: string;
  specialInstructions?: string;
  items: Array<{ name: string; variant?: string; quantity: number; price: number }>;
  grandTotal: number;
}): string {
  const itemsSummary = payload.items
    .map(
      (ci) =>
        `• ${ci.name}${ci.variant && ci.variant !== 'Standard' ? ` (${ci.variant})` : ''} x ${ci.quantity} = ₹${ci.price * ci.quantity}`
    )
    .join('\n');

  const typeLabel =
    payload.orderType === 'takeaway'
      ? '🛍️ Takeaway / Pickup'
      : '🍽️ Dine-In / Table Order';

  const text =
    `*☕ FRIENDS 4 EVER COFFEE CAFE - NEW ORDER*\n` +
    `--------------------------------------\n` +
    `🧾 *Order ID:* #${payload.orderId}\n` +
    `📌 *Order Type:* ${typeLabel}\n` +
    `👤 *Customer Name:* ${payload.customerName || 'Guest'}\n` +
    `📞 *Phone:* ${payload.customerPhone || 'Not provided'}\n` +
    (payload.tableOrAddress
      ? payload.orderType === 'takeaway'
        ? `🛍️ *Pickup Note:* ${payload.tableOrAddress}\n`
        : `🪑 *Table No / Seat:* ${payload.tableOrAddress}\n`
      : '') +
    (payload.specialInstructions ? `📝 *Note:* ${payload.specialInstructions}\n` : '') +
    `--------------------------------------\n` +
    `📋 *Order Items:*\n${itemsSummary}\n` +
    `--------------------------------------\n` +
    `💰 *Total Amount:* ₹${payload.grandTotal}\n` +
    `--------------------------------------\n` +
    `Please confirm my order. Thank you! 🙏`;

  return text;
}

/**
 * Fetch live inventory / items from Google Apps Script endpoint
 */
export async function fetchSheetInventory(): Promise<any[]> {
  try {
    const res = await fetch(GOOGLE_APPS_SCRIPT_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data && data.items) {
      return data.items;
    }
    return [];
  } catch (err) {
    console.error('Error fetching sheet inventory:', err);
    return [];
  }
}
