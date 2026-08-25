"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileCheck, ShieldCheck, Download, Search, Filter, Award, 
  ExternalLink, CalendarDays, Plus, RefreshCw, ChevronRight, 
  Eye, CheckCircle2 
} from "lucide-react";
import { ComplianceCertificate, getComplianceCertificates } from "@/services/compliance";
import IssueCertificateModal from "@/components/dashboard/IssueCertificateModal";
import CertificateDetailDrawer from "@/components/dashboard/CertificateDetailDrawer";

export default function ComplianceCertificates() {
  const [certificates, setCertificates] = useState<ComplianceCertificate[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedCertForDrawer, setSelectedCertForDrawer] = useState<ComplianceCertificate | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const data = await getComplianceCertificates(params);
      setCertificates(data);
    } catch (err) {
      console.error("Failed to load certificates", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleOpenDetail = (cert: ComplianceCertificate) => {
    setSelectedCertForDrawer(cert);
    setIsDetailDrawerOpen(true);
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Award className="text-blue-500" />
            Compliance Certificates Vault
          </h1>
          <p className="text-gray-500 mt-1">Official repository for awarded regulatory certificates, environmental permits, and fitness approvals.</p>
        </div>

        <button 
          onClick={() => setIsIssueModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold cursor-pointer"
        >
          <Plus size={16} />
          Issue Certificate
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search certificates by title, ID or authority..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchCertificates}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Active', 'Expiring Soon', 'Expired'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setSelectedStatus(filter)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                selectedStatus === filter 
                  ? 'bg-[#022C4F] text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Cards Grid */}
      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-400">
          <Award size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-gray-700">No compliance certificates found.</p>
          <p className="text-xs text-gray-400 mt-1">Issue a new statutory certificate to begin vault archival.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {certificates.map((cert, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={cert.id}
              onClick={() => handleOpenDetail(cert)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer relative"
            >
              {/* Certificate Header / Seal Area */}
              <div className="h-32 bg-gradient-to-br from-[#022C4F] to-[#01182E] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>
                
                {/* Decorative Seal */}
                <div className="w-24 h-24 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center relative z-10">
                  <div className="w-20 h-20 rounded-full border border-blue-400/40 bg-blue-400/20 flex items-center justify-center">
                    <ShieldCheck size={32} className="text-blue-300" />
                  </div>
                </div>
                
                {/* Status Badge Overlaid */}
                <div className="absolute top-4 right-4 z-20">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border shadow-sm backdrop-blur-sm ${
                    cert.status === 'Active' ? 'bg-emerald-500/90 text-white border-emerald-400' :
                    'bg-amber-500/90 text-white border-amber-400'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{cert.certificate_reference}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">{cert.category}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-sm font-semibold text-gray-500 mb-6">{cert.authority}</p>

                <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-100 pt-5">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Issued On</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <CalendarDays size={14} className="text-gray-400" /> {cert.issue_date}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Valid Until</span>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${cert.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      <CalendarDays size={14} /> {cert.expiry_date}
                    </div>
                  </div>
                </div>

                {/* Bottom View Details Action Bar */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} /> View Credentials & Actions
                  </span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals & Sidepops */}
      <IssueCertificateModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={fetchCertificates}
      />

      <CertificateDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        certificate={selectedCertForDrawer}
      />
    </div>
  );
}
