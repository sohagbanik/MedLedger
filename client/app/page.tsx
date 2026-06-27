"use client";

import { useState } from "react";
import { Meteors } from "@/components/ui/meteors";
import Navbar from "@/components/Navbar";
import ContractUI from "@/components/Contract";
import FeedbackModal from "@/components/FeedbackModal";
import { useWallet } from "@/contexts/WalletContext";

export default function Home() {
  const { address, isConnecting, networkError, connect, disconnect } = useWallet();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#050510] overflow-hidden">
      {/* Meteors */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Meteors number={12} />
      </div>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#34d399]/15 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#4fc3f7]/12 blur-[120px] animate-float-delayed" />
      </div>

      {/* Navbar */}
      <Navbar
        walletAddress={address}
        onConnect={connect}
        onDisconnect={disconnect}
        isConnecting={isConnecting}
      />

      {networkError && (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-4 animate-fade-in-down">
          <div className="flex items-center gap-3 rounded-xl border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-4 py-3 backdrop-blur-sm">
            <span className="text-[#fbbf24]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span className="text-sm font-medium text-[#fbbf24]/90">{networkError}</span>
          </div>
        </div>
      )}

      {/* Hero + Content */}
      <main className="relative z-10 flex flex-1 w-full max-w-5xl mx-auto flex-col items-center px-6 pt-10 pb-16">
        {/* Hero — compact */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-white/50 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" />
            </span>
            Powered by Soroban on Stellar
          </div>

          <h1 className="mb-3">
            <span className="block text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              <span className="text-white">Medical Records </span>
              <span className="bg-gradient-to-r from-[#34d399] via-[#4fc3f7] to-[#34d399] bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                on the Blockchain
              </span>
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-sm sm:text-base leading-relaxed text-white/40">
            Register as a patient, add medical records, and control who can view them — all on Stellar.
          </p>

          {/* Permissionless badge */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#34d399]/20 bg-[#34d399]/[0.05] px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" />
            </span>
            <span className="text-xs text-[#34d399]/80">100% Permissionless — No admin, no approval needed</span>
          </div>

          {/* Inline stats */}
          <div className="mt-6 flex items-center justify-center gap-6 sm:gap-10 animate-fade-in-up-delayed">
            {[
              { label: "Finality", value: "~5s" },
              { label: "Cost", value: "<$0.01" },
              { label: "Network", value: "Testnet" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg sm:text-xl font-bold text-white/90 font-mono">{stat.value}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contract UI */}
        <ContractUI
          walletAddress={address}
          onConnect={connect}
          isConnecting={isConnecting}
        />

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in">
          {/* Medical records flow */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/20">
            {["Register", "Add Record", "View Records", "Grant Access"].map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === 0
                        ? "bg-[#7c6cf0]/50"
                        : i === 1
                          ? "bg-[#fbbf24]/50"
                          : i === 2
                            ? "bg-[#4fc3f7]/50"
                            : "bg-[#34d399]/50"
                    }`}
                  />
                  <span className="font-mono">{step}</span>
                </span>
                {i < 3 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/10">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] text-white/15">
            <span>Stellar Network</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Freighter Wallet</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Soroban Smart Contracts</span>
          </div>

          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="mt-4 rounded-full border border-[#4fc3f7]/30 bg-[#4fc3f7]/10 px-6 py-2 text-xs font-semibold text-[#4fc3f7] transition-all hover:bg-[#4fc3f7]/20 active:scale-95"
          >
            Leave Feedback
          </button>
        </div>
      </main>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
