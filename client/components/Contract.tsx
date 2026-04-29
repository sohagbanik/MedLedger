"use client";

import { useState, useCallback, useEffect } from "react";
import {
  registerPatient,
  addRecord,
  getRecords,
  getPatient,
  isRegistered,
  hasAccess,
  grantAccess,
  revokeAccess,
  getAccessLog,
  getRecordCount,
  getWalletAddress,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: { 
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-[11px] bg-[#0a0a1a] px-4 py-3 font-mono text-sm text-white/90 outline-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0a0a1a]">
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Record Type Config ────────────────────────────────────────

const RECORD_TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; variant: "success" | "warning" | "info" }> = {
  diagnosis: { color: "text-[#f87171]", bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", dot: "bg-[#f87171]", variant: "warning" },
  treatment: { color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20", dot: "bg-[#fbbf24]", variant: "warning" },
  vaccination: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" },
  checkup: { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", variant: "info" },
  lab: { color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10", border: "border-[#a78bfa]/20", dot: "bg-[#a78bfa]", variant: "info" },
  emergency: { color: "text-[#f472b6]", bg: "bg-[#f472b6]/10", border: "border-[#f472b6]/20", dot: "bg-[#f472b6]", variant: "warning" },
};

const RECORD_TYPES = ["diagnosis", "treatment", "vaccination", "checkup", "lab", "emergency"];

// ── Types ────────────────────────────────────────────────────

interface MedicalRecord {
  id: number;
  record_type: string;
  description: string;
  notes: string;
  reporter_name: string;
  created_at: number;
}

interface PatientInfo {
  name: string;
  created_at: number;
}

interface AccessEvent {
  patient: string;
  accessor: string;
  action: string;
  timestamp: number;
}

type Tab = "register" | "add" | "view" | "access";

// ── Main Component ───────────────────────────────────────────

export default function ContractUI({ walletAddress, onConnect, isConnecting }: {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("register");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Register state
  const [patientName, setPatientName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Add record state
  const [recordPatient, setRecordPatient] = useState("");
  const [recordType, setRecordType] = useState("checkup");
  const [recordDescription, setRecordDescription] = useState("");
  const [recordNotes, setRecordNotes] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // View records state
  const [viewPatient, setViewPatient] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessEvent[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [viewPatientInfo, setViewPatientInfo] = useState<PatientInfo | null>(null);
  const [newRecordsToast, setNewRecordsToast] = useState(false);

  // Access management state
  const [accessAddress, setAccessAddress] = useState("");
  const [hasAccessGranted, setHasAccessGranted] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // ── Handlers ───────────────────────────────────────────────

  const checkPatientRegistration = useCallback(async () => {
    if (!viewPatient.trim()) return setError("Enter a patient address");
    setError(null);
    setIsLoadingRecords(true);
    try {
      const [registered, info] = await Promise.all([
        isRegistered(viewPatient.trim()),
        getPatient(viewPatient.trim()),
        getWalletAddress(),
      ]);
      if (!registered) {
        setViewPatientInfo(null);
        setRecords([]);
        setError("Patient not registered");
      } else {
        setViewPatientInfo(info);
        const walletAddr = await getWalletAddress();
        const caller = walletAddr || viewPatient.trim();
        const [recs, logs] = await Promise.all([
          getRecords(caller, viewPatient.trim()),
          getAccessLog(viewPatient.trim())
        ]);
        setRecords(Array.isArray(recs) ? recs : []);
        setAccessLogs(Array.isArray(logs) ? logs : []);
        
        // Check if viewer has access (if not the patient)
        if (walletAddr && walletAddr !== viewPatient.trim()) {
          const access = await hasAccess(viewPatient.trim(), walletAddr);
          setHasAccessGranted(access);
        } else {
          setHasAccessGranted(null);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsLoadingRecords(false);
    }
  }, [viewPatient]);

  // ── Polling for real-time updates ──
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "view" && viewPatientInfo && hasAccessGranted !== false) {
      interval = setInterval(async () => {
        try {
          const count = await getRecordCount(viewPatient.trim());
          if (count > records.length) {
            setNewRecordsToast(true);
          }
        } catch {
          // ignore polling errors
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [activeTab, viewPatientInfo, hasAccessGranted, records.length, viewPatient]);

  const handleRegister = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!patientName.trim()) return setError("Enter your name");
    setError(null);
    setIsRegistering(true);
    setTxStatus("Awaiting signature...");
    try {
      await registerPatient(walletAddress, patientName.trim());
      setTxStatus("Registered on-chain!");
      setPatientInfo({ name: patientName, created_at: Date.now() });
      setIsPatientRegistered(true);
      setPatientName("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRegistering(false);
    }
  }, [walletAddress, patientName]);

  const handleAddRecord = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!recordPatient.trim()) return setError("Enter patient address");
    if (!recordDescription.trim()) return setError("Enter description");
    if (!reporterName.trim()) return setError("Enter reporter name");
    setError(null);
    setIsAdding(true);
    setTxStatus("Awaiting signature...");
    try {
      await addRecord(
        walletAddress,
        recordPatient.trim(),
        recordType,
        recordDescription.trim(),
        recordNotes.trim(),
        reporterName.trim()
      );
      setTxStatus("Record added on-chain!");
      setRecordDescription("");
      setRecordNotes("");
      setReporterName("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsAdding(false);
    }
  }, [walletAddress, recordPatient, recordType, recordDescription, recordNotes, reporterName]);

  const handleGrantAccess = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!accessAddress.trim()) return setError("Enter accessor address");
    setError(null);
    setIsGranting(true);
    setTxStatus("Awaiting signature...");
    try {
      await grantAccess(walletAddress, accessAddress.trim());
      setTxStatus("Access granted!");
      setHasAccessGranted(true);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsGranting(false);
    }
  }, [walletAddress, accessAddress]);

  const handleRevokeAccess = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!accessAddress.trim()) return setError("Enter accessor address");
    setError(null);
    setIsRevoking(true);
    setTxStatus("Awaiting signature...");
    try {
      await revokeAccess(walletAddress, accessAddress.trim());
      setTxStatus("Access revoked!");
      setHasAccessGranted(false);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRevoking(false);
    }
  }, [walletAddress, accessAddress]);

  const handleCheckAccess = useCallback(async () => {
    if (!accessAddress.trim()) return setError("Enter accessor address");
    if (!viewPatient.trim()) return setError("Enter patient address");
    setError(null);
    setIsCheckingAccess(true);
    try {
      const access = await hasAccess(viewPatient.trim(), accessAddress.trim());
      setHasAccessGranted(access);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsCheckingAccess(false);
    }
  }, [accessAddress, viewPatient]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "register", label: "Register", icon: <UserIcon />, color: "#7c6cf0" },
    { key: "add", label: "Add Record", icon: <PlusIcon />, color: "#fbbf24" },
    { key: "view", label: "View Records", icon: <FileIcon />, color: "#4fc3f7" },
    { key: "access", label: "Access", icon: <ShieldIcon />, color: "#34d399" },
  ];

  const formatTimestamp = (ts: number | bigint) => {
    return new Date(Number(ts) * 1000).toLocaleString();
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {newRecordsToast && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#4fc3f7]/30 bg-[#4fc3f7]/10 px-4 py-3 backdrop-blur-sm animate-slide-down shadow-[0_0_20px_rgba(79,195,247,0.15)]">
          <div className="flex items-center gap-3">
            <span className="text-[#4fc3f7] animate-pulse"><AlertIcon /></span>
            <span className="text-sm font-medium text-[#4fc3f7]">New records available!</span>
          </div>
          <button 
            onClick={() => {
              setNewRecordsToast(false);
              checkPatientRegistration();
            }}
            className="text-xs font-semibold text-[#0a0a1a] bg-[#4fc3f7] px-3 py-1.5 rounded-lg hover:bg-[#4fc3f7]/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("granted") || txStatus.includes("revoked") || txStatus.includes("Registered") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#34d399]">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Medical Records System</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">Permissionless</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Register */}
            {activeTab === "register" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#7c6cf0]/15 bg-[#7c6cf0]/[0.03] px-4 py-3">
                  <p className="text-xs text-[#7c6cf0]/70">
                    <span className="font-semibold">Permissionless:</span> Anyone can register as a patient.
                    Your Stellar address becomes your identity.
                  </p>
                </div>
                <Input 
                  label="Your Name" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)} 
                  placeholder="e.g. John Doe" 
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleRegister} disabled={isRegistering} shimmerColor="#7c6cf0" className="w-full">
                    {isRegistering ? <><SpinnerIcon /> Registering...</> : <><UserIcon /> Register as Patient</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to register
                  </button>
                )}
              </div>
            )}

            {/* Add Record - PERMISSIONLESS */}
            {activeTab === "add" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#fbbf24]/15 bg-[#fbbf24]/[0.03] px-4 py-3">
                  <p className="text-xs text-[#fbbf24]/70">
                    <span className="font-semibold">No permission needed!</span> Anyone can add medical records for any registered patient.
                    This enables public health reporting.
                  </p>
                </div>
                <Input 
                  label="Patient Address" 
                  value={recordPatient} 
                  onChange={(e) => setRecordPatient(e.target.value)} 
                  placeholder="G..." 
                />
                <Select 
                  label="Record Type" 
                  value={recordType} 
                  onChange={setRecordType} 
                  options={RECORD_TYPES} 
                />
                <Input 
                  label="Description" 
                  value={recordDescription} 
                  onChange={(e) => setRecordDescription(e.target.value)} 
                  placeholder="e.g. Annual checkup - all clear" 
                />
                <Input 
                  label="Notes (optional)" 
                  value={recordNotes} 
                  onChange={(e) => setRecordNotes(e.target.value)} 
                  placeholder="Additional notes..." 
                />
                <Input 
                  label="Reporter Name" 
                  value={reporterName} 
                  onChange={(e) => setReporterName(e.target.value)} 
                  placeholder="e.g. Dr. Smith, City Clinic" 
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleAddRecord} disabled={isAdding} shimmerColor="#fbbf24" className="w-full">
                    {isAdding ? <><SpinnerIcon /> Adding...</> : <><PlusIcon /> Add Medical Record</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to add records
                  </button>
                )}
              </div>
            )}

            {/* View Records */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <Input 
                  label="Patient Address" 
                  value={viewPatient} 
                  onChange={(e) => setViewPatient(e.target.value)} 
                  placeholder="G... (enter your address to view your own records)" 
                />
                <ShimmerButton onClick={checkPatientRegistration} disabled={isLoadingRecords} shimmerColor="#4fc3f7" className="w-full">
                  {isLoadingRecords ? <><SpinnerIcon /> Loading...</> : <><FileIcon /> View Records</>}
                </ShimmerButton>

                {viewPatientInfo && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">{viewPatientInfo.name}</p>
                      <p className="text-[10px] text-white/30">Registered {formatTimestamp(viewPatientInfo.created_at)}</p>
                    </div>
                    <Badge variant="info">{records.length} records</Badge>
                  </div>
                )}

                {hasAccessGranted === false && viewPatientInfo && (
                  <div className="rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.03] px-4 py-3">
                    <p className="text-xs text-[#f87171]/70">
                      <span className="font-semibold">Access denied:</span> Ask the patient to grant you access.
                    </p>
                  </div>
                )}

                {hasAccessGranted === true && (
                  <div className="rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.03] px-4 py-3">
                    <p className="text-xs text-[#34d399]/70">
                      <span className="font-semibold">Access granted</span> to view these records.
                    </p>
                  </div>
                )}

                {records.length > 0 && (
                  <div className="space-y-3 animate-fade-in-up">
                    {records.map((record) => {
                      const cfg = RECORD_TYPE_CONFIG[record.record_type] || RECORD_TYPE_CONFIG.checkup;
                      return (
                        <div key={record.id} className={cn("rounded-xl border px-4 py-4", cfg.border, cfg.bg)}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={cfg.variant}>
                              <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", cfg.dot)} />
                              {record.record_type}
                            </Badge>
                            <span className="text-[10px] text-white/30 font-mono">#{record.id}</span>
                          </div>
                          <p className="text-sm text-white/80 mb-1">{record.description}</p>
                          {record.notes && (
                            <p className="text-xs text-white/50 mb-2">{record.notes}</p>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-white/30">
                            <span>by {record.reporter_name}</span>
                            <span>{formatTimestamp(record.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Access Logs */}
                {accessLogs.length > 0 && hasAccessGranted !== false && (
                  <div className="mt-8 space-y-4 animate-fade-in-up-delayed">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <ShieldIcon /> Access Log
                    </h4>
                    <div className="space-y-2 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {accessLogs.map((log, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0a0a1a] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10">
                            <span className={cn("h-2.5 w-2.5 rounded-full", log.action === "grant" ? "bg-[#34d399]" : "bg-[#f87171]")} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className={cn("text-xs font-semibold", log.action === "grant" ? "text-[#34d399]" : "text-[#f87171]")}>
                                Access {log.action === "grant" ? "Granted" : "Revoked"}
                              </span>
                              <span className="text-[10px] text-white/30 font-mono">{formatTimestamp(log.timestamp)}</span>
                            </div>
                            <p className="text-[10px] text-white/50 font-mono break-all">{log.accessor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Access Management */}
            {activeTab === "access" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.03] px-4 py-3">
                  <p className="text-xs text-[#34d399]/70">
                    <span className="font-semibold">Patient control:</span> Grant access to doctors or family members to view your records.
                  </p>
                </div>
                <Input 
                  label="Accessor Address (G...)" 
                  value={accessAddress} 
                  onChange={(e) => setAccessAddress(e.target.value)} 
                  placeholder="G..." 
                />
                <Input 
                  label="Your Patient Address (to check access)" 
                  value={viewPatient} 
                  onChange={(e) => setViewPatient(e.target.value)} 
                  placeholder="Your address..." 
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <ShimmerButton onClick={handleCheckAccess} disabled={isCheckingAccess} shimmerColor="#4fc3f7" className="w-full">
                    {isCheckingAccess ? <SpinnerIcon /> : <KeyIcon />} Check Access
                  </ShimmerButton>
                </div>
                
                {hasAccessGranted !== null && (
                  <div className={cn("rounded-xl border px-4 py-3", 
                    hasAccessGranted ? "border-[#34d399]/20 bg-[#34d399]/[0.05]" : "border-[#f87171]/20 bg-[#f87171]/[0.05]"
                  )}>
                    <p className={cn("text-xs", hasAccessGranted ? "text-[#34d399]/70" : "text-[#f87171]/70")}>
                      Access is <span className="font-semibold">{hasAccessGranted ? "GRANTED" : "NOT GRANTED"}</span>
                    </p>
                  </div>
                )}

                {walletAddress ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <ShimmerButton onClick={handleGrantAccess} disabled={isGranting} shimmerColor="#34d399" className="w-full">
                      {isGranting ? <SpinnerIcon /> : <CheckIcon />} Grant Access
                    </ShimmerButton>
                    <ShimmerButton onClick={handleRevokeAccess} disabled={isRevoking} shimmerColor="#f87171" className="w-full">
                      {isRevoking ? <SpinnerIcon /> : <AlertIcon />} Revoke
                    </ShimmerButton>
                  </div>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to manage access
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Medical Records &middot; Soroban &middot; Permissionless</p>
            <div className="flex items-center gap-2">
              {["Register", "Add", "View", "Access"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 3 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
