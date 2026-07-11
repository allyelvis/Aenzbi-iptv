import React, { useState } from "react";
import { HeadendDevice } from "../types";
import { Cpu, Terminal, Zap, RefreshCw, Layers, ShieldCheck, Play, Code, Sliders } from "lucide-react";

interface HeadendModuleProps {
  devices: HeadendDevice[];
  onRebootDevice: (id: string) => void;
}

export default function HeadendModule({ devices, onRebootDevice }: HeadendModuleProps) {
  const [selectedDevice, setSelectedDevice] = useState<HeadendDevice | null>(devices[1] || null);
  
  // FFmpeg command builder state
  const [ffmpegInput, setFfmpegInput] = useState("rtsp://sat-receiver-ip/stream1");
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [audioCodec, setAudioCodec] = useState("aac");
  const [outputBitrate, setOutputBitrate] = useState("4000k");
  const [outputFormat, setOutputFormat] = useState("hls");
  const [outputUrl, setOutputUrl] = useState("udp://@239.1.1.1:1234?pkt_size=1316");

  const buildFfmpegCmd = () => {
    let codecParams = "";
    if (videoCodec === "libx264") {
      codecParams = "-c:v libx264 -preset veryfast -g 50 -sc_threshold 0";
    } else if (videoCodec === "libx265") {
      codecParams = "-c:v libx265 -preset fast -tag:v hvc1 -x265-params keyint=50";
    } else {
      codecParams = "-c:v copy";
    }

    let audioParams = audioCodec === "aac" ? "-c:a aac -b:a 128k -ar 44100" : "-c:a copy";
    let formatFlag = outputFormat === "hls" 
      ? "-f hls -hls_time 4 -hls_playlist_type event" 
      : "-f mpegts";

    return `ffmpeg -re -i "${ffmpegInput}" ${codecParams} -b:v ${outputBitrate} ${audioParams} ${formatFlag} "${outputUrl}"`;
  };

  const getStatusColor = (status: HeadendDevice["status"]) => {
    switch (status) {
      case "online": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "rebooting": return "text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse";
      case "offline": return "text-gray-400 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6" id="headend-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-600" />
            Headend Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configure and reboot central encoders, gateways and demuxers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Device list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connected Headends ({devices.length})</span>
              <span className="text-[10px] text-slate-400 font-mono">Cluster Uptime: 247 days</span>
            </div>
            <div className="divide-y divide-slate-100">
              {devices.map((dev) => (
                <div 
                  key={dev.id} 
                  onClick={() => setSelectedDevice(dev)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedDevice?.id === dev.id ? "bg-slate-50" : "hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                      <Layers className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{dev.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{dev.brand}</span>
                        <span>•</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">{dev.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-4 text-center font-mono text-xs text-slate-500">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">CPU</span>
                        <span className={`font-semibold ${dev.cpu > 70 ? "text-red-500" : "text-slate-700"}`}>{dev.cpu}%</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">TEMP</span>
                        <span className="text-slate-700 font-semibold">{dev.temp}°C</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(dev.status)}`}>
                        {dev.status}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onRebootDevice(dev.id);
                        }}
                        disabled={dev.status === "rebooting"}
                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-600 cursor-pointer"
                        title="Reboot Headend Device"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transcoder Command Builder */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Code className="h-4 w-4 text-indigo-600" />
              Dynamic FFmpeg Transcoding Orchestrator
            </h3>
            <p className="text-xs text-gray-500">
              Build compliant high-performance video transcoding command lines for on-premises or cloud deployments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-gray-600 mb-1">Source Stream (Input URL)</label>
                <input 
                  type="text" 
                  value={ffmpegInput}
                  onChange={(e) => setFfmpegInput(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">Target Multicast/Edge Output URL</label>
                <input 
                  type="text" 
                  value={outputUrl}
                  onChange={(e) => setOutputUrl(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Video Codec Encodement</label>
                <select 
                  value={videoCodec}
                  onChange={(e) => setVideoCodec(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                >
                  <option value="libx264">H.264 / AVC (Standard Compatibility)</option>
                  <option value="libx265">H.265 / HEVC (Ultra HD High Compression)</option>
                  <option value="copy">Bypass (Direct Stream Copy - Raw PIDs)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-medium text-gray-600 mb-1">Audio Transcode</label>
                  <select 
                    value={audioCodec}
                    onChange={(e) => setAudioCodec(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                  >
                    <option value="aac">AAC Stereo (128 kbps)</option>
                    <option value="copy">Copy Original Audio</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Max Bitrate</label>
                  <select 
                    value={outputBitrate}
                    onChange={(e) => setOutputBitrate(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black text-center outline-none"
                  >
                    <option value="8000k">8 Mbps</option>
                    <option value="5000k">5 Mbps</option>
                    <option value="4000k">4 Mbps</option>
                    <option value="2500k">2.5 Mbps</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 relative">
              <span className="absolute right-3 top-3 bg-gray-800 text-[9px] uppercase font-bold tracking-widest text-emerald-400 px-2 py-0.5 rounded border border-gray-700">FFmpeg CLI output</span>
              <pre className="font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap select-all leading-relaxed p-1">
                {buildFfmpegCmd()}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Inspector pane */}
        <div>
          {selectedDevice ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-6">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Device Monitor</span>
                <h3 className="font-bold text-slate-800 text-base">{selectedDevice.name}</h3>
                <span className="text-xs text-slate-500">{selectedDevice.brand} Chassis</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 uppercase font-mono">CPU Temp</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-slate-800">{selectedDevice.temp}</span>
                    <span className="text-xs text-slate-500">°C</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-2">
                    <div 
                      className={`h-1 rounded-full ${selectedDevice.temp > 55 ? "bg-amber-500" : "bg-emerald-500"}`} 
                      style={{ width: `${(selectedDevice.temp/80)*100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 uppercase font-mono">Core Load</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-slate-800">{selectedDevice.cpu}</span>
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-2">
                    <div 
                      className="h-1 rounded-full bg-indigo-500" 
                      style={{ width: `${selectedDevice.cpu}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Input Signal:</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedDevice.inputSignal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Output format:</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedDevice.outputSignal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Device Status:</span>
                  <span className="text-slate-800 font-semibold capitalize">{selectedDevice.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Platform RAM:</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedDevice.memory}% of 16GB</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button 
                  onClick={() => onRebootDevice(selectedDevice.id)}
                  disabled={selectedDevice.status === "rebooting"}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Trigger Remote Soft-Reboot
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
              Select a headend device from the left grid to view real-time logs, resource gauges, and port mapping tables.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
