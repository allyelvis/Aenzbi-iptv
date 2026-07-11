import React from "react";
import { SmartRoomIoT } from "../types";
import { Zap, DoorClosed, Lightbulb, Thermometer, Lock, Unlock, Eye, ArrowRight } from "lucide-react";

interface IoTModuleProps {
  iotStates: SmartRoomIoT[];
  onUpdateIoT: (roomNumber: string, updates: Partial<SmartRoomIoT>) => void;
}

export default function IoTModule({ iotStates, onUpdateIoT }: IoTModuleProps) {
  const getIntensityLabel = (lvl: number) => {
    if (lvl === 0) return "Off";
    if (lvl < 35) return "Dim Ambient";
    if (lvl < 75) return "Warm Living";
    return "Full Bright";
  };

  return (
    <div className="space-y-6" id="smart-iot-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            Smart Room IoT Telemetry
          </h2>
          <p className="text-sm text-slate-500 mt-1">Command guest door locks, lighting intensity, HVAC fans and track local energy grids</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {iotStates.map((roomIot) => (
          <div key={roomIot.roomNumber} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IoT Controller</span>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">Room {roomIot.roomNumber} Telemetry</h3>
              </div>
              <span className="text-[10px] bg-teal-50 border border-teal-100 text-teal-600 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-ping" />
                Live Grid Node
              </span>
            </div>

            {/* Lock toggle */}
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-gray-700 block">Smart Keyless Door Lock</span>
                <span className="text-gray-400 text-[10px]">{roomIot.doorLocked ? "Locked & Encrypted" : "Unlocked (Reception Override)"}</span>
              </div>
              <button
                onClick={() => onUpdateIoT(roomIot.roomNumber, { doorLocked: !roomIot.doorLocked })}
                className={`p-2 rounded-lg border flex items-center gap-1 cursor-pointer font-bold ${
                  roomIot.doorLocked 
                    ? "bg-red-50 text-red-600 border-red-100" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}
              >
                {roomIot.doorLocked ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    Unlocked
                  </>
                )}
              </button>
            </div>

            {/* Smart dimmer slider */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-700">Luminosity Dimmer</span>
                <span className="font-mono text-gray-400 text-[10px]">{roomIot.lightsIntensity}% ({getIntensityLabel(roomIot.lightsIntensity)})</span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb className={`h-4 w-4 ${roomIot.lightsIntensity > 0 ? "text-yellow-400 fill-yellow-100" : "text-gray-300"}`} />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={roomIot.lightsIntensity}
                  onChange={(e) => onUpdateIoT(roomIot.roomNumber, { lightsIntensity: Number(e.target.value) })}
                  className="flex-1 accent-black bg-gray-100 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Thermostat HVAC control */}
            <div className="flex justify-between items-center text-xs border-t border-b border-gray-100/50 py-3">
              <div>
                <span className="font-semibold text-gray-700 block">Thermostat Climate Limit</span>
                <span className="text-gray-400 text-[10px]">Fan Loop Mode: Auto</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onUpdateIoT(roomIot.roomNumber, { thermostatTemp: Number((roomIot.thermostatTemp - 0.5).toFixed(1)) })}
                  className="h-7 w-7 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-bold rounded-lg flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono font-bold text-gray-900 w-11 text-center text-sm">{roomIot.thermostatTemp}°C</span>
                <button 
                  onClick={() => onUpdateIoT(roomIot.roomNumber, { thermostatTemp: Number((roomIot.thermostatTemp + 0.5).toFixed(1)) })}
                  className="h-7 w-7 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-bold rounded-lg flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Curtains blinds and energy stats */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1.5">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase">Curtains Blinds</span>
                <button
                  onClick={() => onUpdateIoT(roomIot.roomNumber, { curtainsOpen: !roomIot.curtainsOpen })}
                  className={`w-full py-1.5 border rounded-lg font-bold mt-1 cursor-pointer text-center text-[11px] ${
                    roomIot.curtainsOpen 
                      ? "bg-teal-50 text-teal-600 border-teal-100" 
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {roomIot.curtainsOpen ? "Blinds Open" : "Blinds Closed"}
                </button>
              </div>

              <div>
                <span className="text-gray-400 block text-[9px] uppercase">Smart Energy Meter</span>
                <div className="mt-1 flex items-baseline gap-0.5">
                  <span className="font-mono font-bold text-gray-900 text-sm">{roomIot.energyConsumption}</span>
                  <span className="text-[10px] text-gray-400 font-semibold font-mono">kWh/24h</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
