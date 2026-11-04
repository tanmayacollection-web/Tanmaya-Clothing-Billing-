/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, LayoutDashboard, History, Settings, ShoppingBag, PlusCircle } from 'lucide-react';
import { fmtINR } from '../utils/billing';

interface HeaderProps {
  activeTab: 'billing' | 'dashboard' | 'history' | 'settings';
  setActiveTab: (tab: 'billing' | 'dashboard' | 'history' | 'settings') => void;
  shopName: string;
  tagline: string;
  todaySales: number;
  totalBills: number;
  onNewBillClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  shopName,
  tagline,
  todaySales,
  totalBills,
  onNewBillClick,
}) => {
  return (
    <header className="bg-[#0b0b0c] text-white px-4 md:px-8 py-3.5 border-b border-[#222225] no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#d94f30] flex items-center justify-center font-display text-white text-xl shadow-md shadow-[#d94f30]/20 flex-shrink-0">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg tracking-wider text-white">
                {shopName}
              </h1>
              <span className="hidden sm:inline-block bg-[#1c1c1e] text-[#9a9a9f] text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-[#2a2a2c]">
                POS & GST Billing
              </span>
            </div>
            <p className="text-[11px] text-[#9a9a9f]">{tagline}</p>
          </div>
        </div>

        {/* Quick summary metrics */}
        <div className="hidden lg:flex items-center gap-4 bg-[#141415] border border-[#262628] rounded-lg px-3.5 py-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#88888e] uppercase text-[10px] font-semibold">Today:</span>
            <span className="text-[#1a8a3a] font-bold font-mono-num">{fmtINR(todaySales)}</span>
          </div>
          <div className="w-px h-3.5 bg-[#2a2a2c]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#88888e] uppercase text-[10px] font-semibold">Total Bills:</span>
            <span className="text-white font-bold font-mono-num">{totalBills}</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('billing');
              onNewBillClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-white text-black shadow-sm'
                : 'bg-transparent text-[#bbb] border border-[#333] hover:text-white hover:border-[#555]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#d94f30]" />
            <span>New Bill</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-black shadow-sm'
                : 'bg-transparent text-[#bbb] border border-[#333] hover:text-white hover:border-[#555]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-black shadow-sm'
                : 'bg-transparent text-[#bbb] border border-[#333] hover:text-white hover:border-[#555]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Bills History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-black shadow-sm'
                : 'bg-transparent text-[#bbb] border border-[#333] hover:text-white hover:border-[#555]'
            }`}
            title="Shop Settings"
            aria-label="Shop Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
