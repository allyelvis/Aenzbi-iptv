import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Server-side State (In-Memory for full responsiveness)
let channels = [
  { id: "ch-1", name: "CNN International", category: "Live IPTV", status: "active", fps: 60, bitrate: 4500, resolution: "1080p", sourceUrl: "udp://@239.1.1.1:1234", logo: "📺", viewers: 42 },
  { id: "ch-2", name: "HBO Premium", category: "OTT", status: "recording", fps: 24, bitrate: 8000, resolution: "4K UHD", sourceUrl: "rtsp://headend-transcoder/hbo", logo: "🎬", viewers: 18, recordingSchedule: "21:00 - 23:30 Daily" },
  { id: "ch-3", name: "Sky Sports Main Event", category: "DVB-S", status: "active", fps: 50, bitrate: 6200, resolution: "1080p", sourceUrl: "srt://stream-srv:5001", logo: "⚽", viewers: 65 },
  { id: "ch-4", name: "SuperSport Blitz", category: "DVB-C", status: "active", fps: 50, bitrate: 3800, resolution: "1080p", sourceUrl: "udp://@239.1.1.4:1234", logo: "🏆", viewers: 12 },
  { id: "ch-5", name: "BBC World News", category: "DVB-T", status: "active", fps: 25, bitrate: 2900, resolution: "720p", sourceUrl: "http://hls.srv/bbc/playlist.m3u8", logo: "🌍", viewers: 28 },
  { id: "ch-6", name: "Discovery Science", category: "Live IPTV", status: "error", fps: 0, bitrate: 0, resolution: "Unknown", sourceUrl: "udp://@239.1.1.6:1234", logo: "🔬", viewers: 0 },
  { id: "ch-7", name: "Cartoon Network HD", category: "RTSP", status: "active", fps: 30, bitrate: 4200, resolution: "1080p", sourceUrl: "rtsp://239.1.1.7:554", logo: "🧸", viewers: 21 },
];

let headends = [
  { id: "he-1", name: "Main Satellite Receiver S2", type: "Receiver", brand: "Cisco", status: "online", cpu: 32, memory: 45, temp: 42, inputSignal: "RF 12.2GHz DVB-S2", outputSignal: "IP Multicast" },
  { id: "he-2", name: "Central AVC Transcoder 1", type: "Transcoder", brand: "FFmpeg", status: "online", cpu: 78, memory: 60, temp: 58, inputSignal: "MPEG-2 TS (UDP)", outputSignal: "H.264 AAC (HLS/UDP)" },
  { id: "he-3", name: "HEVC Core Transcoder 2", type: "Transcoder", brand: "GStreamer", status: "online", cpu: 65, memory: 55, temp: 54, inputSignal: "Raw SDI Over Fiber", outputSignal: "H.265 / AV1 SRT" },
  { id: "he-4", name: "Edge NGINX RTMP Gateway", type: "Gateway", brand: "NGINX RTMP", status: "online", cpu: 14, memory: 35, temp: 38, inputSignal: "RTMP Ingestion", outputSignal: "HLS / DASH Edge" },
  { id: "he-5", name: "Digital Terrestrial Demuxer", type: "Demux", brand: "Teleste", status: "online", cpu: 22, memory: 30, temp: 40, inputSignal: "DVB-T RF", outputSignal: "MPEG-TS PID Filters" },
  { id: "he-6", name: "Main QAM Modulator", type: "Modulator", brand: "Harmonic", status: "online", cpu: 45, memory: 50, temp: 48, inputSignal: "IP Multicast SPTS", outputSignal: "DVB-C QAM Channels" },
  { id: "he-7", name: "Wowza Backup Engine", type: "Gateway", brand: "Wowza", status: "offline", cpu: 0, memory: 0, temp: 22, inputSignal: "RTMP/RTSP Failover", outputSignal: "HLS Backup" },
];

let tvs = [
  { id: "tv-101", roomNumber: "101", hotelId: "H-LDN", brand: "Samsung Tizen", ipAddress: "192.168.10.101", status: "online", appVersion: "v4.2.1", firmware: "T-MS12-3004", volume: 18, powerSchedule: "07:00 On / 23:00 Off", inputSource: "HDMI 1 (IPTV)", lastReboot: "2026-07-10 08:32" },
  { id: "tv-102", roomNumber: "102", hotelId: "H-LDN", brand: "LG WebOS", ipAddress: "192.168.10.102", status: "online", appVersion: "v4.2.0", firmware: "W-LGOS-5.40", volume: 15, powerSchedule: "08:00 On / 22:30 Off", inputSource: "HTML5 Portal", lastReboot: "2026-07-11 02:15" },
  { id: "tv-103", roomNumber: "103", hotelId: "H-LDN", brand: "Philips CMND", ipAddress: "192.168.10.103", status: "standby", appVersion: "v4.2.1", firmware: "P-PHIL-1.12", volume: 20, powerSchedule: "No Policy", inputSource: "HDMI 1 (IPTV)", lastReboot: "2026-07-09 11:22" },
  { id: "tv-201", roomNumber: "201", hotelId: "H-LDN", brand: "Android TV", ipAddress: "192.168.10.201", status: "online", appVersion: "v4.3.0", firmware: "A-ATV-12.1", volume: 25, powerSchedule: "07:00 On / 00:00 Off", inputSource: "HTML5 Portal", lastReboot: "2026-07-11 11:45" },
  { id: "tv-202", roomNumber: "202", hotelId: "H-LDN", brand: "MAG Linux", ipAddress: "192.168.10.202", status: "offline", appVersion: "v3.9.5", firmware: "M-LIN-2.6.3", volume: 0, powerSchedule: "No Policy", inputSource: "Unknown", lastReboot: "2026-07-05 14:10" },
];

let guests = [
  { id: "g-1", name: "David Beckham", email: "david.b@example.com", phone: "+44 7700 900077", checkInDate: "2026-07-08", checkOutDate: "2026-07-15", roomNumber: "101", status: "checked-in", language: "en" },
  { id: "g-2", name: "Elena Rostova", email: "elena.r@example.com", phone: "+7 911 234-56-78", checkInDate: "2026-07-10", checkOutDate: "2026-07-13", roomNumber: "102", status: "checked-in", language: "fr" },
  { id: "g-3", name: "Kenji Sato", email: "kenji.s@example.com", phone: "+81 90-1234-5678", checkInDate: "2026-07-11", checkOutDate: "2026-07-18", roomNumber: "201", status: "checked-in", language: "es" },
  { id: "g-4", name: "John Doe", email: "john@example.com", phone: "+1 555-0199", checkInDate: "2026-07-12", checkOutDate: "2026-07-14", roomNumber: "103", status: "reservation", language: "sw" },
];

let rooms = [
  { number: "101", building: "Main Block", floor: 1, type: "Suite", housekeeping: "Clean", dnd: false, miniBarStatus: "Stocked", occupancy: true, guestId: "g-1" },
  { number: "102", building: "Main Block", floor: 1, type: "Deluxe", housekeeping: "Clean", dnd: true, miniBarStatus: "Stocked", occupancy: true, guestId: "g-2" },
  { number: "103", building: "Main Block", floor: 1, type: "Standard", housekeeping: "Inspect", dnd: false, miniBarStatus: "Needs Refill", occupancy: false, guestId: "g-4" },
  { number: "201", building: "West Wing", floor: 2, type: "Penthouse", housekeeping: "Clean", dnd: false, miniBarStatus: "Stocked", occupancy: true, guestId: "g-3" },
  { number: "202", building: "West Wing", floor: 2, type: "Deluxe", housekeeping: "Dirty", dnd: false, miniBarStatus: "Needs Refill", occupancy: false },
];

let orders = [
  { id: "ord-1", roomNumber: "101", items: [{ item: { id: "m-3", name: "Wagyu Beef Club Sandwich", category: "Lunch/Dinner", price: 29.00, image: "🥪", stock: 40 }, quantity: 2 }, { item: { id: "m-5", name: "Fresh Squeezed Orange Juice", category: "Beverages", price: 8.50, image: "🍊", stock: 100 }, quantity: 2 }], total: 75.00, status: "Delivered", payment: "Charged to Room", timestamp: "10:30 AM" },
];

let folios: { [roomNumber: string]: any[] } = {
  "101": [
    { id: "fc-1", description: "Deluxe Suite Room Rate (3 Nights)", amount: 1350.00, category: "Room Rate", date: "2026-07-11" },
    { id: "fc-2", description: "Wagyu Club Sandwich & Juices", amount: 75.00, category: "Restaurant", date: "2026-07-11" },
    { id: "fc-3", description: "Hydrotherapy Spa Session", amount: 180.00, category: "Spa", date: "2026-07-10" },
  ],
  "102": [
    { id: "fc-4", description: "Executive King Room Rate (1 Night)", amount: 350.00, category: "Room Rate", date: "2026-07-11" },
    { id: "fc-5", description: "Mini Bar Consumption", amount: 45.00, category: "Mini Bar", date: "2026-07-10" },
  ],
  "201": [
    { id: "fc-6", description: "Penthouse Suite (2 Nights)", amount: 2400.00, category: "Room Rate", date: "2026-07-11" },
    { id: "fc-7", description: "Dry Cleaning Laundry Service", amount: 60.00, category: "Laundry", date: "2026-07-11" },
  ],
};

let messages = [
  { id: "msg-1", sender: "guest", roomNumber: "101", text: "Hello reception, could we get extra feather pillows and 2 bottles of sparkling water?", timestamp: "11:15 AM", isRead: false },
  { id: "msg-2", sender: "reception", roomNumber: "101", text: "Certainly Mr. Beckham! Housekeeping is dispatched and will arrive at Room 101 in 5 minutes.", timestamp: "11:18 AM", isRead: true },
  { id: "msg-3", sender: "guest", roomNumber: "102", text: "Is the dry cleaning service available on Sundays?", timestamp: "11:32 AM", isRead: false },
];

let iotStates = [
  { roomNumber: "101", doorLocked: true, lightsIntensity: 60, hvacOn: true, thermostatTemp: 21.5, curtainsOpen: false, occupancyDetected: true, energyConsumption: 12.4 },
  { roomNumber: "102", doorLocked: true, lightsIntensity: 20, hvacOn: true, thermostatTemp: 22.0, curtainsOpen: false, occupancyDetected: true, energyConsumption: 8.9 },
  { roomNumber: "103", doorLocked: true, lightsIntensity: 0, hvacOn: false, thermostatTemp: 24.0, curtainsOpen: true, occupancyDetected: false, energyConsumption: 1.2 },
  { roomNumber: "201", doorLocked: false, lightsIntensity: 80, hvacOn: true, thermostatTemp: 20.0, curtainsOpen: true, occupancyDetected: true, energyConsumption: 18.6 },
  { roomNumber: "202", doorLocked: true, lightsIntensity: 0, hvacOn: false, thermostatTemp: 23.5, curtainsOpen: false, occupancyDetected: false, energyConsumption: 0.8 },
];

let systemLogs = [
  { id: "log-1", timestamp: "12:00:10", severity: "info", module: "IPTV Streaming", message: "Live stream 'CNN International' PID alignment complete. Stream healthy." },
  { id: "log-2", timestamp: "11:58:32", severity: "warning", module: "Headend Controller", message: "Central Transcoder 1 CPU load spiked to 78% during peak transcoder repackaging." },
  { id: "log-3", timestamp: "11:52:15", severity: "error", module: "Hospitality TV", message: "TV Room 202 (MAG Linux) failed heartbeat response. Initiating diagnostic routing." },
  { id: "log-4", timestamp: "11:45:00", severity: "security", module: "Core Auth", message: "System Admin MFA authentication successful from IP 192.168.1.50" },
  { id: "log-5", timestamp: "11:30:22", severity: "info", module: "Hotel PMS", message: "Guest reservation checked in: Room 201 - Sato Kenji. Welcome greeting deployed." },
];

// Helper to add system log
function addLog(severity: string, module: string, message: string) {
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0];
  systemLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp,
    severity,
    module,
    message
  });
  if (systemLogs.length > 50) systemLogs.pop();
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// IPTV Channels
app.get("/api/channels", (req, res) => {
  res.json(channels);
});

app.post("/api/channels", (req, res) => {
  const newChan = {
    id: `ch-${Date.now()}`,
    viewers: 0,
    fps: 30,
    bitrate: 4000,
    resolution: "1080p",
    status: "active",
    ...req.body
  };
  channels.push(newChan);
  addLog("info", "IPTV Management", `New Channel added: ${newChan.name} (${newChan.category})`);
  res.status(201).json(newChan);
});

app.patch("/api/channels/:id", (req, res) => {
  const { id } = req.params;
  const index = channels.findIndex(c => c.id === id);
  if (index !== -1) {
    channels[index] = { ...channels[index], ...req.body };
    addLog("info", "IPTV Management", `Channel updated: ${channels[index].name}`);
    res.json(channels[index]);
  } else {
    res.status(404).json({ error: "Channel not found" });
  }
});

// Headend devices
app.get("/api/headends", (req, res) => {
  res.json(headends);
});

app.post("/api/headends/:id/reboot", (req, res) => {
  const { id } = req.params;
  const index = headends.findIndex(h => h.id === id);
  if (index !== -1) {
    headends[index].status = "rebooting";
    addLog("warning", "Headend Controller", `Headend Device ${headends[index].name} initiated a remote reboot command.`);
    setTimeout(() => {
      const idx = headends.findIndex(h => h.id === id);
      if (idx !== -1) {
        headends[idx].status = "online";
        addLog("info", "Headend Controller", `Headend Device ${headends[idx].name} is fully back online.`);
      }
    }, 4000);
    res.json({ status: "reboot_initiated" });
  } else {
    res.status(404).json({ error: "Headend device not found" });
  }
});

// Hospitality TVs
app.get("/api/tvs", (req, res) => {
  res.json(tvs);
});

app.post("/api/tvs/:id/command", (req, res) => {
  const { id } = req.params;
  const { command, value } = req.body;
  const index = tvs.findIndex(t => t.id === id);
  if (index !== -1) {
    addLog("info", "Hospitality TV", `Dispatched remote command [${command}] with value [${value}] to TV in Room ${tvs[index].roomNumber}`);
    
    if (command === "reboot") {
      tvs[index].status = "offline";
      tvs[index].lastReboot = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setTimeout(() => {
        const idx = tvs.findIndex(t => t.id === id);
        if (idx !== -1) {
          tvs[idx].status = "online";
          addLog("info", "Hospitality TV", `TV in Room ${tvs[idx].roomNumber} successfully completed remote OTA reboot.`);
        }
      }, 5000);
    } else if (command === "volume") {
      tvs[index].volume = Number(value);
    } else if (command === "input") {
      tvs[index].inputSource = String(value);
    } else if (command === "powerPolicy") {
      tvs[index].powerSchedule = String(value);
    } else if (command === "factoryReset") {
      tvs[index].status = "offline";
      tvs[index].volume = 15;
      tvs[index].inputSource = "Welcome Screen";
      setTimeout(() => {
        const idx = tvs.findIndex(t => t.id === id);
        if (idx !== -1) {
          tvs[idx].status = "online";
          addLog("warning", "Hospitality TV", `TV Room ${tvs[idx].roomNumber} completed total remote factory reset.`);
        }
      }, 7000);
    }
    res.json(tvs[index]);
  } else {
    res.status(404).json({ error: "Hospitality TV not found" });
  }
});

// PMS Rooms & Guest operations
app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

app.patch("/api/rooms/:number", (req, res) => {
  const { number } = req.params;
  const index = rooms.findIndex(r => r.number === number);
  if (index !== -1) {
    rooms[index] = { ...rooms[index], ...req.body };
    addLog("info", "Hotel PMS", `Room ${number} configuration updated in PMS database.`);
    res.json(rooms[index]);
  } else {
    res.status(404).json({ error: "Room not found" });
  }
});

app.get("/api/guests", (req, res) => {
  res.json(guests);
});

app.post("/api/guests/checkin", (req, res) => {
  const { name, roomNumber, email, phone, language } = req.body;
  
  // Check if room is available
  const roomIdx = rooms.findIndex(r => r.number === roomNumber);
  if (roomIdx === -1) {
    return res.status(404).json({ error: "Room not found" });
  }
  
  const guestId = `g-${Date.now()}`;
  const newGuest = {
    id: guestId,
    name,
    email: email || `${name.toLowerCase().replace(" ", "")}@example.com`,
    phone: phone || "+1 555-9000",
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    roomNumber,
    status: "checked-in" as const,
    language: language || "en"
  };

  guests.push(newGuest);
  rooms[roomIdx].occupancy = true;
  rooms[roomIdx].guestId = guestId;
  rooms[roomIdx].housekeeping = "Clean";

  // Initialize empty folio
  folios[roomNumber] = [
    { id: `fc-${Date.now()}`, description: `${rooms[roomIdx].type} Room Tariff (Initial Authorization)`, amount: rooms[roomIdx].type === "Suite" ? 450.00 : rooms[roomIdx].type === "Penthouse" ? 1200.00 : 180.00, category: "Room Rate", date: new Date().toISOString().split('T')[0] }
  ];

  addLog("info", "Hotel PMS", `Guest CHECK-IN completed for ${name} into Room ${roomNumber}. Language preference: ${language || "en"}`);
  res.status(201).json(newGuest);
});

app.post("/api/guests/:id/checkout", (req, res) => {
  const { id } = req.params;
  const guestIdx = guests.findIndex(g => g.id === id);
  if (guestIdx !== -1) {
    const guest = guests[guestIdx];
    const roomNumber = guest.roomNumber;
    
    guest.status = "checked-out";
    
    const roomIdx = rooms.findIndex(r => r.number === roomNumber);
    if (roomIdx !== -1) {
      rooms[roomIdx].occupancy = false;
      rooms[roomIdx].guestId = undefined;
      rooms[roomIdx].housekeeping = "Dirty"; // Needs cleaning post-checkout
    }

    addLog("info", "Hotel PMS", `Guest CHECK-OUT completed for ${guest.name} from Room ${roomNumber}. Folio closed.`);
    res.json({ success: true, roomNumber });
  } else {
    res.status(404).json({ error: "Guest not found" });
  }
});

// Dining / Room Service Restaurant POS & KDS
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { roomNumber, items, paymentMethod } = req.body;
  const total = items.reduce((sum: number, it: any) => sum + (it.item.price * it.quantity), 0);
  
  const newOrder = {
    id: `ord-${Date.now()}`,
    roomNumber,
    items,
    total,
    status: "Received" as const,
    payment: paymentMethod || "Charged to Room",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  orders.push(newOrder);

  // If charged to room, automatically sync to folio!
  if (newOrder.payment === "Charged to Room") {
    if (!folios[roomNumber]) folios[roomNumber] = [];
    folios[roomNumber].push({
      id: `fc-${Date.now()}`,
      description: `In-room Dining Order #${newOrder.id.substring(4, 8)}`,
      amount: total,
      category: "Restaurant",
      date: new Date().toISOString().split('T')[0]
    });
  }

  addLog("info", "Restaurant POS", `Room service order received from Room ${roomNumber}. Total: $${total.toFixed(2)} (${newOrder.payment})`);
  res.status(201).json(newOrder);
});

app.patch("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index].status = status;
    addLog("info", "Kitchen Display", `Order ${id} status updated to: ${status}`);
    res.json(orders[index]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Billing folios
app.get("/api/folios/:roomNumber", (req, res) => {
  const { roomNumber } = req.params;
  res.json(folios[roomNumber] || []);
});

app.post("/api/folios/:roomNumber/charge", (req, res) => {
  const { roomNumber } = req.params;
  const { description, amount, category } = req.body;
  
  if (!folios[roomNumber]) folios[roomNumber] = [];
  
  const newCharge = {
    id: `fc-${Date.now()}`,
    description,
    amount: Number(amount),
    category,
    date: new Date().toISOString().split('T')[0]
  };

  folios[roomNumber].push(newCharge);
  addLog("info", "Billing Engine", `Charged $${Number(amount).toFixed(2)} to Room ${roomNumber} folio: ${description}`);
  res.status(201).json(newCharge);
});

// Chats / Guest Messages
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { roomNumber, text, sender } = req.body;
  
  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: sender || "guest",
    roomNumber,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isRead: sender === "reception"
  };

  messages.push(newMsg);
  
  if (sender === "guest") {
    addLog("info", "Communications", `New instant chat message from Room ${roomNumber}`);
  } else {
    addLog("info", "Communications", `Instant broadcast message dispatched to Room ${roomNumber}`);
  }
  
  res.status(201).json(newMsg);
});

app.post("/api/messages/broadcast", (req, res) => {
  const { text } = req.body;
  
  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: "system" as const,
    roomNumber: "ALL",
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isRead: true
  };

  messages.push(newMsg);
  addLog("security", "Communications", `System-wide Broadcast ALERT: "${text}" sent to all TVs and guest apps.`);
  res.status(201).json(newMsg);
});

// Smart Room IoT Commands
app.get("/api/iot", (req, res) => {
  res.json(iotStates);
});

app.patch("/api/iot/:roomNumber", (req, res) => {
  const { roomNumber } = req.params;
  const index = iotStates.findIndex(i => i.roomNumber === roomNumber);
  if (index !== -1) {
    iotStates[index] = { ...iotStates[index], ...req.body };
    addLog("info", "Smart IoT", `Smart Room ${roomNumber} devices toggled. Thermostat: ${iotStates[index].thermostatTemp}°C.`);
    res.json(iotStates[index]);
  } else {
    res.status(404).json({ error: "IoT room config not found" });
  }
});

// System logs
app.get("/api/logs", (req, res) => {
  res.json(systemLogs);
});

app.post("/api/logs", (req, res) => {
  const { severity, module, message } = req.body;
  addLog(severity || "info", module || "System", message || "");
  res.json({ success: true });
});


// -------------------------------------------------------------
// AI CONCIERGE & ANALYTICS PREDICTIONS (GEMINI API)
// -------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  const { message, history, mode } = req.body; 
  // mode: 'concierge' (for guest) or 'reports' (for management predictive analysis)

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    // Elegant system fallback simulation when GEMINI_API_KEY is not configured
    setTimeout(() => {
      let reply = "";
      if (mode === "reports") {
        reply = `### 📊 Aenzbi AI Predictive Hospitality Optimization & Telemetry Report

**Simulated Insight Engine (Gemini API Key missing/placeholder)**

1. **IPTV & Content Analytics**:
   - *Observation*: Sports channels (e.g., 'Sky Sports') represent 54% of daytime TV usage, but VOD movies account for 68% of post-21:00 revenue.
   - *Actionable Recommendation*: Bundle live sport packages with customized late-night food items (e.g., "Game Night Pizza Combo") via interactive Guest TV orders.
2. **Dynamic Energy Savings (Smart IoT)**:
   - *Observation*: Over 35% of guest rooms have active HVAC running while sensors indicate "Unoccupied" for more than 4 hours.
   - *Actionable Recommendation*: Configure a strict "Eco-Mode Integration" in the IoT dashboard to set thermostat values to 23.5°C when occupancy sensors flag negative for over 60 minutes.
3. **Preventative Headend & TV Maintenance**:
   - *Observation*: 3 LG Pro:Centric TVs in West Wing logged repeated heartbeat misses.
   - *Actionable Recommendation*: Queue automatic OTA firmware updates (v4.2.1) during 03:00 Off schedules to stabilize packet decoders.`;
      } else {
        const lower = message.toLowerCase();
        if (lower.includes("wifi") || lower.includes("wi-fi")) {
          reply = "The complimentary high-speed hotel Wi-Fi is **'Aenzbi_Guest_5G'**. There is no password required; simply input your room number and name on the splash portal to enjoy unlimited 100Mbps bandwidth!";
        } else if (lower.includes("food") || lower.includes("menu") || lower.includes("eat") || lower.includes("dinner")) {
          reply = "We offer excellent dining options! You can view our digital room-service menu right here on your TV or smartphone. We highly recommend our **Signature Wagyu Club Sandwich** or the delicious **Pan-Seared Sea Bass**. Just add them to your cart to order immediately!";
        } else if (lower.includes("checkout") || lower.includes("check out") || lower.includes("leave")) {
          reply = "Standard checkout is at 11:00 AM. You can review your guest folio in the Billing tab or request an express checkout right from this portal. Let us know if you require luggage assistance or a taxi!";
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
          reply = "Hello! I am your **Aenzbi AI IPTV Concierge**. I can assist you with TV channels, ordering room service, controlling your smart room climate, or connecting with the front reception. How can I help you make your stay spectacular today?";
        } else {
          reply = `Welcome to the Aenzbi IPTV Portal! I received your inquiry: "${message}". I can help you instantly configure the headend transcoder, schedule stream recording schedules, order delicious waffles, lock your IoT door, or verify your billing folio. Let me know what you need!`;
        }
      }
      res.json({ reply, mode: "fallback" });
    }, 1200);
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let systemInstruction = "";
    if (mode === "reports") {
      systemInstruction = `You are the Lead Business Intelligence AI for Aenzbi IPTV Hospitality. 
      Analyze hospitality trends, energy consumption, IPTV stream analytics, and PMS bookings.
      Provide highly structured, professional, actionable predictive analytics, revenue tips, and system maintenance recommendations. 
      Keep the formatting clean with markdown, clear headings, and concrete bullet points.`;
    } else {
      systemInstruction = `You are the premium Aenzbi AI IPTV Guest Concierge for a 5-star hotel. 
      Help guests navigate the IPTV channels, local weather, booking concierge, restaurant menu ordering, and smart IoT device controls. 
      Be extremely polite, professional, elegant, and helpful. Frame replies in clear, reader-friendly markdown paragraphs.`;
    }

    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    // Generate content using the new @google/genai SDK format
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const reply = response.text || "I apologize, but I could not compute a response.";
    res.json({ reply, mode: "live" });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "An error occurred calling the AI Engine" });
  }
});


// -------------------------------------------------------------
// VITE OR STATIC BUILD CONFIGURATION
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start listener
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aenzbi IPTV Server] Running full-stack hospitality engine on port ${PORT}`);
  });
}

bootstrap();
