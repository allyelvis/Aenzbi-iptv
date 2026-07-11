import { IPTVChannel, HeadendDevice, HospitalityTV, Guest, Room, RestaurantItem, RestaurantOrder, SystemLog, SmartRoomIoT, FolioCharge, GuestMessage } from "./types";

export const INITIAL_CHANNELS: IPTVChannel[] = [
  { id: "ch-1", name: "CNN International", category: "Live IPTV", status: "active", fps: 60, bitrate: 4500, resolution: "1080p", sourceUrl: "udp://@239.1.1.1:1234", logo: "📺", viewers: 42 },
  { id: "ch-2", name: "HBO Premium", category: "OTT", status: "recording", fps: 24, bitrate: 8000, resolution: "4K UHD", sourceUrl: "rtsp://headend-transcoder/hbo", logo: "🎬", viewers: 18, recordingSchedule: "21:00 - 23:30 Daily" },
  { id: "ch-3", name: "Sky Sports Main Event", category: "DVB-S", status: "active", fps: 50, bitrate: 6200, resolution: "1080p", sourceUrl: "srt://stream-srv:5001", logo: "⚽", viewers: 65 },
  { id: "ch-4", name: "SuperSport Blitz", category: "DVB-C", status: "active", fps: 50, bitrate: 3800, resolution: "1080p", sourceUrl: "udp://@239.1.1.4:1234", logo: "🏆", viewers: 12 },
  { id: "ch-5", name: "BBC World News", category: "DVB-T", status: "active", fps: 25, bitrate: 2900, resolution: "720p", sourceUrl: "http://hls.srv/bbc/playlist.m3u8", logo: "🌍", viewers: 28 },
  { id: "ch-6", name: "Discovery Science", category: "Live IPTV", status: "error", fps: 0, bitrate: 0, resolution: "Unknown", sourceUrl: "udp://@239.1.1.6:1234", logo: "🔬", viewers: 0 },
  { id: "ch-7", name: "Cartoon Network HD", category: "RTSP", status: "active", fps: 30, bitrate: 4200, resolution: "1080p", sourceUrl: "rtsp://239.1.1.7:554", logo: "🧸", viewers: 21 },
];

export const INITIAL_HEADEND_DEVICES: HeadendDevice[] = [
  { id: "he-1", name: "Main Satellite Receiver S2", type: "Receiver", brand: "Cisco", status: "online", cpu: 32, memory: 45, temp: 42, inputSignal: "RF 12.2GHz DVB-S2", outputSignal: "IP Multicast" },
  { id: "he-2", name: "Central AVC Transcoder 1", type: "Transcoder", brand: "FFmpeg", status: "online", cpu: 78, memory: 60, temp: 58, inputSignal: "MPEG-2 TS (UDP)", outputSignal: "H.264 AAC (HLS/UDP)" },
  { id: "he-3", name: "HEVC Core Transcoder 2", type: "Transcoder", brand: "GStreamer", status: "online", cpu: 65, memory: 55, temp: 54, inputSignal: "Raw SDI Over Fiber", outputSignal: "H.265 / AV1 SRT" },
  { id: "he-4", name: "Edge NGINX RTMP Gateway", type: "Gateway", brand: "NGINX RTMP", status: "online", cpu: 14, memory: 35, temp: 38, inputSignal: "RTMP Ingestion", outputSignal: "HLS / DASH Edge" },
  { id: "he-5", name: "Digital Terrestrial Demuxer", type: "Demux", brand: "Teleste", status: "online", cpu: 22, memory: 30, temp: 40, inputSignal: "DVB-T RF", outputSignal: "MPEG-TS PID Filters" },
  { id: "he-6", name: "Main QAM Modulator", type: "Modulator", brand: "Harmonic", status: "online", cpu: 45, memory: 50, temp: 48, inputSignal: "IP Multicast SPTS", outputSignal: "DVB-C QAM Channels" },
  { id: "he-7", name: "Wowza Backup Engine", type: "Gateway", brand: "Wowza", status: "offline", cpu: 0, memory: 0, temp: 22, inputSignal: "RTMP/RTSP Failover", outputSignal: "HLS Backup" },
];

export const INITIAL_TVS: HospitalityTV[] = [
  { id: "tv-101", roomNumber: "101", hotelId: "H-LDN", brand: "Samsung Tizen", ipAddress: "192.168.10.101", status: "online", appVersion: "v4.2.1", firmware: "T-MS12-3004", volume: 18, powerSchedule: "07:00 On / 23:00 Off", inputSource: "HDMI 1 (IPTV)", lastReboot: "2026-07-10 08:32" },
  { id: "tv-102", roomNumber: "102", hotelId: "H-LDN", brand: "LG WebOS", ipAddress: "192.168.10.102", status: "online", appVersion: "v4.2.0", firmware: "W-LGOS-5.40", volume: 15, powerSchedule: "08:00 On / 22:30 Off", inputSource: "HTML5 Portal", lastReboot: "2026-07-11 02:15" },
  { id: "tv-103", roomNumber: "103", hotelId: "H-LDN", brand: "Philips CMND", ipAddress: "192.168.10.103", status: "standby", appVersion: "v4.2.1", firmware: "P-PHIL-1.12", volume: 20, powerSchedule: "No Policy", inputSource: "HDMI 1 (IPTV)", lastReboot: "2026-07-09 11:22" },
  { id: "tv-201", roomNumber: "201", hotelId: "H-LDN", brand: "Android TV", ipAddress: "192.168.10.201", status: "online", appVersion: "v4.3.0", firmware: "A-ATV-12.1", volume: 25, powerSchedule: "07:00 On / 00:00 Off", inputSource: "HTML5 Portal", lastReboot: "2026-07-11 11:45" },
  { id: "tv-202", roomNumber: "202", hotelId: "H-LDN", brand: "MAG Linux", ipAddress: "192.168.10.202", status: "offline", appVersion: "v3.9.5", firmware: "M-LIN-2.6.3", volume: 0, powerSchedule: "No Policy", inputSource: "Unknown", lastReboot: "2026-07-05 14:10" },
];

export const INITIAL_GUESTS: Guest[] = [
  { id: "g-1", name: "David Beckham", email: "david.b@example.com", phone: "+44 7700 900077", checkInDate: "2026-07-08", checkOutDate: "2026-07-15", roomNumber: "101", status: "checked-in", language: "en" },
  { id: "g-2", name: "Elena Rostova", email: "elena.r@example.com", phone: "+7 911 234-56-78", checkInDate: "2026-07-10", checkOutDate: "2026-07-13", roomNumber: "102", status: "checked-in", language: "fr" },
  { id: "g-3", name: "Kenji Sato", email: "kenji.s@example.com", phone: "+81 90-1234-5678", checkInDate: "2026-07-11", checkOutDate: "2026-07-18", roomNumber: "201", status: "checked-in", language: "es" },
  { id: "g-4", name: "John Doe", email: "john@example.com", phone: "+1 555-0199", checkInDate: "2026-07-12", checkOutDate: "2026-07-14", roomNumber: "103", status: "reservation", language: "sw" },
];

export const INITIAL_ROOMS: Room[] = [
  { number: "101", building: "Main Block", floor: 1, type: "Suite", housekeeping: "Clean", dnd: false, miniBarStatus: "Stocked", occupancy: true, guestId: "g-1" },
  { number: "102", building: "Main Block", floor: 1, type: "Deluxe", housekeeping: "Clean", dnd: true, miniBarStatus: "Stocked", occupancy: true, guestId: "g-2" },
  { number: "103", building: "Main Block", floor: 1, type: "Standard", housekeeping: "Inspect", dnd: false, miniBarStatus: "Needs Refill", occupancy: false, guestId: "g-4" },
  { number: "201", building: "West Wing", floor: 2, type: "Penthouse", housekeeping: "Clean", dnd: false, miniBarStatus: "Stocked", occupancy: true, guestId: "g-3" },
  { number: "202", building: "West Wing", floor: 2, type: "Deluxe", housekeeping: "Dirty", dnd: false, miniBarStatus: "Needs Refill", occupancy: false },
];

export const RESTAURANT_MENU: RestaurantItem[] = [
  { id: "m-1", name: "Signature English Breakfast", category: "Breakfast", price: 24.50, image: "🥚", stock: 50 },
  { id: "m-2", name: "Belgian Waffles with Berries", category: "Breakfast", price: 18.00, image: "🥞", stock: 30 },
  { id: "m-3", name: "Wagyu Beef Club Sandwich", category: "Lunch/Dinner", price: 29.00, image: "🥪", stock: 40 },
  { id: "m-4", name: "Pan-Seared Sea Bass", category: "Lunch/Dinner", price: 38.50, image: "🐟", stock: 25 },
  { id: "m-5", name: "Fresh Squeezed Orange Juice", category: "Beverages", price: 8.50, image: "🍊", stock: 100 },
  { id: "m-6", name: "Kona Blend Single-Origin Coffee", category: "Beverages", price: 9.00, image: "☕", stock: 120 },
  { id: "m-7", name: "Grand Chocolate Lava Cake", category: "Desserts", price: 14.50, image: "🍰", stock: 15 },
];

export const INITIAL_ORDERS: RestaurantOrder[] = [
  { id: "ord-1", roomNumber: "101", items: [{ item: RESTAURANT_MENU[2], quantity: 2 }, { item: RESTAURANT_MENU[4], quantity: 2 }], total: 75.00, status: "Delivered", payment: "Charged to Room", timestamp: "10:30 AM" },
  { id: "ord-2", roomNumber: "102", items: [{ item: RESTAURANT_MENU[0], quantity: 1 }, { item: RESTAURANT_MENU[5], quantity: 1 }], total: 33.50, status: "Preparing", payment: "Paid Stripe", timestamp: "11:45 AM" },
];

export const INITIAL_FOLIOS: { [roomNumber: string]: FolioCharge[] } = {
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

export const INITIAL_MESSAGES: GuestMessage[] = [
  { id: "msg-1", sender: "guest", roomNumber: "101", text: "Hello reception, could we get extra feather pillows and 2 bottles of sparkling water?", timestamp: "11:15 AM", isRead: false },
  { id: "msg-2", sender: "reception", roomNumber: "101", text: "Certainly Mr. Beckham! Housekeeping is dispatched and will arrive at Room 101 in 5 minutes.", timestamp: "11:18 AM", isRead: true },
  { id: "msg-3", sender: "guest", roomNumber: "102", text: "Is the dry cleaning service available on Sundays?", timestamp: "11:32 AM", isRead: false },
  { id: "msg-4", sender: "system", roomNumber: "ALL", text: "EMERGENCY UPDATE: Fire drill testing scheduled for July 12th at 14:00. No action required.", timestamp: "09:00 AM", isRead: true },
];

export const INITIAL_IOT: SmartRoomIoT[] = [
  { roomNumber: "101", doorLocked: true, lightsIntensity: 60, hvacOn: true, thermostatTemp: 21.5, curtainsOpen: false, occupancyDetected: true, energyConsumption: 12.4 },
  { roomNumber: "102", doorLocked: true, lightsIntensity: 20, hvacOn: true, thermostatTemp: 22.0, curtainsOpen: false, occupancyDetected: true, energyConsumption: 8.9 },
  { roomNumber: "103", doorLocked: true, lightsIntensity: 0, hvacOn: false, thermostatTemp: 24.0, curtainsOpen: true, occupancyDetected: false, energyConsumption: 1.2 },
  { roomNumber: "201", doorLocked: false, lightsIntensity: 80, hvacOn: true, thermostatTemp: 20.0, curtainsOpen: true, occupancyDetected: true, energyConsumption: 18.6 },
  { roomNumber: "202", doorLocked: true, lightsIntensity: 0, hvacOn: false, thermostatTemp: 23.5, curtainsOpen: false, occupancyDetected: false, energyConsumption: 0.8 },
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: "log-1", timestamp: "12:00:10", severity: "info", module: "IPTV Streaming", message: "Live stream 'CNN International' PID alignment complete. Stream healthy." },
  { id: "log-2", timestamp: "11:58:32", severity: "warning", module: "Headend Controller", message: "Central Transcoder 1 CPU load spiked to 78% during peak transcoder repackaging." },
  { id: "log-3", timestamp: "11:52:15", severity: "error", module: "Hospitality TV", message: "TV Room 202 (MAG Linux) failed heartbeat response. Initiating diagnostic routing." },
  { id: "log-4", timestamp: "11:45:00", severity: "security", module: "Core Auth", message: "System Admin MFA authentication successful from IP 192.168.1.50" },
  { id: "log-5", timestamp: "11:30:22", severity: "info", module: "Hotel PMS", message: "Guest reservation checked in: Room 201 - Sato Kenji. Welcome greeting deployed." },
  { id: "log-6", timestamp: "11:15:10", severity: "info", module: "Smart IoT", message: "Thermostat in Room 101 adjusted to eco-mode (21.5°C) based on active reservation status." },
];

export const DOCKER_COMPOSE_SPEC = `version: "3.8"

services:
  aenzbi-backend:
    image: aenzbi-iptv/core-backend:latest
    container_name: aenzbi-backend
    restart: always
    environment:
      - DATABASE_URL=postgresql://postgres:secret123@db:5432/aenzbi_iptv
      - REDIS_URL=redis://redis:6379/0
      - MQTT_BROKER=mqtt://emqx:1883
      - JWT_SECRET=aenzbi_jwt_super_secret_key_2026
      - OFFLINE_MODE=false
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
      - emqx

  aenzbi-frontend-dashboard:
    image: aenzbi-iptv/frontend-portal:latest
    container_name: aenzbi-frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000

  db:
    image: postgres:15-alpine
    container_name: aenzbi-postgres
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret123
      - POSTGRES_DB=aenzbi_iptv
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: aenzbi-redis
    restart: always
    volumes:
      - redisdata:/data

  emqx:
    image: emqx/emqx:5.1.0
    container_name: aenzbi-mqtt-broker
    restart: always
    ports:
      - "1883:1883"
      - "18083:18083"

  streaming-srs:
    image: ossrs/srs:5
    container_name: aenzbi-srs-streaming
    restart: always
    ports:
      - "1935:1935"
      - "1985:1985"
      - "8080:8080"
    volumes:
      - ./srs.conf:/usr/local/srs/conf/srs.conf

volumes:
  pgdata:
  redisdata:
`;

export const KUBERNETES_MANIFEST = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: aenzbi-backend-deployment
  namespace: aenzbi-iptv
  labels:
    app: aenzbi-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aenzbi-backend
  template:
    metadata:
      labels:
        app: aenzbi-backend
    spec:
      containers:
      - name: backend
        image: aenzbi-iptv/core-backend:v1.2.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          value: "redis://aenzbi-redis-service:6379/0"
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: "250m"
            memory: 512Mi
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 20
          periodSeconds: 15
---
apiVersion: v1
kind: Service
metadata:
  name: aenzbi-backend-service
  namespace: aenzbi-iptv
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
  selector:
    app: aenzbi-backend
`;

export const HELM_VALUES = `global:
  environment: production
  replicaCount: 3

backend:
  image:
    repository: aenzbi-iptv/core-backend
    tag: v1.2.0
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 8000
  resources:
    limits:
      cpu: 1000m
      memory: 1024Mi
    requests:
      cpu: 200m
      memory: 256Mi

frontend:
  image:
    repository: aenzbi-iptv/frontend-portal
    tag: v1.2.0
  service:
    type: LoadBalancer
    port: 80

database:
  postgres:
    enabled: true
    persistence:
      size: 20Gi
    resources:
      limits:
        cpu: 2000m
        memory: 2048Mi

streamingServer:
  srs:
    enabled: true
    rtmpPort: 1935
    httpApiPort: 1985
    httpStreamPort: 8080
`;

export const OPENAPI_SPEC = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Aenzbi IPTV Hospitality Core API",
    "description": "Unified REST, WebSocket and MQTT APIs for headends, hospitality TVs, PMS orchestration, dining POS and IoT Smart Room automation.",
    "version": "1.2.0-release"
  },
  "paths": {
    "/api/channels": {
      "get": {
        "summary": "Retrieve central IPTV channel directory",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/IPTVChannel" }
                }
              }
            }
          }
        }
      }
    },
    "/api/devices/hospitality": {
      "get": {
        "summary": "List monitored hospitality TVs",
        "parameters": [
          { "name": "room", "in": "query", "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Filtered array of television states" } }
      },
      "post": {
        "summary": "Configure target volume, wallpaper, power policies",
        "requestBody": { "required": true }
      }
    },
    "/api/iot/command": {
      "post": {
        "summary": "Send smart room lock, light, or HVAC instructions via MQTT broker",
        "responses": { "202": { "description": "Command accepted and dispatched" } }
      }
    }
  }
}`;

export const FLUTTER_CODE_STRUCTURE = `// Flutter Smart Hospitality Mobile Apps Code Template
// Directory Structure for Centralized Guest, Staff, and Manager Apps

aenzbi_iptv_mobile/
├── android/
├── ios/
├── lib/
│   ├── main.dart                 // Multi-target app entrypoint (detects role)
│   ├── core/
│   │   ├── theme/
│   │   │   └── palette.dart      // High-contrast deep slate colors
│   │   ├── network/
│   │   │   ├── api_client.dart   // HTTP Retrofit + WebSocket state client
│   │   │   └── mqtt_manager.dart // IoT sensor subscribe and state publishing
│   │   └── models/
│   │       ├── channel_model.dart
│   │       ├── room_iot_model.dart
│   │       └── menu_item_model.dart
│   ├── modules/
│   │   ├── guest_app/
│   │   │   ├── controllers/
│   │   │   │   └── remote_control_controller.dart
│   │   │   └── views/
│   │   │       ├── tv_remote_screen.dart   // Remote control emulator for Tizen/WebOS
│   │   │       ├── digital_menu_screen.dart // In-app food & laundry order
│   │   │       └── concierge_chat.dart     // Dynamic chat with front desk
│   │   ├── staff_app/
│   │   │   ├── controllers/
│   │   │   │   └── task_controller.dart
│   │   │   └── views/
│   │   │       ├── housekeeping_board.dart // Mark room clean/dirty
│   │   │       └── maintenance_logs.dart   // Smart alert notifications
│   │   └── manager_app/
│   │       └── views/
│   │           ├── executive_dashboard.dart // Live occupancy & room revenue stats
│   │           └── telemetry_monitor.dart    // Headend status & bandwidth alert logs
│   └── shared_widgets/
│       ├── custom_button.dart
│       └── glass_card.dart
└── pubspec.yaml
`;

export const TV_AGENT_DAEMON = `#!/usr/bin/env python3
"""
Aenzbi IPTV Hospitality TV Agent Daemon
Provides remote firmware download, reboot telemetry, app install, welcome screen caching,
and real-time volume management for Hospitality Televisions (Tizen, WebOS, Android TV, STBs).
"""

import os
import sys
import json
import time
import urllib.request
import subprocess

CONFIG_FILE = "/etc/aenzbi-agent.json"
SERVER_URL = "http://aenzbi-core.hospitality.net:8000/api/devices/hospitality/heartbeat"

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    return {"room_number": "000", "device_id": "STB-GENERIC", "volume_limit": 50}

def get_telemetry(config):
    # Simulated system state extraction
    return {
        "id": config.get("device_id"),
        "roomNumber": config.get("room_number"),
        "uptime": int(time.time()),
        "volume": 20,
        "inputSource": "HDMI 1",
        "appVersion": "v4.2.1",
        "firmware": "LINUX-STB-1.2"
    }

def process_command(cmd, payload):
    print(f"[Aenzbi Agent] Processing Remote Instruction: {cmd} with payload {payload}")
    if cmd == "REBOOT":
        print("[Aenzbi Agent] Initiating safe system reboot sequence.")
        # subprocess.run(["reboot"])
    elif cmd == "VOLUME_POLICY":
        print(f"[Aenzbi Agent] Setting master hardware volume lock to: {payload}")
    elif cmd == "DEPLOY_WALLPAPER":
        print(f"[Aenzbi Agent] Syncing hospitality branding asset from: {payload}")
        # urllib.request.urlretrieve(payload, "/var/local/welcome_logo.png")

def main():
    print("[Aenzbi IPTV STB Agent] Booting background management daemon...")
    config = load_config()
    while True:
        try:
            telemetry = get_telemetry(config)
            req = urllib.request.Request(SERVER_URL, data=json.dumps(telemetry).encode("utf-8"), headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as res:
                response_data = json.loads(res.read().decode("utf-8"))
                if "command" in response_data:
                    process_command(response_data["command"], response_data.get("payload"))
        except Exception as e:
            print(f"[Aenzbi Agent] Telemetry synchronization failed: {e}", file=sys.stderr)
        
        time.sleep(10) # Central 10-second heartbeat check interval

if __name__ == "__main__":
    main()
`;

export const SQL_MIGRATION_SEED = `-- Aenzbi IPTV Hospitality Core database Schema & Seed (PostgreSQL)

CREATE TABLE IF NOT EXISTS hotels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    number VARCHAR(10) PRIMARY KEY,
    building VARCHAR(100),
    floor INT,
    room_type VARCHAR(50),
    housekeeping VARCHAR(20) DEFAULT 'Clean',
    dnd BOOLEAN DEFAULT FALSE,
    minibar VARCHAR(20) DEFAULT 'Stocked',
    occupancy BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS guests (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    room_number VARCHAR(10) REFERENCES rooms(number),
    language VARCHAR(10) DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS iptv_channels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    stream_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active'
);

-- Seed static tables
INSERT INTO hotels (id, name, location) VALUES ('H-LDN', 'Aenzbi Royal Grand Hotel', 'Central London') ON CONFLICT DO NOTHING;
INSERT INTO rooms (number, building, floor, room_type, occupancy) VALUES 
('101', 'Main Block', 1, 'Suite', TRUE),
('102', 'Main Block', 1, 'Deluxe', TRUE),
('103', 'Main Block', 1, 'Standard', FALSE),
('201', 'West Wing', 2, 'Penthouse', TRUE)
ON CONFLICT DO NOTHING;
`;

export const UNIT_TESTS_CODE = `import { expect, test, describe, beforeAll } from "bun:test";
import { IPTVChannel, Room } from "./src/types";

describe("Aenzbi IPTV - Central Orchestration Verification Suite", () => {
  let mockChannel: IPTVChannel;

  beforeAll(() => {
    mockChannel = {
      id: "ch-test-1",
      name: "Aenzbi HD Entertainment",
      category: "Live IPTV",
      status: "active",
      fps: 60,
      bitrate: 4500,
      resolution: "1080p",
      sourceUrl: "udp://@239.5.5.5:1234",
      logo: "🎬",
      viewers: 15
    };
  });

  test("IPTV Channel fields validated correctly", () => {
    expect(mockChannel.id).toBe("ch-test-1");
    expect(mockChannel.fps).toBe(60);
    expect(mockChannel.status).not.toBe("error");
  });

  test("Room occupancy trigger synchronization test", () => {
    const mockRoom: Room = {
      number: "505",
      building: "North Wing",
      floor: 5,
      type: "Suite",
      housekeeping: "Clean",
      dnd: true,
      miniBarStatus: "Stocked",
      occupancy: true,
      guestId: "g-99"
    };

    expect(mockRoom.occupancy).toBe(true);
    expect(mockRoom.dnd).toBe(true);
  });
});
`;
