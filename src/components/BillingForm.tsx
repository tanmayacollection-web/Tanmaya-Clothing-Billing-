/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InvoiceItem } from '../utils/billing';
import { Plus, Trash2, Printer, Save, Share2, RotateCcw } from 'lucide-react';

interface BillingFormProps {
  currentBillNo: string;
  date: string;
  setDate: (val: string) => void;
  buyerState: 'same' | 'diff';
  setBuyerState: (val: 'same' | 'diff') => void;
  paymentMode: 'Cash' | 'Card' | 'Online';
  setPaymentMode: (val: 'Cash' | 'Card' | 'Online') => void;
  custName: string;
  setCustName: (val: string) => void;
  custPhone: string;
  setCustPhone: (val: string) => void;
  custGstin: string;
  setCustGstin: (val: string) => void;
  custAddress: string;
  setCustAddress: (val: string) => void;
  items: InvoiceItem[];
  setItems: React.Dispatch<React.SetStateAction<InvoiceItem[]>>;
  onSaveBill: () => void;
  onPrint: () => void;
  onShareWhatsApp: () => void;
  onReset: () => void;
}

export const BillingForm: React.FC<BillingFormProps> = ({
  currentBillNo,
  date,
  setDate,
  buyerState,
  setBuyerState,
  paymentMode,
  setPaymentMode,
  custName,
  setCustName,
  custPhone,
  setCustPhone,
  custGstin,
  setCustGstin,
  custAddress,
  setCustAddress,
  items,
  setItems,
  onSaveBill,
  onPrint,
  onShareWhatsApp,
  onReset,
}) => {
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: '',
      qty: 1,
      mrp: undefined,
      sellingPrice: 0,
      discount: 0,
      gst: 0, // No forced default GST
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  return (
    <div className="form-panel bg-[#141415] text-white p-6 sm:p-8 overflow-y-auto no-print border-r border-[#262628]">
      {/* Top indicator: Current auto-generated bill number */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#262628]">
        <div>
          <span className="text-[11px] text-[#9a9a9f] uppercase tracking-wider font-semibold">
            Bill Sequence
          </span>
          <div className="text-base font-bold text-white font-mono">
            {currentBillNo}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[#bbb] hover:text-white flex items-center gap-1 border border-[#333] hover:border-[#666] px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New Bill</span>
        </button>
      </div>

      {/* 01. Customer Details (Now on top as requested) */}
      <div className="form-section mb-6">
        <h3 className="text-[13px] uppercase tracking-wider font-bold text-[#d94f30] mb-3.5">
          Customer Details
        </h3>

        <div className="form-field mb-2.5">
          <label className="block text-[11px] text-[#9a9a9f] uppercase tracking-wider mb-1 font-medium">
            Customer Name (Optional)
          </label>
          <input
            type="text"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
            placeholder="Customer's full name"
            className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#d94f30]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
          <div className="form-field">
            <label className="block text-[11px] text-[#9a9a9f] uppercase tracking-wider mb-1 font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="10-digit mobile"
              className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#d94f30]"
            />
          </div>

          <div className="form-field">
            <label className="block text-[11px] text-[#9a9a9f] uppercase tracking-wider mb-1 font-medium">
              Customer GSTIN (Optional)
            </label>
            <input
              type="text"
              value={custGstin}
              onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
              placeholder="If registered business"
              className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#d94f30] uppercase"
            />
          </div>
        </div>

        <div className="form-field">
          <label className="block text-[11px] text-[#9a9a9f] uppercase tracking-wider mb-1 font-medium">
            Address
          </label>
          <textarea
            value={custAddress}
            onChange={(e) => setCustAddress(e.target.value)}
            rows={2}
            placeholder="Delivery / billing address"
            className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#d94f30] resize-none"
          />
        </div>
      </div>

      {/* 02. Invoice Details (Now below customer details as requested) */}
      <div className="form-section mb-6 pt-2 border-t border-[#262628]">
        <h3 className="text-[13px] uppercase tracking-wider font-bold text-[#d94f30] mb-3.5">
          Invoice Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <div className="form-field">
            <label className="block text-[11px] text-[#9a9a9f] uppercase tracking-wider mb-1 font-medium">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#d94f30]"
            />
          </div>

          <div className="form-field">
            <label className="block text-[11px] text-[#9a9a9f] uppercase tracking-wider mb-1 font-medium">
              Place of Supply (Buyer&apos;s State)
            </label>
            <select
              value={buyerState}
              onChange={(e) => setBuyerState(e.target.value as 'same' | 'diff')}
              className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#d94f30]"
            >
              <option value="same">Maharashtra (CGST + SGST)</option>
              <option value="diff">Other State (IGST)</option>
            </select>
          </div>
        </div>

        {/* 3-Button Segmented Selector for Payment Mode */}
        <div className="form-field">
          <label className="block text-[11px] text-[#9a9a9f] uppercase tracking-wider mb-1.5 font-medium">
            Payment Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Cash', 'Card', 'Online'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMode(mode)}
                className={`py-2 px-3 text-xs uppercase font-bold tracking-wider rounded border transition-all cursor-pointer text-center ${
                  paymentMode === mode
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-[#0b0b0c] text-[#9a9a9f] border-[#2a2a2c] hover:border-[#555] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 03. Items Section */}
      <div className="form-section mb-6 pt-2 border-t border-[#262628]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[13px] uppercase tracking-wider font-bold text-[#d94f30]">
            Items
          </h3>
          <span className="text-[11px] text-[#777]">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((it, idx) => (
            <div
              key={it.id || idx}
              className="item-row bg-[#1c1c1e] border border-[#2a2a2c] rounded p-3 transition-colors"
            >
              <div className="grid grid-cols-12 gap-2 items-end">
                {/* Item Name (Optional) */}
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-[10px] text-[#9a9a9f] uppercase mb-1 font-medium">
                    Item Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={it.name || ''}
                    onChange={(e) => updateItem(it.id, { name: e.target.value })}
                    placeholder="e.g. Saree, Kurti, Jeans"
                    className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2 text-xs rounded focus:outline-none focus:border-[#d94f30]"
                  />
                </div>

                {/* Qty */}
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[10px] text-[#9a9a9f] uppercase mb-1 font-medium">
                    Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={it.qty || ''}
                    onChange={(e) =>
                      updateItem(it.id, { qty: Math.max(1, parseInt(e.target.value, 10) || 1) })
                    }
                    className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2 text-xs text-center rounded focus:outline-none focus:border-[#d94f30]"
                  />
                </div>

                {/* MRP (Optional) */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] text-[#9a9a9f] uppercase mb-1 font-medium">
                    MRP (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={it.mrp || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateItem(it.id, { mrp: isNaN(val) ? undefined : val });
                    }}
                    placeholder="Optional"
                    className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2 text-xs rounded focus:outline-none focus:border-[#d94f30]"
                  />
                </div>

                {/* Selling Price / Rate (Required) */}
                <div className="col-span-5 sm:col-span-2">
                  <label className="block text-[10px] text-[#9a9a9f] uppercase mb-1 font-medium">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={it.sellingPrice === 0 ? '' : it.sellingPrice}
                    onChange={(e) => {
                      const sp = parseFloat(e.target.value) || 0;
                      updateItem(it.id, { sellingPrice: sp });
                    }}
                    placeholder="Rate"
                    className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2 text-xs rounded focus:outline-none focus:border-[#d94f30]"
                  />
                </div>

                {/* GST % (No forced default) */}
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] text-[#9a9a9f] uppercase mb-1 font-medium">
                    GST %
                  </label>
                  <select
                    value={it.gst}
                    onChange={(e) =>
                      updateItem(it.id, { gst: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#0b0b0c] border border-[#2a2a2c] text-white p-2 text-xs rounded focus:outline-none focus:border-[#d94f30]"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>

                {/* Remove Item Button */}
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    title="Remove item"
                    aria-label={`Remove item ${idx + 1}`}
                    className="w-[34px] h-[34px] flex items-center justify-center rounded border border-[#444] text-[#ff8a7a] hover:bg-[#ff8a7a]/15 hover:border-[#ff8a7a] transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="btn-add w-full mt-3 py-3 bg-transparent border border-dashed border-[#555] text-white hover:border-[#d94f30] hover:text-[#d94f30] rounded text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Action Buttons matching original HTML */}
      <div className="space-y-2 pt-2 border-t border-[#262628]">
        <button
          type="button"
          onClick={onSaveBill}
          className="btn btn-save w-full bg-[#1a8a3a] hover:bg-[#157230] text-white font-bold uppercase text-[13px] tracking-wider py-3 px-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Bill to Records</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="btn btn-primary w-full bg-white hover:bg-[#d94f30] text-black hover:text-white font-bold uppercase text-[13px] tracking-wider py-3 px-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Download / Print PDF</span>
        </button>

        <button
          type="button"
          onClick={onShareWhatsApp}
          className="btn btn-whatsapp w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold uppercase text-[13px] tracking-wider py-3 px-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Invoice on WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
