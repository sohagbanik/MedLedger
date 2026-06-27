import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { WalletProvider, useWallet } from "../contexts/WalletContext";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as freighterApi from "@stellar/freighter-api";

// Mock the freighter API
vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn(),
  getAddress: vi.fn(),
  setAllowed: vi.fn(),
  isAllowed: vi.fn(),
  requestAccess: vi.fn(),
  getNetwork: vi.fn(),
}));

const TestComponent = () => {
  const { address, isConnected, networkError, connect, disconnect } = useWallet();
  return (
    <div>
      <div data-testid="address">{address || "none"}</div>
      <div data-testid="status">{isConnected ? "connected" : "disconnected"}</div>
      <div data-testid="error">{networkError || "no-error"}</div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
};

describe("WalletContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("handles successful connection on Testnet", async () => {
    // Setup mocks
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
    vi.mocked(freighterApi.isAllowed).mockResolvedValue({ isAllowed: true });
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: "GABC123" });
    vi.mocked(freighterApi.getNetwork).mockResolvedValue("TESTNET");

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    // Initial state before effect runs might be none
    // But since connect button triggers it, let's test explicit connect
    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("connected");
    });
    expect(screen.getByTestId("address")).toHaveTextContent("GABC123");
    expect(screen.getByTestId("error")).toHaveTextContent("no-error");
  });

  it("sets network error if not on Testnet", async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
    vi.mocked(freighterApi.isAllowed).mockResolvedValue({ isAllowed: true });
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: "GABC123" });
    vi.mocked(freighterApi.getNetwork).mockResolvedValue("PUBLIC");

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("switch your Freighter wallet to Testnet");
    });
  });

  it("disconnects properly", async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
    vi.mocked(freighterApi.isAllowed).mockResolvedValue({ isAllowed: true });
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: "GABC123" });
    vi.mocked(freighterApi.getNetwork).mockResolvedValue("TESTNET");

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Connect"));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("connected");
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Disconnect"));
    });

    expect(screen.getByTestId("status")).toHaveTextContent("disconnected");
    expect(screen.getByTestId("address")).toHaveTextContent("none");
  });
});
