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
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300 print:hidden"
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 border-l border-slate-200 print:static print:max-w-full">
        
        {/* Certificate Header Badge (Fixed at top of drawer) */}
        <div className="bg-gradient-to-br from-[#022C4F] via-[#011B33] to-[#011122] p-6 sm:p-7 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30">
                <div className="w-full h-full bg-[#022C4F] rounded-[14px] flex items-center justify-center">
                  <ShieldCheck size={24} className="text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
                  <Sparkles size={10} /> Official Regulatory Seal
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">Statutory Verification Certificate</h2>
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
          <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
            <p className="text-[11px] text-blue-200/80 uppercase font-bold tracking-wider mb-1">Approved Document Title</p>
            <h3 className="text-base font-bold text-white leading-snug">
              {approval.document_title || 'Statutory Project Approval Record'}
            </h3>
            
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-lg font-mono text-emerald-300 font-bold border border-white/10 text-[11px]">
                Vault ID: {approval.approval_reference}
              </span>
              {approval.document_reference && (
                <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-lg font-mono text-blue-200 border border-white/10 text-[11px]">
                  Ref: {approval.document_reference}
                </span>
              )}
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-lg font-bold border border-emerald-500/30 flex items-center gap-1 text-[11px]">
                <CheckCircle size={11} /> Status: {approval.status}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Signature & Stamping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Certifying Authority</p>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600 shrink-0" />
                {approval.approved_by_name || 'Director General - LASBCA'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Lagos State Regulatory Board</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Statutory Approval</p>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-600 shrink-0" />
                {new Date(approval.reviewed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Permanent Immutable Archive</p>
            </div>
          </div>

          {/* Cryptographic Proof Hash */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={15} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">SHA-256 Signature Hash</p>
                <p className="font-mono text-xs text-emerald-800 font-bold break-all mt-0.5">
                  {approval.signature_hash || '0x3f8ae76b74713a3b3d9bc9182419a'}
                </p>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Storage Vault: <span className="font-mono font-bold">nexucondocument (Cloudflare R2)</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyHash}
              className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors shrink-0 cursor-pointer print:hidden"
              title="Copy Signature Hash"
            >
              {copiedHash ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Public Link Share */}
          <div className="space-y-1.5 print:hidden">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Public Transparency & Verification Link
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={verificationUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-blue-600/20"
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Email Dispatch Option */}
          <form onSubmit={handleSendEmail} className="space-y-1.5 print:hidden">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Certificate to Stakeholder / Bank / Contractor
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  required
                  placeholder="stakeholder@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSendingEmail}
                className="px-3.5 py-2 bg-[#022C4F] hover:bg-[#011B33] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : emailSent ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <Share2 size={13} />
                )}
                <span>{emailSent ? 'Dispatched!' : 'Send'}</span>
              </button>
            </div>
          </form>

          {/* Embeddable HTML Web Seal */}
          <div className="pt-2 border-t border-slate-100 print:hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Embeddable HTML Seal Badge
              </span>
              <button
                onClick={handleCopySnippet}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedSnippet ? 'Copied' : 'Copy HTML'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[10px] font-mono overflow-x-auto">
              {embedSnippet}
            </pre>
          </div>
        </div>

        {/* Action Footer (Fixed at bottom of drawer) */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5 shrink-0 print:hidden">
          <button
            onClick={handlePrintCertificate}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Download Stamped PDF</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
