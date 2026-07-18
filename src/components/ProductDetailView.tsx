import React from 'react';
import { ArrowLeft, Percent, Truck, ShieldCheck, Award, ChevronRight, Star, Upload, ShoppingCart, Info, Sparkles } from 'lucide-react';
import { Product } from '../types';
import ProductPlaceholderImage from './ProductPlaceholderImage';

const getSerialNumber = (id: string) => {
  const match = id.match(/\d+/);
  return match ? match[0] : '';
};

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  cart: { [productId: string]: number };
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onUpdateProductImage: (productId: string, base64Image: string) => void;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  pincode: string;
  isAdmin?: boolean;
}

export default function ProductDetailView({
  product,
  allProducts,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateProductImage,
  onBack,
  onSelectProduct,
  pincode,
  isAdmin = false,
}: ProductDetailViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const quantity = cart[product.id] || 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  // Calculate discount percentage
  const getDiscountPercentage = (price: number, originalPrice: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const discount = getDiscountPercentage(product.price, product.originalPrice);

  // Filter similar products (same category, excluding current product)
  const similarProducts = React.useMemo(() => {
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 5); // Show top 5 similar items
  }, [allProducts, product]);

  // Scroll to top on mount or product change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdateProductImage(product.id, base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="font-sans px-4 py-6 md:px-8 max-w-7xl mx-auto" id="product-detail-view-container">
      {/* Back button and Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6" id="detail-breadcrumbs-bar">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff9f00] hover:bg-orange-600 text-white font-extrabold text-xs rounded-lg transition-all shadow-md group"
          id="detail-back-button"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back ❌
        </button>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
          <span className="hover:text-blue-500 cursor-pointer" onClick={onBack}>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-400 font-normal">{product.category}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-800 font-bold truncate max-w-[150px] md:max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Two-Column Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-8 mb-10 grid grid-cols-1 lg:grid-cols-12 gap-8" id="product-detail-card">
        
        {/* Left Column: Image & Upload option (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full aspect-square max-w-[380px] bg-gray-50 rounded-xl border border-gray-100 p-4 relative flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] z-20 flex items-center justify-center">
                <span className="bg-gray-800 text-white text-sm font-black px-4 py-2 rounded-lg shadow-lg uppercase tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}

            <ProductPlaceholderImage
              image={product.image}
              name={product.name}
              category={product.category}
              className="w-full h-full object-contain rounded-lg transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Upload Photo Button Under Image (Admin only) */}
          {isAdmin && (
            <div className="mt-4 w-full max-w-[380px] text-center bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
              <p className="text-[11px] text-gray-500 font-medium mb-2">
                Spotted a quality issue? Upload a fresh local store picture!
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-[#2874f0] font-bold text-xs rounded-lg transition-all shadow-sm"
                id="detail-upload-image-button"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Change Product Image</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>

        {/* Right Column: Title, pricing, stock, cart actions, features (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between" id="product-detail-info-block">
          <div>
            {/* Category Tag & Rating */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#2874f0] text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-mono flex items-center gap-1">
                  <span className="opacity-80">S.No.</span> {getSerialNumber(product.id)}
                </span>
                <span className="bg-[#2874f0]/10 text-[#2874f0] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full text-xs text-amber-700 font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>4.6</span>
                <span className="text-gray-400 font-normal">| 118 reviews</span>
              </div>
            </div>

            {/* Title / Name */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight mb-2">
              {product.name}
            </h1>

            {/* Weight/Size and Stock indicator */}
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded border border-gray-200">
                Net Weight: <strong className="font-extrabold">{product.unit}</strong>
              </span>

              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
                  Currently Unavailable
                </span>
              ) : isLowStock ? (
                <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded border border-orange-100 animate-pulse">
                  Only {product.stock} items left in stock!
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Pricing Section - Flipkart style */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-100 mb-6">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl md:text-3xl font-black text-gray-900">
                  ₹{product.price}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Inclusive of all taxes. Fresh stock promised.
              </p>
            </div>

            {/* Description Section */}
            <div className="mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-[#2874f0]" /> Product Description
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed bg-gray-50/50 rounded-xl p-4 border border-gray-100/50">
                {product.description || `Fresh, premium quality ${product.name.toLowerCase()} sourced directly from verified local suppliers. Certified safe, hygienic, and graded under premium grocery standards.`}
              </p>
            </div>

            {/* Quick Delivery / Assurance Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Instant Local Delivery</h4>
                  <p className="text-[10px] text-gray-500 font-semibold">Deliver to <strong className="text-blue-600">{pincode}</strong> in 2 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">100% Quality Assurance</h4>
                  <p className="text-[10px] text-gray-500 font-semibold">No questions asked refund if not fresh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Call To Actions (Cart Controls) */}
          <div className="border-t border-gray-100 pt-5 mt-4" id="detail-cart-action-panel">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                {quantity === 0 ? (
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                    className="w-full bg-[#ff9f00] hover:bg-[#f39500] text-white font-black text-sm py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 border border-[#ff9f00] hover:shadow-lg transition active:scale-[0.98] disabled:bg-gray-100 disabled:border-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none"
                    id={`detail-add-btn-${product.id}`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>ADD TO SHOPPING CART</span>
                  </button>
                ) : (
                  <div className="flex items-center w-full border-2 border-orange-400 rounded-xl overflow-hidden shadow-sm" id={`detail-qty-counter-${product.id}`}>
                    <button
                      onClick={() => onRemoveFromCart(product)}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-black px-5 py-3.5 text-sm flex-1 text-center select-none active:bg-orange-200 transition"
                      id={`detail-qty-minus-${product.id}`}
                    >
                      &minus;
                    </button>
                    <span className="text-sm font-black text-orange-700 bg-white px-4 py-3.5 flex-1 text-center select-none">
                      {quantity} Unit{quantity > 1 ? 's' : ''} in Cart
                    </span>
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={quantity >= product.stock}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-black px-5 py-3.5 text-sm flex-1 text-center select-none active:bg-orange-200 transition disabled:opacity-50 disabled:pointer-events-none"
                      id={`detail-qty-plus-${product.id}`}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Similar / Related Products Section */}
      <div className="mt-12" id="similar-products-section">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span>Similar Products</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              People who viewed this item also bought these products in {product.category}
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {similarProducts.length} related items
          </span>
        </div>

        {similarProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center" id="empty-similar-state">
            <p className="text-xs text-gray-400 font-bold">No other products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6" id="similar-products-grid">
            {similarProducts.map((simProd) => {
              const simQuantity = cart[simProd.id] || 0;
              const simDiscount = getDiscountPercentage(simProd.price, simProd.originalPrice);
              const simOutOfStock = simProd.stock <= 0;

              return (
                <div
                  key={simProd.id}
                  onClick={() => onSelectProduct(simProd.id)}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer"
                  id={`sim-product-card-${simProd.id}`}
                >

                  {/* Image */}
                  <div className="h-32 md:h-36 bg-gray-50 p-2 flex items-center justify-center border-b border-gray-100 relative">
                    <ProductPlaceholderImage
                      image={simProd.image}
                      name={simProd.name}
                      category={simProd.category}
                      className="w-full h-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
                    />
                    {simOutOfStock && (
                      <span className="absolute bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold tracking-tight">
                        {simProd.unit}
                      </span>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 mt-0.5 leading-tight group-hover:text-[#2874f0] transition-colors min-h-[32px]">
                        {simProd.name}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900">₹{simProd.price}</span>
                      </div>
                      
                      {/* Tiny Mini Button indicator */}
                      <span className="text-[10px] text-[#2874f0] font-black group-hover:underline flex items-center gap-0.5">
                        View Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
