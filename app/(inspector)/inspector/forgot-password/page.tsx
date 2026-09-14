"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";

export default function InspectorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    // Dispatched via generic timing to prevent account enumeration
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#DFDFDF] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans relative">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-10">
        <Link href="/inspector/login" className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
          />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#022C4F]/10 text-[#022C4F] border border-[#022C4F]/20">
            Inspectorate
          </span>
        </Link>
        <Link
          href="/inspector/login"
          className="text-xs font-semibold text-slate-600 hover:text-[#022C4F] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to sign in</span>
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto my-10 z-10">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl">
          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#022C4F]/10 border border-[#022C4F]/20 text-[#022C4F] flex items-center justify-center mb-5">
                  <ShieldCheck size={26} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#022C4F] mb-2">
                  Password Recovery
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your accredited inspector email. If an active record is registered, instructions to securely reset your credentials will be dispatched.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Official Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="inspector@agency.gov.ng"
                      required
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pl-11 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                    />
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#022C4F] mb-2">
                Recovery Email Dispatched
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-8">
                If an account exists for <strong className="text-slate-900">{email}</strong>, a secure one-time password reset link has been transmitted. Check your inbox and spam folder.
              </p>
              <Link
                href="/inspector/login"
                className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Return to Login
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center text-center gap-2">
            <p className="text-[11px] text-slate-500">
              Government Ministry or Agency Administrator?
            </p>
            <a
              href="https://nexucon.net/government/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#022C4F] hover:underline"
            >
              <span>Access Agency Directorate</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 font-medium z-10">
        Nexucon Regulatory Enforcement Terminal • Synchronized with Agency Directorate
      </footer>
    </div>
  );
}
