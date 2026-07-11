import React, { useState } from "react";
import { Room, Guest } from "../types";
import { Hotel, UserPlus, ClipboardList, ShieldAlert, DoorOpen, Plus, Sparkles, LogOut, CheckCircle2 } from "lucide-react";

interface HotelModuleProps {
  rooms: Room[];
  guests: Guest[];
  onCheckIn: (payload: { name: string; roomNumber: string; email?: string; phone?: string; language?: string }) => void;
  onCheckOut: (id: string) => void;
  onUpdateRoom: (roomNumber: string, updates: Partial<Room>) => void;
}

export default function HotelModule({ rooms, guests, onCheckIn, onCheckOut, onUpdateRoom }: HotelModuleProps) {
  const [activeTab, setActiveTab] = useState<"rooms" | "guests" | "checkin">("rooms");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestRoom, setNewGuestRoom] = useState("");
  const [newGuestLanguage, setNewGuestLanguage] = useState("en");

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newGuestRoom) return;
    onCheckIn({
      name: newGuestName,
      roomNumber: newGuestRoom,
      email: newGuestEmail,
      phone: newGuestPhone,
      language: newGuestLanguage
    });
    setNewGuestName("");
    setNewGuestEmail("");
    setNewGuestPhone("");
    setNewGuestRoom("");
    setActiveTab("rooms");
    alert(`Successfully checked-in ${newGuestName} into Room ${newGuestRoom}!`);
  };

  const getHousekeepingStyle = (status: Room["housekeeping"]) => {
    switch (status) {
      case "Clean": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Dirty": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Inspect": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6" id="pms-hotel-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <Hotel className="h-5 w-5 text-indigo-600" />
            Hotel PMS Orchestration
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage guest registration records, room states and housekeeping allocations</p>
        </div>
        
        {/* Navigation sub-tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg self-start border border-slate-200">
          <button 
            onClick={() => setActiveTab("rooms")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "rooms" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Room Grid
          </button>
          <button 
            onClick={() => setActiveTab("guests")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "guests" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Checked-In Guests
          </button>
          <button 
            onClick={() => setActiveTab("checkin")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "checkin" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            New Check-In
          </button>
        </div>
      </div>

      {activeTab === "rooms" && (
        <div className="space-y-6">
          {/* Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const occupyingGuest = guests.find(g => g.roomNumber === room.number && g.status === "checked-in");
              return (
                <div 
                  key={room.number} 
                  className={`bg-white border rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between ${
                    room.occupancy 
                      ? "border-gray-200/80 hover:border-gray-300" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-900">Room {room.number}</span>
                        <span className="block text-[10px] text-gray-400 font-mono">{room.building} • Floor {room.floor}</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded">
                        {room.type}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {room.occupancy && occupyingGuest ? (
                        <div className="bg-blue-50/50 border border-blue-100/50 rounded-lg p-2">
                          <span className="block text-[9px] text-blue-500 uppercase font-mono font-semibold">Current Guest</span>
                          <span className="font-semibold text-blue-950 block truncate">{occupyingGuest.name}</span>
                          <span className="text-[10px] text-blue-700/80">Out: {occupyingGuest.checkOutDate}</span>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center text-gray-400">
                          Vacant Room
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase">Housekeeping</span>
                          <select 
                            value={room.housekeeping}
                            onChange={(e) => onUpdateRoom(room.number, { housekeeping: e.target.value as any })}
                            className={`w-full p-1 text-[11px] rounded border focus:outline-none cursor-pointer font-medium mt-0.5 ${getHousekeepingStyle(room.housekeeping)}`}
                          >
                            <option value="Clean">Clean</option>
                            <option value="Dirty">Dirty</option>
                            <option value="Inspect">Inspect</option>
                          </select>
                        </div>
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase">DND Status</span>
                          <button
                            onClick={() => onUpdateRoom(room.number, { dnd: !room.dnd })}
                            className={`w-full p-1 text-[11px] rounded border font-semibold mt-0.5 cursor-pointer text-center ${
                              room.dnd 
                                ? "bg-red-500/10 text-red-600 border-red-500/20" 
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {room.dnd ? "Active (DND)" : "No DND"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {room.occupancy && occupyingGuest && (
                    <div className="border-t border-gray-100 pt-3 mt-4 flex justify-end">
                      <button 
                        onClick={() => {
                          if (confirm(`Trigger PMS Checkout for ${occupyingGuest.name} from Room ${room.number}?`)) {
                            onCheckOut(occupyingGuest.id);
                          }
                        }}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <LogOut className="h-3 w-3" />
                        Check Out
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "guests" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Live Guest Accounts ({guests.filter(g => g.status === "checked-in").length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500 divide-y divide-gray-100">
              <thead className="bg-gray-50/50 text-[10px] font-bold uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Booking Span</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {guests.filter(g => g.status === "checked-in").map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-900">{g.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-gray-100 font-semibold px-2.5 py-0.5 rounded text-gray-700">Room {g.roomNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 space-y-0.5">
                      <span className="block font-medium text-gray-700">{g.email}</span>
                      <span className="block text-gray-400 font-mono">{g.phone}</span>
                    </td>
                    <td className="px-4 py-3.5 uppercase font-bold text-blue-600">{g.language}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-500">
                      {g.checkInDate} to {g.checkOutDate}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => {
                          if (confirm(`Check-out ${g.name}?`)) {
                            onCheckOut(g.id);
                          }
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 cursor-pointer"
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "checkin" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 text-base mb-2 flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <UserPlus className="h-5 w-5 text-gray-700" />
            Express Guest PMS Check-In
          </h3>
          <form onSubmit={handleCheckInSubmit} className="space-y-4 mt-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-600 mb-1">Guest Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Lionel Messi"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Room Assignment</label>
                <select
                  required
                  value={newGuestRoom}
                  onChange={(e) => setNewGuestRoom(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none bg-white"
                >
                  <option value="">Select vacant room...</option>
                  {rooms.filter(r => !r.occupancy).map(r => (
                    <option key={r.number} value={r.number}>Room {r.number} ({r.type} Floor {r.floor})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="messi@gmail.com"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">TV Portal Language Language Preference</label>
                <select
                  value={newGuestLanguage}
                  onChange={(e) => setNewGuestLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none bg-white font-semibold"
                >
                  <option value="en">English (complimentary IPTV Default)</option>
                  <option value="fr">French (French TV priorities)</option>
                  <option value="es">Spanish (Spanish audio tracks)</option>
                  <option value="de">German (German channel layout)</option>
                  <option value="sw">Swahili (East Africa localized)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setActiveTab("rooms")}
                className="px-4 py-2 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 rounded-lg cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg cursor-pointer font-semibold"
              >
                Complete PMS Check-In
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
