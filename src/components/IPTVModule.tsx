import React, { useState } from "react";
import { IPTVChannel } from "../types";
import { Tv, Play, Plus, RefreshCw, AlertCircle, Radio, Trash2, Video, Database, Upload, BarChart3 } from "lucide-react";

interface IPTVModuleProps {
  channels: IPTVChannel[];
  onAddChannel: (channel: Partial<IPTVChannel>) => void;
  onUpdateChannel: (id: string, updates: Partial<IPTVChannel>) => void;
}

export default function IPTVModule({ channels, onAddChannel, onUpdateChannel }: IPTVModuleProps) {
  const [filter, setFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChanName, setNewChanName] = useState("");
  const [newChanCategory, setNewChanCategory] = useState<IPTVChannel["category"]>("Live IPTV");
  const [newChanUrl, setNewChanUrl] = useState("");
  const [newChanLogo, setNewChanLogo] = useState("📺");
  const [m3uPlaylist, setM3uPlaylist] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  const filteredChannels = filter === "all" ? channels : channels.filter(c => c.category === filter);

  const handleSubmitChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName || !newChanUrl) return;
    onAddChannel({
      name: newChanName,
      category: newChanCategory,
      sourceUrl: newChanUrl,
      logo: newChanLogo
    });
    setNewChanName("");
    setNewChanUrl("");
    setShowAddForm(false);
  };

  const handleImportPlaylist = () => {
    if (!m3uPlaylist) return;
    // Simulate parsing of M3U lines
    const lines = m3uPlaylist.split("\n");
    let addedCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#EXTINF:") && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith("http") || nextLine.startsWith("rtsp") || nextLine.startsWith("udp")) {
          const namePart = line.split(",")[1] || `M3U Channel ${addedCount + 1}`;
          onAddChannel({
            name: namePart,
            category: "OTT",
            sourceUrl: nextLine,
            logo: "🔗"
          });
          addedCount++;
        }
      }
    }
    setM3uPlaylist("");
    setShowImportModal(false);
    alert(`Successfully parsed playlist and imported ${addedCount} IPTV channels!`);
  };

  const getStatusColor = (status: IPTVChannel["status"]) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "recording": return "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse";
      case "error": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6" id="iptv-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <Tv className="h-5 w-5 text-indigo-600" />
            IPTV Stream Orchestration
          </h2>
          <p className="text-sm text-slate-500 mt-1">Config, monitor, transcode and record IPTV streams centrally</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            Import M3U Playlist
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Channel
          </button>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 text-base mb-2 flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-700" />
              Import IPTV M3U Playlist
            </h3>
            <p className="text-xs text-gray-500 mb-4">Paste standard M3U/EXTINF streaming playlist contents here to parse and provision streaming endpoints.</p>
            <textarea
              value={m3uPlaylist}
              onChange={(e) => setM3uPlaylist(e.target.value)}
              placeholder={`#EXTM3U\n#EXTINF:-1 tvg-logo="http://server.com/cnn.png",CNN International\nudp://@239.1.1.1:1234`}
              rows={8}
              className="w-full font-mono text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImportModal(false)} className="px-3.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleImportPlaylist} className="px-3.5 py-1.5 text-xs bg-black text-white hover:bg-gray-800 rounded-lg cursor-pointer">Parse & Import</button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmitChannel} className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-fadeIn">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Channel Name</label>
            <input
              type="text"
              required
              value={newChanName}
              onChange={(e) => setNewChanName(e.target.value)}
              placeholder="e.g. ESPN HD"
              className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Source URL</label>
            <input
              type="text"
              required
              value={newChanUrl}
              onChange={(e) => setNewChanUrl(e.target.value)}
              placeholder="e.g. udp://@239.1.1.10:1234"
              className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={newChanCategory}
                onChange={(e) => setNewChanCategory(e.target.value as any)}
                className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
              >
                <option value="Live IPTV">Live IPTV</option>
                <option value="OTT">OTT</option>
                <option value="DVB-S">DVB-S</option>
                <option value="DVB-T">DVB-T</option>
                <option value="DVB-C">DVB-C</option>
                <option value="RTSP">RTSP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icon/Emoji</label>
              <input
                type="text"
                value={newChanLogo}
                onChange={(e) => setNewChanLogo(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black text-center outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm shadow-indigo-100 cursor-pointer transition-colors"
            >
              Save Channel
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-3 py-1.5 text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto">
        {["all", "Live IPTV", "OTT", "DVB-S", "DVB-T", "DVB-C", "RTSP"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === cat 
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {cat === "all" ? "All Streams" : cat}
          </button>
        ))}
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => (
          <div key={channel.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{channel.logo}</span>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm leading-tight">{channel.name}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{channel.category}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(channel.status)}`}>
                  {channel.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 my-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-mono">
                <div className="flex justify-between">
                  <span>Source URL:</span>
                  <span className="text-gray-700 font-medium truncate max-w-[150px]">{channel.sourceUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <span className="text-gray-700 font-medium">{channel.resolution || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bitrate / FPS:</span>
                  <span className="text-gray-700 font-medium">{channel.bitrate ? `${(channel.bitrate/1000).toFixed(1)} Mbps` : "0 Mbps"} / {channel.fps}fps</span>
                </div>
                {channel.recordingSchedule && (
                  <div className="flex justify-between text-red-500">
                    <span>Rec Schedule:</span>
                    <span>{channel.recordingSchedule}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-1 text-gray-600">
                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                <span className="text-xs font-semibold text-gray-800">{channel.viewers}</span>
                <span className="text-[10px] text-gray-400">active rooms</span>
              </div>

              <div className="flex gap-1.5">
                {channel.status === "active" ? (
                  <button 
                    onClick={() => onUpdateChannel(channel.id, { status: "recording", recordingSchedule: "Manual Capture Triggered" })}
                    className="p-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors cursor-pointer"
                    title="Record stream"
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>
                ) : channel.status === "recording" ? (
                  <button 
                    onClick={() => onUpdateChannel(channel.id, { status: "active", recordingSchedule: undefined })}
                    className="p-1.5 bg-red-50 border border-red-100 text-red-500 rounded-lg hover:bg-gray-100 hover:text-gray-600 hover:border-gray-200 transition-colors cursor-pointer"
                    title="Stop recording"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => onUpdateChannel(channel.id, { status: "active", fps: 60, bitrate: 4500, resolution: "1080p" })}
                    className="p-1.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100 transition-colors cursor-pointer"
                    title="Attempt stream reconnection"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
