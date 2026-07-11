import React, { useState, useEffect } from "react";
import { HospitalityTV } from "../types";
import { Monitor, RefreshCw, Volume2, Power, Settings, ShieldCheck, Heart, AlertTriangle, Eye, Sliders, Image, RotateCcw, Plus, Package, ArrowUpCircle, ChevronRight, Calendar, Trash2, Edit } from "lucide-react";

interface TVSoftwarePackage {
  id: string;
  name: string;
  version: string;
  platform: string;
  releaseDate: string;
  changelog: string;
}

interface HospitalityTVModuleProps {
  tvs: HospitalityTV[];
  onSendCommand: (id: string, command: string, value: any) => void;
  softwarePackages: TVSoftwarePackage[];
  onAddSoftwarePackage: (payload: { name: string; version: string; platform: string; changelog: string }) => void;
  onUpgradeTV: (tvId: string, version: string, firmware?: string) => void;
  onCreateTV?: (payload: { roomNumber: string; brand: string; ipAddress: string; appVersion: string; firmware: string }) => Promise<void>;
  onUpdateTV?: (id: string, updates: Partial<HospitalityTV>) => Promise<void>;
  onDeleteTV?: (id: string) => Promise<void>;
}

export default function HospitalityTVModule({ 
  tvs, 
  onSendCommand,
  softwarePackages = [],
  onAddSoftwarePackage,
  onUpgradeTV,
  onCreateTV,
  onUpdateTV,
  onDeleteTV
}: HospitalityTVModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fleet" | "software">("fleet");
  const [selectedTv, setSelectedTv] = useState<HospitalityTV | null>(null);
  
  // Set default selected TV
  useEffect(() => {
    if (tvs && tvs.length > 0 && !selectedTv) {
      setSelectedTv(tvs[0]);
    }
  }, [tvs, selectedTv]);

  // Local Remote Tuning sliders/inputs
  const [targetVolume, setTargetVolume] = useState<number>(15);
  const [powerPolicy, setPowerPolicy] = useState("07:00 On / 23:00 Off");
  const [inputSource, setInputSource] = useState("HDMI 1 (IPTV)");
  const [wallpaperUrl, setWallpaperUrl] = useState("https://hotel-cdn.com/royal-welcome.jpg");
  const [customWelcomeText, setCustomWelcomeText] = useState("Welcome back! Discover our fine dining, concierge, and IPTV streams.");

  // Software Package Form state
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgVersion, setNewPkgVersion] = useState("");
  const [newPkgPlatform, setNewPkgPlatform] = useState("Samsung Tizen");
  const [newPkgChangelog, setNewPkgChangelog] = useState("");
  const [pkgError, setPkgError] = useState("");

  // CRUD State variables
  const [isAddingTv, setIsAddingTv] = useState(false);
  const [isEditingTv, setIsEditingTv] = useState(false);

  // Add TV Form state
  const [addRoomNumber, setAddRoomNumber] = useState("");
  const [addBrand, setAddBrand] = useState<HospitalityTV["brand"]>("Android TV");
  const [addIpAddress, setAddIpAddress] = useState("");
  const [addAppVersion, setAddAppVersion] = useState("v4.3.0");
  const [addFirmware, setAddFirmware] = useState("A-ATV-12.1");
  const [addError, setAddError] = useState("");

  // Edit TV Form state
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editBrand, setEditBrand] = useState<HospitalityTV["brand"]>("Android TV");
  const [editIpAddress, setEditIpAddress] = useState("");
  const [editAppVersion, setEditAppVersion] = useState("");
  const [editFirmware, setEditFirmware] = useState("");
  const [editError, setEditError] = useState("");

  const handleCommandSubmit = (command: string, val: any) => {
    if (!selectedTv) return;
    onSendCommand(selectedTv.id, command, val);
    
    // Optimistic local state updates for visual responsiveness
    const updated = { ...selectedTv };
    if (command === "volume") updated.volume = Number(val);
    if (command === "input") updated.inputSource = String(val);
    if (command === "powerPolicy") updated.powerSchedule = String(val);
    if (command === "reboot") updated.status = "offline";
    if (command === "factoryReset") updated.status = "offline";
    setSelectedTv(updated as HospitalityTV);
  };

  const handleCreatePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName || !newPkgVersion) {
      setPkgError("Please fill out Name and Version.");
      return;
    }
    onAddSoftwarePackage({
      name: newPkgName,
      version: newPkgVersion,
      platform: newPkgPlatform,
      changelog: newPkgChangelog
    });

    setNewPkgName("");
    setNewPkgVersion("");
    setNewPkgChangelog("");
    setPkgError("");
    alert(`Successfully registered new software release ${newPkgVersion} for ${newPkgPlatform}!`);
  };

  const handleDeployUpgrade = (tvId: string, pkg: TVSoftwarePackage) => {
    const targetTv = tvs.find(t => t.id === tvId);
    if (!targetTv) return;
    
    if (targetTv.status === "offline") {
      alert(`Upgrade aborted. Room ${targetTv.roomNumber} TV is currently offline.`);
      return;
    }

    if (confirm(`Begin dynamic OTA upgrade dispatch? This will deploy "${pkg.name}" (${pkg.version}) over-the-air to Room ${targetTv.roomNumber}. The TV will reboot during compilation.`)) {
      onUpgradeTV(tvId, pkg.version, pkg.name);
      
      // Optimistically update local selected tv to rebooting
      const updated = { ...targetTv, status: "offline", appVersion: pkg.version };
      setSelectedTv(updated as HospitalityTV);
      alert(`OTA Firmware Upgrade initiated for Room ${targetTv.roomNumber}! Watch KDS logs for reboot and registration completion (takes ~4s).`);
    }
  };

  const handleCreateTvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!addRoomNumber.trim()) {
      setAddError("Room number is required.");
      return;
    }

    try {
      if (onCreateTV) {
        await onCreateTV({
          roomNumber: addRoomNumber,
          brand: addBrand,
          ipAddress: addIpAddress || `192.168.10.${100 + Math.floor(Math.random() * 150)}`,
          appVersion: addAppVersion,
          firmware: addFirmware
        });
        setAddRoomNumber("");
        setAddIpAddress("");
        setIsAddingTv(false);
        alert(`Hospitality TV successfully registered for Room ${addRoomNumber}.`);
      } else {
        alert("TV registration callback is not linked.");
      }
    } catch (err: any) {
      setAddError(err.message || "Failed to register TV device.");
    }
  };

  const handleStartEdit = () => {
    if (!selectedTv) return;
    setEditRoomNumber(selectedTv.roomNumber);
    setEditBrand(selectedTv.brand);
    setEditIpAddress(selectedTv.ipAddress);
    setEditAppVersion(selectedTv.appVersion);
    setEditFirmware(selectedTv.firmware);
    setIsEditingTv(true);
    setEditError("");
  };

  const handleEditTvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (!selectedTv) return;

    try {
      if (onUpdateTV) {
        await onUpdateTV(selectedTv.id, {
          brand: editBrand,
          ipAddress: editIpAddress,
          appVersion: editAppVersion,
          firmware: editFirmware
        });
        setIsEditingTv(false);
        setSelectedTv({
          ...selectedTv,
          brand: editBrand,
          ipAddress: editIpAddress,
          appVersion: editAppVersion,
          firmware: editFirmware
        });
        alert(`TV config for Room ${selectedTv.roomNumber} updated successfully.`);
      } else {
        alert("TV update callback is not linked.");
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to update TV device.");
    }
  };

  const handleDeleteTvClick = async () => {
    if (!selectedTv) return;
    if (confirm(`Decommission TV Device? This will completely remove Room ${selectedTv.roomNumber} TV device from the hospitality directory database link.`)) {
      try {
        if (onDeleteTV) {
          await onDeleteTV(selectedTv.id);
          const nextTv = tvs.find(t => t.id !== selectedTv.id) || null;
          setSelectedTv(nextTv);
          setIsEditingTv(false);
          alert(`TV for Room ${selectedTv.roomNumber} successfully decommissioned.`);
        } else {
          alert("TV deletion callback is not linked.");
        }
      } catch (err: any) {
        alert(err.message || "Failed to decommission TV device.");
      }
    }
  };

  const getStatusColor = (status: HospitalityTV["status"]) => {
    switch (status) {
      case "online": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "standby": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "offline": return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="space-y-6" id="tv-management-module">
      {/* Module Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-indigo-600" />
            Hospitality TV Fleet Control
          </h2>
          <p className="text-sm text-slate-500 mt-1">Deploy firmware, welcome branding, software releases and policies to room smart TVs</p>
        </div>

        {/* Sub tab navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-center shadow-sm">
          <button
            onClick={() => {
              setActiveSubTab("fleet");
              setIsEditingTv(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              activeSubTab === "fleet" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            TV Fleet Directory
          </button>
          <button
            onClick={() => setActiveSubTab("software")}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              activeSubTab === "software" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            OTA Firmware Catalog
          </button>
        </div>
      </div>

      {activeSubTab === "fleet" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Columns: TVs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500 font-semibold">
                <span className="font-bold uppercase tracking-wider">Device Fleet Directory ({tvs.length} devices)</span>
                <button
                  onClick={() => setIsAddingTv(!isAddingTv)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isAddingTv ? "Close Form" : "Register TV Device"}
                </button>
              </div>

              {/* Add TV Form */}
              {isAddingTv && (
                <form onSubmit={handleCreateTvSubmit} className="p-5 border-b border-slate-200 bg-slate-50/40 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 104"
                      value={addRoomNumber}
                      onChange={(e) => setAddRoomNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Brand Platform</label>
                    <select
                      value={addBrand}
                      onChange={(e) => setAddBrand(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Samsung Tizen">Samsung Tizen</option>
                      <option value="LG WebOS">LG WebOS</option>
                      <option value="Philips CMND">Philips CMND</option>
                      <option value="Android TV">Android TV</option>
                      <option value="MAG Linux">MAG Linux</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">IP Address</label>
                    <input
                      type="text"
                      placeholder="Auto IP if empty"
                      value={addIpAddress}
                      onChange={(e) => setAddIpAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">App Build Version</label>
                    <input
                      type="text"
                      required
                      placeholder="v4.3.0"
                      value={addAppVersion}
                      onChange={(e) => setAddAppVersion(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                    />
                  </div>
                  <div className="flex gap-1.5 self-end">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-center shadow-sm text-[11px]"
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTv(false)}
                      className="py-1.5 px-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                  {addError && (
                    <p className="col-span-full text-red-500 font-semibold text-[10px] mt-1">{addError}</p>
                  )}
                </form>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500 divide-y divide-slate-100">
                  <thead className="bg-slate-50/30 text-[10px] font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">TV Platform</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Uptime Status</th>
                      <th className="px-4 py-3">App ver / Volume</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {tvs.map((tv) => (
                      <tr 
                        key={tv.id}
                        onClick={() => {
                          setSelectedTv(tv);
                          setIsEditingTv(false);
                        }}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                          selectedTv?.id === tv.id ? "bg-slate-50 font-semibold text-slate-800" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5 font-bold text-gray-900">Room {tv.roomNumber}</td>
                        <td className="px-4 py-3.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold text-[10px]">{tv.brand}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-gray-500">{tv.ipAddress}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusColor(tv.status)}`}>
                            {tv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-mono">
                          {tv.appVersion} / Vol {tv.volume}
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => onSendCommand(tv.id, "reboot", null)}
                            disabled={tv.status === "offline"}
                            className="px-2.5 py-1 text-[10px] font-semibold border border-gray-200 hover:bg-gray-50 rounded text-gray-700 cursor-pointer disabled:opacity-50"
                          >
                            Reboot
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Centralized Welcome screens policy */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Image className="h-4 w-4 text-indigo-600" />
                Centralized Welcome Screens & Branding Policy
              </h3>
              <p className="text-xs text-gray-500">
                Bulk deploy customized splash screens, guest welcome messages, and wallpaper resources to Samsung LYNK REACH and LG Pro:Centric gateways instantly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-gray-600 mb-1 font-mono text-[10px]">Branded Wallpaper URL (.jpg/.png)</label>
                  <input 
                    type="text" 
                    value={wallpaperUrl}
                    onChange={(e) => setWallpaperUrl(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1 font-mono text-[10px]">Welcome Screen Greeting Template</label>
                  <input 
                    type="text" 
                    value={customWelcomeText}
                    onChange={(e) => setCustomWelcomeText(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => {
                    alert(`Successfully queued branding payload. Wallpapers deployed dynamically to ${tvs.length} televisions!`);
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg cursor-pointer shadow-sm shadow-indigo-100"
                >
                  Deploy Branding Assets (Bulk)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Device Controller & Edit Panel */}
          <div>
            {selectedTv ? (
              isEditingTv ? (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 animate-fade-in sticky top-6">
                  <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider font-mono">Edit TV Details</span>
                      <h3 className="font-bold text-gray-900 text-base">Modify Room {selectedTv.roomNumber} TV</h3>
                    </div>
                    <button
                      onClick={() => setIsEditingTv(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleEditTvSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Room Assignment</label>
                      <input
                        type="text"
                        required
                        disabled
                        value={editRoomNumber}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Platform (Brand)</label>
                      <select
                        value={editBrand}
                        onChange={(e) => setEditBrand(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="Samsung Tizen">Samsung Tizen</option>
                        <option value="LG WebOS">LG WebOS</option>
                        <option value="Philips CMND">Philips CMND</option>
                        <option value="Android TV">Android TV</option>
                        <option value="MAG Linux">MAG Linux</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">IP Address</label>
                      <input
                        type="text"
                        required
                        value={editIpAddress}
                        onChange={(e) => setEditIpAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">App Version</label>
                      <input
                        type="text"
                        required
                        value={editAppVersion}
                        onChange={(e) => setEditAppVersion(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Firmware Version</label>
                      <input
                        type="text"
                        required
                        value={editFirmware}
                        onChange={(e) => setEditFirmware(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    {editError && (
                      <p className="text-red-500 font-semibold text-[10px]">{editError}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer text-center shadow-sm"
                      >
                        Save Config
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingTv(false)}
                        className="px-3 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5 sticky top-6">
                  <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Device Controller</span>
                      <h3 className="font-bold text-gray-900 text-base">Room {selectedTv.roomNumber} TV</h3>
                      <span className="text-xs text-gray-500">{selectedTv.brand} ({selectedTv.ipAddress})</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusColor(selectedTv.status)}`}>
                        {selectedTv.status}
                      </span>
                      <button 
                        onClick={handleStartEdit}
                        className="px-2 py-1 text-[10px] font-bold border border-slate-200 hover:bg-slate-50 rounded-md text-indigo-600 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit className="h-2.5 w-2.5" />
                        Edit Details
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Quick Upgrade select */}
                  <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
                    <span className="font-bold text-gray-700 block flex items-center gap-1 font-mono text-[10px] uppercase">
                      <ArrowUpCircle className="h-4 w-4 text-indigo-500" />
                      Quick OTA Software Update
                    </span>
                    
                    {softwarePackages.filter(p => p.platform === selectedTv.brand).length === 0 ? (
                      <p className="text-[10px] text-gray-400">No compatible OTA packages defined in catalog.</p>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-gray-500">Select compatible package to deploy:</p>
                        {softwarePackages.filter(p => p.platform === selectedTv.brand).map((pkg) => (
                          <div key={pkg.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px]">
                            <div>
                              <span className="font-extrabold text-slate-800">{pkg.version}</span>
                              <span className="block text-[9px] text-slate-400">{pkg.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeployUpgrade(selectedTv.id, pkg)}
                              disabled={selectedTv.status === "offline" || selectedTv.appVersion === pkg.version}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[9px] rounded-md disabled:opacity-50"
                            >
                              {selectedTv.appVersion === pkg.version ? "Current" : "Upgrade"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-600 flex items-center gap-1 font-mono text-[10px]">
                        <Volume2 className="h-4 w-4 text-gray-400" />
                        Audio Volume Policy Lock
                      </span>
                      <span className="font-mono font-bold text-gray-900">{targetVolume} max</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        value={targetVolume}
                        onChange={(e) => setTargetVolume(Number(e.target.value))}
                        className="flex-1 accent-indigo-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <button 
                        onClick={() => handleCommandSubmit("volume", targetVolume)}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  </div>

                  {/* Input Source select */}
                  <div className="space-y-2 text-xs">
                    <span className="font-medium text-gray-600 block font-mono text-[10px]">Default Input Source</span>
                    <div className="flex gap-2">
                      <select
                        value={inputSource}
                        onChange={(e) => setInputSource(e.target.value)}
                        className="flex-1 p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white text-xs"
                      >
                        <option value="HDMI 1 (IPTV)">HDMI 1 (IPTV Portal)</option>
                        <option value="HTML5 Portal">HTML5 Native Launcher</option>
                        <option value="HDMI 2 (Chromecast)">HDMI 2 (Chromecast Dongle)</option>
                        <option value="Coaxial Analog">Coaxial Cable Tuner</option>
                      </select>
                      <button 
                        onClick={() => handleCommandSubmit("input", inputSource)}
                        className="px-3 py-1.5 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 cursor-pointer text-xs"
                      >
                        Switch
                      </button>
                    </div>
                  </div>

                  {/* Power Schedule Policy */}
                  <div className="space-y-2 text-xs">
                    <span className="font-medium text-gray-600 block font-mono text-[10px]">Power Schedule Policy (Energy Save)</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={powerPolicy}
                        onChange={(e) => setPowerPolicy(e.target.value)}
                        placeholder="e.g. 07:00 On / 23:00 Off"
                        className="flex-1 p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-xs"
                      />
                      <button 
                        onClick={() => handleCommandSubmit("powerPolicy", powerPolicy)}
                        className="px-3 py-1.5 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 cursor-pointer text-xs"
                      >
                        Enforce
                      </button>
                    </div>
                  </div>

                  {/* Advanced Diagnostics Tools */}
                  <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
                    <span className="font-medium text-gray-400 block uppercase text-[9px] tracking-wider font-mono">Device Admin Actions</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleCommandSubmit("reboot", null)}
                        disabled={selectedTv.status === "offline"}
                        className="py-1.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-[11px]"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        OTA Reboot
                      </button>
                      <button 
                        onClick={() => handleCommandSubmit("factoryReset", null)}
                        disabled={selectedTv.status === "offline"}
                        className="py-1.5 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-[11px]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Factory Reset
                      </button>
                      <button 
                        onClick={handleDeleteTvClick}
                        className="col-span-2 py-1.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50/20 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Decommission Device
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5 text-[10px] font-mono text-gray-500">
                    <div className="flex justify-between">
                      <span>Firmware version:</span>
                      <span className="text-gray-700 font-bold">{selectedTv.firmware}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installed App Version:</span>
                      <span className="text-indigo-600 font-bold">{selectedTv.appVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Input Source:</span>
                      <span className="text-gray-700 font-bold">{selectedTv.inputSource}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Power Policy:</span>
                      <span className="text-gray-700 font-bold truncate max-w-[100px]">{selectedTv.powerSchedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime Heartbeat:</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                        <Heart className="h-2.5 w-2.5 fill-emerald-500 animate-pulse" />
                        {selectedTv.status === "online" ? "Active (Every 10s)" : "No signal"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-xs">
                Select a room television from the table to access physical remote configuration sliders and trigger volume controls.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Software Package Directory */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Package className="h-4.5 w-4.5 text-indigo-600" />
              Registered IPTV Software Packages
            </h3>

            <div className="space-y-3">
              {softwarePackages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">No software releases defined in active catalog.</p>
              ) : (
                softwarePackages.map((pkg) => (
                  <div key={pkg.id} className="border border-slate-200 p-4 rounded-xl hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase">{pkg.platform}</span>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{pkg.name}</h4>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed"><strong className="font-semibold text-slate-800">Changelog:</strong> {pkg.changelog}</p>
                      
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Released: {pkg.releaseDate}
                        </span>
                        <span>•</span>
                        <span className="text-indigo-600">Build: {pkg.version}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 self-center" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Publish New Software Package Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Plus className="h-4.5 w-4.5 text-indigo-600" />
              Publish Software Release
            </h3>

            <form onSubmit={handleCreatePackageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Release Name *</label>
                <input
                  type="text"
                  required
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  placeholder="e.g. Aenzbi IPTV App Build v4.3.5"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Build Version *</label>
                  <input
                    type="text"
                    required
                    value={newPkgVersion}
                    onChange={(e) => setNewPkgVersion(e.target.value)}
                    placeholder="v4.3.5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Platform Gateway</label>
                  <select
                    value={newPkgPlatform}
                    onChange={(e) => setNewPkgPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="Samsung Tizen">Samsung Tizen</option>
                    <option value="LG WebOS">LG WebOS</option>
                    <option value="Philips CMND">Philips CMND</option>
                    <option value="Android TV">Android TV</option>
                    <option value="MAG Linux">MAG Linux</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Release Changelog</label>
                <textarea
                  value={newPkgChangelog}
                  onChange={(e) => setNewPkgChangelog(e.target.value)}
                  placeholder="Summarize patch additions or core UI fixes..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {pkgError && (
                <p className="text-red-500 font-semibold text-[10px]">{pkgError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 text-xs"
              >
                <Plus className="h-4 w-4" />
                Register Release
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
