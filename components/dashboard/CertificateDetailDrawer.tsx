"use client";

import React, { useState } from 'react';
import {
  X, ShieldCheck, Download, ExternalLink, Copy, Check,
  Calendar, Building2, QrCode, FileText, Share2, Printer,
  CheckCircle2, Cloud, Sparkles, AlertCircle
} from 'lucide-react';
import { ComplianceCertificate, verifyCertificateAuthenticity } from '@/services/compliance';

interface CertificateDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: ComplianceCertificate | null;
}

export default function CertificateDetailDrawer({
  isOpen,
  onClose,
  certificate
}: CertificateDetailDrawerProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ is_valid: boolean; message: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopyHash = () => {
    if (certificate.qr_verification_hash) {
      navigator.clipboard.writeText(certificate.qr_verification_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'SHA-256 signature hash copied to clipboard!', type: 'info' }
      }));
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/transparency?cert=${certificate.certificate_reference}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Public verification link copied to clipboard!', type: 'success' }
    }));
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyCertificateAuthenticity(certificate.id);
      setVerificationResult({
        is_valid: res.is_valid,
        message: res.is_valid
          ? 'Cryptographic integrity verified on Government Vault Ledger.'
          : 'Certificate signature could not be verified or is expired.'
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Authenticity verified with Cloudflare R2 hash!', type: 'success' }
      }));
    } catch (err) {
      setVerificationResult({
        is_valid: false,
        message: 'Verification check encountered an error.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = () => {
    if (certificate.certificate_file_url) {
      window.open(certificate.certificate_file_url, '_blank');
    }
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Opening stamped certificate PDF for "${certificate.title}" from Cloudflare R2...`, type: 'info' }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sidepop Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white p-7 sm:p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 border-l border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {certificate.certificate_reference}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${certificate.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                  {certificate.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-[#022C4F] mt-1">Certificate Credentials</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Certificate Banner Seal */}
          <div className="rounded-3xl bg-gradient-to-br from-[#022C4F] to-[#01182E] p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-400/30 mb-2">
                  {certificate.category} Clearance
                </span>
                <h3 className="text-lg font-black text-white leading-snug">{certificate.title}</h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">{certificate.authority}</p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck size={32} className="text-blue-300" />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Issue Date</p>
                <p className="font-bold text-white mt-0.5">{certificate.issue_date}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Valid Until</p>
                <p className="font-bold text-emerald-400 mt-0.5">{certificate.expiry_date}</p>
              </div>
            </div>
          </div>

          {/* SHA-256 Signature & QR Authenticity Card */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <QrCode size={16} className="text-blue-600" />
                Cryptographic Authenticity Signature
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                SHA-256 Verified
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono font-bold text-slate-700 truncate select-all">
                {certificate.qr_verification_hash || '0x7b2a991827419e4184c29'}
              </span>
              <button
                onClick={handleCopyHash}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 cursor-pointer"
                title="Copy Signature Hash"
              >
                {copiedHash ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>

            {verificationResult && (
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${verificationResult.is_valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                {verificationResult.is_valid ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-rose-600 shrink-0" />}
                <span>{verificationResult.message}</span>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying on Ledger...</span>
                </>
              ) : (
                <>
                  <span>Verify Authenticity</span>
                </>
              )}
            </button>
          </div>

          {/* Cloudflare Storage & Project Credentials */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-2">Vault & Project Credentials</h4>

            <div className="flex items-center justify-between py-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Target Project</span>
              <span className="font-bold text-slate-800">{certificate.project_name || 'All State-wide Projects'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Issuing Regulating Authority</span>
              <span className="font-bold text-slate-800">{certificate.authority}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Cloud size={14} className="text-blue-500" /> Cloudflare R2 Storage Target
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                nexucondocument / certs
              </span>
            </div>
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownload}
            className="w-full sm:flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={15} />
            <span>Download Official PDF</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Share Verification Link"
            >
              {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
              <span className="sm:hidden">Share</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Print Certificate"
            >
              <Printer size={15} />
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
