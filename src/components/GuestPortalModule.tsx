import React, { useState, useEffect } from "react";
import { IPTVChannel, RestaurantItem, SmartRoomIoT } from "../types";
import { RESTAURANT_MENU } from "../data";
import { Monitor, Volume2, Flame, Thermometer, Moon, Sun, ShoppingBag, Send, AlertOctagon, Power, Heart, Wifi } from "lucide-react";

interface GuestPortalModuleProps {
  channels: IPTVChannel[];
  iotStates: SmartRoomIoT[];
  onPlaceOrder: (order: { roomNumber: string; items: { item: RestaurantItem; quantity: number }[]; paymentMethod: string }) => void;
  onUpdateIoT: (roomNumber: string, updates: Partial<SmartRoomIoT>) => void;
  onSendMessage: (roomNumber: string, text: string, sender: string) => void;
  messages: any[];
}

export default function GuestPortalModule({ channels, iotStates, onPlaceOrder, onUpdateIoT, onSendMessage, messages }: GuestPortalModuleProps) {
  const [selectedRoom, setSelectedRoom] = useState("101");
  const [tvPower, setTvPower] = useState(true);
  const [activeMenu, setActiveMenu] = useState<"streams" | "dining" | "room" | "concierge" | "guide">("streams");
  
  // Simulated IPTV state
  const [currentChannel, setCurrentChannel] = useState<IPTVChannel>(channels[0]);
  const [tvVolume, setTvVolume] = useState(22);
  const [isPlaying, setIsPlaying] = useState(true);

  // Dining cart state
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  
  // Chat state
  const [chatInput, setChatInput] = useState("");

  const activeIoT = iotStates.find(i => i.roomNumber === selectedRoom) || {
    roomNumber: selectedRoom, doorLocked: true, lightsIntensity: 50, hvacOn: true, thermostatTemp: 22.0, curtainsOpen: false, occupancyDetected: true, energyConsumption: 5.2
  };

  useEffect(() => {
    // If channels update, keep sync
    if (channels.length > 0 && !channels.some(c => c.id === currentChannel?.id)) {
      setCurrentChannel(channels[0]);
    }
  }, [channels]);

  const handleAddToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[id] <= 1) delete copy[id];
      else copy[id]--;
      return copy;
    });
  };

  const handleCheckoutDining = () => {
    const itemsToOrder = Object.entries(cart).map(([id, qty]) => {
      const menu = RESTAURANT_MENU.find(m => m.id === id);
      return { item: menu!, quantity: Number(qty) };
    }).filter(i => i.item !== undefined);

    if (itemsToOrder.length === 0) return;

    onPlaceOrder({
      roomNumber: selectedRoom,
      items: itemsToOrder,
      paymentMethod: "Charged to Room"
    });

    setCart({});
    alert(`Dining order successfully sent to kitchen! Total charged to Room ${selectedRoom} folio.`);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(selectedRoom, chatInput, "guest");
    setChatInput("");
  };

  const filteredMessages = messages.filter(m => m.roomNumber === selectedRoom || m.roomNumber === "ALL");

  return (
    <div className="space-y-6" id="guest-tv-portal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-indigo-600" />
            Interactive IPTV Guest TV Simulator
          </h2>
          <p className="text-sm text-slate-500 mt-1">Simulate interactive guest experiences, menu purchases, and IoT room commands</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Simulate TV in Room:</span>
          <select 
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white cursor-pointer outline-none text-slate-800"
          >
            <option value="101">Room 101 (Suite - David Beckham)</option>
            <option value="102">Room 102 (Deluxe - Elena Rostova)</option>
            <option value="201">Room 201 (Penthouse - Kenji Sato)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TV Chassis frame */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-2xl bg-black rounded-3xl p-3 shadow-2xl border-4 border-gray-800 relative">
            <span className="absolute left-6 top-6 bg-red-600 h-2.5 w-2.5 rounded-full animate-pulse shadow shadow-red-500" />
            
            {/* Screen */}
            <div className="aspect-video bg-neutral-900 rounded-2xl overflow-hidden relative flex flex-col justify-between text-white select-none">
              {!tvPower ? (
                <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center text-gray-600 font-semibold text-sm">
                  <Power className="h-10 w-10 text-gray-700 mb-2 cursor-pointer" onClick={() => setTvPower(true)} />
                  TV STANDBY MODE
                </div>
              ) : (
                <>
                  {/* TV Header Bar */}
                  <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold tracking-tight text-base text-yellow-400">AENZBI IPTV</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">Room {selectedRoom}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Connected</span>
                      </div>
                      <span>Cloud Sync OK</span>
                      <span className="font-bold">12:00 PM</span>
                    </div>
                  </div>

                  {/* Main TV Screen Content body */}
                  <div className="flex-1 relative p-4 flex">
                    {/* Background Simulated Video feed */}
                    {activeMenu === "streams" && currentChannel && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-fadeIn overflow-hidden">
                        {isPlaying ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            {/* Abstract visual animation to pretend its streaming */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-slate-900/40 to-cyan-950/20 mix-blend-color-dodge animate-pulse" />
                            <span className="text-6xl animate-bounce mb-3">{currentChannel.logo}</span>
                            <h4 className="font-bold text-lg text-white drop-shadow">{currentChannel.name}</h4>
                            <span className="text-[10px] bg-red-600 font-bold px-2 py-0.5 rounded uppercase mt-2">LIVE FEED</span>
                            
                            <div className="absolute bottom-4 left-4 bg-black/60 px-2.5 py-1 rounded text-[10px] font-mono text-gray-300 flex items-center gap-2">
                              <span>{currentChannel.resolution}</span>
                              <span>•</span>
                              <span>{currentChannel.fps}fps</span>
                              <span>•</span>
                              <span>{currentChannel.bitrate ? `${(currentChannel.bitrate/1000).toFixed(1)} Mbps` : "Static"}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Stream Paused</div>
                        )}
                      </div>
                    )}

                    {activeMenu === "dining" && (
                      <div className="absolute inset-0 bg-neutral-950 p-4 pt-16 overflow-y-auto text-xs space-y-4">
                        <h3 className="text-sm font-bold text-yellow-400 border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>🍽️ Fine Room-Service Dining</span>
                          <span className="text-[10px] text-gray-400">Billed to Folio</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2 pb-14">
                          {RESTAURANT_MENU.map((item) => (
                            <div key={item.id} className="bg-neutral-900 border border-white/5 p-2 rounded-lg flex items-center justify-between hover:border-yellow-400/20">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{item.image}</span>
                                <div>
                                  <h4 className="font-bold text-white leading-tight">{item.name}</h4>
                                  <span className="text-yellow-400 font-semibold">${item.price.toFixed(2)}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleAddToCart(item.id)}
                                className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-neutral-950 font-bold rounded text-[10px] cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeMenu === "room" && (
                      <div className="absolute inset-0 bg-neutral-950 p-4 pt-16 overflow-y-auto text-xs space-y-4">
                        <h3 className="text-sm font-bold text-teal-400 border-b border-white/10 pb-1 flex items-center gap-1.5">
                          <Thermometer className="h-4 w-4" />
                          Smart Room Automation
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Thermostat */}
                          <div className="bg-neutral-900 p-3 rounded-xl border border-white/5 space-y-3">
                            <span className="font-bold text-gray-300 block">Climate Control</span>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Thermostat:</span>
                              <span className="font-mono text-teal-400 font-bold text-base">{activeIoT.thermostatTemp}°C</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => onUpdateIoT(selectedRoom, { thermostatTemp: Number((activeIoT.thermostatTemp - 0.5).toFixed(1)) })}
                                className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded cursor-pointer"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => onUpdateIoT(selectedRoom, { thermostatTemp: Number((activeIoT.thermostatTemp + 0.5).toFixed(1)) })}
                                className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Smart Lights */}
                          <div className="bg-neutral-900 p-3 rounded-xl border border-white/5 space-y-3">
                            <span className="font-bold text-gray-300 block">Intelligent Lighting</span>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Luminosity:</span>
                              <span className="font-mono text-yellow-400 font-bold text-base">{activeIoT.lightsIntensity}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={activeIoT.lightsIntensity}
                              onChange={(e) => onUpdateIoT(selectedRoom, { lightsIntensity: Number(e.target.value) })}
                              className="w-full accent-yellow-400 bg-neutral-800 h-1.5 rounded"
                            />
                          </div>

                          {/* Curtains */}
                          <div className="bg-neutral-900 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-300 block">Curtains Blinds</span>
                              <span className="text-gray-500 text-[10px]">{activeIoT.curtainsOpen ? "Open" : "Closed"}</span>
                            </div>
                            <button
                              onClick={() => onUpdateIoT(selectedRoom, { curtainsOpen: !activeIoT.curtainsOpen })}
                              className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer ${activeIoT.curtainsOpen ? "bg-teal-500 text-white" : "bg-neutral-800 text-gray-400"}`}
                            >
                              Toggle
                            </button>
                          </div>

                          {/* Smart Lock */}
                          <div className="bg-neutral-900 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-300 block">Main Door Lock</span>
                              <span className="text-gray-500 text-[10px]">{activeIoT.doorLocked ? "Secured" : "Unlocked"}</span>
                            </div>
                            <button
                              onClick={() => onUpdateIoT(selectedRoom, { doorLocked: !activeIoT.doorLocked })}
                              className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer ${activeIoT.doorLocked ? "bg-red-500 text-white" : "bg-teal-500 text-white"}`}
                            >
                              {activeIoT.doorLocked ? "Unlock" : "Lock"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeMenu === "concierge" && (
                      <div className="absolute inset-0 bg-neutral-950 p-4 pt-16 flex flex-col justify-between text-xs">
                        <h3 className="text-sm font-bold text-indigo-400 border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>💬 Messaging Concierge Desk</span>
                          <span className="text-[10px] text-gray-400 font-mono">24/7 Desk Support</span>
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-2 py-3">
                          {filteredMessages.map((msg: any) => (
                            <div 
                              key={msg.id} 
                              className={`max-w-[80%] rounded-lg p-2 ${
                                msg.sender === "guest" 
                                  ? "bg-indigo-600 ml-auto text-white" 
                                  : msg.sender === "system"
                                  ? "bg-red-950/60 text-red-300 border border-red-900/30 mx-auto text-center font-mono text-[10px]"
                                  : "bg-neutral-800 text-gray-200"
                              }`}
                            >
                              {msg.sender === "system" && <span className="block font-bold text-red-400 mb-0.5">⚠️ TELEVISION ALERT</span>}
                              <p className="leading-snug">{msg.text}</p>
                              <span className="block text-[8px] text-white/50 text-right mt-1 font-mono">{msg.timestamp}</span>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendChat} className="flex gap-2 border-t border-white/10 pt-2">
                          <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask receptionist or type 'wifi'..."
                            className="flex-1 bg-neutral-900 border border-white/10 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500 text-xs"
                          />
                          <button type="submit" className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer">
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    )}

                    {activeMenu === "guide" && (
                      <div className="absolute inset-0 bg-neutral-950 p-4 pt-16 overflow-y-auto text-xs space-y-4">
                        <h3 className="text-sm font-bold text-emerald-400 border-b border-white/10 pb-1">🗺️ Local Attractions & Tourist Guide</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-neutral-900 p-2.5 rounded-lg border border-white/5">
                            <span className="text-lg">🎡</span>
                            <h4 className="font-bold text-white mt-1">London Eye & River Cruise</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">Complementary fast-track passes. Enquire at frontdesk desk.</p>
                          </div>
                          <div className="bg-neutral-900 p-2.5 rounded-lg border border-white/5">
                            <span className="text-lg">🏰</span>
                            <h4 className="font-bold text-white mt-1">Tower of London Historic Tour</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">Daily excursions with premium multilingual guides.</p>
                          </div>
                          <div className="bg-neutral-900 p-2.5 rounded-lg border border-white/5">
                            <span className="text-lg">🎭</span>
                            <h4 className="font-bold text-white mt-1">West End Theatre Bookings</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">Premium tickets for the most popular musicals.</p>
                          </div>
                          <div className="bg-neutral-900 p-2.5 rounded-lg border border-white/5">
                            <span className="text-lg">🧖‍♀️</span>
                            <h4 className="font-bold text-white mt-1">Royal Spa & Sauna Treatments</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">Located on Floor 5. Open daily 06:00 - 22:00.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Navigation Rail overlay */}
                  <div className="p-2.5 bg-neutral-950 border-t border-white/5 flex justify-around items-center z-10 text-[10px] font-bold text-gray-400">
                    <button 
                      onClick={() => setActiveMenu("streams")} 
                      className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeMenu === "streams" ? "text-yellow-400 scale-105" : "hover:text-white"}`}
                    >
                      <Monitor className="h-4 w-4" />
                      <span>Channels</span>
                    </button>
                    <button 
                      onClick={() => setActiveMenu("dining")} 
                      className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${activeMenu === "dining" ? "text-yellow-400 scale-105" : "hover:text-white"}`}
                    >
                      {Object.keys(cart).length > 0 && (
                        <span className="absolute -top-1 -right-1.5 bg-red-500 text-white rounded-full h-3.5 w-3.5 flex items-center justify-center text-[8px] animate-pulse">
                          {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
                        </span>
                      )}
                      <ShoppingBag className="h-4 w-4" />
                      <span>In-Room Dining</span>
                    </button>
                    <button 
                      onClick={() => setActiveMenu("room")} 
                      className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeMenu === "room" ? "text-yellow-400 scale-105" : "hover:text-white"}`}
                    >
                      <Thermometer className="h-4 w-4" />
                      <span>My Smart Room</span>
                    </button>
                    <button 
                      onClick={() => setActiveMenu("concierge")} 
                      className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeMenu === "concierge" ? "text-yellow-400 scale-105" : "hover:text-white"}`}
                    >
                      <Send className="h-4 w-4" />
                      <span>Concierge Desk</span>
                    </button>
                    <button 
                      onClick={() => setActiveMenu("guide")} 
                      className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeMenu === "guide" ? "text-yellow-400 scale-105" : "hover:text-white"}`}
                    >
                      <span>🗺️ Tour Guide</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* TV Stand Base */}
          <div className="w-24 h-6 bg-gray-800 rounded-t-lg -mt-1 shadow-md" />
          <div className="w-48 h-2 bg-gray-900 rounded-lg shadow-md" />
        </div>

        {/* Remote Controller layout on Right */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Simulated Remote</span>
              <h3 className="font-semibold text-gray-900 text-sm">Hardware Control Daemon</h3>
            </div>

            <div className="bg-neutral-100 p-4 rounded-2xl border border-neutral-200 shadow-inner flex flex-col items-center space-y-4 max-w-[200px] mx-auto">
              {/* Power button */}
              <button 
                onClick={() => setTvPower(!tvPower)}
                className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-colors ${
                  tvPower ? "bg-red-600 hover:bg-red-700 text-white" : "bg-neutral-800 text-red-500"
                }`}
              >
                <Power className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold text-gray-600 w-full">
                <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-200 shadow-sm flex flex-col items-center justify-center">
                  <span>VOL +</span>
                  <button 
                    onClick={() => {
                      if (tvVolume < 50) {
                        setTvVolume(v => v + 1);
                        onUpdateIoT(selectedRoom, { energyConsumption: Number((activeIoT.energyConsumption + 0.05).toFixed(1)) });
                      }
                    }}
                    className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md mt-1 w-full text-center font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-200 shadow-sm flex flex-col items-center justify-center">
                  <span>VOL -</span>
                  <button 
                    onClick={() => {
                      if (tvVolume > 0) setTvVolume(v => v - 1);
                    }}
                    className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md mt-1 w-full text-center font-bold cursor-pointer"
                  >
                    -
                  </button>
                </div>
              </div>

              {/* Channels browsing */}
              <div className="w-full bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl text-center space-y-1.5 text-xs font-medium">
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block">TV Tuner Channel Select</span>
                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                  {channels.map((chan) => (
                    <button 
                      key={chan.id}
                      onClick={() => {
                        setCurrentChannel(chan);
                        setIsPlaying(true);
                        setActiveMenu("streams");
                      }}
                      className={`w-full text-left p-1 rounded hover:bg-neutral-200/50 text-[10px] flex items-center gap-1 cursor-pointer truncate ${
                        currentChannel?.id === chan.id ? "bg-black text-white" : "text-gray-700"
                      }`}
                    >
                      <span>{chan.logo}</span>
                      <span>{chan.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cart preview */}
          {activeMenu === "dining" && Object.keys(cart).length > 0 && (
            <div className="border-t border-gray-100 pt-3 mt-4 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Cart Checklist</span>
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto text-xs text-gray-600">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = RESTAURANT_MENU.find(m => m.id === id);
                  if (!item) return null;
                  const itemQty = Number(qty);
                  return (
                    <div key={id} className="flex justify-between items-center bg-gray-50 p-1.5 rounded border border-gray-100">
                      <span className="font-semibold">{item.name} (x{itemQty})</span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-900 font-bold">${(item.price * itemQty).toFixed(2)}</span>
                        <button 
                          onClick={() => handleRemoveFromCart(id)} 
                          className="px-1 py-0.5 bg-gray-200 text-gray-700 rounded text-[9px] font-bold hover:bg-gray-300 cursor-pointer"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-center font-bold text-xs">
                <span>Total:</span>
                <span className="text-gray-900 text-sm">
                  ${Object.entries(cart).reduce((sum, [id, qty]) => sum + ((RESTAURANT_MENU.find(m => m.id === id)?.price || 0) * Number(qty)), 0).toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleCheckoutDining}
                className="w-full py-1.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Place Dining Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
