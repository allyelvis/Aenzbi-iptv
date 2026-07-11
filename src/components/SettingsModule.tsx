import React, { useState } from "react";
import { Building, Settings, ShieldCheck, Mail, Phone, MapPin, Globe, DollarSign, Bed, Sparkles, RefreshCw, Layers } from "lucide-react";

interface SettingsData {
  orgName: string;
  orgSlogan: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  timezone: string;
  currency: string;
  suiteRate: number;
  penthouseRate: number;
  deluxeRate: number;
  standardRate: number;
  defaultCleanInterval: number;
}

interface SettingsModuleProps {
  settings: SettingsData;
  onUpdateSettings: (updated: Partial<SettingsData>) => Promise<void>;
  rooms: any[];
  onUpdateRoom: (roomNumber: string, updates: any) => Promise<void>;
}

export default function SettingsModule({ settings, onUpdateSettings, rooms, onUpdateRoom }: SettingsModuleProps) {
  const [orgName, setOrgName] = useState(settings.orgName || "");
  const [orgSlogan, setOrgSlogan] = useState(settings.orgSlogan || "");
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || "");
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || "");
  const [address, setAddress] = useState(settings.address || "");
  const [timezone, setTimezone] = useState(settings.timezone || "UTC-8 (Pacific Time)");
  const [currency, setCurrency] = useState(settings.currency || "USD ($)");

  const [suiteRate, setSuiteRate] = useState(settings.suiteRate || 450);
  const [penthouseRate, setPenthouseRate] = useState(settings.penthouseRate || 1200);
  const [deluxeRate, setDeluxeRate] = useState(settings.deluxeRate || 350);
  const [standardRate, setStandardRate] = useState(settings.standardRate || 180);
  const [defaultCleanInterval, setDefaultCleanInterval] = useState(settings.defaultCleanInterval || 24);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSaveOrgSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await onUpdateSettings({
        orgName,
        orgSlogan,
        supportEmail,
        supportPhone,
        address,
        timezone,
        currency,
      });
      setSuccessMsg("Organization settings successfully saved and synced across gateways.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoomSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await onUpdateSettings({
        suiteRate,
        penthouseRate,
        deluxeRate,
        standardRate,
        defaultCleanInterval,
      });
      setSuccessMsg("Room tariff limits and cleaning schedules successfully enforced.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCleaningAction = async (status: "Clean" | "Dirty" | "Inspect") => {
    if (confirm(`Enforce bulk housekeeping override? This will flag ALL ${rooms.length} hotel rooms as "${status}".`)) {
      setLoading(true);
      try {
        await Promise.all(
          rooms.map(room => onUpdateRoom(room.number, { housekeeping: status }))
        );
        setSuccessMsg(`Housekeeping override: All rooms updated to ${status}.`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkMinibarAction = async (status: "Stocked" | "Needs Refill") => {
    if (confirm(`Enforce bulk minibar status update? This will flag ALL ${rooms.length} rooms as "${status}".`)) {
      setLoading(true);
      try {
        await Promise.all(
          rooms.map(room => onUpdateRoom(room.number, { miniBarStatus: status }))
        );
        setSuccessMsg(`Minibar policy override: All room bars updated to ${status}.`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6" id="settings-module-viewport">
      {/* Title Section */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          System & Organization Policies
        </h2>
        <p className="text-sm text-slate-500 mt-1">Configure global resort attributes, room tariff limits, and bulk operations</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Building className="h-4.5 w-4.5 text-indigo-600" />
            Corporate Organization Profile
          </h3>

          <form onSubmit={handleSaveOrgSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Organization Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Building className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Branding Slogan</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                  </span>
                  <input
                    type="text"
                    required
                    value={orgSlogan}
                    onChange={(e) => setOrgSlogan(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Corporate Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Support Hotline</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Physical Address</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Resort Timezone</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Globe className="h-4 w-4" />
                  </span>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                    <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                    <option value="UTC+0 (London GMT)">UTC+0 (London GMT)</option>
                    <option value="UTC+1 (Paris CET)">UTC+1 (Paris CET)</option>
                    <option value="UTC+3 (East Africa Time)">UTC+3 (East Africa Time)</option>
                    <option value="UTC+8 (Singapore Time)">UTC+8 (Singapore Time)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">System Currency</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="KES (KSh)">KES (KSh)</option>
                    <option value="JPY (¥)">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm disabled:opacity-55"
              >
                {loading ? "Saving Profile..." : "Save Org Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Room Tariff & Policies Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Bed className="h-4.5 w-4.5 text-indigo-600" />
            Standard Room Tariff & Policies
          </h3>

          <form onSubmit={handleSaveRoomSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Penthouse Rate / night</label>
                <input
                  type="number"
                  required
                  value={penthouseRate}
                  onChange={(e) => setPenthouseRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Suite Rate / night</label>
                <input
                  type="number"
                  required
                  value={suiteRate}
                  onChange={(e) => setSuiteRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Deluxe Rate / night</label>
                <input
                  type="number"
                  required
                  value={deluxeRate}
                  onChange={(e) => setDeluxeRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Standard Rate / night</label>
                <input
                  type="number"
                  required
                  value={standardRate}
                  onChange={(e) => setStandardRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Auto Housekeeping Interval (hours)</label>
              <input
                type="number"
                required
                value={defaultCleanInterval}
                onChange={(e) => setDefaultCleanInterval(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm disabled:opacity-55"
              >
                {loading ? "Enforcing Policies..." : "Enforce Tariffs & Policies"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bulk Operations & Smart Triggers */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Layers className="h-4.5 w-4.5 text-indigo-600" />
          Bulk Operations & Smart Policy Triggers
        </h3>
        <p className="text-xs text-slate-500">
          Enforce immediate organization-wide states across all connected hotel nodes, bypassing standard PMS cron delays.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
          {/* Housekeeping overrides */}
          <div className="p-4 border border-slate-150 bg-slate-50/50 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-700 flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
              Housekeeping Bulk Override
            </h4>
            <p className="text-[11px] text-slate-400">Update the clean status of all rooms in the database simultaneously.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleBulkCleaningAction("Clean")}
                disabled={loading}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-100 rounded-lg cursor-pointer text-[11px]"
              >
                Clean All Rooms
              </button>
              <button
                onClick={() => handleBulkCleaningAction("Dirty")}
                disabled={loading}
                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-100 rounded-lg cursor-pointer text-[11px]"
              >
                Dirty All Rooms
              </button>
              <button
                onClick={() => handleBulkCleaningAction("Inspect")}
                disabled={loading}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold border border-amber-100 rounded-lg cursor-pointer text-[11px]"
              >
                Inspect All Rooms
              </button>
            </div>
          </div>

          {/* Minibar overrides */}
          <div className="p-4 border border-slate-150 bg-slate-50/50 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-700 flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
              Minibar Status Bulk Override
            </h4>
            <p className="text-[11px] text-slate-400">Instantly flag minibars as either fully stocked or needing refill.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleBulkMinibarAction("Stocked")}
                disabled={loading}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold border border-indigo-100 rounded-lg cursor-pointer text-[11px]"
              >
                Fully Stock All Bars
              </button>
              <button
                onClick={() => handleBulkMinibarAction("Needs Refill")}
                disabled={loading}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold border border-amber-100 rounded-lg cursor-pointer text-[11px]"
              >
                Flag All for Refill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
