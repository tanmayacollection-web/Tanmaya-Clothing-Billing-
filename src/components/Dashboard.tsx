/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvoiceRecord, StoreSettings, fmtINR, buildWhatsAppShareUrl } from '../utils/billing';
import {
  TrendingUp,
  CreditCard,
  Banknote,
  Receipt,
  Eye,
  Printer,
  Share2,
  Trash2,
  Calendar,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface DashboardProps {
  invoices: InvoiceRecord[];
  store: StoreSettings;
  onViewInvoice: (inv: InvoiceRecord) => void;
  onDeleteInvoice: (id: string) => void;
  onNewBill: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  store,
  onViewInvoice,
  onDeleteInvoice,
  onNewBill,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);

  const now = new Date();
  const thisMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey =
    lastMonthDate.getFullYear() + '-' + String(lastMonthDate.getMonth() + 1).padStart(2, '0');
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  let thisMonthTotal = 0;
  let lastMonthTotal = 0;
  let yearTotal = 0;
  let cashTotal = 0;
  let onlineTotal = 0;
  let totalSavingsGiven = 0;
  let totalItemsCount = 0;
  const monthTotals: Record<string, { total: number; count: number }> = {};

  invoices.forEach((inv) => {
    const d = new Date(inv.date);
    const key = inv.date ? inv.date.slice(0, 7) : thisMonthKey;
    if (!monthTotals[key]) monthTotals[key] = { total: 0, count: 0 };
    monthTotals[key].total += inv.grandTotal;
    monthTotals[key].count += 1;

    if (key === thisMonthKey) thisMonthTotal += inv.grandTotal;
    if (key === lastMonthKey) lastMonthTotal += inv.grandTotal;
    if (d >= oneYearAgo) yearTotal += inv.grandTotal;

    if (inv.paymentMode === 'Cash') {
      cashTotal += inv.grandTotal;
    } else {
      onlineTotal += inv.grandTotal;
    }

    totalSavingsGiven += inv.totalSavings || 0;
    totalItemsCount += (inv.items || []).reduce((acc, it) => acc + (it.qty || 1), 0);
  });

  // Last 6 months keys, oldest to newest
  const last6Keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Keys.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }

  const maxVal = Math.max(...last6Keys.map((k) => monthTotals[k]?.total || 0), 1000);
  const totalMoney = cashTotal + onlineTotal || 1;
  const cashPct = Math.round((cashTotal / totalMoney) * 100);
  const onlinePct = 100 - cashPct;

  const recentBills = [...invoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id)
  );

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  };

  const handlePrintInv = (inv: InvoiceRecord) => {
    onViewInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleShareWhatsApp = (inv: InvoiceRecord) => {
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
    <div className="dash max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notice box */}
      <div className="bg-[#fff7ed] border border-[#ffedd5] text-[#9a3412] text-xs sm:text-sm p-4 rounded-lg mb-8 flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-[#d94f30] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Local Device Records:</strong> Sales bills are saved securely in this browser for{' '}
          <strong>{store.shopName}</strong>. You can view, search, re-print, and export sales to CSV anytime.
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white border border-[#e4e2dc] rounded-xl p-12 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-[#9a9a9f] mx-auto mb-3" />
          <h3 className="font-display text-lg text-[#0b0b0c] uppercase">No Saved Bills Yet</h3>
          <p className="text-xs text-[#6b6b70] max-w-md mx-auto mt-1 mb-6">
            Create your first customer bill on the New Bill tab and hit &quot;Save Bill to Records&quot; to start tracking revenue.
          </p>
          <button
            type="button"
            onClick={onNewBill}
            className="bg-[#0b0b0c] hover:bg-[#d94f30] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded transition-colors cursor-pointer"
          >
            Create First Bill
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
            <div className="bg-white border border-[#e4e2dc] rounded-lg p-4 shadow-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#6b6b70] font-bold mb-1 flex items-center justify-between">
                <span>This Month</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#d94f30]" />
              </div>
              <div className="font-display text-xl sm:text-2xl text-[#d94f30]">
                {fmtINR(thisMonthTotal)}
              </div>
            </div>

            <div className="bg-white border border-[#e4e2dc] rounded-lg p-4 shadow-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#6b6b70] font-bold mb-1">
                Last Month
              </div>
              <div className="font-display text-xl sm:text-2xl text-[#0b0b0c]">
                {fmtINR(lastMonthTotal)}
              </div>
            </div>

            <div className="bg-white border border-[#e4e2dc] rounded-lg p-4 shadow-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#6b6b70] font-bold mb-1">
                Last 12 Mos
              </div>
              <div className="font-display text-xl sm:text-2xl text-[#0b0b0c]">
                {fmtINR(yearTotal)}
              </div>
            </div>

            <div className="bg-white border border-[#e4e2dc] rounded-lg p-4 shadow-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#6b6b70] font-bold mb-1 flex items-center justify-between">
                <span>Cash Sales</span>
                <Banknote className="w-3.5 h-3.5 text-[#b8551a]" />
              </div>
              <div className="font-display text-xl sm:text-2xl text-[#b8551a]">
                {fmtINR(cashTotal)}
              </div>
              <div className="text-[10px] text-[#888] mt-0.5">{cashPct}% of revenue</div>
            </div>

            <div className="bg-white border border-[#e4e2dc] rounded-lg p-4 shadow-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#6b6b70] font-bold mb-1 flex items-center justify-between">
                <span>Online / UPI</span>
                <CreditCard className="w-3.5 h-3.5 text-[#2e6bd9]" />
              </div>
              <div className="font-display text-xl sm:text-2xl text-[#2e6bd9]">
                {fmtINR(onlineTotal)}
              </div>
              <div className="text-[10px] text-[#888] mt-0.5">{onlinePct}% of revenue</div>
            </div>

            <div className="bg-white border border-[#e4e2dc] rounded-lg p-4 shadow-xs">
              <div className="text-[10px] uppercase tracking-wider text-[#6b6b70] font-bold mb-1 flex items-center justify-between">
                <span>Total Bills</span>
                <Receipt className="w-3.5 h-3.5 text-[#1a8a3a]" />
              </div>
              <div className="font-display text-xl sm:text-2xl text-[#1a8a3a]">
                {invoices.length}
              </div>
              <div className="text-[10px] text-[#888] mt-0.5">{totalItemsCount} items sold</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Monthly Sales Bar Chart */}
            <div className="lg:col-span-8 bg-white border border-[#e4e2dc] rounded-lg p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm tracking-wide text-[#0b0b0c] uppercase">
                  Sales Revenue — Last 6 Months
                </h3>
                <span className="text-[11px] text-[#777]">Hover to inspect</span>
              </div>

              <div className="flex items-end gap-3 sm:gap-6 h-52 pt-8 pb-2 border-b border-[#e4e2dc]">
                {last6Keys.map((k, idx) => {
                  const mData = monthTotals[k] || { total: 0, count: 0 };
                  const heightPct = Math.max(4, Math.round((mData.total / maxVal) * 100));
                  const isHovered = selectedMonthIndex === idx;

                  return (
                    <div
                      key={k}
                      onMouseEnter={() => setSelectedMonthIndex(idx)}
                      onMouseLeave={() => setSelectedMonthIndex(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    >
                      {/* Bar value label */}
                      <div
                        className={`text-[10px] font-bold font-mono-num mb-1.5 transition-all ${
                          isHovered ? 'text-[#d94f30] scale-110' : 'text-[#555]'
                        }`}
                      >
                        {mData.total > 0 ? fmtINR(mData.total) : '₹0'}
                      </div>

                      {/* Bar fill */}
                      <div className="w-full max-w-[48px] bg-[#f0eee9] rounded-t-sm h-full flex items-end">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isHovered
                              ? 'bg-[#d94f30]'
                              : 'bg-gradient-to-t from-[#b8391e] to-[#d94f30]'
                          }`}
                        />
                      </div>

                      {/* Month label */}
                      <div className="text-[11px] text-[#6b6b70] mt-2 font-medium">
                        {monthLabel(k)}
                      </div>
                      <div className="text-[9px] text-[#999]">
                        {mData.count} {mData.count === 1 ? 'bill' : 'bills'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Split */}
            <div className="lg:col-span-4 bg-white border border-[#e4e2dc] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-display text-sm tracking-wide text-[#0b0b0c] uppercase mb-4">
                  Payment Mode Split
                </h3>

                <div className="flex flex-col items-center justify-center my-4">
                  {/* Conic donut preview */}
                  <div
                    className="w-36 h-36 rounded-full flex items-center justify-center shadow-inner relative"
                    style={{
                      background: `conic-gradient(#b8551a 0% ${cashPct}%, #2e6bd9 ${cashPct}% 100%)`,
                    }}
                  >
                    <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] text-[#888] font-bold uppercase">Total</span>
                      <span className="text-xs font-display text-black">{invoices.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#f0eee9] text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#b8551a]" />
                    <span className="font-medium text-[#333]">Cash</span>
                  </div>
                  <div className="font-mono-num font-bold text-[#b8551a]">
                    {cashPct}% ({fmtINR(cashTotal)})
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2e6bd9]" />
                    <span className="font-medium text-[#333]">Online / UPI</span>
                  </div>
                  <div className="font-mono-num font-bold text-[#2e6bd9]">
                    {onlinePct}% ({fmtINR(onlineTotal)})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bills Table */}
          <div className="bg-white border border-[#e4e2dc] rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#e4e2dc] flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display text-sm tracking-wide text-[#0b0b0c] uppercase">
                  Recent Invoices ({recentBills.length})
                </h3>
                <p className="text-xs text-[#777]">Latest sales bills created in Tanmaya Clothing</p>
              </div>

              <button
                type="button"
                onClick={onNewBill}
                className="bg-[#0b0b0c] hover:bg-[#d94f30] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors cursor-pointer"
              >
                + New Bill
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f3ee] text-[#0b0b0c] text-[11px] uppercase tracking-wider font-semibold border-b border-[#e4e2dc]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Items</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2dc] text-xs">
                  {recentBills.slice(0, 10).map((inv) => (
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
                      <td className="py-3 px-3 text-[#666]">
                        {inv.items?.length || 0} {inv.items?.length === 1 ? 'item' : 'items'}
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
                            onClick={() => handlePrintInv(inv)}
                            title="Print Invoice"
                            className="p-1.5 rounded border border-[#ddd] hover:border-[#d94f30] text-[#333] hover:text-[#d94f30] transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(inv)}
                            title="Share on WhatsApp"
                            className="p-1.5 rounded border border-[#ddd] hover:border-[#25D366] text-[#333] hover:text-[#25D366] transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.invNo}?`)) {
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
          </div>
        </>
      )}
    </div>
  );
};
