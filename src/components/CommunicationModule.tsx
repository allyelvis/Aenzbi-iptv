import React, { useState } from "react";
import { GuestMessage, Guest } from "../types";
import { MessageSquare, Send, BellRing, User, ShieldAlert, PhoneIncoming, MessageCircle } from "lucide-react";

interface CommunicationModuleProps {
  messages: GuestMessage[];
  guests: Guest[];
  onSendMessage: (roomNumber: string, text: string, sender: string) => void;
  onSendBroadcast: (text: string) => void;
}

export default function CommunicationModule({ messages, guests, onSendMessage, onSendBroadcast }: CommunicationModuleProps) {
  const [activeRoom, setActiveRoom] = useState<string>("101");
  const [inputText, setInputText] = useState("");
  const [emergencyText, setEmergencyText] = useState("");

  const activeGuest = guests.find(g => g.roomNumber === activeRoom && g.status === "checked-in");
  const roomMessages = messages.filter(m => m.roomNumber === activeRoom || m.roomNumber === "ALL");

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(activeRoom, inputText, "reception");
    setInputText("");
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyText.trim()) return;
    onSendBroadcast(emergencyText);
    setEmergencyText("");
    alert("Emergency warning broadcasted system-wide to all TV screens!");
  };

  return (
    <div className="space-y-6" id="comms-reception-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            Hotel Communications Hub
          </h2>
          <p className="text-sm text-slate-500 mt-1">Chat directly with guest TVs, send voice notes, and broadcast emergency warning bulletins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Guest list / rooms to chat */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block font-mono">Active Guest Chats</span>
          
          <div className="space-y-1.5">
            {guests.filter(g => g.status === "checked-in").map((guest) => (
              <div 
                key={guest.id}
                onClick={() => setActiveRoom(guest.roomNumber)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  activeRoom === guest.roomNumber 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100" 
                    : "bg-slate-50 text-slate-800 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-md ${activeRoom === guest.roomNumber ? "bg-indigo-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate leading-snug">{guest.name}</h4>
                    <span className={`text-[9px] ${activeRoom === guest.roomNumber ? "text-indigo-200" : "text-slate-400"}`}>Room {guest.roomNumber} • {guest.language.toUpperCase()}</span>
                  </div>
                </div>

                <span className={`h-2 w-2 rounded-full shrink-0 ${activeRoom === guest.roomNumber ? "bg-white" : "bg-indigo-500"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Central Column: Chat box with guest room */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-xs">Room {activeRoom} Desk Console</h3>
                <span className="text-[9px] text-gray-400 uppercase font-mono">Chat Status: Active Session</span>
              </div>
              <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded uppercase">Guest TV Connected</span>
            </div>

            <div className="space-y-3.5 overflow-y-auto h-[300px] pr-2 scrollbar-thin">
              {roomMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === "reception" 
                      ? "bg-gray-100 ml-auto text-gray-800 border border-gray-200/50" 
                      : msg.sender === "system"
                      ? "bg-red-50 border border-red-100 text-red-700 mx-auto text-center font-mono text-[10px]"
                      : "bg-blue-600 text-white ml-0"
                  }`}
                >
                  {msg.sender === "system" && <span className="block font-bold text-red-500 text-[9px] mb-1">📢 ALL-ROOM BROADCASTED ALERT</span>}
                  <p>{msg.text}</p>
                  <span className="block text-[8px] text-gray-400 text-right mt-1.5 font-mono">{msg.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendSubmit} className="flex gap-2 border-t border-gray-100 pt-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send instant chat to Room ${activeRoom}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-black outline-none"
            />
            <button type="submit" className="p-2 bg-black hover:bg-gray-800 text-white rounded-lg cursor-pointer">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Emergency Alerts Bulletin */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" />
              Crisis Control Center
            </span>
            <h3 className="font-semibold text-gray-900 text-sm mt-1">TV Overlay Broadcaster</h3>
          </div>

          <p className="text-[11px] text-gray-500 leading-normal">
            Transmit full-screen warning messages, severe weather evacuations, or fire drill bulletins to all television monitors in the facility instantly.
          </p>

          <form onSubmit={handleBroadcastSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-gray-600 mb-1">Bulletin Overlay Message</label>
              <textarea 
                rows={4}
                required
                value={emergencyText}
                onChange={(e) => setEmergencyText(e.target.value)}
                placeholder="e.g. FIRE ALARM TEST IN PROGRESS. Please ignore all visual alarm indicators. There is no need to evacuate."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black outline-none text-xs"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <BellRing className="h-4 w-4 animate-bounce" />
              Broadcast Emergency Warning
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
