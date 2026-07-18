import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { ALL_PRODUCTS } from './src/data/allProducts.js';

const isESM = typeof import.meta !== 'undefined' && typeof import.meta.url !== 'undefined';
const __filename = isESM ? fileURLToPath(import.meta.url) : '';
const __dirname = isESM ? path.dirname(__filename) : process.cwd();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Increase request size limits for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Load configuration from firebase-applet-config.json
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Initial default products list
const defaultProducts = [
  {
    id: 'prod-1',
    name: 'Fresh Farm Tomatoes',
    category: 'Fruits & Vegetables',
    price: 40,
    originalPrice: 50,
    unit: '1 kg',
    stock: 120,
    image: 'tomato-placeholder',
    description: 'Farm-fresh, juicy red tomatoes. Ideal for salads, curries, and soups.',
    isAvailable: true
  },
  {
    id: 'prod-2',
    name: 'Organic Potatoes',
    category: 'Fruits & Vegetables',
    price: 25,
    originalPrice: 30,
    unit: '1 kg',
    stock: 150,
    image: 'potato-placeholder',
    description: 'Fresh organic potatoes directly sourced from local farms.',
    isAvailable: true
  },
  {
    id: 'prod-3',
    name: 'Fresh Red Onions',
    category: 'Fruits & Vegetables',
    price: 35,
    originalPrice: 45,
    unit: '1 kg',
    stock: 140,
    image: 'onion-placeholder',
    description: 'Sharp and flavor-rich red onions, essential for every kitchen.',
    isAvailable: true
  },
  {
    id: 'prod-4',
    name: 'Sweet Bananas (Dozen)',
    category: 'Fruits & Vegetables',
    price: 50,
    originalPrice: 60,
    unit: '1 Dozen',
    stock: 45,
    image: 'banana-placeholder',
    description: 'Perfectly ripe, sweet, and energy-packed bananas.',
    isAvailable: true
  },
  {
    id: 'prod-5',
    name: 'Premium Red Apples',
    category: 'Fruits & Vegetables',
    price: 140,
    originalPrice: 180,
    unit: '1 kg',
    stock: 60,
    image: 'apple-placeholder',
    description: 'Crisp, sweet, and delicious high-quality red apples.',
    isAvailable: true
  },
  {
    id: 'prod-6',
    name: 'Fresh Pasteurised Milk',
    category: 'Dairy & Eggs',
    price: 62,
    originalPrice: 66,
    unit: '1 Litre',
    stock: 80,
    image: 'milk-placeholder',
    description: 'Full cream pasteurised fresh milk, rich in nutrients.',
    isAvailable: true
  },
  {
    id: 'prod-7',
    name: 'Premium Salted Butter',
    category: 'Dairy & Eggs',
    price: 55,
    originalPrice: 58,
    unit: '100 g',
    stock: 90,
    image: 'butter-placeholder',
    description: 'Rich, creamy salted butter. Perfect spread for your morning toast.',
    isAvailable: true
  },
  {
    id: 'prod-8',
    name: 'Fresh Cottage Cheese (Paneer)',
    category: 'Dairy & Eggs',
    price: 85,
    originalPrice: 95,
    unit: '200 g',
    stock: 70,
    image: 'paneer-placeholder',
    description: 'Soft, fresh, and high-protein cottage cheese (Paneer).',
    isAvailable: true
  },
  {
    id: 'prod-9',
    name: 'Farm Fresh Eggs',
    category: 'Dairy & Eggs',
    price: 45,
    originalPrice: 50,
    unit: '6 Pieces',
    stock: 100,
    image: 'eggs-placeholder',
    description: 'Healthy, clean, protein-rich farm-fresh white eggs.',
    isAvailable: true
  },
  {
    id: 'prod-10',
    name: 'Premium Basmati Rice',
    category: 'Pantry & Staples',
    price: 110,
    originalPrice: 130,
    unit: '1 kg',
    stock: 200,
    image: 'rice-placeholder',
    description: 'Long-grain, aromatic aged basmati rice for royal meals.',
    isAvailable: true
  },
  {
    id: 'prod-11',
    name: 'Chakki Fresh Atta',
    category: 'Pantry & Staples',
    price: 210,
    originalPrice: 240,
    unit: '5 kg',
    stock: 110,
    image: 'atta-placeholder',
    description: '100% pure stone-ground whole wheat flour for soft rotis.',
    isAvailable: true
  },
  {
    id: 'prod-12',
    name: 'Refined White Sugar',
    category: 'Pantry & Staples',
    price: 44,
    originalPrice: 48,
    unit: '1 kg',
    stock: 180,
    image: 'sugar-placeholder',
    description: 'Pure, sulfur-free white sugar crystals.',
    isAvailable: true
  },
  {
    id: 'prod-13',
    name: 'Refined Sunflower Oil',
    category: 'Pantry & Staples',
    price: 135,
    originalPrice: 160,
    unit: '1 Litre',
    stock: 95,
    image: 'oil-placeholder',
    description: 'Healthy, light refined sunflower oil. Ideal for daily cooking.',
    isAvailable: true
  },
  {
    id: 'prod-14',
    name: 'Split Toor Dal / Arhar Dal',
    category: 'Pantry & Staples',
    price: 145,
    originalPrice: 165,
    unit: '1 kg',
    stock: 150,
    image: 'dal-placeholder',
    description: 'Unpolished split pigeon peas (Toor dal), packed with protein.',
    isAvailable: true
  },
  {
    id: 'prod-15',
    name: 'Soft White Bread',
    category: 'Bakery & Bread',
    price: 30,
    originalPrice: 35,
    unit: '400 g',
    stock: 50,
    image: 'bread-placeholder',
    description: 'Freshly baked, soft slices of premium sandwich bread.',
    isAvailable: true
  },
  {
    id: 'prod-16',
    name: 'Choco Chip Cookies',
    category: 'Bakery & Bread',
    price: 40,
    originalPrice: 50,
    unit: '150 g',
    stock: 80,
    image: 'cookies-placeholder',
    description: 'Crunchy cookies loaded with delicious dark chocolate chips.',
    isAvailable: true
  },
  {
    id: 'prod-17',
    name: 'Premium Assam Masala Tea',
    category: 'Beverages',
    price: 95,
    originalPrice: 110,
    unit: '250 g',
    stock: 120,
    image: 'tea-placeholder',
    description: 'Strong, aromatic CTC tea blended with traditional spices.',
    isAvailable: true
  },
  {
    id: 'prod-18',
    name: 'Pure Instant Coffee',
    category: 'Beverages',
    price: 175,
    originalPrice: 195,
    unit: '100 g',
    stock: 75,
    image: 'coffee-placeholder',
    description: '100% pure soluble coffee powder with a rich, bold aroma.',
    isAvailable: true
  },
  {
    id: 'prod-19',
    name: 'Crunchy Potato Chips',
    category: 'Snacks & Sweets',
    price: 20,
    originalPrice: 25,
    unit: '100 g',
    stock: 200,
    image: 'chips-placeholder',
    description: 'Thinly sliced crispy salted potato chips, the perfect snack.',
    isAvailable: true
  },
  {
    id: 'prod-20',
    name: 'Premium Milk Chocolate Bar',
    category: 'Snacks & Sweets',
    price: 70,
    originalPrice: 80,
    unit: '80 g',
    stock: 150,
    image: 'chocolate-placeholder',
    description: 'Silky smooth, rich milk chocolate that melts in your mouth.',
    isAvailable: true
  },
  {
    id: 'prod-21',
    name: 'Active Gel Dishwash Liquid',
    category: 'Household Supplies',
    price: 99,
    originalPrice: 115,
    unit: '500 ml',
    stock: 85,
    image: 'dishwash-placeholder',
    description: 'Cuts through tough grease instantly, leaving dishes sparkling clean.',
    isAvailable: true
  },
  {
    id: 'prod-22',
    name: 'Premium Laundry Detergent',
    category: 'Household Supplies',
    price: 149,
    originalPrice: 175,
    unit: '1 kg',
    stock: 90,
    image: 'detergent-placeholder',
    description: 'Advanced dirt-removal powder formula that keeps clothes bright.',
    isAvailable: true
  },
  {
    id: 'prod-23',
    name: 'Gentle Liquid Hand Wash',
    category: 'Personal Care',
    price: 79,
    originalPrice: 95,
    unit: '250 ml',
    stock: 110,
    image: 'handwash-placeholder',
    description: 'Antibacterial hand wash with moisturizers for soft, clean hands.',
    isAvailable: true
  }
];

// Initialize and sync Firestore database
async function initializeDatabase() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (snapshot.size !== ALL_PRODUCTS.length) {
      console.log(`Firestore products collection has old data (${snapshot.size} items) or is empty. Re-seeding with updated ${ALL_PRODUCTS.length} premium products...`);
      
      // Delete old products in batches
      if (!snapshot.empty) {
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
        console.log('Old catalog cleared successfully.');
      }
      
      // Seed ALL_PRODUCTS in chunks of 100 to stay under Firestore batch limit of 500
      const batches = [];
      let currentBatch = writeBatch(db);
      let opCount = 0;
      
      for (const prod of ALL_PRODUCTS) {
        const docRef = doc(db, 'products', prod.id);
        currentBatch.set(docRef, prod);
        opCount++;
        if (opCount === 100) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          opCount = 0;
        }
      }
      if (opCount > 0) {
        batches.push(currentBatch.commit());
      }
      
      await Promise.all(batches);
      console.log(`${ALL_PRODUCTS.length} updated premium products seeded successfully!`);
    } else {
      console.log(`Firestore products collection already has ${ALL_PRODUCTS.length} updated items. Skipping seed.`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/* -------------------------------------------
   API Endpoints
   ------------------------------------------- */

// 1. Get products (with filtering, searching, and admin controls)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, admin } = req.query;
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let productsList: any[] = [];
    snapshot.forEach((doc) => {
      productsList.push(doc.data());
    });

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
    console.error('Error fetching products from Firestore:', err);
    res.status(500).json({ error: err.message || 'Connecting to store catalog failed.' });
  }
});

// 2. Add product (Admin only)
app.post('/api/products', async (req, res) => {
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

    const docRef = doc(db, 'products', id);
    await setDoc(docRef, newProduct);
    res.status(201).json(newProduct);
  } catch (err: any) {
    console.error('Error adding product to Firestore:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Update product (Admin only)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, originalPrice, unit, stock, image, description, isAvailable } = req.body;

    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const currentData = docSnap.data();
    if (!currentData) {
      return res.status(404).json({ error: 'Product data is missing.' });
    }

    const updatedProduct = {
      ...currentData,
      name: name !== undefined ? name : currentData.name,
      category: category !== undefined ? category : currentData.category,
      price: price !== undefined ? Number(price) : currentData.price,
      originalPrice: originalPrice !== undefined ? Number(originalPrice) : currentData.originalPrice,
      unit: unit !== undefined ? unit : currentData.unit,
      stock: stock !== undefined ? Number(stock) : currentData.stock,
      image: image !== undefined ? image : currentData.image,
      description: description !== undefined ? description : currentData.description,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : currentData.isAvailable
    };

    await setDoc(docRef, updatedProduct);
    res.json(updatedProduct);
  } catch (err: any) {
    console.error('Error updating product in Firestore:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete product (Admin only)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await deleteDoc(docRef);
    res.json({ message: 'Product deleted successfully', id });
  } catch (err: any) {
    console.error('Error deleting product from Firestore:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get orders (Admin/User list)
app.get('/api/orders', async (req, res) => {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    let ordersList: any[] = [];
    snapshot.forEach((doc) => {
      ordersList.push(doc.data());
    });

    // Sort by createdAt descending
    ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(ordersList);
  } catch (err: any) {
    console.error('Error fetching orders from Firestore:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5b. Get orders for specific customer by phone number
app.get('/api/orders/customer/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ error: 'Customer phone number is required' });
    }
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    let ordersList: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data && data.customerPhone === phone) {
        ordersList.push(data);
      }
    });

    // Sort by createdAt descending
    ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(ordersList);
  } catch (err: any) {
    console.error('Error fetching customer orders from Firestore:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Place order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, deliveryType, items } = req.body;

    if (!customerName || !customerPhone || !items || !items.length) {
      return res.status(400).json({ error: 'Customer name, phone, and items are required.' });
    }

    let totalAmount = 0;
    let savings = 0;
    const orderItems: any[] = [];

    // Process and update stock
    const batch = writeBatch(db);

    for (const item of items) {
      const productRef = doc(db, 'products', item.product.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return res.status(400).json({ error: `Product ${item.product.name} no longer exists.` });
      }

      const product = productSnap.data();
      if (!product) {
        return res.status(400).json({ error: `Product data for ${item.product.name} is missing.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      // Deduct stock
      batch.update(productRef, { stock: product.stock - item.quantity });
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      savings = 0;

      orderItems.push({
        id: product.id,
        name: product.name,
        unit: product.unit,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Create new order
    const orderId = 'ord-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      customerName,
      customerPhone,
      customerAddress: customerAddress || 'Store Pickup',
      deliveryType,
      items: orderItems,
      totalAmount,
      savings,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const orderRef = doc(db, 'orders', orderId);
    batch.set(orderRef, newOrder);

    // Commit stock changes and order creation together atomically!
    await batch.commit();

    res.status(201).json(newOrder);
  } catch (err: any) {
    console.error('Error placing order in Firestore:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Customer Authentication API Endpoints ---

// In-memory OTP store (temporary for verification)
const customerOtps = new Map<string, string>();

// 1. Initial register (Generates simulation OTP)
app.post('/api/customers/register', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and Full Name are required.' });
    }

    const emailKey = email.trim().toLowerCase();
    
    // Check if customer already exists in Firestore
    const customerRef = doc(db, 'customers', emailKey);
    const customerSnap = await getDoc(customerRef);

    if (customerSnap.exists()) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please sign in instead.' });
    }

    // Generate a 4-digit code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    customerOtps.set(emailKey, otpCode);

    console.log(`Generated OTP code ${otpCode} for registration of ${fullName} (${email})`);
    res.json({ success: true, otp: otpCode });
  } catch (err: any) {
    console.error('Error in customer register endpoint:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Code Verification & Account Creation
app.post('/api/customers/verify', async (req, res) => {
  try {
    const { fullName, email, password, phone, shippingAddress, city, pincode, code } = req.body;

    if (!email || !fullName || !password || !phone || !shippingAddress || !city || !pincode || !code) {
      return res.status(400).json({ error: 'All profile and verification details are required.' });
    }

    const emailKey = email.trim().toLowerCase();
    const storedOtp = customerOtps.get(emailKey);

    if (!storedOtp || storedOtp !== code.trim()) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    // Remove OTP from temporary store
    customerOtps.delete(emailKey);

    // Save customer record to Firestore
    const customerRef = doc(db, 'customers', emailKey);
    const newCustomer = {
      id: emailKey,
      fullName: fullName.trim(),
      email: emailKey,
      password: password, // Simple password check demonstration
      phone: phone.trim(),
      shippingAddress: shippingAddress.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    await setDoc(customerRef, newCustomer);
    
    // Omit password from client response
    const { password: _, ...customerResponse } = newCustomer;
    res.status(201).json({ success: true, customer: customerResponse });
  } catch (err: any) {
    console.error('Error verifying customer account:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Customer Sign In
app.post('/api/customers/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and Password are required.' });
    }

    const emailKey = email.trim().toLowerCase();
    const customerRef = doc(db, 'customers', emailKey);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      return res.status(404).json({ error: 'No account found with this email. Please sign up.' });
    }

    const customer = customerSnap.data();
    if (!customer || customer.password !== password) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // Omit password from response
    const { password: _, ...customerResponse } = customer as any;
    res.json({ success: true, customer: customerResponse });
  } catch (err: any) {
    console.error('Error logging in customer:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Customer Profile
app.put('/api/customers/update', async (req, res) => {
  try {
    const { email, fullName, phone, shippingAddress, city, pincode } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to locate the user profile.' });
    }

    const emailKey = email.trim().toLowerCase();
    const customerRef = doc(db, 'customers', emailKey);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      return res.status(404).json({ error: 'Customer account not found.' });
    }

    const currentData = customerSnap.data();
    const updatedCustomer = {
      ...currentData,
      fullName: fullName ? fullName.trim() : currentData.fullName,
      phone: phone ? phone.trim() : currentData.phone,
      shippingAddress: shippingAddress ? shippingAddress.trim() : currentData.shippingAddress,
      city: city ? city.trim() : currentData.city,
      pincode: pincode ? pincode.trim() : currentData.pincode,
    };

    await setDoc(customerRef, updatedCustomer);

    // Omit password from response
    const { password: _, ...customerResponse } = updatedCustomer as any;
    res.json({ success: true, customer: customerResponse });
  } catch (err: any) {
    console.error('Error updating customer profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Update order status (Admin only)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderRef = doc(db, 'orders', id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    await updateDoc(orderRef, { status });
    const updatedSnap = await getDoc(orderRef);

    res.json(updatedSnap.data());
  } catch (err: any) {
    console.error('Error updating order status in Firestore:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Reset catalog to defaults (Admin recovery tool)
app.post('/api/reset', async (req, res) => {
  try {
    console.log('Resetting Firestore collections to default...');
    
    // 1. Delete all current products
    const productsRef = collection(db, 'products');
    const productsSnap = await getDocs(productsRef);
    const batch1 = writeBatch(db);
    productsSnap.forEach((doc) => {
      batch1.delete(doc.ref);
    });
    await batch1.commit();

    // 2. Delete all current orders
    const ordersRef = collection(db, 'orders');
    const ordersSnap = await getDocs(ordersRef);
    const batch2 = writeBatch(db);
    ordersSnap.forEach((doc) => {
      batch2.delete(doc.ref);
    });
    await batch2.commit();

    // 3. Re-seed default products
    const batch3 = writeBatch(db);
    for (const prod of defaultProducts) {
      const docRef = doc(db, 'products', prod.id);
      batch3.set(docRef, prod);
    }
    await batch3.commit();

    res.json({ message: 'Catalog and orders reset to factory defaults successfully!', products: defaultProducts });
  } catch (err: any) {
    console.error('Error resetting database:', err);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------
   Static Asset & Frontend Bundling Config
------------------------------------------- */

async function startServer() {
  // Initialize Firestore database values if needed
  await initializeDatabase();

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
