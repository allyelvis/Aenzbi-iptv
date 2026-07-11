import React, { useState } from "react";
import { Room, Guest } from "../types";
import { Hotel, UserPlus, ClipboardList, ShieldAlert, DoorOpen, Plus, Sparkles, LogOut, CheckCircle2, Trash2, Layers, Building } from "lucide-react";

interface HotelModuleProps {
  rooms: Room[];
  guests: Guest[];
  onCheckIn: (payload: { name: string; roomNumber: string; email?: string; phone?: string; language?: string }) => void;
  onCheckOut: (id: string) => void;
  onUpdateRoom: (roomNumber: string, updates: Partial<Room>) => void;
  onCreateRoom: (payload: { number: string; building: string; floor: number; type: Room["type"] }) => void;
  onDeleteRoom: (roomNumber: string) => void;
}

export default function HotelModule({ 
  rooms, 
  guests, 
  onCheckIn, 
  onCheckOut, 
  onUpdateRoom,
  onCreateRoom,
  onDeleteRoom
}: HotelModuleProps) {
  const [activeTab, setActiveTab] = useState<"rooms" | "guests" | "checkin" | "manage">("rooms");
  
  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestRoom, setNewGuestRoom] = useState("");
  const [newGuestLanguage, setNewGuestLanguage] = useState("en");

  // New Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomBuilding, setNewRoomBuilding] = useState("Main Block");
  const [newRoomFloor, setNewRoomFloor] = useState("1");
  const [newRoomType, setNewRoomType] = useState<Room["type"]>("Standard");
  const [roomError, setRoomError] = useState("");

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

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) {
      setRoomError("Room number is required");
      return;
    }
    const exists = rooms.some(r => r.number === newRoomNumber);
    if (exists) {
      setRoomError(`Room ${newRoomNumber} already exists in the PMS catalog.`);
      return;
    }

    onCreateRoom({
      number: newRoomNumber,
      building: newRoomBuilding,
      floor: parseInt(newRoomFloor) || 1,
      type: newRoomType
    });

    setNewRoomNumber("");
    setRoomError("");
    setActiveTab("rooms");
    alert(`Room ${newRoomNumber} successfully created and added to PMS database! TV and IoT components have been auto-provisioned.`);
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
          <p className="text-sm text-slate-500 mt-1">Manage guest registration records, room states, and fleet decommissioning links</p>
        </div>
        
        {/* Navigation sub-tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start border border-slate-200 shadow-sm text-xs font-semibold">
          <button 
            onClick={() => setActiveTab("rooms")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "rooms" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Room Grid
          </button>
          <button 
            onClick={() => setActiveTab("guests")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "guests" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Checked-In Guests
          </button>
          <button 
            onClick={() => setActiveTab("checkin")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "checkin" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Express Check-In
          </button>
          <button 
            onClick={() => setActiveTab("manage")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "manage" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Room Manager
          </button>
        </div>
      </div>

      {activeTab === "rooms" && (
        <div className="space-y-6 animate-fade-in">
          {/* Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const occupyingGuest = guests.find(g => g.roomNumber === room.number && g.status === "checked-in");
              return (
                <div 
                  key={room.number} 
                  className={`bg-white border rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between ${
                    room.occupancy 
                      ? "border-indigo-100 hover:shadow-md" 
                      : "border-slate-200 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-900">Room {room.number}</span>
                        <span className="block text-[10px] text-gray-400 font-mono">{room.building} • Floor {room.floor}</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {room.type}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {room.occupancy && occupyingGuest ? (
                        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-2.5">
                          <span className="block text-[9px] text-indigo-500 uppercase font-mono font-bold tracking-wider">Current Guest</span>
                          <span className="font-bold text-indigo-950 block truncate">{occupyingGuest.name}</span>
                          <span className="text-[10px] text-indigo-700/80">Checkout: {occupyingGuest.checkOutDate}</span>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center text-gray-400">
                          Vacant Room
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider font-mono">Housekeeping</span>
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
                          <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider font-mono">DND Status</span>
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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
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
                      <span className="bg-gray-100 font-semibold px-2.5 py-0.5 rounded text-gray-700 font-mono">Room {g.roomNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 space-y-0.5">
                      <span className="block font-medium text-gray-700">{g.email}</span>
                      <span className="block text-gray-400 font-mono">{g.phone}</span>
                    </td>
                    <td className="px-4 py-3.5 uppercase font-bold text-indigo-600">{g.language}</td>
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
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-xl shadow-sm animate-fade-in">
          <h3 className="font-semibold text-gray-900 text-base mb-2 flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <UserPlus className="h-5 w-5 text-indigo-600" />
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
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Room Assignment</label>
                <select
                  required
                  value={newGuestRoom}
                  onChange={(e) => setNewGuestRoom(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
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
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">TV Portal Language Preference</label>
                <select
                  value={newGuestLanguage}
                  onChange={(e) => setNewGuestLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-semibold"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer font-semibold shadow-sm shadow-indigo-100"
              >
                Complete PMS Check-In
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Create Room Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Plus className="h-4.5 w-4.5 text-indigo-600" />
              Provision New Room
            </h3>

            <form onSubmit={handleCreateRoomSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Room Number *</label>
                <input 
                  type="text"
                  required
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="e.g. 104, 301"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Building Block</label>
                  <select
                    value={newRoomBuilding}
                    onChange={(e) => setNewRoomBuilding(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="Main Block">Main Block</option>
                    <option value="West Wing">West Wing</option>
                    <option value="Spa Annex">Spa Annex</option>
                    <option value="Executive Pool Tower">Executive Pool Tower</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Floor Level</label>
                  <input 
                    type="number"
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Suite Category</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Standard">Standard (DVB-T Television)</option>
                  <option value="Deluxe">Deluxe (LG WebOS Interactive TV)</option>
                  <option value="Suite">Suite (Samsung Tizen Smart TV)</option>
                  <option value="Penthouse">Penthouse (Android Smart Box)</option>
                </select>
              </div>

              {roomError && (
                <p className="text-red-500 font-semibold text-[10px]">{roomError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 text-xs"
              >
                <Plus className="h-4 w-4" />
                Initialize Room Hardware
              </button>
            </form>
          </div>

          {/* Directory for Decommissioning/Deleting */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Trash2 className="h-4.5 w-4.5 text-red-600" />
              Active Hardware Decommissioning Ledger
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left text-slate-500 divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Room</th>
                    <th className="px-3 py-2">Block</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Occupancy Status</th>
                    <th className="px-3 py-2 text-right">Ledger Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rooms.map((room) => (
                    <tr key={room.number} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3 font-bold text-slate-900">Room {room.number}</td>
                      <td className="px-3 py-3">{room.building} (Flr {room.floor})</td>
                      <td className="px-3 py-3 font-medium text-slate-600">{room.type}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          room.occupancy 
                            ? "bg-amber-50 text-amber-700 border-amber-150" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-150"
                        }`}>
                          {room.occupancy ? "Occupied (In Use)" : "Vacant"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => {
                            if (room.occupancy) {
                              alert(`Room ${room.number} cannot be decommissioned because a guest is currently checked in.`);
                              return;
                            }
                            if (confirm(`CRITICAL WARNING: Are you sure you want to decommission Room ${room.number}? This will permanently wipe and delete its linked Hospitality TV, IP Address configurations, and smart IoT telemetry parameters.`)) {
                              onDeleteRoom(room.number);
                            }
                          }}
                          className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 font-bold text-[10px] cursor-pointer inline-flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
