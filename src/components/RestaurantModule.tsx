import React, { useState } from "react";
import { RestaurantOrder, RestaurantItem } from "../types";
import { ChefHat, ShoppingBag, Truck, Flame, CheckCircle, PackageOpen, ClipboardList, Plus, Trash, DollarSign, Filter, Utensils, Heart } from "lucide-react";

interface RestaurantModuleProps {
  orders: RestaurantOrder[];
  onUpdateOrderStatus: (id: string, status: RestaurantOrder["status"]) => void;
  menuItems: RestaurantItem[];
  onAddMenuItem: (payload: { name: string; category: string; price: number; image: string; stock: number }) => void;
  onUpdateMenuItem: (id: string, updates: Partial<RestaurantItem>) => void;
  onDeleteMenuItem: (id: string) => void;
}

export default function RestaurantModule({ 
  orders, 
  onUpdateOrderStatus, 
  menuItems = [], 
  onAddMenuItem, 
  onUpdateMenuItem, 
  onDeleteMenuItem 
}: RestaurantModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "menu">("orders");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Add Item form state
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Lunch/Dinner");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImage, setNewItemImage] = useState("🍛");
  const [newItemStock, setNewItemStock] = useState("50");

  const [formError, setFormError] = useState("");

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) {
      setFormError("Please fill out name and price.");
      return;
    }
    const priceNum = parseFloat(newItemPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Please provide a valid price greater than 0.");
      return;
    }
    const stockNum = parseInt(newItemStock);

    onAddMenuItem({
      name: newItemName,
      category: newItemCategory as any,
      price: priceNum,
      image: newItemImage,
      stock: isNaN(stockNum) ? 50 : stockNum
    });

    // Reset Form
    setNewItemName("");
    setNewItemPrice("");
    setNewItemImage("🍛");
    setNewItemStock("50");
    setFormError("");
  };

  const getStatusColor = (status: RestaurantOrder["status"]) => {
    switch (status) {
      case "Received": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Preparing": return "bg-amber-100 text-amber-700 border-amber-200 animate-pulse";
      case "Ready": return "bg-teal-100 text-teal-700 border-teal-200";
      case "Delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const categories = ["All", "Breakfast", "Lunch/Dinner", "Beverages", "Desserts"];

  const filteredMenuItems = categoryFilter === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === categoryFilter);

  return (
    <div className="space-y-6" id="restaurant-kitchen-module">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-indigo-600" />
            Kitchen Display System (KDS) & POS Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Receive guest room service orders and configure the hotel's dynamic dining catalog</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-center shadow-sm">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
              activeSubTab === "orders" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Orders Queue & KDS
          </button>
          <button
            onClick={() => setActiveSubTab("menu")}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
              activeSubTab === "menu" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Restaurant Menu Catalog
          </button>
        </div>
      </div>

      {activeSubTab === "orders" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
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
                        <th className="px-3 py-2 text-right">Total Amount</th>
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

          {/* Quick pantry summary list */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
                <PackageOpen className="h-4.5 w-4.5 text-indigo-600" />
                Dry-Stock Pantry Levels
              </h3>

              <div className="space-y-3 text-xs text-gray-600">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <div className="flex items-center gap-2">
                      <span className="text-lg bg-white p-1 rounded-lg shadow-sm border border-slate-100">{item.image}</span>
                      <div>
                        <span className="font-bold text-gray-800 block leading-tight">{item.name}</span>
                        <span className="text-gray-400 text-[10px]">{item.category}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-bold font-mono text-sm block ${item.stock < 10 ? "text-red-500 font-extrabold" : "text-gray-700"}`}>
                        {item.stock}
                      </span>
                      <span className="text-[10px] text-gray-400">in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Menu Catalog List */}
          <div className="lg:col-span-2 space-y-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            
            {/* Filter and Category Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Filter className="h-4 w-4 text-slate-400" />
                <span>Filter Category:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors ${
                      categoryFilter === cat 
                        ? "bg-indigo-600 text-white font-semibold shadow-sm" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu items list table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left text-gray-500 divide-y divide-gray-100">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Dish Info</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-center">In-Stock Pantry</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        No culinary items defined in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-slate-100 p-1.5 rounded-xl border border-slate-200">{item.image}</span>
                            <div>
                              <span className="font-bold text-slate-800 text-sm block leading-tight">{item.name}</span>
                              <span className="text-slate-400 text-[10px] font-mono">ID: {item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">{item.category}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-800 text-sm">${item.price.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                const newPriceStr = prompt(`Set new price for ${item.name}:`, String(item.price));
                                if (newPriceStr !== null) {
                                  const p = parseFloat(newPriceStr);
                                  if (!isNaN(p) && p > 0) onUpdateMenuItem(item.id, { price: p });
                                }
                              }}
                              className="text-indigo-600 hover:underline font-mono text-[10px] ml-1"
                            >
                              [Edit]
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onUpdateMenuItem(item.id, { stock: Math.max(0, item.stock - 5) })}
                              className="w-5 h-5 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 text-xs font-bold rounded flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`font-bold font-mono text-sm w-8 ${item.stock < 10 ? "text-red-500" : "text-slate-800"}`}>
                              {item.stock}
                            </span>
                            <button
                              onClick={() => onUpdateMenuItem(item.id, { stock: item.stock + 5 })}
                              className="w-5 h-5 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 text-xs font-bold rounded flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove "${item.name}" from the active menu?`)) {
                                onDeleteMenuItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 border border-slate-100 hover:border-red-100 rounded-lg transition-all"
                            title="Delete Item"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create new culinary dish form */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-3">
                <Plus className="h-4.5 w-4.5 text-indigo-600" />
                Add New Culinary Item
              </h3>

              <form onSubmit={handleCreateMenuItem} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Dish Name *</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Eggs Benedict, Sirloin Steak"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Category</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch/Dinner">Lunch/Dinner</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Emoji Icon</label>
                    <select
                      value={newItemImage}
                      onChange={(e) => setNewItemImage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                    >
                      <option value="🍳">🍳 Egg (Breakfast)</option>
                      <option value="🥞">🥞 Pancakes (Breakfast)</option>
                      <option value="🥪">🥪 Sandwich (Lunch)</option>
                      <option value="🍔">🍔 Burger (Lunch)</option>
                      <option value="🥩">🥩 Steak (Dinner)</option>
                      <option value="🐟">🐟 Fish (Dinner)</option>
                      <option value="🍕">🍕 Pizza (Lunch/Dinner)</option>
                      <option value="🍜">🍜 Noodles (Dinner)</option>
                      <option value="🍊">🍊 Juice (Beverage)</option>
                      <option value="☕">☕ Coffee (Beverage)</option>
                      <option value="🍷">🍷 Wine (Beverage)</option>
                      <option value="🍰">🍰 Cake (Dessert)</option>
                      <option value="🍦">🍦 Ice Cream (Dessert)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Price ($ USD) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-semibold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="22.50"
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Initial Stock</label>
                    <input
                      type="number"
                      value={newItemStock}
                      onChange={(e) => setNewItemStock(e.target.value)}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-red-500 font-semibold text-[10px] mt-1">{formError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add to Active Catalog
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
