/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcItemAmounts,
  calcInvoiceTotals,
  fmt,
  generateNewInvoiceNo,
  buildWhatsAppShareUrl,
  DEFAULT_STORE_SETTINGS,
  InvoiceItem
} from './billing';

test('calcItemAmounts works with selling price without MRP', () => {
  const item: InvoiceItem = {
    id: '1',
    qty: 2,
    sellingPrice: 800,
    gst: 5
  };
  const res = calcItemAmounts(item);
  assert.equal(res.rate, 800);
  assert.equal(res.taxable, 1600);
  assert.equal(res.gstAmount, 80);
  assert.equal(res.total, 1680);
  assert.equal(res.savings, 0);
});

test('calcItemAmounts works with optional MRP and calculates savings', () => {
  const item: InvoiceItem = {
    id: '2',
    name: 'Kurti',
    qty: 1,
    mrp: 1200,
    sellingPrice: 900,
    gst: 5
  };
  const res = calcItemAmounts(item);
  assert.equal(res.rate, 900);
  assert.equal(res.mrp, 1200);
  assert.equal(res.taxable, 900);
  assert.equal(res.gstAmount, 45);
  assert.equal(res.savings, 300);
  assert.equal(res.discount, 25); // (1200 - 900) / 1200 = 25%
});

test('calcInvoiceTotals handles intra-state Maharashtra and inter-state', () => {
  const items: InvoiceItem[] = [
    { id: '1', qty: 1, sellingPrice: 1000, gst: 5 },
    { id: '2', qty: 2, sellingPrice: 500, gst: 12 }
  ];
  const sameState = calcInvoiceTotals(items, 'same');
  assert.equal(sameState.taxable, 2000);
  assert.equal(sameState.totalGst, 170); // 50 + 120
  assert.equal(sameState.cgst, 85);
  assert.equal(sameState.sgst, 85);
  assert.equal(sameState.igst, 0);
  assert.equal(sameState.grandTotal, 2170);

  const diffState = calcInvoiceTotals(items, 'diff');
  assert.equal(diffState.cgst, 0);
  assert.equal(diffState.sgst, 0);
  assert.equal(diffState.igst, 170);
});

test('generateNewInvoiceNo produces sequential invoice numbers', () => {
  assert.equal(generateNewInvoiceNo([]), 'TC-001');
  assert.equal(generateNewInvoiceNo([{ invNo: 'TC-001' }]), 'TC-002');
  assert.equal(generateNewInvoiceNo([{ invNo: 'TC-001' }, { invNo: 'TC-004' }]), 'TC-005');
});

test('buildWhatsAppShareUrl generates valid WhatsApp link', () => {
  const url = buildWhatsAppShareUrl({
    invNo: 'TC-001',
    custName: 'Sneha',
    custPhone: '9822145678',
    items: [{ id: '1', qty: 1, sellingPrice: 500, gst: 5 }],
    taxable: 500,
    totalGst: 25,
    totalSavings: 0,
    grandTotal: 525,
    store: DEFAULT_STORE_SETTINGS
  });
  assert.ok(url.startsWith('https://wa.me/919822145678?text='));
  assert.ok(url.includes('TC-001'));
});
