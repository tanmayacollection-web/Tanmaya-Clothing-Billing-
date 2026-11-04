/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InvoiceItem {
  id: string;
  name?: string; // Optional item name
  qty: number;
  mrp?: number; // Optional MRP
  sellingPrice: number; // Selling price / rate per unit
  discount?: number; // Optional discount %
  gst: number; // GST % (0, 5, 12, 18)
}

export interface StoreSettings {
  shopName: string;
  address: string;
  cityState: string;
  phone: string;
  email: string;
  gstin: string;
  instagram?: string;
  terms: string[];
}

export interface InvoiceRecord {
  id: string;
  invNo: string;
  date: string; // YYYY-MM-DD
  buyerState: 'same' | 'diff'; // 'same' = Maharashtra, 'diff' = Other State
  paymentMode: 'Cash' | 'Card' | 'Online';
  custName?: string;
  custPhone?: string;
  custGstin?: string;
  custAddress?: string;
  items: InvoiceItem[];
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  totalSavings: number;
  grandTotal: number;
  savedAt: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  shopName: 'TANMAYA CLOTHING',
  address: 'Dhruv Nagar, Gangapur Road,',
  cityState: 'Nashik, Maharashtra',
  phone: '7397921579',
  email: 'tanmayaclothing@gmail.com',
  gstin: '27AABCT8921F1Z2',
  instagram: '@tanmayaclothing',
  terms: [
    'All prices mentioned above are inclusive of applicable taxes.',
    'Exchange is accepted only within 24 hours of purchase, along with this original bill.',
    'Once an item is taken from the store, it is not eligible for a refund — exchange only, within 24 hours.',
  ],
};

/**
 * Calculates per-line amounts
 */
export function calcItemAmounts(item: InvoiceItem) {
  const qty = Math.max(0, item.qty || 0);
  const sellingPrice = Math.max(0, item.sellingPrice || 0);
  const mrp = item.mrp && item.mrp > 0 ? item.mrp : 0;
  const gst = Math.max(0, item.gst || 0);

  // If MRP is given and higher than selling price, compute savings & discount %
  let discount = item.discount || 0;
  let savings = 0;
  if (mrp > sellingPrice) {
    savings = (mrp - sellingPrice) * qty;
    if (!item.discount) {
      discount = Math.round(((mrp - sellingPrice) / mrp) * 100);
    }
  }

  const taxable = qty * sellingPrice;
  const gstAmount = taxable * (gst / 100);
  const total = taxable + gstAmount;

  return {
    rate: sellingPrice,
    mrp,
    discount,
    taxable,
    gstAmount,
    total,
    savings,
  };
}

/**
 * Calculates invoice totals
 */
export function calcInvoiceTotals(items: InvoiceItem[], buyerState: 'same' | 'diff' = 'same') {
  let taxable = 0;
  let totalGst = 0;
  let totalSavings = 0;

  for (const item of items) {
    const res = calcItemAmounts(item);
    taxable += res.taxable;
    totalGst += res.gstAmount;
    totalSavings += res.savings;
  }

  const grandTotal = Math.round((taxable + totalGst) * 100) / 100;
  const isSame = buyerState === 'same';
  const cgst = isSame ? Math.round((totalGst / 2) * 100) / 100 : 0;
  const sgst = isSame ? Math.round((totalGst / 2) * 100) / 100 : 0;
  const igst = !isSame ? Math.round(totalGst * 100) / 100 : 0;

  return {
    taxable: Math.round(taxable * 100) / 100,
    cgst,
    sgst,
    igst,
    totalGst: Math.round(totalGst * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    grandTotal,
  };
}

/**
 * Format Indian Rupee currency string matching HTML prototype
 */
export function fmt(n: number): string {
  if (isNaN(n)) return '₹0';
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function fmtINR(val: number): string {
  return fmt(val);
}

/**
 * Generate a new invoice number automatically for every bill
 */
export function generateNewInvoiceNo(existingInvoices: { invNo: string }[] = []): string {
  let highestNum = 0;
  for (const inv of existingInvoices) {
    const match = inv.invNo.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > highestNum) highestNum = num;
    }
  }
  const next = highestNum + 1;
  return 'TC-' + String(next).padStart(3, '0');
}

/**
 * WhatsApp share matching original HTML share logic
 */
export function buildWhatsAppShareUrl(invoice: {
  invNo: string;
  custName?: string;
  custPhone?: string;
  items: InvoiceItem[];
  taxable: number;
  totalGst: number;
  totalSavings: number;
  grandTotal: number;
  store: StoreSettings;
}): string {
  const custPhone = (invoice.custPhone || '').replace(/\D/g, '');
  const custName = invoice.custName || 'Customer';
  const invNo = invoice.invNo;

  let msg = `*TANMAYA CLOTHING — INVOICE ${invNo}*\n\n`;
  msg += `Customer: ${custName}\n\n`;

  invoice.items.forEach((it) => {
    const res = calcItemAmounts(it);
    const itemName = it.name || 'Item';
    if (res.mrp > res.rate && res.discount > 0) {
      msg += `${itemName} x${it.qty} — ~₹${res.mrp}~ ₹${res.rate.toFixed(0)} (${res.discount}% off) = ₹${res.taxable.toFixed(0)}\n`;
    } else {
      msg += `${itemName} x${it.qty} — ₹${res.taxable.toFixed(0)}\n`;
    }
  });

  if (invoice.totalSavings > 0) {
    msg += `\nYou saved: ₹${invoice.totalSavings.toFixed(0)}`;
  }

  msg += `\nTaxable: ₹${invoice.taxable.toFixed(0)}\nGST: ₹${invoice.totalGst.toFixed(0)}\n*Total: ₹${invoice.grandTotal.toFixed(0)}* (incl. all taxes)\n\n`;
  msg += `Thank you for shopping with ${invoice.store.shopName}!\n${invoice.store.phone} | ${invoice.store.instagram || '@tanmayaclothing'}`;

  const target =
    custPhone.length >= 10
      ? custPhone.length === 10
        ? '91' + custPhone
        : custPhone
      : '';
  return `https://wa.me/${target}?text=${encodeURIComponent(msg)}`;
}
