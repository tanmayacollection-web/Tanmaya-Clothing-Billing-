/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  InvoiceItem,
  InvoiceRecord,
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
  calcInvoiceTotals,
  generateNewInvoiceNo,
  buildWhatsAppShareUrl
} from './utils/billing';
import { INITIAL_SEED_INVOICES } from './data/seedData';
import { Header } from './components/Header';
import { BillingForm } from './components/BillingForm';
import { InvoicePreview } from './components/InvoicePreview';
import { Dashboard } from './components/Dashboard';
import { BillsHistory } from './components/BillsHistory';
import { SettingsTab } from './components/SettingsTab';
import { ViewBillModal } from './components/ViewBillModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_INVOICES_KEY = 'tanmaya_invoices_v1';
const STORAGE_STORE_KEY = 'tanmaya_store_settings_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'billing' | 'dashboard' | 'history' | 'settings'>('billing');

  const [store, setStore] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STORE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INVOICES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SEED_INVOICES;
    } catch {
      return INITIAL_SEED_INVOICES;
    }
  });

  // Automatically generated bill number for every new bill
  const currentBillNo = useMemo(() => {
    return generateNewInvoiceNo(invoices);
  }, [invoices]);

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [buyerState, setBuyerState] = useState<'same' | 'diff'>('same');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'Online'>('Cash');
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custGstin, setCustGstin] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');

  // Items: Item name is optional, MRP is optional, Selling Price is input, GST %
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'init-1',
      name: 'Cotton Kurti',
      qty: 1,
      mrp: 899,
      sellingPrice: 809,
      discount: 10,
      gst: 5,
    },
    {
      id: 'init-2',
      name: 'Designer Saree',
      qty: 1,
      mrp: 1899,
      sellingPrice: 1804,
      discount: 5,
      gst: 12,
    },
  ]);

  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.warn('Failed to save invoices to localStorage', e);
    }
  }, [invoices]);

  const handleSaveStoreSettings = (newSettings: StoreSettings) => {
    setStore(newSettings);
    try {
      localStorage.setItem(STORAGE_STORE_KEY, JSON.stringify(newSettings));
      showToast('Shop profile settings saved successfully!');
    } catch (e) {
      console.warn('Failed to save store settings', e);
    }
  };

  const todaySales = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return invoices
      .filter((inv) => inv.date === today)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices]);

  const handleSaveBill = () => {
    if (items.length === 0 || items.every((i) => !i.sellingPrice)) {
      showToast('Please add at least one item with a valid selling price.', 'error');
      return;
    }

    const totals = calcInvoiceTotals(items, buyerState);
    const newRecord: InvoiceRecord = {
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      invNo: currentBillNo,
      date: date || new Date().toISOString().slice(0, 10),
      buyerState,
      paymentMode,
      custName: custName.trim() || 'Customer Name',
      custPhone: custPhone.trim(),
      custGstin: custGstin.trim(),
      custAddress: custAddress.trim(),
      items: [...items],
      taxable: totals.taxable,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      totalGst: totals.totalGst,
      totalSavings: totals.totalSavings,
      grandTotal: totals.grandTotal,
      savedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [...prev, newRecord]);
    showToast(`Bill #${newRecord.invNo} saved to records!`);

    // Reset customer and items for the next bill
    setCustName('');
    setCustPhone('');
    setCustGstin('');
    setCustAddress('');
    setPaymentMode('Cash');
    setItems([
      {
        id: 'new-' + Date.now(),
        name: '',
        qty: 1,
        mrp: undefined,
        sellingPrice: 0,
        discount: 0,
        gst: 0,
      },
    ]);
  };

  const handleResetBill = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setPaymentMode('Cash');
    setCustName('');
    setCustPhone('');
    setCustGstin('');
    setCustAddress('');
    setItems([
      {
        id: 'reset-1',
        name: '',
        qty: 1,
        mrp: undefined,
        sellingPrice: 0,
        discount: 0,
        gst: 0,
      },
    ]);
    showToast('Started new bill.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (items.length === 0) {
      showToast('Add at least one item first.', 'error');
      return;
    }
    const totals = calcInvoiceTotals(items, buyerState);
    const url = buildWhatsAppShareUrl({
      invNo: currentBillNo,
      custName,
      custPhone,
      items,
      taxable: totals.taxable,
      totalGst: totals.totalGst,
      totalSavings: totals.totalSavings,
      grandTotal: totals.grandTotal,
      store,
    });
    window.open(url, '_blank');
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    showToast('Invoice deleted from records.');
    if (viewingInvoice && viewingInvoice.id === id) {
      setViewingInvoice(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1ec] text-[#0b0b0c]">
      {/* Toast Alert */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-xs font-bold uppercase tracking-wider transition-all ${
            toast.type === 'error'
              ? 'bg-[#d94f30] text-white shadow-[#d94f30]/30'
              : 'bg-[#1a8a3a] text-white shadow-[#1a8a3a]/30'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopName={store.shopName}
        tagline="GST Invoice & Sales Dashboard"
        todaySales={todaySales}
        totalBills={invoices.length}
        onNewBillClick={() => {
          setActiveTab('billing');
        }}
      />

      <main className="flex-1">
        {/* VIEW 1: BILLING (SPLIT LAYOUT) */}
        {activeTab === 'billing' && (
          <div className="layout grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-60px)]">
            {/* Left: Form Panel */}
            <BillingForm
              currentBillNo={currentBillNo}
              date={date}
              setDate={setDate}
              buyerState={buyerState}
              setBuyerState={setBuyerState}
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
              custName={custName}
              setCustName={setCustName}
              custPhone={custPhone}
              setCustPhone={setCustPhone}
              custGstin={custGstin}
              setCustGstin={setCustGstin}
              custAddress={custAddress}
              setCustAddress={setCustAddress}
              items={items}
              setItems={setItems}
              onSaveBill={handleSaveBill}
              onPrint={handlePrint}
              onShareWhatsApp={handleShareWhatsApp}
              onReset={handleResetBill}
            />

            {/* Right: WYSIWYG Invoice Preview Panel (Non-sliding, exactly matching HTML) */}
            <div className="preview-panel bg-[#e9e7e0] p-6 sm:p-10 flex flex-col items-center justify-start overflow-y-auto">
              <InvoicePreview
                invNo={currentBillNo}
                date={date}
                buyerState={buyerState}
                custName={custName}
                custPhone={custPhone}
                custGstin={custGstin}
                custAddress={custAddress}
                items={items}
                store={store}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            invoices={invoices}
            store={store}
            onViewInvoice={(inv) => setViewingInvoice(inv)}
            onDeleteInvoice={handleDeleteInvoice}
            onNewBill={() => setActiveTab('billing')}
          />
        )}

        {/* VIEW 3: BILLS HISTORY */}
        {activeTab === 'history' && (
          <BillsHistory
            invoices={invoices}
            store={store}
            onViewInvoice={(inv) => setViewingInvoice(inv)}
            onDeleteInvoice={handleDeleteInvoice}
            onNewBill={() => setActiveTab('billing')}
          />
        )}

        {/* VIEW 4: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsTab store={store} onSaveSettings={handleSaveStoreSettings} />
        )}
      </main>

      {/* Modal for viewing any past bill */}
      {viewingInvoice && (
        <ViewBillModal
          invoice={viewingInvoice}
          store={store}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
}
