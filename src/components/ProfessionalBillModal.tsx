import React, { useRef } from 'react';
import { Printer, X, Coffee } from 'lucide-react';

export interface BillItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
}

export interface BillData {
  orderId: string;
  orderType: 'dine-in' | 'takeaway';
  customerName: string;
  customerPhone: string;
  tableOrAddress?: string;
  specialInstructions?: string;
  items: BillItem[];
  subtotal: number;
  deliveryCharge?: number;
  packagingCharge?: number;
  grandTotal: number;
  dateStr?: string;
  timeStr?: string;
}

export interface ProfessionalBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: BillData;
}

// Helper to convert number to INR words
function numberToWordsINR(amount: number): string {
  const num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertChunk(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let result = '';
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundreds = rem;

  if (crore > 0) result += convertChunk(crore) + ' Crore ';
  if (lakh > 0) result += convertChunk(lakh) + ' Lakh ';
  if (thousand > 0) result += convertChunk(thousand) + ' Thousand ';
  if (hundreds > 0) result += convertChunk(hundreds) + ' ';

  return result.trim() + ' Rupees Only';
}

export const ProfessionalBillModal: React.FC<ProfessionalBillModalProps> = ({
  isOpen,
  onClose,
  billData,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const cafeName = 'FRIENDS 4 EVER COFFEE CAFE';
  const cafeSubtitle = 'Pure Vegetarian Cafe & Quick Service Restaurant';
  const cafeAddress = 'Chandpur - Dattiyana Rd, Chandpur, Saraishekh Habib, Uttar Pradesh 246725';
  const cafePhone = '+91 97198 52037';
  const cafeEmail = 'friends4evercafe@gmail.com';
  const fssaiLic = '2272300000000';
  const gstin = '09AAAAA0000A1Z5 (Composition)';

  const formattedDate = billData.dateStr || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = billData.timeStr || new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Dedicated iframe printing function to cleanly print or save PDF
  const handlePrintPDF = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    const itemsRows = billData.items
      .map(
        (it, idx) => `
        <tr style="border-bottom: 1px dashed #d1d5db;">
          <td style="padding: 8px 6px; text-align: center; font-size: 12px; color: #4b5563;">${idx + 1}</td>
          <td style="padding: 8px 6px; font-size: 13px; font-weight: 600; color: #111827;">
            ${it.name}
            ${it.variant && it.variant !== 'Standard' ? `<br/><span style="font-size: 11px; font-weight: normal; color: #6b7280;">(${it.variant})</span>` : ''}
          </td>
          <td style="padding: 8px 6px; text-align: center; font-size: 13px; font-weight: 700; color: #111827;">${it.quantity}</td>
          <td style="padding: 8px 6px; text-align: right; font-size: 13px; color: #374151;">₹${it.price}</td>
          <td style="padding: 8px 6px; text-align: right; font-size: 13px; font-weight: 700; color: #111827;">₹${it.price * it.quantity}</td>
        </tr>
      `
      )
      .join('');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill_FFC_${billData.orderId}_${cafeName.replace(/ /g, '_')}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page {
            size: auto;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 10px;
          }
          .bill-card {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #1f2937;
            border-radius: 8px;
            padding: 24px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #9ca3af;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #991b1b;
            margin: 0;
            text-transform: uppercase;
          }
          .brand-sub {
            font-size: 11px;
            font-weight: 700;
            color: #047857;
            margin: 3px 0;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .brand-contact {
            font-size: 11px;
            color: #4b5563;
            margin: 3px 0;
            line-height: 1.4;
          }
          .invoice-pill-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-size: 12px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 12px;
            padding: 10px;
            background: #fafafa;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          th {
            background: #f3f4f6;
            padding: 8px 6px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: #374151;
            border-bottom: 2px solid #9ca3af;
          }
          .totals-table {
            width: 100%;
            margin-left: auto;
            max-width: 320px;
            margin-bottom: 16px;
          }
          .totals-table td {
            padding: 4px 6px;
            font-size: 12px;
          }
          .grand-total-row {
            border-top: 2px solid #111827;
            border-bottom: 2px solid #111827;
            font-size: 15px;
            font-weight: 900;
          }
          .words-row {
            font-size: 11px;
            font-style: italic;
            color: #4b5563;
            padding: 8px 0;
            border-top: 1px dashed #d1d5db;
            margin-bottom: 16px;
          }
          .footer-section {
            border-top: 2px dashed #9ca3af;
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .thank-you {
            font-size: 12px;
            font-weight: 700;
            color: #1f2937;
          }
          .signature-box {
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            border-top: 1px solid #9ca3af;
            padding-top: 6px;
            width: 140px;
          }
        </style>
      </head>
      <body>
        <div class="bill-card">
          <div class="header">
            <div style="font-size: 26px; margin-bottom: 4px;">☕</div>
            <h1 class="brand-title">${cafeName}</h1>
            <p class="brand-sub">${cafeSubtitle}</p>
            <p class="brand-contact">${cafeAddress}</p>
            <p class="brand-contact"><strong>Phone:</strong> ${cafePhone} | <strong>Email:</strong> ${cafeEmail}</p>
            <p class="brand-contact" style="font-size: 10px; color: #6b7280;">FSSAI: ${fssaiLic} | GSTIN: ${gstin}</p>
          </div>

          <div class="invoice-pill-row">
            <div>
              <strong>INVOICE / CASH MEMO:</strong> <span style="font-family: monospace; font-weight: bold; color: #991b1b;">#${billData.orderId}</span>
            </div>
            <div>
              <strong>Date:</strong> ${formattedDate} ${formattedTime}
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <p style="margin: 0 0 4px 0; font-weight: bold; color: #6b7280; font-size: 10px; text-transform: uppercase;">Customer Details</p>
              <p style="margin: 0; font-weight: bold; font-size: 13px; color: #111827;">${billData.customerName || 'Valued Guest'}</p>
              <p style="margin: 2px 0 0 0; color: #4b5563;">${billData.customerPhone ? `📞 ${billData.customerPhone}` : 'Direct Counter'}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 4px 0; font-weight: bold; color: #6b7280; font-size: 10px; text-transform: uppercase;">Order Preference</p>
              <p style="margin: 0; font-weight: bold; font-size: 13px; color: #991b1b;">
                ${billData.orderType === 'dine-in' ? '🍽️ DINE-IN' : '🛍️ TAKEAWAY'}
              </p>
              <p style="margin: 2px 0 0 0; color: #4b5563;">
                ${billData.tableOrAddress ? (billData.orderType === 'dine-in' ? `Table: ${billData.tableOrAddress}` : `Note: ${billData.tableOrAddress}`) : 'Standard'}
              </p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th style="text-align: left;">Item Description</th>
                <th style="width: 50px;">Qty</th>
                <th style="width: 70px; text-align: right;">Rate</th>
                <th style="width: 80px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end;">
            <table class="totals-table">
              <tr>
                <td style="color: #4b5563;">Item Subtotal:</td>
                <td style="text-align: right; font-weight: bold; color: #111827;">₹${billData.subtotal}</td>
              </tr>
              <tr>
                <td style="color: #4b5563;">GST & Restaurant Taxes:</td>
                <td style="text-align: right; color: #047857; font-weight: bold;">₹0 (Included)</td>
              </tr>
              <tr>
                <td style="color: #4b5563;">Packaging / Service:</td>
                <td style="text-align: right; color: #047857; font-weight: bold;">FREE</td>
              </tr>
              <tr class="grand-total-row">
                <td style="padding: 8px 6px;">TOTAL AMOUNT:</td>
                <td style="padding: 8px 6px; text-align: right; color: #991b1b;">₹${billData.grandTotal}</td>
              </tr>
            </table>
          </div>

          <div class="words-row">
            <strong>Amount in Words:</strong> ${numberToWordsINR(billData.grandTotal)}
          </div>

          ${
            billData.specialInstructions
              ? `<div style="font-size: 11px; background: #fffbeb; border: 1px solid #fef3c7; padding: 6px 10px; border-radius: 4px; margin-bottom: 14px; color: #92400e;">
                  <strong>Chef Instructions:</strong> ${billData.specialInstructions}
                 </div>`
              : ''
          }

          <div class="footer-section">
            <div>
              <div class="thank-you">☕ Thank You! Visit Again</div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">
                Freshly prepared with love & quality ingredients.<br/>
                Computer Generated Invoice • No Signature Required.
              </div>
            </div>
            <div class="signature-box">
              For Friends 4 Ever Cafe<br/>
              <strong>Authorized Signatory</strong>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Header */}
        <div className="p-4 sm:px-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-sm">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Professional Tax Invoice / Bill</h3>
              <p className="text-[11px] text-stone-400">Friends 4 Ever Coffee Cafe • Ready to Print</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close bill preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Bill Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 dark:bg-stone-950 flex justify-center">
          <div
            ref={invoiceRef}
            className="w-full max-w-lg bg-white text-stone-900 rounded-2xl p-5 sm:p-7 shadow-md border border-stone-200 space-y-4"
          >
            {/* Header: Business Identity */}
            <div className="text-center border-b-2 border-dashed border-stone-300 pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-rose-700 mb-2 border border-amber-200">
                <Coffee className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-rose-800 tracking-tight uppercase">
                {cafeName}
              </h2>
              <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mt-0.5">
                {cafeSubtitle}
              </p>
              <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto leading-relaxed">
                {cafeAddress}
              </p>
              <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 font-medium">
                <span>📞 {cafePhone}</span>
                <span>•</span>
                <span>✉️ {cafeEmail}</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-1 flex items-center justify-center gap-2">
                <span>FSSAI Lic: {fssaiLic}</span>
                <span>|</span>
                <span>GSTIN: {gstin}</span>
              </div>
            </div>

            {/* Invoice Meta Banner */}
            <div className="flex items-center justify-between bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Invoice / Memo</span>
                <span className="font-mono font-black text-rose-700 text-sm">#{billData.orderId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Date & Time</span>
                <span className="font-semibold text-stone-700">{formattedDate} {formattedTime}</span>
              </div>
            </div>

            {/* Customer & Order Preference Details */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50/80 border border-stone-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">
                  Billed To
                </span>
                <span className="font-bold text-stone-900 block text-sm">
                  {billData.customerName || 'Valued Guest'}
                </span>
                <span className="text-stone-500 text-[11px] block mt-0.5">
                  {billData.customerPhone ? `📞 ${billData.customerPhone}` : 'Counter Checkout'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">
                  Order Preference
                </span>
                <span className="inline-flex items-center gap-1 font-extrabold text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {billData.orderType === 'dine-in' ? '🍽️ Dine-In' : '🛍️ Takeaway'}
                </span>
                <span className="text-stone-500 text-[11px] block mt-1">
                  {billData.tableOrAddress
                    ? billData.orderType === 'dine-in'
                      ? `Table: ${billData.tableOrAddress}`
                      : `Note: ${billData.tableOrAddress}`
                    : 'Standard Order'}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-stone-300 text-stone-600 bg-stone-50 text-[11px]">
                    <th className="py-2 px-1 text-center w-8">#</th>
                    <th className="py-2 px-2 text-left">Item Description</th>
                    <th className="py-2 px-2 text-center w-12">Qty</th>
                    <th className="py-2 px-2 text-right w-16">Rate</th>
                    <th className="py-2 px-2 text-right w-16">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-stone-200">
                  {billData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-1 text-center text-stone-400 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-stone-900">{item.name}</div>
                        {item.variant && item.variant !== 'Standard' && (
                          <div className="text-[10px] text-stone-500">({item.variant})</div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-stone-800 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-2 text-right text-stone-600 font-mono">
                        ₹{item.price}
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-stone-900 font-mono">
                        ₹{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary Breakdown */}
            <div className="border-t-2 border-stone-300 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-stone-900 font-mono">₹{billData.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST & Restaurant Taxes:</span>
                <span className="text-emerald-700 font-bold font-mono">₹0 (Included in MRP)</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Packaging & Dine-in Service:</span>
                <span className="text-emerald-700 font-bold font-mono">FREE</span>
              </div>

              <div className="border-t-2 border-stone-900 pt-2 pb-1 flex justify-between items-center text-sm font-black text-stone-900">
                <span className="text-base uppercase tracking-tight">Grand Total</span>
                <span className="text-lg text-rose-700 font-mono font-black">
                  ₹{billData.grandTotal}
                </span>
              </div>

              <div className="text-[11px] text-stone-500 italic pt-1 border-t border-dashed border-stone-200">
                <span className="font-semibold text-stone-700 not-italic">Amount in Words: </span>
                {numberToWordsINR(billData.grandTotal)}
              </div>
            </div>

            {/* Special Instructions Note if Present */}
            {billData.specialInstructions && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold block text-[10px] uppercase text-amber-700">Special Note:</span>
                {billData.specialInstructions}
              </div>
            )}

            {/* Footer Signatory & Clean Remarks */}
            <div className="border-t-2 border-dashed border-stone-300 pt-4 flex items-end justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-stone-800 flex items-center gap-1">
                  <span>☕ Thank You For Your Visit!</span>
                </div>
                <p className="text-[10px] text-stone-400">
                  Computerized receipt • Terms apply
                </p>
              </div>

              <div className="text-center w-36">
                <div className="text-[10px] font-bold text-stone-700 border-t border-stone-400 pt-1">
                  Friends 4 Ever Coffee Cafe<br />
                  <span className="text-stone-400 font-normal">Authorized Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer with Quick Actions */}
        <div className="p-4 sm:px-6 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Click <strong className="text-stone-800 dark:text-stone-200">Print / Save PDF</strong> to save to your device or print to thermal printer.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintPDF}
              className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalBillModal;
