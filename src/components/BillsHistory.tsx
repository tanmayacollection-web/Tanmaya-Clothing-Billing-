/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { InvoiceRecord, StoreSettings, fmtINR, buildWhatsAppShareUrl } from '../utils/billing';
import {
  Search,
  Download,
  Filter,
  Eye,
  Printer,
  Share2,
  Trash2,
  FileText,
  Calendar,
  ArrowUpDown
} from 'lucide-react';

interface BillsHistoryProps {
  invoices: InvoiceRecord[];
  store: StoreSettings;
  onViewInvoice: (inv: InvoiceRecord) => void;
  onDeleteInvoice: (id: string) => void;
  onNewBill: () => void;
}

export const BillsHistory: React.FC<BillsHistoryProps> = ({
  invoices,
  store,
  onViewInvoice,
  onDeleteInvoice,
  onNewBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredInvoices = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekStr = oneWeekAgo.toISOString().slice(0, 10);
    const thisMonthStr = today.slice(0, 7);

    return invoices
      .filter((inv) => {
        // Search filter
        const term = searchTerm.toLowerCase().trim();
        const custNameStr = (inv.custName || '').toLowerCase();
        const matchesSearch =
          !term ||
          inv.invNo.toLowerCase().includes(term) ||
          custNameStr.includes(term) ||
          (inv.custPhone && inv.custPhone.includes(term)) ||
          inv.items.some((it) => (it.name || '').toLowerCase().includes(term));

        if (!matchesSearch) return false;

        // Date filter
        if (dateFilter === 'today' && inv.date !== today) return false;
        if (dateFilter === 'week' && inv.date < oneWeekStr) return false;
        if (dateFilter === 'month' && !inv.date.startsWith(thisMonthStr)) return false;

        // Payment filter
        if (paymentFilter !== 'all' && inv.paymentMode !== paymentFilter) return false;

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [invoices, searchTerm, dateFilter, paymentFilter, sortOrder]);

  const totalFilteredSum = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  }, [filteredInvoices]);

  const exportCSV = () => {
    if (filteredInvoices.length === 0) return;
    const headers = [
      'Invoice No',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Customer GSTIN',
      'Items Count',
      'Items Detail',
      'Payment Mode',
      'Taxable Value',
      'CGST',
      'SGST',
      'IGST',
      'Total GST',
      'Grand Total',
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.invNo,
      inv.date,
      `"${(inv.custName || '').replace(/"/g, '""')}"`,
      inv.custPhone || '',
      inv.custGstin || '',
      inv.items.length,
      `"${inv.items.map((i) => `${i.name || 'Item'} x${i.qty} (₹${i.sellingPrice})`).join('; ')}"`,
      inv.paymentMode,
      inv.taxable,
      inv.cgst,
      inv.sgst,
      inv.igst,
      inv.totalGst,
      inv.grandTotal,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Tanmaya_Clothing_Sales_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (inv: InvoiceRecord) => {
    onViewInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleWhatsApp = (inv: InvoiceRecord) => {
    const url = buildWhatsAppShareUrl({
      invNo: inv.invNo,
      custName: inv.custName,
      custPhone: inv.custPhone,
      items: inv.items,
      taxable: inv.taxable,
      totalGst: inv.totalGst,
      totalSavings: inv.totalSavings,
      grandTotal: inv.grandTotal,
      store,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl text-[#0b0b0c] uppercase">
            Bills & Sales History
          </h2>
          <p className="text-xs text-[#6b6b70]">
            Complete record of all invoices generated for {store.shopName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredInvoices.length === 0}
            className="flex items-center gap-1.5 bg-white border border-[#d8d5cd] hover:border-black text-[#0b0b0c] text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onNewBill}
            className="flex items-center gap-1.5 bg-[#0b0b0c] hover:bg-[#d94f30] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded shadow-xs transition-colors cursor-pointer"
          >
            <span>+ New Bill</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e4e2dc] rounded-lg p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice, customer, phone, item..."
            className="w-full bg-[#f8f7f4] border border-[#d8d5cd] text-black pl-9 pr-3 py-1.5 text-xs rounded focus:outline-none focus:border-black"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-[#f5f3ee] p-1 rounded border border-[#e4e2dc] text-xs">
            <span className="text-[10px] uppercase font-bold text-[#777] px-1">Period:</span>
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                dateFilter === 'all' ? 'bg-white shadow-xs font-bold text-black' : 'text-[#666]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                dateFilter === 'today' ? 'bg-white shadow-xs font-bold text-black' : 'text-[#666]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('week')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                dateFilter === 'week' ? 'bg-white shadow-xs font-bold text-black' : 'text-[#666]'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('month')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                dateFilter === 'month' ? 'bg-white shadow-xs font-bold text-black' : 'text-[#666]'
              }`}
            >
              This Month
            </button>
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#f5f3ee] border border-[#e4e2dc] text-black px-2.5 py-1.5 text-xs rounded focus:outline-none"
          >
            <option value="all">All Modes</option>
            <option value="Cash">Cash Only</option>
            <option value="Online">Online / UPI</option>
            <option value="Card">Card</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 bg-[#f5f3ee] border border-[#e4e2dc] rounded hover:bg-white text-xs text-[#555] flex items-center gap-1 cursor-pointer"
            title="Toggle Sort Date"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex justify-between items-center text-xs text-[#666] mb-3 px-1">
        <div>
          Showing <strong>{filteredInvoices.length}</strong> of {invoices.length} bills
        </div>
        <div>
          Filtered Total: <strong className="text-black font-mono-num">{fmtINR(totalFilteredSum)}</strong>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-[#e4e2dc] rounded-lg shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-[#888] text-xs">
            No invoices found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f3ee] text-[#0b0b0c] text-[11px] uppercase tracking-wider font-semibold border-b border-[#e4e2dc]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-right">Taxable</th>
                  <th className="py-3 px-3 text-right">GST</th>
                  <th className="py-3 px-3 text-right font-bold">Grand Total</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2dc] text-xs">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3 px-4 font-mono-num font-bold text-[#0b0b0c]">
                      {inv.invNo}
                    </td>
                    <td className="py-3 px-3 text-[#555] font-mono-num whitespace-nowrap">
                      {inv.date
                        ? new Date(inv.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#111]">
                      <div>{inv.custName || 'Walk-in Customer'}</div>
                      {inv.custPhone && (
                        <div className="text-[10px] text-[#777] font-mono-num">
                          +91 {inv.custPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#555]">
                      <div className="truncate max-w-[180px]" title={inv.items.map((i) => i.name || 'Item').join(', ')}>
                        {inv.items.map((i) => i.name || 'Item').join(', ') || '0 items'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          inv.paymentMode === 'Cash'
                            ? 'bg-[#fde8d8] text-[#b8551a]'
                            : 'bg-[#dbe8fd] text-[#2e6bd9]'
                        }`}
                      >
                        {inv.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-[#555]">
                      {fmtINR(inv.taxable)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-[#555]">
                      {fmtINR(inv.totalGst)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num font-bold text-sm text-[#0b0b0c]">
                      {fmtINR(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          title="View Invoice"
                          className="p-1.5 rounded border border-[#ddd] hover:border-black text-[#333] hover:text-black transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(inv)}
                          title="Print"
                          className="p-1.5 rounded border border-[#ddd] hover:border-[#d94f30] text-[#333] hover:text-[#d94f30] transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(inv)}
                          title="WhatsApp Share"
                          className="p-1.5 rounded border border-[#ddd] hover:border-[#25D366] text-[#333] hover:text-[#25D366] transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete invoice ${inv.invNo}?`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          title="Delete"
                          className="p-1.5 rounded border border-[#ddd] hover:border-[#ff8a7a] text-[#888] hover:text-[#ff8a7a] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
