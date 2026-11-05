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

export interface ShareableBillPayload {
  invNo: string;
  date: string;
  buyerState: 'same' | 'diff';
  paymentMode: 'Cash' | 'Card' | 'Online';
  custName?: string;
  custPhone?: string;
  custGstin?: string;
  custAddress?: string;
  items: InvoiceItem[];
  store: StoreSettings;
}

/**
 * Encode bill payload into a compact, URL-safe base64url string
 */
export function encodeBillToUrl(payload: ShareableBillPayload): string {
  const compact = [
    payload.invNo,
    payload.date,
    payload.buyerState === 'diff' ? 'd' : 's',
    payload.paymentMode,
    payload.custName || '',
    payload.custPhone || '',
    payload.custGstin || '',
    payload.custAddress || '',
    payload.items.map((it) => [
      it.name || '',
      it.qty,
      it.mrp || 0,
      it.sellingPrice,
      it.gst,
    ]),
  ];
  const json = JSON.stringify(compact);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode bill payload from a compact or legacy URL-safe base64url string
 */
export function decodeBillFromUrl(encoded: string): ShareableBillPayload | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);

    // Compact array format
    if (Array.isArray(parsed) && parsed.length >= 9) {
      const [invNo, date, stateCode, paymentMode, custName, custPhone, custGstin, custAddress, rawItems] = parsed;
      const items: InvoiceItem[] = Array.isArray(rawItems)
        ? rawItems.map((row: any, idx: number) => ({
            id: `shared-${idx}`,
            name: row[0] || '',
            qty: Number(row[1]) || 1,
            mrp: Number(row[2]) > 0 ? Number(row[2]) : undefined,
            sellingPrice: Number(row[3]) || 0,
            gst: Number(row[4]) || 0,
          }))
        : [];
      return {
        invNo: String(invNo),
        date: String(date),
        buyerState: stateCode === 'd' ? 'diff' : 'same',
        paymentMode: paymentMode || 'Cash',
        custName: custName || '',
        custPhone: custPhone || '',
        custGstin: custGstin || '',
        custAddress: custAddress || '',
        items,
        store: DEFAULT_STORE_SETTINGS,
      };
    }

    // Legacy object format
    if (parsed && parsed.invNo && Array.isArray(parsed.items)) {
      return {
        ...parsed,
        store: parsed.store || DEFAULT_STORE_SETTINGS,
      } as ShareableBillPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build the short public shareable bill link on tanmayabillingsoftware.netlify.app
 */
export function buildShareableBillLink(payload: ShareableBillPayload): string {
  const origin =
    typeof window !== 'undefined' && window.location.hostname.endsWith('netlify.app')
      ? window.location.origin
      : 'https://tanmayabillingsoftware.netlify.app';
  const encoded = encodeBillToUrl(payload);
  return `${origin}/bill?d=${encoded}`;
}

/**
 * WhatsApp share with direct clickable bill link
 */
export function buildWhatsAppShareUrl(invoice: {
  invNo: string;
  date?: string;
  buyerState?: 'same' | 'diff';
  paymentMode?: 'Cash' | 'Card' | 'Online';
  custName?: string;
  custPhone?: string;
  custGstin?: string;
  custAddress?: string;
  items: InvoiceItem[];
  taxable: number;
  totalGst: number;
  totalSavings: number;
  grandTotal: number;
  store: StoreSettings;
}): string {
  const rawDigits = (invoice.custPhone || '').replace(/\D/g, '').replace(/^0+/, '');
  const custName = invoice.custName || 'Customer';
  const invNo = invoice.invNo;

  const billLink = buildShareableBillLink({
    invNo,
    date: invoice.date || new Date().toISOString().slice(0, 10),
    buyerState: invoice.buyerState || 'same',
    paymentMode: invoice.paymentMode || 'Cash',
    custName: invoice.custName,
    custPhone: invoice.custPhone,
    custGstin: invoice.custGstin,
    custAddress: invoice.custAddress,
    items: invoice.items,
    store: invoice.store,
  });

  let msg = `*${invoice.store.shopName} — INVOICE ${invNo}*\n`;
  msg += `Hello ${custName},\n`;
  msg += `Thank you for shopping with us! Your bill total is *₹${invoice.grandTotal.toFixed(0)}*.\n\n`;
  msg += `View & Download your PDF Bill here:\n${billLink}\n\n`;
  msg += `${invoice.store.phone} | ${invoice.store.instagram || '@tanmayaclothing'}`;

  const target =
    rawDigits.length >= 10
      ? rawDigits.length === 10
        ? '91' + rawDigits
        : rawDigits
      : '';
  return `https://wa.me/${target}?text=${encodeURIComponent(msg)}`;
}
