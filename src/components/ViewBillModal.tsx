/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InvoiceRecord, StoreSettings, buildWhatsAppShareUrl } from '../utils/billing';
import { InvoicePreview } from './InvoicePreview';
import { X, Printer, Share2 } from 'lucide-react';

interface ViewBillModalProps {
  invoice: InvoiceRecord | null;
  store: StoreSettings;
  onClose: () => void;
}

export const ViewBillModal: React.FC<ViewBillModalProps> = ({
  invoice,
  store,
  onClose,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const url = buildWhatsAppShareUrl({
      invNo: invoice.invNo,
      custName: invoice.custName,
      custPhone: invoice.custPhone,
      items: invoice.items,
      taxable: invoice.taxable,
      totalGst: invoice.totalGst,
      totalSavings: invoice.totalSavings,
      grandTotal: invoice.grandTotal,
      store,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#e9e7e0] border border-[#333] rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-[#0b0b0c] text-white px-5 py-3 flex items-center justify-between no-print border-b border-[#222]">
          <div className="flex items-center gap-3">
            <span className="font-display tracking-wider text-sm sm:text-base">
              INVOICE #{invoice.invNo}
            </span>
            <span className="text-[11px] bg-[#1f1f21] text-[#bbb] px-2 py-0.5 rounded border border-[#333]">
              {invoice.date}
            </span>
            <span className="text-[11px] bg-[#1f1f21] text-[#bbb] px-2 py-0.5 rounded border border-[#333]">
              {invoice.paymentMode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-white hover:bg-[#d94f30] text-black hover:text-white px-3 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#aaa] hover:text-white rounded hover:bg-[#222] transition-colors cursor-pointer"
              title="Close"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#e9e7e0]">
          <InvoicePreview
            invNo={invoice.invNo}
            date={invoice.date}
            buyerState={invoice.buyerState}
            custName={invoice.custName}
            custPhone={invoice.custPhone}
            custGstin={invoice.custGstin}
            custAddress={invoice.custAddress}
            items={invoice.items}
            store={store}
          />
        </div>
      </div>
    </div>
  );
};
