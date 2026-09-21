"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Download,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  ExternalLink,
  X,
  Lock,
} from "lucide-react";

export default function StakeholderFinancialsPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "escrow">("invoices");
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<"remita" | "paystack" | "flutterwave">("remita");

  const invoices = [
    {
      invoiceNumber: "INV-2026-0054",
      project: "Eko Atlantic Horizon Towers",
      feeCategory: "Stage 3 Structural Audit Levy",
      amountNgn: 2400000,
      amountFormatted: "₦2,400,000",
      issuedDate: "15 Sep 2026",
      dueDate: "25 Sep 2026",
      status: "DUE",
      beneficiary: "Lagos State Building Control Agency (LASBCA Revenue Account)",
      breakdown: [
        { desc: "Mandatory Stage 3 Field Audit Tariff", amt: "₦1,800,000" },
        { desc: "Ultrasonic NDT & Rebar Meter Surcharge", amt: "₦600,000" },
      ],
    },
    {
      invoiceNumber: "INV-2026-0052",
      project: "Victoria Island Central Commercial Hub",
      feeCategory: "EIA Environmental Assessment Tariff",
      amountNgn: 1450000,
      amountFormatted: "₦1,450,000",
      issuedDate: "10 Sep 2026",
      dueDate: "28 Sep 2026",
      status: "DUE",
      beneficiary: "Federal Ministry of Environment & EPDA",
      breakdown: [
        { desc: "Environmental Impact Assessment Review", amt: "₦1,200,000" },
        { desc: "Waterways & Drainage Clearance", amt: "₦250,000" },
      ],
    },
    {
      invoiceNumber: "INV-2026-0048",
      project: "Lekki Phase 1 Residential Estate",
      feeCategory: "Building Plan Approval Statutory Fee",
      amountNgn: 3200000,
      amountFormatted: "₦3,200,000",
      issuedDate: "01 Aug 2026",
      dueDate: "15 Aug 2026",
      status: "PAID",
      paidDate: "12 Aug 2026",
      receiptNumber: "REC-LAS-89412",
      beneficiary: "LASPPPA Revenue Portal",
      breakdown: [
        { desc: "Statutory Architectural Assessment", amt: "₦2,000,000" },
        { desc: "Zonal Development Levy", amt: "₦1,200,000" },
      ],
    },
    {
      invoiceNumber: "INV-2026-0042",
      project: "Ikoyi Waterfront Luxury Condos",
      feeCategory: "Stage 2 Deep Foundation Inspection",
      amountNgn: 1800000,
      amountFormatted: "₦1,800,000",
      issuedDate: "10 Jul 2026",
      dueDate: "24 Jul 2026",
      status: "PAID",
      paidDate: "20 Jul 2026",
      receiptNumber: "REC-LAS-77319",
      beneficiary: "LASBCA Field Operations Account",
      breakdown: [
        { desc: "Piling Integrity Test (PIT) Verification", amt: "₦1,800,000" },
      ],
    },
  ];

  const escrowMilestones = [
    {
      id: "ESC-01",
      contractor: "Julius Berger Nigeria Plc",
      project: "Eko Atlantic Horizon Towers",
      deliverable: "Level 1 to 3 Reinforced Concrete Slab Pour",
      heldAmount: "₦45,000,000",
      statutoryInspectionRef: "INS-STG-2026-041",
      inspectionStatus: "Pending Pass (Scheduled Today)",
      isEligibleForRelease: false,
    },
    {
      id: "ESC-02",
      contractor: "Cappa & D'Alberto Plc",
      project: "Victoria Island Central Commercial Hub",
      deliverable: "Level 4 Floor Slab Concrete Pour",
      heldAmount: "₦32,000,000",
      statutoryInspectionRef: "INS-STG-2026-039",
      inspectionStatus: "Passed with Conditions",
      isEligibleForRelease: true,
    },
  ];

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.project.toLowerCase().includes(search.toLowerCase()) ||
    inv.feeCategory.toLowerCase().includes(search.toLowerCase())
  );

  const handlePayClick = (inv: any) => {
    setSelectedInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  const handleExecutePayment = () => {
    setIsPaymentModalOpen(false);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: `Payment of ${selectedInvoice?.amountFormatted} processed successfully via ${paymentGateway.toUpperCase()}! Official receipt issued.`, 
        type: "success" 
      }
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider mb-2">
            <CreditCard size={14} />
            Pillar 3 &bull; Financial Activities & Statutory Revenue Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
            Statutory Levies & Invoicing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Official government assessment fees, building plan levies, and contractor milestone escrow releases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "invoices"
                  ? "bg-white text-[#022C4F] shadow-sm"
                  : "text-gray-500 hover:text-[#022C4F]"
              }`}
            >
              Statutory Invoices
            </button>
            <button
              onClick={() => setActiveTab("escrow")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "escrow"
                  ? "bg-white text-[#022C4F] shadow-sm"
                  : "text-gray-500 hover:text-[#022C4F]"
              }`}
            >
              Contractor Escrow
            </button>
          </div>
        </div>
      </div>

      {activeTab === "invoices" ? (
        <>
          {/* Search Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number, project, fee category..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
              />
            </div>
          </div>

          {/* Invoices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {filteredInvoices.map((inv, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-gray-400">{inv.invoiceNumber}</span>
                      <h3 className="text-base font-bold text-[#022C4F] mt-0.5">{inv.project}</h3>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">{inv.feeCategory}</div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        inv.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 my-4 space-y-2 text-xs">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Statutory Fee Items
                    </div>
                    {inv.breakdown.map((b, bIdx) => (
                      <div key={bIdx} className="flex justify-between items-center text-gray-600">
                        <span>{b.desc}</span>
                        <span className="font-bold text-[#022C4F]">{b.amt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    Beneficiary: <strong className="text-gray-700">{inv.beneficiary}</strong>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Total Due</div>
                    <div className="text-lg font-extrabold text-[#022C4F]">{inv.amountFormatted}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === "DUE" ? (
                      <button
                        onClick={() => handlePayClick(inv)}
                        className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        Proceed to Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('show-toast', {
                          detail: { message: `Downloading Official Treasury Receipt ${inv.receiptNumber}...`, type: "success" }
                        }))}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Receipt ({inv.receiptNumber})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Escrow Tab */
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 leading-relaxed">
            <strong>Statutory Milestone Escrow Governance:</strong> Contractor milestone disbursements are securely held in escrow and can only be authorized for release once the corresponding government inspection certificate has been digitally signed off.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {escrowMilestones.map((esc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold text-gray-400">{esc.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        esc.isEligibleForRelease
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {esc.isEligibleForRelease ? "Eligible for Release" : "Held in Escrow"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#022C4F]">{esc.contractor}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">{esc.project}</div>
                  <div className="text-xs font-semibold text-blue-700 mt-2">{esc.deliverable}</div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 my-4 text-xs space-y-1">
                    <div className="flex justify-between text-gray-500">
                      <span>Inspection Reference:</span>
                      <span className="font-mono font-bold text-[#022C4F]">{esc.statutoryInspectionRef}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Government Audit Status:</span>
                      <span className="font-bold text-emerald-600">{esc.inspectionStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Escrow Sum</div>
                    <div className="text-lg font-extrabold text-[#022C4F]">{esc.heldAmount}</div>
                  </div>

                  <button
                    disabled={!esc.isEligibleForRelease}
                    onClick={() => window.dispatchEvent(new CustomEvent('show-toast', {
                      detail: { message: `Escrow payment of ${esc.heldAmount} released to ${esc.contractor}!`, type: "success" }
                    }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      esc.isEligibleForRelease
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Release Escrow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-[#022C4F] text-white flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <CreditCard size={18} /> Statutory Payment Checkout
                </h3>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <div className="text-xs text-gray-400">{selectedInvoice.feeCategory}</div>
                  <div className="text-2xl font-extrabold text-[#022C4F] my-1">
                    {selectedInvoice.amountFormatted}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{selectedInvoice.invoiceNumber}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#022C4F]">Select Payment Gateway</label>
                  <div className="space-y-2">
                    {[
                      { id: "remita", name: "Remita e-Payment", desc: "Government Treasury & Statutory Account" },
                      { id: "paystack", name: "Paystack Checkout", desc: "Cards, Bank Transfer & USSD" },
                      { id: "flutterwave", name: "Flutterwave for Business", desc: "Multi-currency & Direct Debit" },
                    ].map(gw => (
                      <div
                        key={gw.id}
                        onClick={() => setPaymentGateway(gw.id as any)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          paymentGateway === gw.id
                            ? "border-[#022C4F] bg-blue-50/50 shadow-xs"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[#022C4F]">{gw.name}</div>
                          <div className="text-[11px] text-gray-500">{gw.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentGateway === gw.id ? "border-[#022C4F]" : "border-gray-300"
                        }`}>
                          {paymentGateway === gw.id && <div className="w-2 h-2 rounded-full bg-[#022C4F]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-1/3 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    className="w-2/3 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock size={14} />
                    <span>Authorize Payment</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
