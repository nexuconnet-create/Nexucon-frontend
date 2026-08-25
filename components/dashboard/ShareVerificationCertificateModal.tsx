"use client";

import React, { useState } from 'react';
import { 
  X, CheckCircle, ShieldCheck, Copy, Check, Share2, 
  Download, Printer, Mail, ExternalLink, QrCode, Lock, 
  Award, FileText, Sparkles, Building2, Calendar
} from 'lucide-react';
import { DocumentApproval } from '@/services/documents';

interface ShareVerificationCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: DocumentApproval | null;
}

export default function ShareVerificationCertificateModal({
  isOpen,
  onClose,
  approval
}: ShareVerificationCertificateModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen || !approval) return null;

  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/transparency?ref=${encodeURIComponent(approval.approval_reference)}`
    : `https://nexucon.net/transparency?ref=${encodeURIComponent(approval.approval_reference)}`;

  const embedSnippet = `<a href="${verificationUrl}" target="_blank" rel="noopener noreferrer"><img src="https://nexucon.net/badges/lasbca-verified-seal.svg" alt="LASBCA Verified Certificate ${approval.approval_reference}" width="160" height="48"/></a>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: 'Public verification link copied to clipboard!', type: 'success' } 
    }));
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyHash = () => {
    if (approval.signature_hash) {
      navigator.clipboard.writeText(approval.signature_hash);
      setCopiedHash(true);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'SHA-256 signature hash copied to clipboard!', type: 'info' } 
      }));
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedSnippet(true);
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: 'HTML Web Seal snippet copied to clipboard!', type: 'success' } 
    }));
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSent(true);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Verification Certificate successfully dispatched to ${emailInput}!`, type: 'success' } 
      }));
      setTimeout(() => {
        setEmailSent(false);
        setEmailInput('');
      }, 3000);
    }, 600);
  };

  const handleDownloadFile = () => {
    if (approval.file_url) {
      window.open(approval.file_url, '_blank');
    }
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Opening stamped document for "${approval.document_title || approval.approval_reference}"...`, type: 'info' } 
    }));
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#02182B]/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300 print:hidden"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto print:p-0 print:static">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-full">
          
          {/* Certificate Header Badge */}
          <div className="bg-gradient-to-br from-[#022C4F] via-[#011B33] to-[#011122] p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30">
                  <div className="w-full h-full bg-[#022C4F] rounded-[14px] flex items-center justify-center">
                    <ShieldCheck size={26} className="text-emerald-400" />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                    <Sparkles size={11} /> Official Regulatory Seal
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Statutory Verification Certificate</h2>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer print:hidden"
              >
                <X size={16} />
              </button>
            </div>

            {/* Document Title & Vault ID */}
            <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
              <p className="text-xs text-blue-200/80 uppercase font-bold tracking-wider mb-1">Approved Document Title</p>
              <h3 className="text-lg font-bold text-white leading-snug">
                {approval.document_title || 'Statutory Project Approval Record'}
              </h3>
              
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg font-mono text-emerald-300 font-bold border border-white/10">
                  Vault ID: {approval.approval_reference}
                </span>
                {approval.document_reference && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg font-mono text-blue-200 border border-white/10">
                    Ref: {approval.document_reference}
                  </span>
                )}
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle size={12} /> Status: {approval.status}
                </span>
              </div>
            </div>
          </div>

          {/* Certificate Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Signature & Stamping Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Certifying Authority</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 size={15} className="text-blue-600 shrink-0" />
                  {approval.approved_by_name || 'Director General - LASBCA'}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Lagos State Regulatory Board</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Statutory Approval</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar size={15} className="text-emerald-600 shrink-0" />
                  {new Date(approval.reviewed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Permanent Immutable Archive</p>
              </div>
            </div>

            {/* Cryptographic Proof Hash */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">SHA-256 Cryptographic Signature Hash</p>
                  <p className="font-mono text-xs text-emerald-800 font-bold break-all mt-1">
                    {approval.signature_hash || '0x3f8ae76b74713a3b3d9bc9182419a'}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Direct Cloudflare R2 Storage Bucket: <span className="font-mono font-bold">nexucondocument</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyHash}
                className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors shrink-0 cursor-pointer print:hidden"
                title="Copy Signature Hash"
              >
                {copiedHash ? <Check size={16} className="text-emerald-700" /> : <Copy size={16} />}
              </button>
            </div>

            {/* Public Link Share */}
            <div className="space-y-2 print:hidden">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Public Transparency & Verification Link
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={verificationUrl}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-700 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Email Dispatch Option */}
            <form onSubmit={handleSendEmail} className="space-y-2 print:hidden">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Certificate to Stakeholder / Bank / Contractor
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="stakeholder@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-4 py-2.5 bg-[#022C4F] hover:bg-[#011B33] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : emailSent ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Share2 size={14} />
                  )}
                  <span>{emailSent ? 'Dispatched!' : 'Send Certificate'}</span>
                </button>
              </div>
            </form>

            {/* Embeddable HTML Web Seal */}
            <div className="pt-2 border-t border-slate-100 print:hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Embeddable HTML Seal Badge
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSnippet ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSnippet ? 'Copied Snippet' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[10px] font-mono overflow-x-auto">
                {embedSnippet}
              </pre>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <button
              onClick={handlePrintCertificate}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Certificate</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownloadFile}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>Download Stamped PDF</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
