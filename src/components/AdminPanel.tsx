import React from 'react';
import { 
  Plus, Edit, Trash2, Check, RefreshCw, Upload, FileText, ShoppingBag, 
  ChevronDown, Settings, ToggleLeft, ToggleRight, X, Image as ImageIcon, Box
} from 'lucide-react';
import { Product, Order, CATEGORIES } from '../types';
import ProductPlaceholderImage from './ProductPlaceholderImage';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<any>;
  onUpdateProduct: (productId: string, updatedFields: Partial<Product>) => Promise<any>;
  onDeleteProduct: (productId: string) => Promise<any>;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<any>;
  onResetDatabase: () => Promise<any>;
  onExitAdmin: () => void;
}

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onResetDatabase,
  onExitAdmin,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'products' | 'orders' | 'settings' | 'bulk-upload'>('products');
  
  // Bulk upload states
  interface BulkImageItem {
    id: string;
    name: string;
    size: number;
    base64: string;
    selectedProductId: string; // mapped product ID, or 'new'
    category: string;
    price: string;
    unit: string;
    stock: string;
    description: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
  }

  const [bulkItems, setBulkItems] = React.useState<BulkImageItem[]>([]);
  const [bulkUploadStatus, setBulkUploadStatus] = React.useState<'idle' | 'processing' | 'done'>('idle');
  const [bulkUploadProgress, setBulkUploadProgress] = React.useState({ current: 0, total: 0 });
  const bulkFileRef = React.useRef<HTMLInputElement>(null);

  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BulkImageItem[] = [];
    let processedCount = 0;

    (Array.from(files) as File[]).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        // Clean filename for product name suggestion
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[_-]/g, " ")     // replace underscores/dashes with spaces
          .replace(/\s+/g, " ")      // clean consecutive spaces
          .trim();
          
        // Try fuzzy match to find an existing product
        const lowerClean = cleanName.toLowerCase();
        const matchedProduct = products.find(p => 
          p.name.toLowerCase() === lowerClean || 
          p.name.toLowerCase().includes(lowerClean) || 
          lowerClean.includes(p.name.toLowerCase())
        );

        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          name: cleanName,
          size: file.size,
          base64: base64,
          selectedProductId: matchedProduct ? matchedProduct.id : 'new',
          category: matchedProduct ? matchedProduct.category : (CATEGORIES[0] || 'Vegetables'),
          price: matchedProduct ? String(matchedProduct.price) : '99',
          unit: matchedProduct ? matchedProduct.unit : '1 kg',
          stock: matchedProduct ? String(matchedProduct.stock) : '50',
          description: matchedProduct ? (matchedProduct.description || '') : `Fresh premium quality ${cleanName} sourced directly from local farms.`,
          status: 'pending'
        });

        processedCount++;
        if (processedCount === files.length) {
          setBulkItems(prev => [...prev, ...newItems]);
          if (bulkFileRef.current) {
            bulkFileRef.current.value = ''; // Reset input so same files can be re-selected
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveBulkItem = (itemId: string) => {
    setBulkItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateBulkItem = (itemId: string, fields: Partial<BulkImageItem>) => {
    setBulkItems(prev => prev.map(item => item.id === itemId ? { ...item, ...fields } : item));
  };

  const handleStartBulkUpload = async () => {
    if (bulkItems.length === 0) return;
    
    setBulkUploadStatus('processing');
    setBulkUploadProgress({ current: 0, total: bulkItems.length });

    for (let i = 0; i < bulkItems.length; i++) {
      const item = bulkItems[i];
      if (item.status === 'success') {
        // Skip already successfully uploaded ones
        setBulkUploadProgress(prev => ({ ...prev, current: i + 1 }));
        continue;
      }

      setBulkItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'uploading' } : it));

      try {
        if (item.selectedProductId === 'new') {
          // Create new product
          await onAddProduct({
            name: item.name.trim(),
            category: item.category,
            price: Number(item.price) || 0,
            originalPrice: Number(item.price) || 0,
            unit: item.unit.trim() || '1 kg',
            stock: Number(item.stock) || 0,
            description: item.description.trim(),
            image: item.base64,
            isAvailable: true
          });
        } else {
          // Update existing product
          await onUpdateProduct(item.selectedProductId, {
            image: item.base64
          });
        }

        setBulkItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'success' } : it));
      } catch (err: any) {
        setBulkItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'error', error: err.message || 'Upload failed' } : it));
      }

      setBulkUploadProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setBulkUploadStatus('done');
  };

  // Search & Filter state
  const [productSearch, setProductSearch] = React.useState('');
  const [productCategory, setProductCategory] = React.useState('All');

  // Form State (for Add / Edit)
  const [showFormModal, setShowFormModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Form Input states
  const [formData, setFormData] = React.useState({
    name: '',
    category: CATEGORIES[0] as string,
    price: '',
    originalPrice: '',
    unit: '1 kg',
    stock: '50',
    description: '',
    image: '',
    isAvailable: true
  });

  const [formImagePreview, setFormImagePreview] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Filtered products list
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
      const matchCat = productCategory === 'All' || p.category === productCategory;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, productCategory]);

  // Handle open Form (Add Mode)
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: CATEGORIES[0],
      price: '',
      originalPrice: '',
      unit: '1 kg',
      stock: '50',
      description: '',
      image: '',
      isAvailable: true
    });
    setFormImagePreview('');
    setShowFormModal(true);
  };

  // Handle open Form (Edit Mode)
  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      unit: product.unit,
      stock: String(product.stock),
      description: product.description || '',
      image: product.image,
      isAvailable: product.isAvailable
    });
    setFormImagePreview(product.image);
    setShowFormModal(true);
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, image: base64String }));
      setFormImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      alert('Please enter a valid price.');
      return;
    }
    if (!formData.unit.trim()) {
      alert('Product Unit/Size is required.');
      return;
    }

    const submissionData = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
      unit: formData.unit.trim(),
      stock: formData.stock ? Number(formData.stock) : 0,
      description: formData.description.trim(),
      image: formData.image,
      isAvailable: formData.isAvailable
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, submissionData);
      } else {
        await onAddProduct(submissionData);
      }
      setShowFormModal(false);
    } catch (err: any) {
      alert('Operation failed: ' + err.message);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await onUpdateProduct(product.id, { isAvailable: !product.isAvailable });
    } catch (err: any) {
      alert('Failed to update product availability');
    }
  };

  const handleOrderAction = async (orderId: string, status: Order['status']) => {
    try {
      await onUpdateOrderStatus(orderId, status);
    } catch (err: any) {
      alert('Failed to update order status');
    }
  };

  const handleResetConfirm = async () => {
    if (confirm('Are you absolutely sure you want to reset the entire database? This will clear all orders and restore default inventory items!')) {
      try {
        await onResetDatabase();
        alert('Database restored successfully.');
      } catch (err: any) {
        alert('Failed to reset: ' + err.message);
      }
    }
  };

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Packed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="font-sans max-w-7xl mx-auto px-4 py-8 md:px-8" id="admin-panel-root">
      
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={onExitAdmin}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-xs rounded-lg transition-all shadow-md"
          id="admin-exit-to-store"
        >
          ← Back to Store ❌
        </button>
      </div>

      {/* Admin Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-800 animate-spin-slow" />
            Local Store Manager Console
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your grocery inventory, stock counts (approx. 2000 item capacity), process orders, and upload product photos.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-lg border border-gray-200 shadow-inner">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'products' 
                ? 'bg-white text-emerald-850 shadow-sm font-black border border-emerald-100' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Box className="h-4 w-4" />
            Inventory ({products.length})
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition flex items-center gap-1.5 relative ${
              activeTab === 'orders' 
                ? 'bg-white text-emerald-850 shadow-sm font-black border border-emerald-100' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Customer Orders
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-ping" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'settings' 
                ? 'bg-white text-emerald-850 shadow-sm font-black border border-emerald-100' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            Database Settings
          </button>

          <button
            onClick={() => setActiveTab('bulk-upload')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'bulk-upload' 
                ? 'bg-white text-emerald-850 shadow-sm font-black border border-emerald-100' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            id="admin-bulk-image-upload-tab"
          >
            <Upload className="h-4 w-4" />
            Bulk Image Upload ({bulkItems.length})
          </button>
        </div>
      </div>

      {/* 1. PRODUCTS MANAGEMENT TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6" id="admin-tab-products">
          
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
              <input
                type="text"
                placeholder="Search inventory by name, code..."
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              
              <select
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white min-w-[160px]"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Add product button */}
            <button
              onClick={handleOpenAddForm}
              className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs px-5 py-2.5 rounded shadow flex items-center gap-1.5 self-stretch md:self-auto transition"
              id="admin-add-product-trigger"
            >
              <Plus className="h-4 w-4" />
              ADD NEW GROCERY
            </button>
          </div>

          {/* Inventory Table/Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
              <Box className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No items match your filters</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-0.5">
                Try widening your search terms or adding a new grocery item above.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" id="inventory-table-container">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                      <th className="py-3 px-4">Item Detail</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">MRP (Org)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        
                        {/* Detail */}
                        <td className="py-3.5 px-4 flex items-center gap-3 min-w-[220px]">
                          <div className="w-12 h-12 rounded border overflow-hidden bg-gray-50 flex-shrink-0">
                            <ProductPlaceholderImage
                              image={p.image}
                              name={p.name}
                              category={p.category}
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 leading-tight">{p.name}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Size/Unit: <strong className="text-gray-700">{p.unit}</strong></p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-gray-600 font-semibold">{p.category}</td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-extrabold text-gray-900">₹{p.price}</td>

                        {/* Original Price */}
                        <td className="py-3.5 px-4 text-gray-400 line-through">₹{p.originalPrice}</td>

                        {/* Stock count */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                            p.stock <= 0 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : p.stock < 15 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>

                        {/* Availability Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleAvailability(p)}
                            className="focus:outline-none transition-all hover:scale-105 inline-block"
                            id={`availability-toggle-${p.id}`}
                          >
                            {p.isAvailable ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Active
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Hidden
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditForm(p)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${p.name}?`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. CUSTOMER ORDERS LOG TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6" id="admin-tab-orders">
          {orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
              <ShoppingBag className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No Orders Received Yet</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-0.5">
                When customer places order from the shopping cart drawer, they will display here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-4" id="orders-catalog-list">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow transition-all"
                  id={`order-block-${order.id}`}
                >
                  {/* Order header */}
                  <div className="bg-gray-50 border-b border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 font-mono text-base">Order #{order.id}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Placed on: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Change Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-semibold">Change Status:</span>
                      <select
                        className="px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700"
                        value={order.status}
                        onChange={(e) => handleOrderAction(order.id, e.target.value as any)}
                        id={`status-select-${order.id}`}
                      >
                        <option value="Pending">🕒 Pending</option>
                        <option value="Accepted">👍 Accepted</option>
                        <option value="Packed">📦 Packed</option>
                        <option value="Out for Delivery">🛵 Out for Delivery</option>
                        <option value="Completed">✅ Completed</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order details & customer */}
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-1.5 text-xs">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h4>
                      <p><strong className="text-gray-900">Name:</strong> {order.customerName}</p>
                      <p>
                        <strong className="text-gray-900">Phone:</strong> {order.customerPhone}
                        <a 
                          href={`https://wa.me/${order.customerPhone.length === 10 ? '91' : ''}${order.customerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-emerald-600 font-black hover:underline ml-2"
                        >
                          💬 WhatsApp
                        </a>
                      </p>
                      <p><strong className="text-gray-900">Delivery Type:</strong> {order.deliveryType === 'delivery' ? '🏠 Home Delivery' : '🏪 Self-Pickup'}</p>
                      <p><strong className="text-gray-900">Address:</strong> {order.customerAddress}</p>
                    </div>

                    {/* Ordered Items list */}
                    <div className="lg:col-span-2 space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items Bought</h4>
                      <div className="divide-y max-h-48 overflow-y-auto pr-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between text-xs gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded border overflow-hidden bg-gray-50 flex-shrink-0">
                                <ProductPlaceholderImage
                                  image={item.image}
                                  name={item.name}
                                  category=""
                                />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{item.name}</p>
                                <p className="text-[10px] text-gray-400">{item.unit} &times; {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-extrabold text-gray-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total Amount card */}
                      <div className="border-t border-dashed pt-3 flex justify-between items-center text-sm font-extrabold text-gray-900">
                        <span>Total Paid Amount:</span>
                        <span className="text-emerald-800 text-base">₹{order.totalAmount}</span>
                      </div>
                      {order.savings > 0 && (
                        <p className="text-[11px] text-right text-emerald-600 font-bold">
                          Customer Saved: ₹{order.savings}!
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-xl" id="admin-tab-settings">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-gray-600" />
            System Maintenance tools
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Recover initial pre-populated catalog categories and remove test purchase orders safely. Useful for resetting catalog settings.
          </p>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 border-l-4 border-l-amber-500 mb-6">
            <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-1">Warning: Destructive operation</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Tapping &ldquo;Reset Database&rdquo; will erase all custom added catalog items, revert customized images to factory placeholders, and wipe out customer order history.
            </p>
          </div>

          <button
            onClick={handleResetConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-[0.98]"
            id="factory-reset-btn"
          >
            <RefreshCw className="h-4 w-4" />
            RESET DATABASE TO DEFAULT
          </button>
        </div>
      )}

      {/* 4. BULK IMAGE UPLOAD TAB */}
      {activeTab === 'bulk-upload' && (
        <div className="space-y-6" id="admin-tab-bulk-upload">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-in fade-in duration-150">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-800" />
                  Smart Bulk Image Uploader
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload multiple grocery product images at once. System automatically detects matching items or lets you create new inventory items on the fly!
                </p>
              </div>
              {bulkItems.length > 0 && bulkUploadStatus !== 'processing' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => bulkFileRef.current?.click()}
                    className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs rounded border border-emerald-200 transition flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add More
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Clear the bulk upload list?')) {
                        setBulkItems([]);
                        setBulkUploadStatus('idle');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded border border-rose-200 transition flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear List
                  </button>
                </div>
              )}
            </div>

            {/* Hidden Input File */}
            <input
              type="file"
              ref={bulkFileRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleBulkFilesSelect}
              disabled={bulkUploadStatus === 'processing'}
            />

            {/* Dropzone if empty */}
            {bulkItems.length === 0 ? (
              <div
                onClick={() => bulkFileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-750 rounded-xl p-12 bg-gray-50 hover:bg-emerald-50/30 transition cursor-pointer flex flex-col items-center justify-center text-center group"
              >
                <div className="w-16 h-16 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-md text-gray-400 group-hover:scale-110 transition duration-300 mb-4">
                  <Upload className="h-8 w-8 text-emerald-800" />
                </div>
                <h4 className="text-base font-extrabold text-gray-800 mb-1">
                  Drag & drop multiple product images here
                </h4>
                <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
                  Or click to browse and select image files from your device. You can choose dozens of files at once!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-[11px] text-gray-600">
                  <div className="flex gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span><strong>Auto Match:</strong> Scans filenames and pairs them with similar product names in seconds.</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span><strong>On the Fly:</strong> Instantly add new items if no matches are found in your current inventory.</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span><strong>Permanently Saved:</strong> Saves directly to Firebase Firestore for immediate visibility.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Upload Status Header / Progress Bar */}
                {bulkUploadStatus === 'processing' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-emerald-800">
                        Processing image uploads: {bulkUploadProgress.current} of {bulkUploadProgress.total} items
                      </span>
                      <span className="text-xs font-black text-emerald-900">
                        {Math.round((bulkUploadProgress.current / bulkUploadProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-850 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(bulkUploadProgress.current / bulkUploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* List of files to upload */}
                <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                  {bulkItems.map((item) => {
                    const isNew = item.selectedProductId === 'new';
                    return (
                      <div 
                        key={item.id} 
                        className={`pt-4 first:pt-0 flex flex-col md:flex-row gap-4 items-start ${
                          item.status === 'success' 
                            ? 'opacity-65' 
                            : ''
                        }`}
                      >
                        {/* Thumbnail & Status */}
                        <div className="relative w-20 h-20 bg-gray-50 border border-gray-200 rounded overflow-hidden flex-shrink-0 shadow-sm">
                          <ProductPlaceholderImage
                            image={item.base64}
                            name={item.name}
                            category={item.category}
                          />
                          {/* Absolute Status Badge */}
                          <div className="absolute inset-x-0 bottom-0 text-[9px] font-black py-0.5 text-center text-white bg-black/60">
                            {(item.size / 1024).toFixed(0)} KB
                          </div>
                        </div>

                        {/* Details and Inputs */}
                        <div className="flex-1 space-y-3 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-sm font-extrabold text-gray-800 break-all">
                              {item.name}
                            </span>
                            
                            {/* Status Pill */}
                            <div className="flex items-center gap-1.5">
                              {item.status === 'pending' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  Ready
                                </span>
                              )}
                              {item.status === 'uploading' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full animate-pulse">
                                  Uploading...
                                </span>
                              )}
                              {item.status === 'success' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Done
                                </span>
                              )}
                              {item.status === 'error' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full" title={item.error}>
                                  Failed: {item.error}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Controls: Choose Existing or Create New */}
                          {item.status === 'pending' && (
                            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 space-y-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBulkItem(item.id, { selectedProductId: 'new' })}
                                  className={`px-3 py-1 text-xs font-bold rounded transition border ${
                                    isNew 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold border-2' 
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  + Create New Product
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Map to first product if none selected
                                    const defaultId = products[0]?.id || '';
                                    handleUpdateBulkItem(item.id, { selectedProductId: defaultId });
                                  }}
                                  className={`px-3 py-1 text-xs font-bold rounded transition border ${
                                    !isNew 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold border-2' 
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  Map to Existing Product
                                </button>
                              </div>

                              {isNew ? (
                                /* Create New Product Form fields */
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Product Name</label>
                                    <input
                                      type="text"
                                      value={item.name}
                                      onChange={(e) => handleUpdateBulkItem(item.id, { name: e.target.value })}
                                      className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Category</label>
                                    <select
                                      value={item.category}
                                      onChange={(e) => handleUpdateBulkItem(item.id, { category: e.target.value })}
                                      className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    >
                                      {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Price (₹)</label>
                                    <input
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => handleUpdateBulkItem(item.id, { price: e.target.value })}
                                      className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Unit/Size</label>
                                    <input
                                      type="text"
                                      value={item.unit}
                                      onChange={(e) => handleUpdateBulkItem(item.id, { unit: e.target.value })}
                                      className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Initial Stock</label>
                                    <input
                                      type="number"
                                      value={item.stock}
                                      onChange={(e) => handleUpdateBulkItem(item.id, { stock: e.target.value })}
                                      className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Description</label>
                                    <input
                                      type="text"
                                      value={item.description}
                                      onChange={(e) => handleUpdateBulkItem(item.id, { description: e.target.value })}
                                      className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                      placeholder="Brief description..."
                                    />
                                  </div>
                                </div>
                              ) : (
                                /* Map to Existing Product Dropdown */
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Select Grocery Item to Update</label>
                                  <select
                                    value={item.selectedProductId}
                                    onChange={(e) => {
                                      const pId = e.target.value;
                                      const prod = products.find(p => p.id === pId);
                                      if (prod) {
                                        handleUpdateBulkItem(item.id, { 
                                          selectedProductId: pId,
                                          name: prod.name,
                                          category: prod.category,
                                          price: String(prod.price),
                                          unit: prod.unit,
                                          stock: String(prod.stock)
                                        });
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
                                  >
                                    <option value="">-- Choose an item from your catalog --</option>
                                    {[...products].sort((a, b) => a.name.localeCompare(b.name)).map(prod => (
                                      <option key={prod.id} value={prod.id}>
                                        {prod.name} ({prod.category} - {prod.unit})
                                      </option>
                                    ))}
                                  </select>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    Choosing an item replaces its current image with this newly uploaded photo.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {item.status !== 'pending' && !isNew && (
                            <p className="text-xs text-gray-500 italic">
                              Updating image for existing catalog product: <strong>{products.find(p => p.id === item.selectedProductId)?.name || item.name}</strong>
                            </p>
                          )}

                          {item.status !== 'pending' && isNew && (
                            <p className="text-xs text-gray-500 italic">
                              Creating new product: <strong>{item.name}</strong> (₹{item.price}, Category: {item.category}, Stock: {item.stock})
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {bulkUploadStatus !== 'processing' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBulkItem(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded border border-transparent hover:border-rose-100 transition self-center"
                            title="Discard image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bulk Actions Footer */}
                <div className="border-t pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-gray-500">
                    Ready to process: <strong>{bulkItems.filter(i => i.status === 'pending').length}</strong> pending. 
                    Successfully uploaded: <strong className="text-emerald-600">{bulkItems.filter(i => i.status === 'success').length}</strong>.
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    {bulkUploadStatus === 'done' && (
                      <button
                        type="button"
                        onClick={() => {
                          setBulkItems([]);
                          setBulkUploadStatus('idle');
                        }}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                      >
                        Reset / Clear Successfully Uploaded
                      </button>
                    )}
                    
                    <button
                      type="button"
                      disabled={bulkUploadStatus === 'processing' || bulkItems.filter(i => i.status === 'pending').length === 0}
                      onClick={handleStartBulkUpload}
                      className="flex-1 sm:flex-none px-8 py-2.5 bg-emerald-800 hover:bg-emerald-950 disabled:opacity-50 text-white text-xs font-black rounded-lg shadow-md transition flex items-center justify-center gap-2"
                    >
                      {bulkUploadStatus === 'processing' ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>UPLOADING IMAGES ({bulkUploadProgress.current}/{bulkUploadProgress.total})...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>START BULK UPLOAD ({bulkItems.filter(i => i.status === 'pending').length} ITEMS)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL FORM */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" id="admin-product-form-modal">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-800 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Box className="h-5 w-5 text-yellow-400" />
                <span>{editingProduct ? `Edit Item: ${editingProduct.name}` : 'Add New Grocery Product'}</span>
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Grocery Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Red Carrots"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Store Category *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Pack Unit size */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Pack Size / Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg, 500 ml, Pack of 4"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                {/* Original Price / MRP */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Original Price / MRP (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 55"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-gray-500"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  />
                </div>

                {/* Stock count */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Initial Stock Count *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>

                {/* Is Available Toggle */}
                <div className="flex items-center gap-3 pl-1 self-center">
                  <label className="text-xs font-bold text-gray-600">Product Available to Customers</label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                    className="focus:outline-none"
                  >
                    {formData.isAvailable ? (
                      <ToggleRight className="h-9 w-9 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Tell customers about freshness, details, or usage notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* IMAGE UPLOAD PANEL - Highly functional */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase text-center w-full">
                  Product Image (Fresh Upload)
                </label>
                
                {formImagePreview ? (
                  <div className="relative w-32 h-32 border border-gray-200 rounded overflow-hidden shadow-sm mb-3 group/preview bg-white">
                    <ProductPlaceholderImage
                      image={formImagePreview}
                      name={formData.name || 'preview'}
                      category={formData.category}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: '' }));
                        setFormImagePreview('');
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition"
                      title="Clear photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-inner mb-2 text-gray-400">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold py-1.5 px-4 rounded shadow flex items-center gap-1 transition"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-800" />
                  <span>Choose Image File</span>
                </button>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Supports JPEG, PNG, WEBP (Max 5MB). Photo is stored permanently in server.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-extrabold text-white bg-emerald-800 hover:bg-emerald-950 rounded shadow transition"
                >
                  {editingProduct ? 'UPDATE GROCERY' : 'ADD PRODUCT'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
