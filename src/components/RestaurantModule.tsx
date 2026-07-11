import React from "react";
import { RestaurantOrder, RestaurantItem } from "../types";
import { RESTAURANT_MENU } from "../data";
import { ChefHat, ShoppingBag, Truck, Flame, CheckCircle, PackageOpen, ClipboardList } from "lucide-react";

interface RestaurantModuleProps {
  orders: RestaurantOrder[];
  onUpdateOrderStatus: (id: string, status: RestaurantOrder["status"]) => void;
}

export default function RestaurantModule({ orders, onUpdateOrderStatus }: RestaurantModuleProps) {
  const getStatusColor = (status: RestaurantOrder["status"]) => {
    switch (status) {
      case "Received": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Preparing": return "bg-amber-100 text-amber-700 border-amber-200 animate-pulse";
      case "Ready": return "bg-teal-100 text-teal-700 border-teal-200";
      case "Delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6" id="restaurant-kitchen-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-indigo-600" />
            Kitchen Display System (KDS) & POS
          </h2>
          <p className="text-sm text-slate-500 mt-1">Receive, prepare and deliver guest room dining orders reactive to TV simulators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KDS active board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-3">
              <ClipboardList className="h-4.5 w-4.5 text-slate-500" />
              Active Preparation Queue ({orders.filter(o => o.status !== "Delivered").length} pending)
            </h3>

            {orders.filter(o => o.status !== "Delivered").length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                🍽️ Preparation queue is clean. Empty slots ready for guest TV simulator dining orders.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {orders.filter(o => o.status !== "Delivered").map((ord) => (
                  <div key={ord.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-gray-100 pb-2.5 mb-3">
                        <div>
                          <span className="font-extrabold text-sm text-gray-900">Order #{ord.id.substring(4, 8)}</span>
                          <span className="block text-[10px] text-gray-400 font-mono">Room {ord.roomNumber} • {ord.timestamp}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(ord.status)}`}>
                          {ord.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 text-xs">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-gray-700 bg-gray-50 p-1.5 rounded">
                            <span className="font-medium">{it.item.name} <span className="text-gray-400">x {it.quantity}</span></span>
                            <span className="font-mono text-gray-500">${(it.item.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mt-4 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-400 block text-[9px]">PAYMENT METHOD</span>
                        <span className="font-semibold text-gray-800">{ord.payment}</span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        {ord.status === "Received" && (
                          <button 
                            onClick={() => onUpdateOrderStatus(ord.id, "Preparing")}
                            className="px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold border border-amber-100 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Flame className="h-3 w-3" />
                            Cook Item
                          </button>
                        )}
                        {ord.status === "Preparing" && (
                          <button 
                            onClick={() => onUpdateOrderStatus(ord.id, "Ready")}
                            className="px-2.5 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold border border-teal-100 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Ready
                          </button>
                        )}
                        {ord.status === "Ready" && (
                          <button 
                            onClick={() => onUpdateOrderStatus(ord.id, "Delivered")}
                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-100 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="h-3 w-3" />
                            Deliver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Orders History */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3 mb-4">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
              Delivered Orders Archive ({orders.filter(o => o.status === "Delivered").length})
            </h3>
            {orders.filter(o => o.status === "Delivered").length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                No orders delivered in this shifts cycle yet.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left text-gray-500 divide-y divide-gray-100">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400">
                    <tr>
                      <th className="px-3 py-2">Order ID</th>
                      <th className="px-3 py-2">Room</th>
                      <th className="px-3 py-2">Items</th>
                      <th className="px-3 py-2">Total Amount</th>
                      <th className="px-3 py-2 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {orders.filter(o => o.status === "Delivered").map(o => (
                      <tr key={o.id}>
                        <td className="px-3 py-3 font-mono font-bold text-gray-800">#{o.id.substring(4, 8)}</td>
                        <td className="px-3 py-3 font-semibold text-gray-900">Room {o.roomNumber}</td>
                        <td className="px-3 py-3 truncate max-w-[150px]">
                          {o.items.map(it => `${it.item.name} (${it.quantity})`).join(", ")}
                        </td>
                        <td className="px-3 py-3 font-bold text-gray-900">${o.total.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                            {o.payment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stock management panel on Right */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <PackageOpen className="h-4.5 w-4.5 text-gray-700" />
              Kitchen Pantry Dry-Stock Inventory
            </h3>

            <div className="space-y-3.5 text-xs text-gray-600">
              {RESTAURANT_MENU.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.image}</span>
                    <div>
                      <span className="font-bold text-gray-800 block leading-tight">{item.name}</span>
                      <span className="text-gray-400 text-[10px]">{item.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold font-mono text-sm block ${item.stock < 20 ? "text-red-500" : "text-gray-700"}`}>{item.stock}</span>
                    <span className="text-[10px] text-gray-400">units in fridge</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
