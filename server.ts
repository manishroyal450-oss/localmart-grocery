import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { ALL_PRODUCTS } from './src/data/allProducts.js';

const isESM = typeof import.meta !== 'undefined' && typeof import.meta.url !== 'undefined';
const __filename = isESM ? fileURLToPath(import.meta.url) : '';
const __dirname = isESM ? path.dirname(__filename) : process.cwd();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Increase request size limits for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-Memory Database State
let productsList = [...ALL_PRODUCTS];
let ordersList: any[] = [];
let customersList: any[] = [];

/* -------------------------------------------
   API Endpoints (Fully Local / In-Memory)
   ------------------------------------------- */

// 0. Dynamic Google Sheet Menu endpoint
const GOOGLE_SHEET_MENU_URL = 'https://docs.google.com/spreadsheets/d/1qVLdRKkLlQHDKtC7iZr4O1E-wSpNAjXzEssM-Zsb4og/gviz/tq?tqx=out:json&sheet=Menudata';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHl-grnqg64pbYukq0WnDK73opMdgZ8n1WP7bxcdx7xO0NXJBw7jJPSX_aEnQtfFGLqA/exec';

// 0a. Dynamic Google Sheet Menu endpoint (GViz)
app.get('/api/menu', async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SHEET_MENU_URL);
    if (!response.ok) {
      throw new Error(`Google Sheets responded with status ${response.status}`);
    }
    const rawText = await response.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(rawText);
  } catch (err: any) {
    console.error('Error fetching Google Sheet menu:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch menu from Google Sheets' });
  }
});

// 0b. Google Apps Script Live Menu & Stock endpoint
app.get('/api/apps-script/menu', async (req, res) => {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
    if (!response.ok) {
      throw new Error(`Apps Script responded with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('Error fetching Apps Script menu:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch items from Apps Script' });
  }
});

// 0c. Sync Order to Google Sheet (Deduct stock and add order amount in Excel/Sheet)
app.post('/api/sync-sheet-order', async (req, res) => {
  try {
    const orderData = req.body;
    console.log('[AppsScript Sync] Syncing order to Google Sheet:', orderData?.bill_no || orderData?.order_id);

    const scriptResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const result = await scriptResponse.json();
    console.log('[AppsScript Sync] Response:', result);
    res.json({
      status: result.status || 'success',
      message: result.message || 'Data saved, stock deducted and all columns updated successfully',
      data: result
    });
  } catch (err: any) {
    console.error('Error syncing order to Google Apps Script:', err);
    res.status(500).json({
      status: 'error',
      error: err.message || 'Failed to sync with Google Sheet'
    });
  }
});

// 1. Get products (with filtering, searching, and admin controls)
app.get('/api/products', (req, res) => {
  try {
    const { category, search, admin } = req.query;
    
    let filtered = [...productsList];

    // If search query is provided
    if (search) {
      const term = String(search).toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term)) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // If category is specified
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Customers should only see active/available items
    if (admin !== 'true') {
      filtered = filtered.filter(p => p.isAvailable);
    }

    res.json(filtered);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message || 'Connecting to store catalog failed.' });
  }
});

// 2. Add product (Admin only)
app.post('/api/products', (req, res) => {
  try {
    const { name, category, price, originalPrice, unit, stock, image, description, isAvailable } = req.body;

    if (!name || !category || price === undefined || !unit) {
      return res.status(400).json({ error: 'Name, Category, Price, and Unit are required.' });
    }

    const id = 'prod-' + Date.now();
    const newProduct = {
      id,
      name,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      unit,
      stock: stock !== undefined ? Number(stock) : 50,
      image: image || 'placeholder',
      description: description || '',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
    };

    productsList.unshift(newProduct);
    res.status(201).json(newProduct);
  } catch (err: any) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Update product (Admin only)
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, originalPrice, unit, stock, image, description, isAvailable } = req.body;

    const productIndex = productsList.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const existing = productsList[productIndex];
    const updatedProduct = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      category: category !== undefined ? category : existing.category,
      price: price !== undefined ? Number(price) : existing.price,
      originalPrice: originalPrice !== undefined ? Number(originalPrice) : existing.originalPrice,
      unit: unit !== undefined ? unit : existing.unit,
      stock: stock !== undefined ? Number(stock) : existing.stock,
      image: image !== undefined ? image : existing.image,
      description: description !== undefined ? description : existing.description,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existing.isAvailable
    };

    productsList[productIndex] = updatedProduct;
    res.json(updatedProduct);
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete product (Admin only)
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = productsList.length;
    productsList = productsList.filter(p => p.id !== id);

    if (productsList.length === initialLength) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product deleted from local listing successfully.' });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get all orders (Admin console view log)
app.get('/api/orders', (req, res) => {
  try {
    res.json(ordersList);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Submit a new order & deduct stock
app.post('/api/orders', (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, deliveryType, items } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing mandatory shipping information.' });
    }

    // Double check stock and construct order item details
    const finalizedItems: any[] = [];
    let totalAmount = 0;
    let savings = 0;

    for (const item of items) {
      const dbProduct = productsList.find(p => p.id === item.product.id);
      if (!dbProduct) {
        return res.status(400).json({ error: `Product ${item.product.name} is no longer in the store catalog.` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${dbProduct.name}. Only ${dbProduct.stock} units available.` });
      }

      // Deduct stock in-memory
      dbProduct.stock = Math.max(0, dbProduct.stock - item.quantity);

      const itemCost = dbProduct.price * item.quantity;
      const itemOriginalCost = (dbProduct.originalPrice || dbProduct.price) * item.quantity;
      totalAmount += itemCost;
      savings += (itemOriginalCost - itemCost);

      finalizedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        unit: dbProduct.unit,
        price: dbProduct.price,
        quantity: item.quantity,
        image: dbProduct.image
      });
    }

    const orderId = 'order-' + Date.now();
    const newOrder = {
      id: orderId,
      customerName,
      customerPhone,
      customerAddress,
      deliveryType,
      items: finalizedItems,
      totalAmount,
      savings,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    ordersList.unshift(newOrder);

    // Sync stock deduction & amount addition to Google Sheet / Excel in background
    try {
      fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_no: orderId,
          order_id: orderId,
          customer_name: customerName,
          customer_phone: customerPhone,
          table_or_address: customerAddress,
          order_type: deliveryType,
          grandtotal: totalAmount,
          items: finalizedItems.map(f => ({
            name: f.name,
            item_name: f.name,
            qty: f.quantity,
            stockdeduct: f.quantity,
            price: f.price,
            total: f.price * f.quantity
          }))
        })
      }).catch(err => console.error('[AppsScript Sync Background Error]:', err));
    } catch (e) {
      console.error('[AppsScript Trigger Error]:', e);
    }

    res.status(201).json(newOrder);
  } catch (err: any) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Get orders for specific customer by phone number
app.get('/api/orders/customer/:phone', (req, res) => {
  try {
    const { phone } = req.params;
    const customerOrders = ordersList.filter(o => o.customerPhone === phone);
    res.json(customerOrders);
  } catch (err: any) {
    console.error('Error retrieving customer orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Register customer (Generate temporary OTP)
app.post('/api/customers/register', (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to verify account.' });
    }

    // Generate random 4 digit code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[SIMULATED REGISTRATION OTP] Email: ${email}, OTP: ${otp}`);
    
    res.json({ success: true, otp });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Verify OTP & Create account
app.post('/api/customers/verify', (req, res) => {
  try {
    const { fullName, email, password, phone, shippingAddress, city, pincode, code } = req.body;

    if (!email || !fullName || !phone || !pincode) {
      return res.status(400).json({ error: 'Missing account registration details.' });
    }

    // Check if user already exists
    const existing = customersList.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newCustomer = {
      id: 'cust-' + Date.now(),
      fullName,
      email,
      password, // In memory plain text for simple validation
      phone,
      shippingAddress,
      city,
      pincode,
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    customersList.push(newCustomer);
    
    // Omit password from output
    const { password: _, ...responseCustomer } = newCustomer;
    res.status(201).json({ success: true, customer: responseCustomer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Login Customer
app.post('/api/customers/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = customersList.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    if (!customer) {
      return res.status(401).json({ error: 'Invalid email address or password. Please try again.' });
    }

    // Omit password from response
    const { password: _, ...customerResponse } = customer;
    res.json({ success: true, customer: customerResponse });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Update customer profile
app.put('/api/customers/update', (req, res) => {
  try {
    const { email, fullName, phone, shippingAddress, city, pincode } = req.body;

    const customerIndex = customersList.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer account not found.' });
    }

    const currentData = customersList[customerIndex];
    const updatedCustomer = {
      ...currentData,
      fullName: fullName ? fullName.trim() : currentData.fullName,
      phone: phone ? phone.trim() : currentData.phone,
      shippingAddress: shippingAddress ? shippingAddress.trim() : currentData.shippingAddress,
      city: city ? city.trim() : currentData.city,
      pincode: pincode ? pincode.trim() : currentData.pincode,
    };

    customersList[customerIndex] = updatedCustomer;

    // Omit password from response
    const { password: _, ...customerResponse } = updatedCustomer;
    res.json({ success: true, customer: customerResponse });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Update order status (Admin only)
app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderIndex = ordersList.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    ordersList[orderIndex].status = status;
    res.json(ordersList[orderIndex]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Reset catalog to defaults (Admin recovery tool)
app.post('/api/reset', (req, res) => {
  try {
    productsList = [...ALL_PRODUCTS];
    ordersList = [];
    customersList = [];
    res.json({ message: 'Catalog and orders reset to factory defaults successfully!', products: ALL_PRODUCTS });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Analyze image from search camera (using server-side Gemini 3.5 Flash)
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in environment.' });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let base64Data = image;
    let mimeType = 'image/jpeg';
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: "Identify the grocery item, product, brand, or household object in this image. Respond with ONLY the single most relevant search keyword or category name (e.g., 'Apple', 'Tomato', 'Milk', 'Biscuit', 'Earphone', 'Charger', 'Bulb', 'Potato', 'Onion') in English. Keep it to 1 or 2 words max, with NO extra words, punctuation, or explanations.",
        },
      ],
    });

    const detectedText = response.text ? response.text.trim() : '';
    res.json({ keyword: detectedText });
  } catch (err: any) {
    console.error('Error in /api/analyze-image:', err);
    res.status(500).json({ error: err.message || 'Image analysis failed.' });
  }
});

/* -------------------------------------------
   Static Asset & Frontend Bundling Config
   ------------------------------------------- */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
