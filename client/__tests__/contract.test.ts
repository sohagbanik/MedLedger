import { describe, it, expect } from "vitest";
import {
  CONTRACT_ADDRESS,
  NETWORK_PASSPHRASE,
  RPC_URL,
  HORIZON_URL,
  NETWORK,
  toScValString,
  toScValBool,
  toScValAddress,
  toScValU32,
} from "@/hooks/contract";

describe("Contract constants", () => {
  it("CONTRACT_ADDRESS is a valid 56-char Stellar public key", () => {
    expect(CONTRACT_ADDRESS).toBeDefined();
    expect(CONTRACT_ADDRESS).toHaveLength(56);
    expect(CONTRACT_ADDRESS).toMatch(/^C[A-Z0-9]{55}$/);
  });

  it("NETWORK_PASSPHRASE matches Stellar testnet", () => {
    expect(NETWORK_PASSPHRASE).toContain("Test SDF Network");
  });

  it("RPC_URL points to Soroban testnet", () => {
    expect(RPC_URL).toBe("https://soroban-testnet.stellar.org");
  });

  it("HORIZON_URL points to Horizon testnet", () => {
    expect(HORIZON_URL).toBe("https://horizon-testnet.stellar.org");
  });

  it("NETWORK is TESTNET", () => {
    expect(NETWORK).toBe("TESTNET");
  });
});

describe("ScVal conversion helpers", () => {
  it("toScValString returns an ScVal", () => {
    const result = toScValString("hello");
    expect(result).toBeDefined();
    // ScVal objects have a toXDR method
    expect(typeof result.toXDR).toBe("function");
  });

  it("toScValBool returns an ScVal for true and false", () => {
    const t = toScValBool(true);
    const f = toScValBool(false);
    expect(t).toBeDefined();
    expect(f).toBeDefined();
    expect(typeof t.toXDR).toBe("function");
    expect(typeof f.toXDR).toBe("function");
  });

  it("toScValU32 returns an ScVal for integers", () => {
    const result = toScValU32(42);
    expect(result).toBeDefined();
    expect(typeof result.toXDR).toBe("function");
  });

  it("toScValAddress returns an ScVal for a valid Stellar address", () => {
    // Use a well-known testnet address format
    const addr = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";
    const result = toScValAddress(addr);
    expect(result).toBeDefined();
    expect(typeof result.toXDR).toBe("function");
  });
});
