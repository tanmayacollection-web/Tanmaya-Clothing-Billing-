/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvoiceRecord } from '../utils/billing';

export const INITIAL_SEED_INVOICES: InvoiceRecord[] = [
  {
    id: 'seed-1',
    invNo: 'TC-001',
    date: new Date(Date.now() - 3600 * 24 * 1000 * 3).toISOString().slice(0, 10),
    buyerState: 'same',
    paymentMode: 'Cash',
    custName: 'Ananya Deshmukh',
    custPhone: '9822145678',
    custAddress: 'College Road, Nashik',
    items: [
      { id: 'item-s1-1', name: 'Cotton Printed Kurti', qty: 2, mrp: 899, sellingPrice: 809, gst: 5 },
      { id: 'item-s1-2', name: 'Women Cotton Palazzo', qty: 1, sellingPrice: 599, gst: 5 }
    ],
    taxable: 2217,
    cgst: 55.43,
    sgst: 55.43,
    igst: 0,
    totalGst: 110.86,
    totalSavings: 180,
    grandTotal: 2327.86,
    savedAt: new Date(Date.now() - 3600 * 24 * 1000 * 3).toISOString()
  },
  {
    id: 'seed-2',
    invNo: 'TC-002',
    date: new Date(Date.now() - 3600 * 24 * 1000 * 2).toISOString().slice(0, 10),
    buyerState: 'same',
    paymentMode: 'Online',
    custName: 'Sanjay Kulkarni',
    custPhone: '9423188990',
    custAddress: 'Gangapur Road, Nashik',
    items: [
      { id: 'item-s2-1', name: 'Chanderi Silk Saree', qty: 1, mrp: 1899, sellingPrice: 1804, gst: 12 },
      { id: 'item-s2-2', name: 'Cotton Dupatta', qty: 2, sellingPrice: 350, gst: 5 }
    ],
    taxable: 2504,
    cgst: 125.74,
    sgst: 125.74,
    igst: 0,
    totalGst: 251.48,
    totalSavings: 95,
    grandTotal: 2755.48,
    savedAt: new Date(Date.now() - 3600 * 24 * 1000 * 2).toISOString()
  },
  {
    id: 'seed-3',
    invNo: 'TC-003',
    date: new Date(Date.now() - 3600 * 24 * 1000 * 1).toISOString().slice(0, 10),
    buyerState: 'same',
    paymentMode: 'Card',
    custName: 'Sneha Patel',
    custPhone: '9158334411',
    custAddress: 'Mahatma Nagar, Nashik',
    items: [
      { id: 'item-s3-1', name: 'Stretchable Denim Jeans', qty: 1, mrp: 1499, sellingPrice: 1274, gst: 12 },
      { id: 'item-s3-2', name: 'Oversized Graphic T-Shirt', qty: 2, mrp: 649, sellingPrice: 584, gst: 5 }
    ],
    taxable: 2442,
    cgst: 105.15,
    sgst: 105.15,
    igst: 0,
    totalGst: 210.3,
    totalSavings: 355,
    grandTotal: 2652.3,
    savedAt: new Date(Date.now() - 3600 * 24 * 1000 * 1).toISOString()
  },
  {
    id: 'seed-4',
    invNo: 'TC-004',
    date: new Date().toISOString().slice(0, 10),
    buyerState: 'same',
    paymentMode: 'Cash',
    custName: 'Rahul Joshi',
    custPhone: '9860223344',
    custAddress: 'Panchavati, Nashik',
    items: [
      { id: 'item-s4-1', name: 'Men Cotton Casual Shirt', qty: 2, mrp: 999, sellingPrice: 799, gst: 5 }
    ],
    taxable: 1598,
    cgst: 39.95,
    sgst: 39.95,
    igst: 0,
    totalGst: 79.9,
    totalSavings: 400,
    grandTotal: 1677.9,
    savedAt: new Date().toISOString()
  }
];
