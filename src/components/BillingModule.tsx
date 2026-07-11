import React, { useState } from "react";
import { FolioCharge, Guest } from "../types";
import { CreditCard, DollarSign, Printer, Percent, PlusCircle, User, ArrowRight, ShieldCheck } from "lucide-react";

interface BillingModuleProps {
  guests: Guest[];
  folios: { [roomNumber: string]: FolioCharge[] };
  onAddCharge: (roomNumber: string, charge: { description: string; amount: number; category: FolioCharge["category"] }) => void;
}

export default function BillingModule({ guests, folios, onAddCharge }: BillingModuleProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("101");
  const [chargeDesc, setChargeDesc] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeCategory, setChargeCategory] = useState<FolioCharge["category"]>("Mini Bar");
  const [splitCount, setSplitCount] = useState(1);
  const [paymentGateway, setPaymentGateway] = useState<"Stripe" | "PayPal" | "Flutterwave" | "M-Pesa">("Stripe");

  const currentFolio = folios[selectedRoom] || [];
  const activeGuest = guests.find(g => g.roomNumber === selectedRoom && g.status === "checked-in");

  const handleAddChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeDesc || !chargeAmount) return;
    onAddCharge(selectedRoom, {
      description: chargeDesc,
      amount: Number(chargeAmount),
      category: chargeCategory
    });
    setChargeDesc("");
    setChargeAmount("");
    alert(`Successfully added charge of $${Number(chargeAmount).toFixed(2)} to Room ${selectedRoom} folio!`);
  };

  const calculateSubtotal = () => currentFolio.reduce((sum, item) => sum + item.amount, 0);
  const calculateTax = () => calculateSubtotal() * 0.12; // 12% Hospitality Tax
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handlePrintMockInvoice = () => {
    if (!activeGuest) return;
    const printContent = `
========================================
     AENZBI IPTV HOSPITALITY GROUP      
       Grand Royal Hotel London         
========================================
Guest Name: ${activeGuest.name}
Room Number: Room ${selectedRoom}
Checked In: ${activeGuest.checkInDate}
Expected Out: ${activeGuest.checkOutDate}
----------------------------------------
Charges:
${currentFolio.map(f => `- [${f.date}] ${f.description}: $${f.amount.toFixed(2)}`).join("\n")}
----------------------------------------
Subtotal: $${calculateSubtotal().toFixed(2)}
Hotel VAT/Tax (12%): $${calculateTax().toFixed(2)}
TOTAL FOLIO SETTLEMENT: $${calculateTotal().toFixed(2)}
========================================
     Thank you for your residence!      
========================================
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<pre style="font-family: monospace; font-size: 13px; line-height: 1.5; padding: 20px;">${printContent}</pre>`);
      win.document.close();
    } else {
      alert("In-browser PDF popup blocked. Direct print payload:\n" + printContent);
    }
  };

  return (
    <div className="space-y-6" id="billing-folios-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Guest Folio & Billing Engine
          </h2>
          <p className="text-sm text-slate-500 mt-1">Settle guest folios, add auxiliary spa/minibar fees, print invoices, and execute split payments</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Select Guest Room:</span>
          <select 
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-lg font-bold bg-white cursor-pointer outline-none text-slate-850"
          >
            {Object.keys(folios).map((roomNo) => (
              <option key={roomNo} value={roomNo}>Room {roomNo}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folio list and balance */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-400" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">
                    {activeGuest ? activeGuest.name : "Vacant Room Ledger"}
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Folio Reference: Room {selectedRoom}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrintMockInvoice}
                  disabled={!activeGuest}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  Print Invoice
                </button>
              </div>
            </div>

            {/* Invoices tables */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Item Description</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2 text-right">Charge Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentFolio.map((charge) => (
                    <tr key={charge.id}>
                      <td className="px-3 py-3 font-mono font-medium text-gray-400">{charge.date}</td>
                      <td className="px-3 py-3 font-semibold text-gray-800">{charge.description}</td>
                      <td className="px-3 py-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">{charge.category}</span>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-gray-900 text-right">${charge.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Balance Summary */}
            <div className="border-t border-gray-100 pt-4 flex flex-col items-end text-xs space-y-1.5 pr-3">
              <div className="flex justify-between w-64 text-gray-500 font-medium">
                <span>Subtotal Charges:</span>
                <span className="font-mono text-gray-900">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-gray-500 font-medium">
                <span>Hospitality Tax & VAT (12%):</span>
                <span className="font-mono text-gray-900">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-base font-extrabold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                <span>Total Balance Due:</span>
                <span className="font-mono text-red-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Gateway Split Sandbox */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <DollarSign className="h-4.5 w-4.5 text-gray-700" />
              Dynamic Multi-Channel Split Billing Gateway
            </h3>
            <p className="text-xs text-gray-500">
              Integrate enterprise checkout models. Partition room dues across multiple co-residents and clear balances dynamically via global processors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-gray-600 mb-1">Co-Resident Split Count</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" 
                    max="5"
                    value={splitCount}
                    onChange={(e) => setSplitCount(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs outline-none"
                  />
                  <span className="text-gray-400 font-medium">ways</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Target Payment Processor</label>
                <select 
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none bg-white font-semibold"
                >
                  <option value="Stripe">Stripe API (Credit / ApplePay)</option>
                  <option value="PayPal">PayPal Commerce Platform</option>
                  <option value="Flutterwave">Flutterwave Gateway (Africa Multi-Pay)</option>
                  <option value="M-Pesa">Safaricom M-Pesa Express</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Dispatched split payload via ${paymentGateway} SDK. Requested ${splitCount} payments of $${(calculateTotal() / splitCount).toFixed(2)} each. Success!`);
                  }}
                  className="py-2 px-4 bg-black hover:bg-gray-800 text-white rounded-lg text-center font-semibold cursor-pointer"
                >
                  Process Split ({splitCount}x)
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-mono text-gray-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                PCI-DSS Level 1 Secure Transactions Managed Server-Side
              </span>
              <span>Calculated: ${(calculateTotal() / splitCount).toFixed(2)} per guest</span>
            </div>
          </div>
        </div>

        {/* Right Column: Add Auxiliary Charges */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <PlusCircle className="h-4.5 w-4.5 text-gray-700" />
            Auxiliary Ledger Posting
          </h3>

          <form onSubmit={handleAddChargeSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-600 mb-1">Charge Category</label>
              <select
                value={chargeCategory}
                onChange={(e) => setChargeCategory(e.target.value as any)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none bg-white font-semibold"
              >
                <option value="Mini Bar">Mini Bar Consumption</option>
                <option value="Spa">Spa & Wellness booking</option>
                <option value="Laundry">Dry Cleaning & Laundry</option>
                <option value="Restaurant">In-Hotel Restaurant Charge</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">LEDGER DESCRIPTION</label>
              <input 
                type="text" 
                required
                value={chargeDesc}
                onChange={(e) => setChargeDesc(e.target.value)}
                placeholder="e.g. 2 Bottles Champagne (Mini Bar)"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1">Charge Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 font-bold text-gray-400">$</span>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="85.00"
                  className="w-full pl-6 pr-3 p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none font-mono font-bold"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold border border-gray-200 rounded-lg transition-colors cursor-pointer text-center"
            >
              Post Dues to Room {selectedRoom}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
