import React, { useState, useEffect } from "react";
import { IPTVChannel, HeadendDevice, HospitalityTV, Room, Guest, RestaurantOrder, FolioCharge, GuestMessage, SmartRoomIoT, SystemLog } from "./types";

// Import modules
import IPTVModule from "./components/IPTVModule";
import HeadendModule from "./components/HeadendModule";
import HospitalityTVModule from "./components/HospitalityTVModule";
import HotelModule from "./components/HotelModule";
import GuestPortalModule from "./components/GuestPortalModule";
import RestaurantModule from "./components/RestaurantModule";
import BillingModule from "./components/BillingModule";
import CommunicationModule from "./components/CommunicationModule";
import IoTModule from "./components/IoTModule";
import AnalyticsModule from "./components/AnalyticsModule";
import DeploymentModule from "./components/DeploymentModule";
import WorkspaceModule from "./components/WorkspaceModule";

// Icons
import { 
  BarChart3, Monitor, Server, Settings, Hotel, ChefHat, CreditCard, 
  MessageSquare, Zap, HardDrive, ShieldAlert, Heart, Terminal, 
  Menu, X, Radio, Activity, LayoutDashboard, Clock, Sparkles, Download
} from "lucide-react";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [headends, setHeadends] = useState<HeadendDevice[]>([]);
  const [tvs, setTvs] = useState<HospitalityTV[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [iotStates, setIotStates] = useState<SmartRoomIoT[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [folios, setFolios] = useState<{ [roomNumber: string]: FolioCharge[] }>({});

  const [loading, setLoading] = useState(true);

  // Poll for real-time updates every 4 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [
        channelsRes, headendsRes, tvsRes, roomsRes, guestsRes, 
        ordersRes, messagesRes, iotRes, logsRes
      ] = await Promise.all([
        fetch("/api/channels").then(r => r.json()),
        fetch("/api/headends").then(r => r.json()),
        fetch("/api/tvs").then(r => r.json()),
        fetch("/api/rooms").then(r => r.json()),
        fetch("/api/guests").then(r => r.json()),
        fetch("/api/orders").then(r => r.json()),
        fetch("/api/messages").then(r => r.json()),
        fetch("/api/iot").then(r => r.json()),
        fetch("/api/logs").then(r => r.json()),
      ]);

      setChannels(channelsRes);
      setHeadends(headendsRes);
      setTvs(tvsRes);
      setRooms(roomsRes);
      setGuests(guestsRes);
      setOrders(ordersRes);
      setMessages(messagesRes);
      setIotStates(iotRes);
      setLogs(logsRes);

      // Fetch all room folios
      const roomNumbers = ["101", "102", "103", "201", "202"];
      const foliosDict: { [roomNumber: string]: FolioCharge[] } = {};
      await Promise.all(
        roomNumbers.map(async (num) => {
          const res = await fetch(`/api/folios/${num}`);
          if (res.ok) {
            foliosDict[num] = await res.json();
          }
        })
      );
      setFolios(foliosDict);
      setLoading(false);
    } catch (error) {
      console.error("Full-stack state sync error:", error);
    }
  };

  // State mutators calling full-stack backend APIs
  const handleSaveChannel = async (id: string, updates: Partial<IPTVChannel>) => {
    const res = await fetch(`/api/channels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (res.ok) fetchData();
  };

  const handleAddChannel = async (channel: Omit<IPTVChannel, "id" | "viewers" | "fps" | "bitrate" | "resolution" | "status">) => {
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(channel)
    });
    if (res.ok) fetchData();
  };

  const handleRebootHeadend = async (id: string) => {
    const res = await fetch(`/api/headends/${id}/reboot`, { method: "POST" });
    if (res.ok) fetchData();
  };

  const handleSendCommandTV = async (id: string, command: string, value: any) => {
    const res = await fetch(`/api/tvs/${id}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, value })
    });
    if (res.ok) fetchData();
  };

  const handleCheckInGuest = async (payload: { name: string; roomNumber: string; email?: string; phone?: string; language?: string }) => {
    const res = await fetch("/api/guests/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) fetchData();
  };

  const handleCheckOutGuest = async (id: string) => {
    const res = await fetch(`/api/guests/${id}/checkout`, { method: "POST" });
    if (res.ok) fetchData();
  };

  const handleUpdateRoomPMS = async (roomNumber: string, updates: Partial<Room>) => {
    const res = await fetch(`/api/rooms/${roomNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (res.ok) fetchData();
  };

  const handlePlaceDiningOrder = async (order: { roomNumber: string; items: { item: any; quantity: number }[]; paymentMethod: string }) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });
    if (res.ok) fetchData();
  };

  const handleUpdateOrderStatus = async (id: string, status: RestaurantOrder["status"]) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchData();
  };

  const handleAddFolioCharge = async (roomNumber: string, charge: { description: string; amount: number; category: FolioCharge["category"] }) => {
    const res = await fetch(`/api/folios/${roomNumber}/charge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(charge)
    });
    if (res.ok) fetchData();
  };

  const handleSendMessage = async (roomNumber: string, text: string, sender: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomNumber, text, sender })
    });
    if (res.ok) fetchData();
  };

  const handleSendBroadcast = async (text: string) => {
    const res = await fetch("/api/messages/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (res.ok) fetchData();
  };

  const handleUpdateIoT = async (roomNumber: string, updates: Partial<SmartRoomIoT>) => {
    const res = await fetch(`/api/iot/${roomNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (res.ok) fetchData();
  };

  const handleGenerateReportAI = async (): Promise<string> => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Compile our strategic predictive report based on connected room energy grids, IPTV stream viewership spikes and check-in ratios.",
        mode: "reports"
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.reply;
    }
    throw new Error("API report failed");
  };

  const handleAddSystemLog = async (severity: string, module: string, message: string) => {
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ severity, module, message })
    });
    if (res.ok) fetchData();
  };

  const downloadLogsCSV = () => {
    const escapeCsvValue = (val: string) => {
      const escaped = val.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const headers = ["ID", "Timestamp", "Severity", "Module", "Message"];
    const rows = logs.map(log => [
      escapeCsvValue(log.id),
      escapeCsvValue(log.timestamp),
      escapeCsvValue(log.severity),
      escapeCsvValue(log.module),
      escapeCsvValue(log.message)
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `aenzbi_system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityStyle = (sev: SystemLog["severity"]) => {
    switch (sev) {
      case "info": return "text-blue-500 bg-blue-50";
      case "warning": return "text-amber-600 bg-amber-50";
      case "error": return "text-red-600 bg-red-50";
      case "security": return "text-indigo-600 bg-indigo-50";
    }
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "iptv":
        return <IPTVModule channels={channels} onUpdateChannel={handleSaveChannel} onAddChannel={handleAddChannel} />;
      case "headend":
        return <HeadendModule devices={headends} onRebootDevice={handleRebootHeadend} />;
      case "tvs":
        return <HospitalityTVModule tvs={tvs} onSendCommand={handleSendCommandTV} />;
      case "pms":
        return <HotelModule rooms={rooms} guests={guests} onCheckIn={handleCheckInGuest} onCheckOut={handleCheckOutGuest} onUpdateRoom={handleUpdateRoomPMS} />;
      case "simulator":
        return <GuestPortalModule channels={channels} iotStates={iotStates} onPlaceOrder={handlePlaceDiningOrder} onUpdateIoT={handleUpdateIoT} onSendMessage={handleSendMessage} messages={messages} />;
      case "restaurant":
        return <RestaurantModule orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />;
      case "billing":
        return <BillingModule guests={guests} folios={folios} onAddCharge={handleAddFolioCharge} />;
      case "comms":
        return <CommunicationModule messages={messages} guests={guests} onSendMessage={handleSendMessage} onSendBroadcast={handleSendBroadcast} />;
      case "iot":
        return <IoTModule iotStates={iotStates} onUpdateIoT={handleUpdateIoT} />;
      case "analytics":
        return <AnalyticsModule onGenerateReport={handleGenerateReportAI} />;
      case "workspace":
        return <WorkspaceModule guests={guests} onAddLog={handleAddSystemLog} />;
      case "deployment":
        return <DeploymentModule />;
      
      case "overview":
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider font-mono">Active IPTV Channels</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-slate-800">{channels.filter(c => c.status === "active").length}</span>
                  <span className="text-[11px] font-semibold text-slate-400">/ {channels.length} configured</span>
                </div>
                <div className="text-[10px] text-emerald-500 font-medium mt-1">42 streams active</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider font-mono">Stream Health</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-slate-800">99.98%</span>
                  <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                    <Heart className="h-3 w-3 fill-emerald-500 animate-pulse" />
                    All Nominal
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">+12 since 08:00 AM</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider font-mono">Occupancy</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-slate-800">
                    {Math.round((rooms.filter(r => r.occupancy).length / rooms.length) * 100)}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {rooms.filter(r => r.occupancy).length} / {rooms.length} occupied
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Rooms: 1,320 / 1,428</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider font-mono">Pending Orders</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-slate-800">{orders.filter(o => o.status !== "Delivered").length}</span>
                  <span className="text-[11px] font-semibold text-slate-400">active in KDS</span>
                </div>
                <div className="text-[10px] text-amber-500 font-medium mt-1">Avg kitchen wait: 12m</div>
              </div>
            </div>

            {/* Quick overview directory */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rooms and IoT quick telemetry preview */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col lg:col-span-2">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-slate-500" />
                    IPTV Stream Monitor & Room Telemetry
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                    All Systems Nominal
                  </span>
                </div>
                
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {rooms.map((room) => {
                    const iot = iotStates.find(i => i.roomNumber === room.number);
                    return (
                      <div key={room.number} className="bg-slate-50/40 border border-slate-200/60 p-4 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm">Room {room.number}</span>
                            <span className="block text-[10px] text-slate-400 font-medium">{room.type}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            room.occupancy ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {room.occupancy ? "Occupied" : "Vacant"}
                          </span>
                        </div>

                        {iot && (
                          <div className="grid grid-cols-3 gap-2 pt-3.5 mt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-500">
                            <div>
                              <span className="block text-[8px] text-slate-400 font-bold uppercase">HVAC</span>
                              <span className="font-semibold text-slate-800">{iot.thermostatTemp}°C</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 font-bold uppercase">Lights</span>
                              <span className="font-semibold text-slate-800">{iot.lightsIntensity}%</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 font-bold uppercase">Grid load</span>
                              <span className="font-bold text-slate-700">{iot.energyConsumption} kWh</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Syslog Stream */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-slate-500" />
                    System Activity Logs
                  </h3>
                  <button
                    onClick={downloadLogsCSV}
                    className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-100 flex items-center gap-1 cursor-pointer transition-colors"
                    id="download-logs-csv-btn"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download CSV
                  </button>
                </div>

                <div className="p-5 space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div key={log.id} className="text-[11px] leading-relaxed border-b border-slate-100 pb-3 last:border-0 flex items-start gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase shrink-0 ${getSeverityStyle(log.severity)}`}>
                        {log.severity}
                      </span>
                      <div className="min-w-0">
                        <p className="text-slate-700 font-medium break-words">{log.message}</p>
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{log.timestamp} • {log.module}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "iptv", label: "IPTV Stream Monitor", icon: <Radio className="h-4 w-4" /> },
    { id: "headend", label: "RF Headend Transcoders", icon: <Server className="h-4 w-4" /> },
    { id: "tvs", label: "Hospitality TV Fleet Control", icon: <Monitor className="h-4 w-4" /> },
    { id: "pms", label: "Front Desk PMS Directory", icon: <Hotel className="h-4 w-4" /> },
    { id: "workspace", label: "Google Workspace Hub", icon: <Sparkles className="h-4 w-4 text-indigo-400" /> },
    { id: "simulator", label: "Room TV Screen Simulator", icon: <Monitor className="h-4 w-4 text-emerald-400" /> },
    { id: "restaurant", label: "Kitchen POS / KDS", icon: <ChefHat className="h-4 w-4" /> },
    { id: "billing", label: "Folio ledger & Billing", icon: <CreditCard className="h-4 w-4" /> },
    { id: "comms", label: "Guest Emergency TV alerts", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "iot", label: "In-Room Smart IoT Nodes", icon: <Zap className="h-4 w-4" /> },
    { id: "analytics", label: "Business Analytics & AI", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "deployment", label: "Infrastructure Manifests", icon: <HardDrive className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <Activity className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">Initializing Aenzbi IPTV System...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800" id="main-application-container">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 text-slate-300 p-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-extrabold text-white text-sm shadow-sm shadow-indigo-900/30">
              A
            </div>
            <h1 className="font-extrabold text-sm tracking-tight text-white uppercase">Aenzbi IPTV</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto select-none scrollbar-thin space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs font-medium flex items-center gap-3 transition-all cursor-pointer border-l-4 ${
                activeTab === item.id 
                  ? "bg-white/10 text-white font-bold border-indigo-500" 
                  : "hover:bg-white/5 text-slate-400 hover:text-white border-transparent"
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2 shrink-0">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Infrastructure</div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Cloud Node: US-EAST</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex justify-between items-center shrink-0 shadow-sm shadow-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-black cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Organization:</span>
              <span className="font-semibold text-slate-800">Luxor Grand Resorts & Spas</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>UTC:</span>
              <span className="font-mono font-semibold text-slate-800">12:15:39</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold">v4.2.0 Stable</div>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-indigo-600 shadow-sm border border-slate-300">JD</div>
            </div>
          </div>
        </header>

        {/* Content Body viewport */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}
