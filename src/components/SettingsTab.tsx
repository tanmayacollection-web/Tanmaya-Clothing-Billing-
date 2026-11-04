/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreSettings, DEFAULT_STORE_SETTINGS } from '../utils/billing';
import { Save, RotateCcw, Building, Phone, FileText, CheckCircle2 } from 'lucide-react';

interface SettingsTabProps {
  store: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ store, onSaveSettings }) => {
  const [form, setForm] = useState<StoreSettings>({ ...store });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset store profile to default Tanmaya Clothing details?')) {
      setForm({ ...DEFAULT_STORE_SETTINGS });
      onSaveSettings({ ...DEFAULT_STORE_SETTINGS });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white border border-[#e4e2dc] rounded-lg shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e4e2dc] flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-xl text-[#0b0b0c] uppercase">
              Shop & GST Profile Settings
            </h2>
            <p className="text-xs text-[#6b6b70]">
              Configure your store contact, GSTIN, and terms printed on the invoice.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#d94f30] font-semibold border border-[#d8d5cd] hover:border-[#d94f30] px-3 py-1.5 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {savedNotice && (
          <div className="bg-[#e8f5ec] border-b border-[#c2e4cc] text-[#1a8a3a] px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Shop settings updated successfully! All bills will use this profile.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Shop Information */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#d94f30] mb-4 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              <span>Shop Identity & GSTIN</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  required
                  className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1">
                  GSTIN (Tax Identification)
                </label>
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  maxLength={15}
                  placeholder="27AABCT8921F1Z2"
                  className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1">
                  Street / Area Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1">
                  City & State
                </label>
                <input
                  type="text"
                  value={form.cityState}
                  onChange={(e) => setForm({ ...form, cityState: e.target.value })}
                  required
                  className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#e4e2dc]" />

          {/* Contact Details */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#d94f30] mb-4 flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={form.instagram || ''}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@tanmayaclothing"
                  className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#e4e2dc]" />

          {/* Terms & Conditions */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#d94f30] mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Terms & Conditions</span>
            </h3>
            <p className="text-[11px] text-[#666] mb-3">
              One condition per line.
            </p>

            <textarea
              rows={3}
              value={form.terms.join('\n')}
              onChange={(e) =>
                setForm({
                  ...form,
                  terms: e.target.value.split('\n').filter((line) => line.trim().length > 0),
                })
              }
              className="w-full bg-[#f9f8f5] border border-[#d8d5cd] px-3 py-2 text-xs rounded focus:outline-none focus:border-black leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-[#0b0b0c] hover:bg-[#d94f30] text-white font-bold uppercase text-xs tracking-wider px-6 py-3 rounded shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
