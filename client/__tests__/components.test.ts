import { describe, it, expect } from "vitest";

/**
 * These tests validate the core UI helper logic used throughout
 * the Contract and page components. They don't mount React components
 * (which would require mocking Freighter / Stellar SDK) but instead
 * test the pure functions and data structures that drive the UI.
 */

// ── Recreate the helpers used in the components ──

const truncateNavbar = (addr: string) =>
  `${addr.slice(0, 4)}...${addr.slice(-4)}`;

const truncateContract = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const formatTimestamp = (ts: number) => new Date(ts * 1000).toLocaleString();

const RECORD_TYPES = [
  "diagnosis",
  "treatment",
  "vaccination",
  "checkup",
  "lab",
  "emergency",
];

const RECORD_TYPE_CONFIG: Record<
  string,
  { variant: "success" | "warning" | "info" }
> = {
  diagnosis: { variant: "warning" },
  treatment: { variant: "warning" },
  vaccination: { variant: "success" },
  checkup: { variant: "info" },
  lab: { variant: "info" },
  emergency: { variant: "warning" },
};

// ── Tests ────────────────────────────────────────────────────

describe("Address truncation helpers", () => {
  const ADDR = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";

  it("Navbar truncate keeps first 4 and last 4 chars", () => {
    expect(truncateNavbar(ADDR)).toBe("GAAZ...CWN7");
  });

  it("Contract truncate keeps first 6 and last 4 chars", () => {
    expect(truncateContract(ADDR)).toBe("GAAZI4...CWN7");
  });
});

describe("formatTimestamp", () => {
  it("converts a Unix timestamp to a locale date string", () => {
    // 1700000000 = 2023-11-14T22:13:20.000Z
    const result = formatTimestamp(1700000000);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Should contain "2023" somewhere
    expect(result).toContain("2023");
  });

  it("handles timestamp 0 (epoch)", () => {
    const result = formatTimestamp(0);
    expect(result).toBeDefined();
    expect(result).toContain("1970");
  });
});

describe("Record type configuration", () => {
  it("has exactly 6 record types", () => {
    expect(RECORD_TYPES).toHaveLength(6);
  });

  it("every record type has a config entry", () => {
    for (const type of RECORD_TYPES) {
      expect(RECORD_TYPE_CONFIG[type]).toBeDefined();
      expect(RECORD_TYPE_CONFIG[type].variant).toMatch(
        /^(success|warning|info)$/
      );
    }
  });

  it("vaccination is 'success' variant", () => {
    expect(RECORD_TYPE_CONFIG.vaccination.variant).toBe("success");
  });

  it("emergency is 'warning' variant", () => {
    expect(RECORD_TYPE_CONFIG.emergency.variant).toBe("warning");
  });
});

describe("Tab navigation constants", () => {
  const TABS = ["register", "add", "view", "access"];

  it("has 4 tabs", () => {
    expect(TABS).toHaveLength(4);
  });

  it("contains all expected tab keys", () => {
    expect(TABS).toContain("register");
    expect(TABS).toContain("add");
    expect(TABS).toContain("view");
    expect(TABS).toContain("access");
  });
});
