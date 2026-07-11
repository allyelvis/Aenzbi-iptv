import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, Cpu, Lightbulb, Bot, AlertCircle } from "lucide-react";

interface AnalyticsModuleProps {
  onGenerateReport: () => Promise<string>;
}

export default function AnalyticsModule({ onGenerateReport }: AnalyticsModuleProps) {
  const [aiReport, setAiReport] = useState<string>("");
  const [loadingReport, setLoadingReport] = useState(false);

  // Sample static high-quality analytics arrays
  const occupancyData = [
    { day: "Mon", rate: 68, revenue: 14200 },
    { day: "Tue", rate: 72, revenue: 15100 },
    { day: "Wed", rate: 80, revenue: 16800 },
    { day: "Thu", rate: 85, revenue: 18200 },
    { day: "Fri", rate: 95, revenue: 21500 },
    { day: "Sat", rate: 98, revenue: 23000 },
    { day: "Sun", rate: 90, revenue: 19500 },
  ];

  const channelPopularity = [
    { name: "CNN", viewers: 42, color: "#EF4444" },
    { name: "HBO Premium", viewers: 35, color: "#8B5CF6" },
    { name: "Sky Sports", viewers: 65, color: "#3B82F6" },
    { name: "Discovery", viewers: 28, color: "#10B981" },
    { name: "CN Cartoon", viewers: 21, color: "#F59E0B" },
  ];

  const energyGridTelemetry = [
    { hour: "00:00", kwh: 12 },
    { hour: "04:00", kwh: 8 },
    { hour: "08:00", kwh: 35 },
    { hour: "12:00", kwh: 48 },
    { hour: "16:00", kwh: 52 },
    { hour: "20:00", kwh: 65 },
  ];

  const handleFetchAiReport = async () => {
    setLoadingReport(true);
    try {
      const text = await onGenerateReport();
      setAiReport(text);
    } catch (e) {
      setAiReport("Unable to compile predictive report. Verify your server is fully started and environment routes are configured.");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6" id="analytics-bi-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Hospitality Intelligence & BI
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review operational, utility, and IPTV viewing analytics across connected devices</p>
        </div>

        <button
          onClick={handleFetchAiReport}
          disabled={loadingReport}
          className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100 transition-colors"
        >
          <Bot className="h-4 w-4" />
          {loadingReport ? "Generating AI Report..." : "Generate AI Strategic Report"}
        </button>
      </div>

      {/* AI report panel */}
      {aiReport && (
        <div className="bg-neutral-900 text-gray-100 rounded-xl p-5 border border-neutral-800 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-extrabold tracking-tight text-white">Aenzbi AI Predictive Telemetry Report</span>
            </div>
            <button 
              onClick={() => setAiReport("")}
              className="text-gray-400 hover:text-white text-xs cursor-pointer font-semibold"
            >
              Clear
            </button>
          </div>
          <div className="text-xs space-y-2.5 leading-relaxed overflow-y-auto max-h-[300px] text-gray-300 font-mono select-all whitespace-pre-wrap p-1">
            {aiReport}
          </div>
        </div>
      )}

      {/* Key operational figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ADR (Daily Average)</span>
            <span className="block text-xl font-extrabold text-gray-900 font-mono mt-1">$245.50</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Average Occupancy</span>
            <span className="block text-xl font-extrabold text-gray-900 font-mono mt-1">83.4%</span>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Active Stream Bandwidth</span>
            <span className="block text-xl font-extrabold text-gray-900 font-mono mt-1">124.5 Mbps</span>
          </div>
          <div className="p-2 bg-neutral-100 text-gray-600 rounded-lg">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Utility Grid load</span>
            <span className="block text-xl font-extrabold text-gray-900 font-mono mt-1">146.2 kWh</span>
          </div>
          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
            <Lightbulb className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy and Revenue curve */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Weekly PMS Occupancy & Revenue Curve</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="day" style={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis style={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                <Area type="monotone" dataKey="rate" name="Occupancy %" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel viewing stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">IPTV Channel Active Rooms Popularity</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPopularity} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="name" style={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis style={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                <Bar dataKey="viewers" name="Active Rooms" radius={[4, 4, 0, 0]}>
                  {channelPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utility energy telemetry curve */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Smart Grid IoT Hourly Electricity Consumption</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyGridTelemetry} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="hour" style={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis style={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                <Area type="monotone" dataKey="kwh" name="Energy Usage (kWh)" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorKwh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
