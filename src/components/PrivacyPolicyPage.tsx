import React from 'react';
import { ArrowLeft, Shield, Lock, HardDrive, Eye, UserCheck, Trash2, Mail, Phone, MapPin, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-emerald-900 font-extrabold text-xs rounded-xl shadow-xs border border-gray-200 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-700" />
            <span>Back to Store</span>
          </button>

          <span className="text-xs font-mono text-gray-400">
            Last Updated: July 28, 2026
          </span>
        </div>

        {/* Main Document Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-gray-900 text-white rounded-2xl p-6 md:p-10 shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-yellow-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5 text-yellow-400" />
              <span>Official Privacy Policy</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white font-serif">
              Privacy Policy & Data Protection
            </h1>
            <p className="text-emerald-100/90 text-xs md:text-sm max-w-2xl leading-relaxed">
              At <strong className="text-white font-bold">Bari' All-In-One Mart (LocalMart Grocery)</strong>, we respect your privacy and are committed to protecting your personal information. This page explains how your information is handled in our application.
            </p>
          </div>
          
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <Shield className="h-64 w-64 text-white" />
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 md:p-10 space-y-8 leading-relaxed text-sm text-gray-700">

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                <HardDrive className="h-4 w-4 text-emerald-700" />
                <span>Client-Side Storage</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Your profile & orders are stored locally in your browser's Local Storage.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                <Lock className="h-4 w-4 text-amber-600" />
                <span>No Third-Party Sales</span>
              </div>
              <p className="text-[11px] text-gray-600">
                We never sell, rent, or trade your personal data to external advertisers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                <UserCheck className="h-4 w-4 text-blue-700" />
                <span>You Control Data</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Update or delete your account data anytime using our in-app profile settings.
              </p>
            </div>
          </div>

          {/* 1. What Information We Collect */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileText className="h-5 w-5 text-emerald-700" />
              1. Information We Collect
            </h2>
            <p>
              We collect personal information strictly when you voluntarily create an account, update your profile, or place an order within the LocalMart Grocery app:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong className="text-gray-800">Account & Profile Information:</strong> Your full name, mobile phone number, delivery address, city, 6-digit pincode, and optional email address when registering or editing your account profile.
              </li>
              <li>
                <strong className="text-gray-800">Order Information:</strong> Details regarding your grocery purchases and restaurant food orders, including ordered item names, quantities, unit prices, total amount, delivery type (Home Delivery or Store Pickup), timestamp, and order status.
              </li>
              <li>
                <strong className="text-gray-800">Delivery Pincode:</strong> Your preferred 6-digit delivery pincode to display relevant local inventory availability.
              </li>
            </ul>
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200/60 italic">
              <strong>Note:</strong> We do NOT collect credit card numbers, banking passwords, biometric data, or background location tracking.
            </p>
          </section>

          {/* 2. Client-Side Local Storage */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <HardDrive className="h-5 w-5 text-emerald-700" />
              2. Browser Storage Mechanisms (Local Storage)
            </h2>
            <p>
              This app operates on a client-side model using your web browser's <strong>Local Storage (`localStorage`)</strong> for data persistence.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2 text-xs font-mono">
              <p className="font-bold font-sans text-gray-800">The following Local Storage keys are used on your device:</p>
              <ul className="space-y-1.5 text-gray-700">
                <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-emerald-900">localmart_grocery_customer</code> — Stores your active account profile.</li>
                <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-emerald-900">localmart_grocery_orders</code> — Stores your order history log.</li>
                <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-emerald-900">localmart_grocery_cart</code> — Stores your current shopping basket items.</li>
                <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-emerald-900">localmart_grocery_pincode</code> — Stores your selected delivery zone pincode.</li>
                <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-emerald-900">localmart_grocery_products</code> — Caches local catalog items for fast browsing.</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              We do not use tracking cookies or IndexedDB databases for tracking users across other websites.
            </p>
          </section>

          {/* 3. How We Use Your Data */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Eye className="h-5 w-5 text-emerald-700" />
              3. How We Use Collected Data
            </h2>
            <p>
              Your data is strictly utilized to deliver essential shopping services within the app, including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block font-semibold">Order Processing</strong>
                  <span className="text-gray-600">Preparing and fulfilling your grocery and restaurant food orders accurately.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block font-semibold">Account Management</strong>
                  <span className="text-gray-600">Managing your customer account profile and saved delivery addresses.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block font-semibold">Delivery Logistics</strong>
                  <span className="text-gray-600">Matching items to your 6-digit delivery pincode and processing delivery options.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-100 bg-gray-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block font-semibold">Customer Support</strong>
                  <span className="text-gray-600">Assisting you with order updates via phone call or WhatsApp support.</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Third-Party Sharing */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Lock className="h-5 w-5 text-emerald-700" />
              4. Third-Party Data Sharing Policy
            </h2>
            <p>
              <strong>We do NOT sell, rent, trade, or share your personal data with any third parties or marketing brokers.</strong>
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Restaurant menu items are fetched live via a public Google Sheet CSV URL for real-time kitchen dish synchronization. This process only fetches public dish descriptions and prices, and no customer personal data is ever transmitted to Google Sheets or external analytics services.
            </p>
          </section>

          {/* 5. Data Security Practices */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Shield className="h-5 w-5 text-emerald-700" />
              5. Data Security Practices
            </h2>
            <p>
              Because your personal profile and order history reside directly in your browser's Local Storage, your data remains secured on your device under your direct control. We encourage users to maintain secure access to their personal devices and web browsers.
            </p>
          </section>

          {/* 6. Retention and Deletion Practices */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Trash2 className="h-5 w-5 text-emerald-700" />
              6. Data Retention & Deletion Rights
            </h2>
            <p>
              Your profile information and local order history remain in your browser's Local Storage until you choose to modify or clear them.
            </p>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-rose-900 text-sm">
                <Trash2 className="h-4 w-4 text-rose-600" />
                <span>Delete Account & Clear Personal Data Feature</span>
              </div>
              <p className="text-rose-950/80 leading-relaxed">
                You can delete your account profile and clear all locally saved order logs directly at any time by opening your <strong className="text-rose-950">Customer Account / Profile modal</strong> and clicking the <strong className="text-rose-950 font-bold">"Delete Account & Clear Local Data"</strong> button, or by clearing your browser cache/cookies for this site.
              </p>
            </div>
          </section>

          {/* 7. Contact Information for Privacy Requests */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Mail className="h-5 w-5 text-emerald-700" />
              7. Privacy Contact & Data Deletion Requests
            </h2>
            <p>
              If you have any questions regarding this Privacy Policy or need assistance regarding your data, please contact our privacy support:
            </p>

            <div className="bg-gray-900 text-gray-300 p-5 rounded-xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span>Bari' All-In-One Mart (LocalMart Grocery)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="space-y-1">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Store Address:</p>
                  <p className="text-white font-medium">Bari' All-In-One Mart - Premium Natural, Organic & Daily Needs Outlet, 2nd Floor</p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Phone & WhatsApp Support:</p>
                  <p className="text-yellow-400 font-bold font-mono">+91 75002 36520</p>
                </div>

                <div className="space-y-1 md:col-span-2 pt-1 border-t border-gray-800">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Privacy Contact Email:</p>
                  <p className="text-emerald-400 font-bold font-mono">
                    privacy@bari-allinone-mart.local <span className="text-[10px] text-gray-500 font-sans italic">(Placeholder Email)</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Page Footer Return button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-850 hover:bg-emerald-950 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-yellow-400" />
            <span>Return to Store Catalog</span>
          </button>
        </div>

      </div>
    </div>
  );
}
