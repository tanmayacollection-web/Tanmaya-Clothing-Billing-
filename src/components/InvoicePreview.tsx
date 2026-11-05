/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  InvoiceItem,
  StoreSettings,
  calcItemAmounts,
  calcInvoiceTotals,
  fmt
} from '../utils/billing';

interface InvoicePreviewProps {
  invNo: string;
  date: string;
  buyerState: 'same' | 'diff';
  custName?: string;
  custPhone?: string;
  custGstin?: string;
  custAddress?: string;
  items: InvoiceItem[];
  store: StoreSettings;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invNo,
  date,
  buyerState,
  custName,
  custPhone,
  custGstin,
  custAddress,
  items,
  store,
}) => {
  const totals = calcInvoiceTotals(items, buyerState);
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <div
      id="invoicePreview"
      className="invoice bg-white text-[#111111] w-full max-w-[800px] p-8 sm:p-10 shadow-2xl rounded-none border border-[#d8d5cd] select-text"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Header */}
      <div className="flex justify-between items-start border-b-[3px] border-[#0b0b0c] pb-5 mb-5">
        <div>
          <div className="font-display text-2xl sm:text-[30px] tracking-tight leading-none text-[#0b0b0c]">
            {store.shopName}
            <div className="w-11 h-1 bg-[#d94f30] mt-2 rounded-xs" />
          </div>
          <div className="text-xs text-[#6b6b70] mt-3 leading-relaxed max-w-[280px]">
            {store.address}<br />
            {store.cityState}<br />
            Phone: {store.phone} &nbsp;|&nbsp; Email: {store.email}<br />
            GSTIN: <span>{store.gstin || 'ADD YOUR GSTIN HERE'}</span>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-xl sm:text-[26px] font-display text-white bg-[#0b0b0c] inline-block px-4 py-1.5 tracking-wider">
            TAX INVOICE
          </h2>
          <div className="text-xs text-[#6b6b70] mt-2.5 leading-relaxed">
            Invoice No: <span className="font-bold text-[#0b0b0c]">{invNo || 'TC-001'}</span><br />
            Date: <span className="font-bold text-[#0b0b0c]">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Parties / Bill To & Place of Supply */}
      <div className="flex justify-between gap-5 mb-6">
        <div className="flex-1">
          <h4 className="text-[11px] uppercase tracking-wider text-[#6b6b70] mb-1.5 font-bold">
            Billed To
          </h4>
          <div className="font-extrabold text-[15px] text-[#0b0b0c] mb-0.5">
            {custName || 'Customer Name'}
          </div>
          <div className="text-[13px] text-[#444] leading-normal">
            {custAddress || 'Address'}
          </div>
          {custPhone ? (
            <div className="text-[13px] text-[#444] leading-normal">
              Phone: {custPhone}
            </div>
          ) : (
            <div className="text-[13px] text-[#444] leading-normal">Phone</div>
          )}
          {custGstin && (
            <div className="text-[13px] text-[#0b0b0c] font-semibold leading-normal">
              GSTIN: {custGstin}
            </div>
          )}
        </div>
      </div>

      {/* Non-sliding Full Width Items Table */}
      <table className="w-full border-collapse mb-5 text-[13px]">
        <thead>
          <tr className="bg-[#0b0b0c] text-white text-[11px] uppercase tracking-wider">
            <th className="py-2.5 px-2 text-left font-semibold">Item</th>
            <th className="py-2.5 px-2 text-right font-semibold">Qty</th>
            <th className="py-2.5 px-2 text-right font-semibold">MRP</th>
            <th className="py-2.5 px-2 text-right font-semibold">Discount</th>
            <th className="py-2.5 px-2 text-right font-semibold">Rate</th>
            <th className="py-2.5 px-2 text-right font-semibold">GST%</th>
            <th className="py-2.5 px-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4e2dc]">
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-[#999] italic">
                No items added yet.
              </td>
            </tr>
          ) : (
            items.map((it, idx) => {
              const res = calcItemAmounts(it);
              const displayName = it.name?.trim() || 'Item';
              return (
                <tr key={it.id || idx}>
                  <td className="py-2.5 px-2 text-left font-medium text-[#111] break-words max-w-[240px]">
                    {displayName}
                  </td>
                  <td className="py-2.5 px-2 text-right">{it.qty}</td>
                  <td className="py-2.5 px-2 text-right">
                    {res.mrp > 0 ? (
                      res.discount > 0 ? (
                        <span className="line-through text-[#999]">{fmt(res.mrp)}</span>
                      ) : (
                        fmt(res.mrp)
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    {res.discount > 0 ? `${res.discount}%` : '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right">{fmt(res.rate)}</td>
                  <td className="py-2.5 px-2 text-right">{it.gst}%</td>
                  <td className="py-2.5 px-2 text-right font-semibold">{fmt(res.taxable)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Totals Box matching original HTML */}
      <div className="flex justify-end mb-6">
        <div className="w-[280px]">
          {totals.totalSavings > 0 && (
            <div className="flex justify-between py-1.5 text-[13px] text-[#1a8a3a] font-bold">
              <span>You Saved</span>
              <span>{fmt(totals.totalSavings)}</span>
            </div>
          )}

          <div className="flex justify-between py-1.5 text-[13px] text-[#444]">
            <span>Taxable Value</span>
            <span>{fmt(totals.taxable)}</span>
          </div>

          <div className="flex justify-between py-1.5 text-[13px] text-[#444]">
            <span>CGST</span>
            <span>{fmt(totals.cgst)}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[13px] text-[#444]">
            <span>SGST</span>
            <span>{fmt(totals.sgst)}</span>
          </div>

          <div className="flex justify-between border-t-2 border-[#0b0b0c] mt-1.5 pt-2.5 text-lg font-extrabold text-[#0b0b0c]">
            <span>Grand Total</span>
            <span>{fmt(totals.grandTotal)}</span>
          </div>

          <div className="text-[11px] text-[#6b6b70] text-right mt-1">
            Inclusive of all applicable taxes
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="border-t border-[#e4e2dc] pt-4 mb-4">
        <h4 className="text-[11px] uppercase tracking-wider text-[#6b6b70] mb-2 font-bold">
          Terms &amp; Conditions
        </h4>
        <ol className="list-decimal pl-4 text-[11.5px] text-[#555] leading-relaxed space-y-1">
          {store.terms.map((t, idx) => (
            <li key={idx}>{t}</li>
          ))}
        </ol>
      </div>

      {/* Invoice Footer */}
      <div className="flex justify-between items-end border-t border-[#e4e2dc] pt-5 gap-5">
        <div className="flex-1 text-xs text-[#444] leading-relaxed">
          <h4 className="text-[11px] uppercase tracking-wider text-[#6b6b70] mb-1.5 font-bold">
            Payment / Contact
          </h4>
          Phone: {store.phone}<br />
          Email / Support: {store.email}<br />
          {store.instagram && <>Instagram: {store.instagram}</>}
        </div>

        <div className="flex-1 text-right">
          <div className="inline-block text-center">
            <img
              src="/stamp.png"
              alt="Authorised Signatory Tanmaya Clothing"
              className="h-14 object-contain mb-1 inline-block"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="border-t border-[#999] pt-1.5 text-xs text-[#6b6b70] min-w-[170px] text-center">
              Authorised Signatory
              <strong className="block text-[13px] text-[#0b0b0c] mt-0.5">
                {store.shopName}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
