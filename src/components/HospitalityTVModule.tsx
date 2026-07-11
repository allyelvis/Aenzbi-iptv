import React, { useState } from "react";
import { HospitalityTV } from "../types";
import { Monitor, RefreshCw, Volume2, Power, Settings, ShieldCheck, Heart, AlertTriangle, Eye, Sliders, Image, RotateCcw } from "lucide-react";

interface HospitalityTVModuleProps {
  tvs: HospitalityTV[];
  onSendCommand: (id: string, command: string, value: any) => void;
}

export default function HospitalityTVModule({ tvs, onSendCommand }: HospitalityTVModuleProps) {
  const [selectedTv, setSelectedTv] = useState<HospitalityTV | null>(tvs[0] || null);
  const [targetVolume, setTargetVolume] = useState<number>(15);
  const [powerPolicy, setPowerPolicy] = useState("07:00 On / 23:00 Off");
  const [inputSource, setInputSource] = useState("HDMI 1 (IPTV)");
  const [wallpaperUrl, setWallpaperUrl] = useState("https://hotel-cdn.com/royal-welcome.jpg");
  const [customWelcomeText, setCustomWelcomeText] = useState("Welcome back! Discover our fine dining, concierge, and IPTV streams.");

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

  const getStatusColor = (status: HospitalityTV["status"]) => {
    switch (status) {
      case "online": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "standby": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "offline": return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="space-y-6" id="tv-management-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-indigo-600" />
            Hospitality TV Configuration Panel
          </h2>
          <p className="text-sm text-slate-500 mt-1">Deploy firmware, welcome branding and policies to Samsung LYNK, WebOS and Android TVs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: TVs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider">Device Fleet Directory ({tvs.length} devices)</span>
              <span>All Groups: Main Hotel Block</span>
            </div>
            
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
                      onClick={() => setSelectedTv(tv)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                        selectedTv?.id === tv.id ? "bg-slate-50 font-semibold text-slate-800" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-gray-900">Room {tv.roomNumber}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-semibold text-[10px]">{tv.brand}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-500">{tv.ipAddress}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusColor(tv.status)}`}>
                          {tv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {tv.appVersion} / Vol {tv.volume}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => onSendCommand(tv.id, "reboot", null)}
                          disabled={tv.status === "offline"}
                          className="px-2 py-1 text-[10px] font-semibold border border-gray-200 hover:bg-gray-50 rounded text-gray-700 cursor-pointer disabled:opacity-50"
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

          {/* Quick Group Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Image className="h-4 w-4 text-gray-700" />
              Centralized Welcome Screens & Branding Policy
            </h3>
            <p className="text-xs text-gray-500">
              Bulk deploy customized splash screens, guest welcome messages, and wallpaper resources to Samsung LYNK REACH and LG Pro:Centric gateways instantly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-gray-600 mb-1">Branded Wallpaper URL (.jpg/.png)</label>
                <input 
                  type="text" 
                  value={wallpaperUrl}
                  onChange={(e) => setWallpaperUrl(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">Welcome Screen Greeting Template</label>
                <input 
                  type="text" 
                  value={customWelcomeText}
                  onChange={(e) => setCustomWelcomeText(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-black outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => {
                  alert(`Successfully queued branding payload. Wallpapers deployed dynamically to ${tvs.length} televisions!`);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-black text-white hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                Deploy Branding Assets (Bulk)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Device Controller */}
        <div>
          {selectedTv ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5 sticky top-6">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Device Controller</span>
                  <h3 className="font-bold text-gray-900 text-base">Room {selectedTv.roomNumber} TV</h3>
                  <span className="text-xs text-gray-500">{selectedTv.brand} ({selectedTv.ipAddress})</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusColor(selectedTv.status)}`}>
                  {selectedTv.status}
                </span>
              </div>

              {/* Volume Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-600 flex items-center gap-1">
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
                    className="flex-1 accent-black h-1 bg-gray-200 rounded-lg cursor-pointer"
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
                <span className="font-medium text-gray-600 block">Default Input Source</span>
                <div className="flex gap-2">
                  <select
                    value={inputSource}
                    onChange={(e) => setInputSource(e.target.value)}
                    className="flex-1 p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none bg-white"
                  >
                    <option value="HDMI 1 (IPTV)">HDMI 1 (IPTV Portal)</option>
                    <option value="HTML5 Portal">HTML5 Native Launcher</option>
                    <option value="HDMI 2 (Chromecast)">HDMI 2 (Chromecast Dongle)</option>
                    <option value="Coaxial Analog">Coaxial Cable Tuner</option>
                  </select>
                  <button 
                    onClick={() => handleCommandSubmit("input", inputSource)}
                    className="px-3 py-1.5 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 cursor-pointer"
                  >
                    Switch
                  </button>
                </div>
              </div>

              {/* Power Schedule Policy */}
              <div className="space-y-2 text-xs">
                <span className="font-medium text-gray-600 block">Power Schedule Policy (Energy Save)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={powerPolicy}
                    onChange={(e) => setPowerPolicy(e.target.value)}
                    placeholder="e.g. 07:00 On / 23:00 Off"
                    className="flex-1 p-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                  <button 
                    onClick={() => handleCommandSubmit("powerPolicy", powerPolicy)}
                    className="px-3 py-1.5 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 cursor-pointer"
                  >
                    Enforce
                  </button>
                </div>
              </div>

              {/* Advanced Diagnostics Tools */}
              <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
                <span className="font-medium text-gray-400 block uppercase text-[9px] tracking-wider">Device Admin Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleCommandSubmit("reboot", null)}
                    disabled={selectedTv.status === "offline"}
                    className="py-1.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    OTA Reboot
                  </button>
                  <button 
                    onClick={() => handleCommandSubmit("factoryReset", null)}
                    disabled={selectedTv.status === "offline"}
                    className="py-1.5 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Factory Reset
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5 text-[10px] font-mono text-gray-500">
                <div className="flex justify-between">
                  <span>Firmware version:</span>
                  <span className="text-gray-700 font-bold">{selectedTv.firmware}</span>
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
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-xs">
              Select a room television from the table to access physical remote configuration sliders and trigger volume controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
