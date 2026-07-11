import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Firebase Backend
import { db } from "./src/lib/firebase-backend";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  getCollectionData, 
  setDocumentData, 
  deleteDocument, 
  seedCollectionIfEmpty, 
  seedSettingsIfEmpty, 
  seedFoliosIfEmpty, 
  getRoomFolio 
} from "./src/lib/firebase-db";
import { uploadTextToStorage } from "./src/lib/firebase-storage";

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Server-side State (Seed Data used for database initialization)
const initialChannels = [
  { id: "ch-1", name: "CNN International", category: "Live IPTV", status: "active", fps: 60, bitrate: 4500, resolution: "1080p", sourceUrl: "udp://@239.1.1.1:1234", logo: "📺", viewers: 42 },
  { id: "ch-2", name: "HBO Premium", category: "OTT", status: "recording", fps: 24, bitrate: 8000, resolution: "4K UHD", sourceUrl: "rtsp://headend-transcoder/hbo", logo: "🎬", viewers: 18, recordingSchedule: "21:00 - 23:30 Daily" },
  { id: "ch-3", name: "Sky Sports Main Event", category: "DVB-S", status: "active", fps: 50, bitrate: 6200, resolution: "1080p", sourceUrl: "srt://stream-srv:5001", logo: "⚽", viewers: 65 },
  { id: "ch-4", name: "SuperSport Blitz", category: "DVB-C", status: "active", fps: 50, bitrate: 3800, resolution: "1080p", sourceUrl: "udp://@239.1.1.4:1234", logo: "🏆", viewers: 12 },
  { id: "ch-5", name: "BBC World News", category: "DVB-T", status: "active", fps: 25, bitrate: 2900, resolution: "720p", sourceUrl: "http://hls.srv/bbc/playlist.m3u8", logo: "🌍", viewers: 28 },
  { id: "ch-6", name: "Discovery Science", category: "Live IPTV", status: "error", fps: 0, bitrate: 0, resolution: "Unknown", sourceUrl: "udp://@239.1.1.6:1234", logo: "🔬", viewers: 0 },
  { id: "ch-7", name: "Cartoon Network HD", category: "RTSP", status: "active", fps: 30, bitrate: 4200, resolution: "1080p", sourceUrl: "rtsp://239.1.1.7:554", logo: "🧸", viewers: 21 },
];

const initialHeadends = [
  { id: "he-1", name: "Main Satellite Receiver S2", type: "Receiver", brand: "Cisco", status: "online", cpu: 32, memory: 45, temp: 42, inputSignal: "RF 12.2GHz DVB-S2", outputSignal: "IP Multicast" },
  { id: "he-2", name: "Central AVC Transcoder 1", type: "Transcoder", brand: "FFmpeg", status: "online", cpu: 78, memory: 60, temp: 58, inputSignal: "MPEG-2 TS (UDP)", outputSignal: "H.264 AAC (HLS/UDP)" },
  { id: "he-3", name: "HEVC Core Transcoder 2", type: "Transcoder", brand: "GStreamer", status: "online", cpu: 65, memory: 55, temp: 54, inputSignal: "Raw SDI Over Fiber", outputSignal: "H.265 / AV1 SRT" },
  { id: "he-4", name: "Edge NGINX RTMP Gateway", type: "Gateway", brand: "NGINX RTMP", status: "online", cpu: 14, memory: 35, temp: 38, inputSignal: "RTMP Ingestion", outputSignal: "HLS / DASH Edge" },
  { id: "he-5", name: "Digital Terrestrial Demuxer", type: "Demux", brand: "Teleste", status: "online", cpu: 22, memory: 30, temp: 40, inputSignal: "DVB-T RF", outputSignal: "MPEG-TS PID Filters" },
  { id: "he-6", name: "Main QAM Modulator", type: "Modulator", brand: "Harmonic", status: "online", cpu: 45, memory: 50, temp: 48, inputSignal: "IP Multicast SPTS", outputSignal: "DVB-C QAM Channels" },
  { id: "he-7", name: "Wowza Backup Engine", type: "Gateway", brand: "Wowza", status: "offline", cpu: 0, memory: 0, temp: 22, inputSignal: "RTMP/RTSP Failover", outputSignal: "HLS Backup" },
];

const initialTvs = [
  { id: "tv-101", roomNumber: "101", hotelId: "H-LDN", brand: "Samsung Tizen", ipAddress: "192.168.10.101", status: "online", appVersion: "v4.2.1", firmware: "T-MS12-3004", volume: 18, powerSchedule: "07:00 On / 23:00 Off", inputSource: "HDMI 1 (IPTV)", lastReboot: "2026-07-10 08:32" },
  { id: "tv-102", roomNumber: "102", hotelId: "H-LDN", brand: "LG WebOS", ipAddress: "192.168.10.102", status: "online", appVersion: "v4.2.0", firmware: "W-LGOS-5.40", volume: 15, powerSchedule: "08:00 On / 22:30 Off", inputSource: "HTML5 Portal", lastReboot: "2026-07-11 02:15" },
  { id: "tv-103", roomNumber: "103", hotelId: "H-LDN", brand: "Philips CMND", ipAddress: "192.168.10.103", status: "standby", appVersion: "v4.2.1", firmware: "P-PHIL-1.12", volume: 20, powerSchedule: "No Policy", inputSource: "HDMI 1 (IPTV)", lastReboot: "2026-07-09 11:22" },
  { id: "tv-201", roomNumber: "201", hotelId: "H-LDN", brand: "Android TV", ipAddress: "192.168.10.201", status: "online", appVersion: "v4.3.0", firmware: "A-ATV-12.1", volume: 25, powerSchedule: "07:00 On / 00:00 Off", inputSource: "HTML5 Portal", lastReboot: "2026-07-11 11:45" },
  { id: "tv-202", roomNumber: "202", hotelId: "H-LDN", brand: "MAG Linux", ipAddress: "192.168.10.202", status: "offline", appVersion: "v3.9.5", firmware: "M-LIN-2.6.3", volume: 0, powerSchedule: "No Policy", inputSource: "Unknown", lastReboot: "2026-07-05 14:10" },
];

const initialGuests = [
  { id: "g-1", name: "David Beckham", email: "david.b@example.com", phone: "+44 7700 900077", checkInDate: "2026-07-08", checkOutDate: "2026-07-15", roomNumber: "101", status: "checked-in", language: "en" },
  { id: "g-2", name: "Elena Rostova", email: "elena.r@example.com", phone: "+7 911 234-56-78", checkInDate: "2026-07-10", checkOutDate: "2026-07-13", roomNumber: "102", status: "checked-in", language: "fr" },
  { id: "g-3", name: "Kenji Sato", email: "kenji.s@example.com", phone: "+81 90-1234-5678", checkInDate: "2026-07-11", checkOutDate: "2026-07-18", roomNumber: "201", status: "checked-in", language: "es" },
  { id: "g-4", name: "John Doe", email: "john@example.com", phone: "+1 555-0199", checkInDate: "2026-07-12", checkOutDate: "2026-07-14", roomNumber: "103", status: "reservation", language: "sw" },
];

const initialRooms = [
  { number: "101", building: "Main Block", floor: 1, type: "Suite", housekeeping: "Clean", dnd: false, miniBarStatus: "Stocked", occupancy: true, guestId: "g-1" },
  { number: "102", building: "Main Block", floor: 1, type: "Deluxe", housekeeping: "Clean", dnd: true, miniBarStatus: "Stocked", occupancy: true, guestId: "g-2" },
  { number: "103", building: "Main Block", floor: 1, type: "Standard", housekeeping: "Inspect", dnd: false, miniBarStatus: "Needs Refill", occupancy: false, guestId: "g-4" },
  { number: "201", building: "West Wing", floor: 2, type: "Penthouse", housekeeping: "Clean", dnd: false, miniBarStatus: "Stocked", occupancy: true, guestId: "g-3" },
  { number: "202", building: "West Wing", floor: 2, type: "Deluxe", housekeeping: "Dirty", dnd: false, miniBarStatus: "Needs Refill", occupancy: false },
];

const initialOrders = [
  { id: "ord-1", roomNumber: "101", items: [{ item: { id: "m-3", name: "Wagyu Beef Club Sandwich", category: "Lunch/Dinner", price: 29.00, image: "🥪", stock: 40 }, quantity: 2 }, { item: { id: "m-5", name: "Fresh Squeezed Orange Juice", category: "Beverages", price: 8.50, image: "🍊", stock: 100 }, quantity: 2 }], total: 75.00, status: "Delivered", payment: "Charged to Room", timestamp: "10:30 AM" },
];

const initialFolios: { [roomNumber: string]: any[] } = {
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

const initialMessages = [
  { id: "msg-1", sender: "guest", roomNumber: "101", text: "Hello reception, could we get extra feather pillows and 2 bottles of sparkling water?", timestamp: "11:15 AM", isRead: false },
  { id: "msg-2", sender: "reception", roomNumber: "101", text: "Certainly Mr. Beckham! Housekeeping is dispatched and will arrive at Room 101 in 5 minutes.", timestamp: "11:18 AM", isRead: true },
  { id: "msg-3", sender: "guest", roomNumber: "102", text: "Is the dry cleaning service available on Sundays?", timestamp: "11:32 AM", isRead: false },
];

const initialIotStates = [
  { roomNumber: "101", doorLocked: true, lightsIntensity: 60, hvacOn: true, thermostatTemp: 21.5, curtainsOpen: false, occupancyDetected: true, energyConsumption: 12.4 },
  { roomNumber: "102", doorLocked: true, lightsIntensity: 20, hvacOn: true, thermostatTemp: 22.0, curtainsOpen: false, occupancyDetected: true, energyConsumption: 8.9 },
  { roomNumber: "103", doorLocked: true, lightsIntensity: 0, hvacOn: false, thermostatTemp: 24.0, curtainsOpen: true, occupancyDetected: false, energyConsumption: 1.2 },
  { roomNumber: "201", doorLocked: false, lightsIntensity: 80, hvacOn: true, thermostatTemp: 20.0, curtainsOpen: true, occupancyDetected: true, energyConsumption: 18.6 },
  { roomNumber: "202", doorLocked: true, lightsIntensity: 0, hvacOn: false, thermostatTemp: 23.5, curtainsOpen: false, occupancyDetected: false, energyConsumption: 0.8 },
];

const initialSystemLogs = [
  { id: "log-1", timestamp: "12:00:10", severity: "info", module: "IPTV Streaming", message: "Live stream 'CNN International' PID alignment complete. Stream healthy." },
  { id: "log-2", timestamp: "11:58:32", severity: "warning", module: "Headend Controller", message: "Central Transcoder 1 CPU load spiked to 78% during peak transcoder repackaging." },
  { id: "log-3", timestamp: "11:52:15", severity: "error", module: "Hospitality TV", message: "TV Room 202 (MAG Linux) failed heartbeat response. Initiating diagnostic routing." },
  { id: "log-4", timestamp: "11:45:00", severity: "security", module: "Core Auth", message: "System Admin MFA authentication successful from IP 192.168.1.50" },
  { id: "log-5", timestamp: "11:30:22", severity: "info", module: "Hotel PMS", message: "Guest reservation checked in: Room 201 - Sato Kenji. Welcome greeting deployed." },
];

const initialMenuItems = [
  { id: "m-1", name: "Signature English Breakfast", category: "Breakfast", price: 24.50, image: "🥚", stock: 50 },
  { id: "m-2", name: "Belgian Waffles with Berries", category: "Breakfast", price: 18.00, image: "🥞", stock: 30 },
  { id: "m-3", name: "Wagyu Beef Club Sandwich", category: "Lunch/Dinner", price: 29.00, image: "🥪", stock: 40 },
  { id: "m-4", name: "Pan-Seared Sea Bass", category: "Lunch/Dinner", price: 38.50, image: "🐟", stock: 25 },
  { id: "m-5", name: "Fresh Squeezed Orange Juice", category: "Beverages", price: 8.50, image: "🍊", stock: 100 },
  { id: "m-6", name: "Kona Blend Single-Origin Coffee", category: "Beverages", price: 9.00, image: "☕", stock: 120 },
  { id: "m-7", name: "Grand Chocolate Lava Cake", category: "Desserts", price: 14.50, image: "🍰", stock: 15 },
];

const initialSoftwarePackages = [
  { id: "sw-1", name: "Aenzbi IPTV App v4.3.0", version: "v4.3.0", platform: "Samsung Tizen", releaseDate: "2026-07-01", changelog: "Added dynamic room service ordering & volume controls." },
  { id: "sw-2", name: "Aenzbi IPTV App v4.2.1", version: "v4.2.1", platform: "LG WebOS", releaseDate: "2026-06-15", changelog: "Enhanced stability for multicasting streams." },
  { id: "sw-3", name: "Aenzbi IPTV OS v12.1-r3", version: "v12.1", platform: "Android TV", releaseDate: "2026-05-10", changelog: "Android TV native pipeline hardware acceleration." },
  { id: "sw-4", name: "Aenzbi IPTV App v4.2.1", version: "v4.2.1", platform: "Samsung Tizen", releaseDate: "2026-06-20", changelog: "Samsung Tizen screen orientation fixes." }
];

const initialSettings = {
  orgName: "Luxor Grand Resorts & Spas",
  orgSlogan: "Luxury Hospitality & Branded Entertainment",
  supportEmail: "support@luxorresorts.com",
  supportPhone: "+1 (800) 555-0199",
  address: "777 Las Vegas Blvd, Las Vegas, NV",
  timezone: "UTC-8 (Pacific Time)",
  currency: "USD ($)",
  suiteRate: 450,
  penthouseRate: 1200,
  deluxeRate: 350,
  standardRate: 180,
  defaultCleanInterval: 24, // hours
};

// Helper to add system log to Firestore
async function addLog(severity: string, module: string, message: string) {
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0];
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp,
    severity,
    module,
    message
  };
  try {
    await setDocumentData("systemLogs", newLog.id, newLog);
  } catch (err) {
    console.error("Error adding log to Firestore:", err);
  }
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// IPTV Channels
app.get("/api/channels", async (req, res) => {
  try {
    const data = await getCollectionData("channels");
    // Sort channels consistently
    res.json(data.sort((a: any, b: any) => a.id.localeCompare(b.id)));
  } catch (err: any) {
    res.status(550).json({ error: err.message });
  }
});

app.post("/api/channels", async (req, res) => {
  try {
    const newChan = {
      id: `ch-${Date.now()}`,
      viewers: 0,
      fps: 30,
      bitrate: 4000,
      resolution: "1080p",
      status: "active",
      ...req.body
    };
    await setDocumentData("channels", newChan.id, newChan);
    await addLog("info", "IPTV Management", `New Channel added: ${newChan.name} (${newChan.category})`);
    res.status(201).json(newChan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/channels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const channelsList = await getCollectionData<any>("channels");
    const current = channelsList.find(c => c.id === id);
    if (current) {
      const updated = { ...current, ...req.body };
      await setDocumentData("channels", id, updated);
      await addLog("info", "IPTV Management", `Channel updated: ${updated.name}`);
      res.json(updated);
    } else {
      res.status(404).json({ error: "Channel not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Headend devices
app.get("/api/headends", async (req, res) => {
  try {
    const data = await getCollectionData("headends");
    res.json(data.sort((a: any, b: any) => a.id.localeCompare(b.id)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/headends/:id/reboot", async (req, res) => {
  try {
    const { id } = req.params;
    const headendsList = await getCollectionData<any>("headends");
    const index = headendsList.findIndex(h => h.id === id);
    if (index !== -1) {
      const device = { ...headendsList[index], status: "rebooting" };
      await setDocumentData("headends", id, device);
      await addLog("warning", "Headend Controller", `Headend Device ${device.name} initiated a remote reboot command.`);
      
      setTimeout(async () => {
        try {
          const current = await getCollectionData<any>("headends");
          const curIdx = current.findIndex(h => h.id === id);
          if (curIdx !== -1) {
            const restored = { ...current[curIdx], status: "online" };
            await setDocumentData("headends", id, restored);
            await addLog("info", "Headend Controller", `Headend Device ${restored.name} is fully back online.`);
          }
        } catch (err) {
          console.error("Deferred headend reboot error:", err);
        }
      }, 4000);
      res.json({ status: "reboot_initiated" });
    } else {
      res.status(404).json({ error: "Headend device not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Hospitality TVs
app.get("/api/tvs", async (req, res) => {
  try {
    const data = await getCollectionData("tvs");
    res.json(data.sort((a: any, b: any) => a.id.localeCompare(b.id)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System & Organization Settings
app.get("/api/settings", async (req, res) => {
  try {
    const snap = await getDoc(doc(db, "settings", "config"));
    if (snap.exists()) {
      res.json(snap.data());
    } else {
      res.json(initialSettings);
    }
  } catch (err: any) {
    res.json(initialSettings);
  }
});

app.patch("/api/settings", async (req, res) => {
  try {
    const snap = await getDoc(doc(db, "settings", "config"));
    const current = snap.exists() ? snap.data() : initialSettings;
    const updated = { ...current, ...req.body };
    await setDoc(doc(db, "settings", "config"), updated);
    await addLog("info", "Settings Controller", "Organization and Room Policies updated.");
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tvs", async (req, res) => {
  try {
    const { roomNumber, brand, ipAddress, appVersion, firmware } = req.body;
    if (!roomNumber) {
      return res.status(400).json({ error: "Room number is required" });
    }
    const tvsList = await getCollectionData<any>("tvs");
    const exists = tvsList.some(t => t.roomNumber === roomNumber);
    if (exists) {
      return res.status(400).json({ error: `A TV device is already registered for Room ${roomNumber}.` });
    }

    const newTv = {
      id: `tv-${roomNumber}`,
      roomNumber,
      hotelId: "H-LDN",
      brand: brand || "Android TV",
      ipAddress: ipAddress || `192.168.10.${100 + Math.floor(Math.random() * 150)}`,
      status: "online",
      appVersion: appVersion || "v4.3.0",
      firmware: firmware || "A-ATV-12.1",
      volume: 15,
      powerSchedule: "No Policy",
      inputSource: "HDMI 1 (IPTV)",
      lastReboot: "N/A"
    };

    await setDocumentData("tvs", newTv.id, newTv);
    await addLog("info", "Hospitality TV", `Manual TV fleet registration complete: Room ${roomNumber} (${newTv.brand})`);
    res.status(201).json(newTv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tvs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tvsList = await getCollectionData<any>("tvs");
    const target = tvsList.find(t => t.id === id);
    if (!target) {
      return res.status(404).json({ error: "TV device not found" });
    }
    await deleteDocument("tvs", id);
    await addLog("warning", "Hospitality TV", `Decommissioned TV device in Room ${target.roomNumber}`);
    res.json({ success: true, message: `TV for Room ${target.roomNumber} decommissioned.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tvs/:id/command", async (req, res) => {
  try {
    const { id } = req.params;
    const { command, value } = req.body;
    const tvsList = await getCollectionData<any>("tvs");
    const target = tvsList.find(t => t.id === id);
    if (target) {
      const updated = { ...target };
      await addLog("info", "Hospitality TV", `Dispatched remote command [${command}] with value [${value}] to TV in Room ${target.roomNumber}`);
      
      if (command === "reboot") {
        updated.status = "offline";
        updated.lastReboot = new Date().toISOString().replace('T', ' ').substring(0, 16);
        await setDocumentData("tvs", id, updated);
        setTimeout(async () => {
          try {
            const currentTvs = await getCollectionData<any>("tvs");
            const curTv = currentTvs.find(t => t.id === id);
            if (curTv) {
              const backOnline = { ...curTv, status: "online" };
              await setDocumentData("tvs", id, backOnline);
              await addLog("info", "Hospitality TV", `TV in Room ${backOnline.roomNumber} successfully completed remote OTA reboot.`);
            }
          } catch (e) {
            console.error("OTA reboot timeout error:", e);
          }
        }, 5000);
      } else if (command === "volume") {
        updated.volume = Number(value);
        await setDocumentData("tvs", id, updated);
      } else if (command === "status") {
        updated.status = value;
        await setDocumentData("tvs", id, updated);
      } else if (command === "input") {
        updated.inputSource = String(value);
        await setDocumentData("tvs", id, updated);
      } else if (command === "powerPolicy") {
        updated.powerSchedule = String(value);
        await setDocumentData("tvs", id, updated);
      } else if (command === "factoryReset") {
        updated.status = "offline";
        updated.volume = 15;
        updated.inputSource = "Welcome Screen";
        await setDocumentData("tvs", id, updated);
        setTimeout(async () => {
          try {
            const currentTvs = await getCollectionData<any>("tvs");
            const curTv = currentTvs.find(t => t.id === id);
            if (curTv) {
              const backOnline = { ...curTv, status: "online" };
              await setDocumentData("tvs", id, backOnline);
              await addLog("warning", "Hospitality TV", `TV Room ${backOnline.roomNumber} completed total remote factory reset.`);
            }
          } catch (e) {
            console.error("Factory reset timeout error:", e);
          }
        }, 7000);
      }
      res.json(updated);
    } else {
      res.status(404).json({ error: "Hospitality TV not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PMS Rooms & Guest operations
app.get("/api/rooms", async (req, res) => {
  try {
    const data = await getCollectionData("rooms");
    res.json(data.sort((a: any, b: any) => a.number.localeCompare(b.number)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/rooms/:number", async (req, res) => {
  try {
    const { number } = req.params;
    const roomsList = await getCollectionData<any>("rooms");
    const target = roomsList.find(r => r.number === number);
    if (target) {
      const updated = { ...target, ...req.body };
      await setDocumentData("rooms", number, updated);
      await addLog("info", "Hotel PMS", `Room ${number} configuration updated in PMS database.`);
      res.json(updated);
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const { number, building, floor, type } = req.body;
    if (!number) {
      return res.status(400).json({ error: "Room number is required" });
    }
    const roomsList = await getCollectionData<any>("rooms");
    const exists = roomsList.some(r => r.number === number);
    if (exists) {
      return res.status(400).json({ error: `Room ${number} already exists` });
    }

    const newRoom = {
      number,
      building: building || "Main Block",
      floor: Number(floor) || 1,
      type: type || "Standard",
      housekeeping: "Clean",
      dnd: false,
      miniBarStatus: "Stocked",
      occupancy: false,
      guestId: ""
    };

    await setDocumentData("rooms", number, newRoom);

    // Auto-provision corresponding Hospitality TV for this room
    const newTv = {
      id: `tv-${number}`,
      roomNumber: number,
      hotelId: "H-LDN",
      brand: "Android TV",
      ipAddress: `192.168.10.${100 + Math.floor(Math.random() * 150)}`,
      status: "online",
      appVersion: "v4.3.0",
      firmware: "A-ATV-12.1",
      volume: 20,
      powerSchedule: "No Policy",
      inputSource: "HDMI 1 (IPTV)",
      lastReboot: "N/A"
    };
    await setDocumentData("tvs", newTv.id, newTv);

    // Auto-provision corresponding Smart IoT Node
    const newIot = {
      roomNumber: number,
      doorLocked: true,
      lightsIntensity: 40,
      hvacOn: true,
      thermostatTemp: 22.0,
      curtainsOpen: false,
      occupancyDetected: false,
      energyConsumption: 0.0
    };
    await setDocumentData("iotStates", number, newIot);

    await addLog("info", "Hotel PMS", `New Room ${number} created. Auto-provisioned Android TV (IP: ${newTv.ipAddress}) and IoT node.`);
    res.status(201).json(newRoom);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/rooms/:number", async (req, res) => {
  try {
    const { number } = req.params;
    const roomsList = await getCollectionData<any>("rooms");
    const roomIndex = roomsList.some(r => r.number === number);
    if (!roomIndex) {
      return res.status(404).json({ error: "Room not found" });
    }

    await deleteDocument("rooms", number);
    await deleteDocument("tvs", `tv-${number}`);
    await deleteDocument("iotStates", number);

    await addLog("warning", "Hotel PMS", `Room ${number} and all its connected IoT and TV hardware links decommissioned.`);
    res.json({ success: true, message: `Room ${number} successfully deleted.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/guests", async (req, res) => {
  try {
    const data = await getCollectionData("guests");
    res.json(data.sort((a: any, b: any) => a.id.localeCompare(b.id)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/guests/checkin", async (req, res) => {
  try {
    const { name, roomNumber, email, phone, language } = req.body;
    
    // Check if room exists
    const roomsList = await getCollectionData<any>("rooms");
    const roomIdx = roomsList.findIndex(r => r.number === roomNumber);
    if (roomIdx === -1) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    const guestId = `g-${Date.now()}`;
    const newGuest = {
      id: guestId,
      name,
      email: email || `${name.toLowerCase().replace(/\s/g, "")}@example.com`,
      phone: phone || "+1 555-9000",
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      roomNumber,
      status: "checked-in",
      language: language || "en"
    };

    await setDocumentData("guests", guestId, newGuest);

    // Update room
    const updatedRoom = { 
      ...roomsList[roomIdx], 
      occupancy: true, 
      guestId: guestId, 
      housekeeping: "Clean" 
    };
    await setDocumentData("rooms", roomNumber, updatedRoom);

    // Initialize folio tarff charge
    const initialTariff = {
      id: `fc-${Date.now()}`,
      roomNumber,
      description: `${updatedRoom.type} Room Tariff (Initial Authorization)`,
      amount: updatedRoom.type === "Suite" ? 450.00 : updatedRoom.type === "Penthouse" ? 1200.00 : updatedRoom.type === "Deluxe" ? 350.00 : 180.00,
      category: "Room Rate",
      date: new Date().toISOString().split('T')[0]
    };
    await setDocumentData("folios", initialTariff.id, initialTariff);

    await addLog("info", "Hotel PMS", `Guest CHECK-IN completed for ${name} into Room ${roomNumber}. Language preference: ${language || "en"}`);
    res.status(201).json(newGuest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/guests/:id/checkout", async (req, res) => {
  try {
    const { id } = req.params;
    const guestsList = await getCollectionData<any>("guests");
    const targetIdx = guestsList.findIndex(g => g.id === id);
    if (targetIdx !== -1) {
      const guest = guestsList[targetIdx];
      const roomNumber = guest.roomNumber;
      
      const updatedGuest = { ...guest, status: "checked-out" };
      await setDocumentData("guests", id, updatedGuest);
      
      const roomsList = await getCollectionData<any>("rooms");
      const rIdx = roomsList.findIndex(r => r.number === roomNumber);
      if (rIdx !== -1) {
        const updatedRoom = { 
          ...roomsList[rIdx], 
          occupancy: false, 
          guestId: "", 
          housekeeping: "Dirty" 
        };
        await setDocumentData("rooms", roomNumber, updatedRoom);
      }

      await addLog("info", "Hotel PMS", `Guest CHECK-OUT completed for ${guest.name} from Room ${roomNumber}. Folio closed.`);
      res.json({ success: true, roomNumber });
    } else {
      res.status(404).json({ error: "Guest not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dining / Room Service Restaurant POS & KDS
app.get("/api/orders", async (req, res) => {
  try {
    const data = await getCollectionData("orders");
    res.json(data.sort((a: any, b: any) => b.id.localeCompare(a.id)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { roomNumber, items, paymentMethod } = req.body;
    const total = items.reduce((sum: number, it: any) => sum + (it.item.price * it.quantity), 0);
    
    const newOrder = {
      id: `ord-${Date.now()}`,
      roomNumber,
      items,
      total,
      status: "Received",
      payment: paymentMethod || "Charged to Room",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    await setDocumentData("orders", newOrder.id, newOrder);

    // If charged to room, automatically sync to folio
    if (newOrder.payment === "Charged to Room") {
      const orderCharge = {
        id: `fc-${Date.now()}`,
        roomNumber,
        description: `In-room Dining Order #${newOrder.id.substring(4, 8)}`,
        amount: total,
        category: "Restaurant",
        date: new Date().toISOString().split('T')[0]
      };
      await setDocumentData("folios", orderCharge.id, orderCharge);
    }

    await addLog("info", "Restaurant POS", `Room service order received from Room ${roomNumber}. Total: $${total.toFixed(2)} (${newOrder.payment})`);
    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ordersList = await getCollectionData<any>("orders");
    const target = ordersList.find(o => o.id === id);
    if (target) {
      const updated = { ...target, status };
      await setDocumentData("orders", id, updated);
      await addLog("info", "Kitchen Display", `Order ${id} status updated to: ${status}`);
      res.json(updated);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic Restaurant Menu Management APIs
app.get("/api/menu", async (req, res) => {
  try {
    const data = await getCollectionData("menuItems");
    res.json(data.sort((a: any, b: any) => a.id.localeCompare(b.id)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/menu", async (req, res) => {
  try {
    const { name, category, price, image, stock } = req.body;
    const newItem = {
      id: `m-${Date.now()}`,
      name: name || "New Culinary Dish",
      category: category || "Lunch/Dinner",
      price: Number(price) || 15.00,
      image: image || "🍛",
      stock: Number(stock) || 50
    };
    await setDocumentData("menuItems", newItem.id, newItem);
    await addLog("info", "Restaurant POS", `Menu item added: ${newItem.name} (${newItem.category}) at $${newItem.price.toFixed(2)}`);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const menuList = await getCollectionData<any>("menuItems");
    const target = menuList.find(m => m.id === id);
    if (target) {
      const updated = { ...target, ...req.body };
      await setDocumentData("menuItems", id, updated);
      await addLog("info", "Restaurant POS", `Menu item ${updated.name} details/stock updated.`);
      res.json(updated);
    } else {
      res.status(404).json({ error: "Menu item not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const menuList = await getCollectionData<any>("menuItems");
    const target = menuList.find(m => m.id === id);
    if (target) {
      await deleteDocument("menuItems", id);
      await addLog("warning", "Restaurant POS", `Menu item "${target.name}" removed from active kitchen offerings.`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Menu item not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TV Software Packages & Upgrades APIs
app.get("/api/tv-software", async (req, res) => {
  try {
    const data = await getCollectionData("softwarePackages");
    res.json(data.sort((a: any, b: any) => b.id.localeCompare(a.id)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tv-software", async (req, res) => {
  try {
    const { name, version, platform, changelog } = req.body;
    const newPkg = {
      id: `sw-${Date.now()}`,
      name: name || `Software Release ${version}`,
      version: version || "v1.0.0",
      platform: platform || "Samsung Tizen",
      releaseDate: new Date().toISOString().split('T')[0],
      changelog: changelog || "General bug fixes and performance improvements."
    };
    await setDocumentData("softwarePackages", newPkg.id, newPkg);
    await addLog("security", "Hospitality TV", `New software package published: ${newPkg.name} for ${newPkg.platform}.`);
    res.status(201).json(newPkg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tvs/:id/upgrade", async (req, res) => {
  try {
    const { id } = req.params;
    const { version, firmware } = req.body;
    const tvsList = await getCollectionData<any>("tvs");
    const targetIdx = tvsList.findIndex(t => t.id === id);
    if (targetIdx !== -1) {
      const tv = tvsList[targetIdx];
      const oldVersion = tv.appVersion;
      
      const updatedTv = { ...tv, status: "offline" };
      await setDocumentData("tvs", id, updatedTv);
      await addLog("warning", "Hospitality TV", `TV Room ${tv.roomNumber} is undergoing an OTA Software Update to version ${version}.`);
      
      setTimeout(async () => {
        try {
          const currentTvs = await getCollectionData<any>("tvs");
          const idx = currentTvs.findIndex(t => t.id === id);
          if (idx !== -1) {
            const finishedTv = {
              ...currentTvs[idx],
              status: "online",
              appVersion: version,
              lastReboot: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
            if (firmware) finishedTv.firmware = firmware;
            await setDocumentData("tvs", id, finishedTv);
            await addLog("info", "Hospitality TV", `TV Room ${finishedTv.roomNumber} successfully upgraded from ${oldVersion} to ${version}. Reboot complete.`);
          }
        } catch (e) {
          console.error("OTA software upgrade timeout error:", e);
        }
      }, 4000);
      
      res.json({ success: true, message: "Upgrade initiated" });
    } else {
      res.status(404).json({ error: "TV not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/tvs/:id/config", async (req, res) => {
  try {
    const { id } = req.params;
    const tvsList = await getCollectionData<any>("tvs");
    const target = tvsList.find(t => t.id === id);
    if (target) {
      const updated = { ...target, ...req.body };
      await setDocumentData("tvs", id, updated);
      await addLog("info", "Hospitality TV", `TV Room ${target.roomNumber} configuration policies updated.`);
      res.json(updated);
    } else {
      res.status(404).json({ error: "TV not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Billing folios
app.get("/api/folios/:roomNumber", async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const data = await getRoomFolio(roomNumber);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/folios/:roomNumber/charge", async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { description, amount, category } = req.body;
    
    const newCharge = {
      id: `fc-${Date.now()}`,
      roomNumber,
      description,
      amount: Number(amount),
      category,
      date: new Date().toISOString().split('T')[0]
    };

    await setDocumentData("folios", newCharge.id, newCharge);
    await addLog("info", "Billing Engine", `Charged $${Number(amount).toFixed(2)} to Room ${roomNumber} folio: ${description}`);
    res.status(201).json(newCharge);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chats / Guest Messages
app.get("/api/messages", async (req, res) => {
  try {
    const data = await getCollectionData("messages");
    res.json(data.sort((a: any, b: any) => a.id.localeCompare(b.id)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { roomNumber, text, sender } = req.body;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: sender || "guest",
      roomNumber,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: sender === "reception"
    };

    await setDocumentData("messages", newMsg.id, newMsg);
    
    if (sender === "guest") {
      await addLog("info", "Communications", `New instant chat message from Room ${roomNumber}`);
    } else {
      await addLog("info", "Communications", `Instant broadcast message dispatched to Room ${roomNumber}`);
    }
    
    res.status(201).json(newMsg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/messages/broadcast", async (req, res) => {
  try {
    const { text } = req.body;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "system",
      roomNumber: "ALL",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    await setDocumentData("messages", newMsg.id, newMsg);
    await addLog("security", "Communications", `System-wide Broadcast ALERT: "${text}" sent to all TVs and guest apps.`);
    res.status(201).json(newMsg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Room IoT Commands
app.get("/api/iot", async (req, res) => {
  try {
    const data = await getCollectionData("iotStates");
    res.json(data.sort((a: any, b: any) => a.roomNumber.localeCompare(b.roomNumber)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/iot/:roomNumber", async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const iotList = await getCollectionData<any>("iotStates");
    const targetIdx = iotList.findIndex(i => i.roomNumber === roomNumber);
    if (targetIdx !== -1) {
      const updated = { ...iotList[targetIdx], ...req.body };
      await setDocumentData("iotStates", roomNumber, updated);
      await addLog("info", "Smart IoT", `Smart Room ${roomNumber} devices toggled. Thermostat: ${updated.thermostatTemp}°C.`);
      res.json(updated);
    } else {
      res.status(404).json({ error: "IoT room config not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System logs
app.get("/api/logs", async (req, res) => {
  try {
    const data = await getCollectionData("systemLogs");
    // Sort logs descending by timestamp or id
    res.json(data.sort((a: any, b: any) => b.id.localeCompare(a.id)).slice(0, 50));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/logs", async (req, res) => {
  try {
    const { severity, module, message } = req.body;
    await addLog(severity || "info", module || "System", message || "");
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FIREBASE STORAGE PLAYLIST BACKUP ENDPOINT
// -------------------------------------------------------------
app.post("/api/storage/backup-m3u", async (req, res) => {
  try {
    const activeChannels = await getCollectionData<any>("channels");
    let m3uContent = "#EXTM3U\n";
    for (const chan of activeChannels) {
      m3uContent += `#EXTINF:-1 tvg-logo="${chan.logo}",${chan.name}\n${chan.sourceUrl}\n`;
    }
    
    const timestamp = Date.now();
    const fileName = `backups/channels_backup_${timestamp}.m3u`;
    const downloadUrl = await uploadTextToStorage(fileName, m3uContent, "text/plain");
    
    await addLog("info", "Firebase Storage", `Completed stream playlist backup to Firebase Cloud Storage: ${fileName}`);
    res.json({ success: true, downloadUrl, fileName });
  } catch (error: any) {
    console.error("Backup to Storage failed:", error);
    res.status(500).json({ error: "Firebase Cloud Storage upload failed: " + error.message });
  }
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
  console.log("[Aenzbi IPTV Server] Connecting, syncing, and seeding database collections in Firestore...");
  try {
    await seedCollectionIfEmpty("channels", initialChannels, "id");
    await seedCollectionIfEmpty("headends", initialHeadends, "id");
    await seedCollectionIfEmpty("tvs", initialTvs, "id");
    await seedCollectionIfEmpty("guests", initialGuests, "id");
    await seedCollectionIfEmpty("rooms", initialRooms, "number");
    await seedCollectionIfEmpty("orders", initialOrders, "id");
    await seedCollectionIfEmpty("messages", initialMessages, "id");
    await seedCollectionIfEmpty("iotStates", initialIotStates, "roomNumber");
    await seedCollectionIfEmpty("systemLogs", initialSystemLogs, "id");
    await seedCollectionIfEmpty("menuItems", initialMenuItems, "id");
    await seedCollectionIfEmpty("softwarePackages", initialSoftwarePackages, "id");
    await seedSettingsIfEmpty(initialSettings);
    await seedFoliosIfEmpty(initialFolios);
    console.log("[Aenzbi IPTV Server] Firebase Firestore seeded & synced successfully.");
  } catch (err) {
    console.error("[Aenzbi IPTV Server] Firebase database seeding failed:", err);
  }

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
