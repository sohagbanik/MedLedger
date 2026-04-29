"use client";

import { cache, cacheKey } from "@/lib/cache";
import {
  Contract,
  Networks,
  TransactionBuilder,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  signTransaction,
  setAllowed,
  isAllowed,
  requestAccess,
} from "@stellar/freighter-api";

// ============================================================
// CONSTANTS — Update these for your contract
// ============================================================

/** Your deployed Soroban contract ID */
export const CONTRACT_ADDRESS =
  "CCETBZNAQ4RL6HDW4B6WI4QD5LDRVDCGHHEEDUVFGP3RJYD45GVTWNOX";

/** Your deployed AccessLog contract ID */
export const ACCESS_LOG_CONTRACT_ADDRESS =
  "CDD2K5XOWR6G36A5SIVZ3223EJJ77IHRYXZM66Z2CYCUB2L6U3YHYY67";

/** Network passphrase (testnet by default) */
export const NETWORK_PASSPHRASE = Networks.TESTNET;

/** Soroban RPC URL */
export const RPC_URL = "https://soroban-testnet.stellar.org";

/** Horizon URL */
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

/** Network name for Freighter */
export const NETWORK = "TESTNET";

// ============================================================
// RPC Server Instance
// ============================================================

const server = new rpc.Server(RPC_URL);

// ============================================================
// Wallet Helpers
// ============================================================

export async function checkConnection(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function connectWallet(): Promise<string> {
  const connResult = await isConnected();
  if (!connResult.isConnected) {
    throw new Error("Freighter extension is not installed or not available.");
  }

  const allowedResult = await isAllowed();
  if (!allowedResult.isAllowed) {
    await setAllowed();
    await requestAccess();
  }

  const { address } = await getAddress();
  if (!address) {
    throw new Error("Could not retrieve wallet address from Freighter.");
  }
  return address;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connResult = await isConnected();
    if (!connResult.isConnected) return null;

    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) return null;

    const { address } = await getAddress();
    return address || null;
  } catch {
    return null;
  }
}

// ============================================================
// Contract Interaction Helpers
// ============================================================

/**
 * Build, simulate, and optionally sign + submit a Soroban contract call.
 */
export async function callContract(
  method: string,
  params: xdr.ScVal[] = [],
  caller: string,
  sign: boolean = true,
  contractAddress: string = CONTRACT_ADDRESS
) {
  // Wrap getAccount in its own try-catch — the Stellar SDK can throw
  // complex error objects that crash the browser tab if unhandled.
  let account;
  try {
    account = await server.getAccount(caller);
  } catch {
    throw new Error(`Account not found: ${caller.slice(0, 8)}...${caller.slice(-4)}. Make sure the account is funded on Testnet.`);
  }

  const contract = new Contract(contractAddress);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  let simulated;
  try {
    simulated = await server.simulateTransaction(tx);
  } catch {
    throw new Error(`Network error while simulating ${method}. Please try again.`);
  }

  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(
      `Simulation failed: ${(simulated as rpc.Api.SimulateTransactionErrorResponse).error}`
    );
  }

  if (!sign) {
    return simulated;
  }

  const prepared = rpc.assembleTransaction(tx, simulated).build();

  const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const txToSubmit = TransactionBuilder.fromXDR(
    signedTxXdr,
    NETWORK_PASSPHRASE
  );

  const result = await server.sendTransaction(txToSubmit);

  if (result.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${result.status}`);
  }

  let getResult = await server.getTransaction(result.hash);
  while (getResult.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResult = await server.getTransaction(result.hash);
  }

  if (getResult.status === "FAILED") {
    throw new Error("Transaction failed on chain.");
  }

  return getResult;
}

/**
 * Read-only contract call (does not require signing).
 */
export async function readContract(
  method: string,
  params: xdr.ScVal[] = [],
  caller?: string,
  contractAddress: string = CONTRACT_ADDRESS
) {
  try {
    // Use caller, or connected wallet — never use random keys (they don't exist on testnet)
    const account = caller || (await getWalletAddress());
    if (!account) {
      throw new Error("Connect your wallet to query the contract.");
    }
    const sim = await callContract(method, params, account, false, contractAddress);
    if (
      rpc.Api.isSimulationSuccess(sim as rpc.Api.SimulateTransactionSuccessResponse) &&
      (sim as rpc.Api.SimulateTransactionSuccessResponse).result
    ) {
      return scValToNative(
        (sim as rpc.Api.SimulateTransactionSuccessResponse).result!.retval
      );
    }
    return null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Contract read failed";
    throw new Error(message);
  }
}

// ============================================================
// ScVal Conversion Helpers
// ============================================================

export function toScValString(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "string" });
}

export function toScValU32(value: number): xdr.ScVal {
  return nativeToScVal(value, { type: "u32" });
}

export function toScValU64(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: "u64" });
}

export function toScValI128(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: "i128" });
}

export function toScValAddress(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

export function toScValBool(value: boolean): xdr.ScVal {
  return nativeToScVal(value, { type: "bool" });
}

// ============================================================
// Medical Records System — Contract Methods
// ============================================================

/**
 * Register caller as a patient.
 * Calls: register_patient(caller: Address, name: String)
 */
export async function registerPatient(caller: string, name: string) {
  const result = await callContract(
    "register_patient",
    [toScValAddress(caller), toScValString(name)],
    caller,
    true
  );
  // Invalidate registration cache so subsequent reads reflect new state
  cache.delete(cacheKey("is_registered", caller));
  cache.delete(cacheKey("get_patient", caller));
  return result;
}

/**
 * PERMISSIONLESS: Add a medical record for any registered patient.
 * Anyone can call this - no permission required.
 * Calls: add_record(patient: Address, record_type: String, description: String, notes: String, reporter_name: String) -> u64
 */
export async function addRecord(
  caller: string,
  patient: string,
  recordType: string,
  description: string,
  notes: string,
  reporterName: string
) {
  const result = await callContract(
    "add_record",
    [
      toScValAddress(patient),
      toScValString(recordType),
      toScValString(description),
      toScValString(notes),
      toScValString(reporterName),
    ],
    caller,
    true
  );
  // Invalidate records cache so next view fetches fresh data
  cache.delete(cacheKey("get_records", caller, patient));
  cache.delete(cacheKey("get_record_count", patient));
  return result;
}

/**
 * Grant access to another address to view caller's records.
 * Calls: grant_access(caller: Address, accessor: Address)
 */
export async function grantAccess(caller: string, accessor: string) {
  const result = await callContract(
    "grant_access",
    [toScValAddress(caller), toScValAddress(accessor)],
    caller,
    true
  );
  // Invalidate access cache
  cache.delete(cacheKey("has_access", caller, accessor));
  return result;
}

/**
 * Revoke access from another address.
 * Calls: revoke_access(caller: Address, accessor: Address)
 */
export async function revokeAccess(caller: string, accessor: string) {
  const result = await callContract(
    "revoke_access",
    [toScValAddress(caller), toScValAddress(accessor)],
    caller,
    true
  );
  cache.delete(cacheKey("has_access", caller, accessor));
  return result;
}

/**
 * Get a specific medical record.
 * Calls: get_record(caller: Address, patient: Address, record_id: u64) -> MedicalRecord | null
 */
export async function getRecord(
  caller: string,
  patient: string,
  recordId: number
) {
  return readContract(
    "get_record",
    [toScValAddress(caller), toScValAddress(patient), toScValU64(BigInt(recordId))],
    caller
  );
}

/**
 * Get all medical records for a patient.
 * Calls: get_records(caller: Address, patient: Address) -> Vec<MedicalRecord>
 */
export async function getRecords(caller: string, patient: string) {
  return readContract(
    "get_records",
    [toScValAddress(caller), toScValAddress(patient)],
    caller
  );
}

/**
 * Check if an address is registered as a patient.
 * Calls: is_registered(patient: Address) -> bool
 */
export async function isRegistered(patient: string) {
  const key = cacheKey("is_registered", patient);
  const cached = cache.get<boolean>(key);
  if (cached !== undefined) return cached;
  const result = await readContract(
    "is_registered",
    [toScValAddress(patient)],
    patient
  );
  cache.set(key, result);
  return result;
}

/**
 * Get patient info.
 * Calls: get_patient(patient: Address) -> Patient | null
 */
export async function getPatient(patient: string) {
  const key = cacheKey("get_patient", patient);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const result = await readContract(
    "get_patient",
    [toScValAddress(patient)],
    patient
  );
  cache.set(key, result);
  return result;
}

/**
 * Check if an accessor has been granted access to a patient's records.
 * Calls: has_access(patient: Address, accessor: Address) -> bool
 */
export async function hasAccess(patient: string, accessor: string) {
  const key = cacheKey("has_access", patient, accessor);
  const cached = cache.get<boolean>(key);
  if (cached !== undefined) return cached;
  const result = await readContract(
    "has_access",
    [toScValAddress(patient), toScValAddress(accessor)],
    patient
  );
  cache.set(key, result);
  return result;
}

/**
 * Get the count of records for a patient.
 * Calls: get_record_count(patient: Address) -> u64
 */
export async function getRecordCount(patient: string) {
  const key = cacheKey("get_record_count", patient);
  const cached = cache.get<number>(key);
  if (cached !== undefined) return cached;
  try {
    const result = await readContract(
      "get_record_count",
      [toScValAddress(patient)],
      patient
    );
    cache.set(key, result);
    return result;
  } catch {
    // Graceful fallback if the updated contract hasn't been deployed yet
    return 0;
  }
}

/**
 * Get access log for a patient from the AccessLog contract.
 * Calls: get_access_log(patient: Address) -> Vec<AccessEvent>
 */
export async function getAccessLog(patient: string) {
  try {
    const logs = await readContract(
      "get_access_log",
      [toScValAddress(patient)],
      patient,
      ACCESS_LOG_CONTRACT_ADDRESS
    );
    return logs;
  } catch {
    // Graceful fallback if the AccessLog contract hasn't been deployed yet
    return [];
  }
}

export { nativeToScVal, scValToNative, Address, xdr };
