export interface IPTVChannel {
  id: string;
  name: string;
  category: "Live IPTV" | "OTT" | "DVB-S" | "DVB-T" | "DVB-C" | "RTSP";
  status: "active" | "error" | "recording";
  fps: number;
  bitrate: number; // kbps
  resolution: string;
  sourceUrl: string;
  logo: string;
  viewers: number;
  recordingSchedule?: string;
}

export interface HeadendDevice {
  id: string;
  name: string;
  type: "Encoder" | "Transcoder" | "Gateway" | "Mux" | "Demux" | "Receiver" | "Modulator";
  brand: "FFmpeg" | "GStreamer" | "NGINX RTMP" | "Wowza" | "Harmonic" | "Cisco" | "Teleste";
  status: "online" | "offline" | "rebooting";
  cpu: number;
  memory: number;
  temp: number;
  inputSignal: string;
  outputSignal: string;
}

export interface HospitalityTV {
  id: string;
  roomNumber: string;
  hotelId: string;
  brand: "Samsung Tizen" | "LG WebOS" | "Philips CMND" | "Android TV" | "MAG Linux";
  ipAddress: string;
  status: "online" | "offline" | "standby";
  appVersion: string;
  firmware: string;
  volume: number;
  powerSchedule: string;
  inputSource: string;
  lastReboot: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  status: "checked-in" | "checked-out" | "reservation";
  language: "en" | "fr" | "es" | "de" | "sw";
}

export interface Room {
  number: string;
  building: string;
  floor: number;
  type: "Deluxe" | "Suite" | "Standard" | "Penthouse";
  housekeeping: "Clean" | "Dirty" | "Inspect";
  dnd: boolean;
  miniBarStatus: "Stocked" | "Needs Refill";
  occupancy: boolean;
  guestId?: string;
}

export interface RestaurantItem {
  id: string;
  name: string;
  category: "Breakfast" | "Lunch/Dinner" | "Beverages" | "Desserts";
  price: number;
  image: string;
  stock: number;
}

export interface RestaurantOrder {
  id: string;
  roomNumber: string;
  items: { item: RestaurantItem; quantity: number }[];
  total: number;
  status: "Received" | "Preparing" | "Ready" | "Delivered";
  payment: "Charged to Room" | "Paid Stripe" | "Paid PayPal" | "M-Pesa";
  timestamp: string;
}

export interface FolioCharge {
  id: string;
  description: string;
  amount: number;
  category: "Room Rate" | "Restaurant" | "Mini Bar" | "Spa" | "Laundry";
  date: string;
}

export interface GuestMessage {
  id: string;
  sender: "guest" | "reception" | "system";
  roomNumber: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface SmartRoomIoT {
  roomNumber: string;
  doorLocked: boolean;
  lightsIntensity: number; // 0-100
  hvacOn: boolean;
  thermostatTemp: number; // C
  curtainsOpen: boolean;
  occupancyDetected: boolean;
  energyConsumption: number; // kWh
}

export interface SystemLog {
  id: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "security";
  module: string;
  message: string;
}
