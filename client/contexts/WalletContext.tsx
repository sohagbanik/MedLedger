"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  isConnected as checkFreighterConnected,
  getAddress,
  setAllowed,
  isAllowed,
  requestAccess,
  getNetwork
} from "@stellar/freighter-api";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  networkError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const verifyNetwork = async () => {
    try {
      const result = await getNetwork();
      const network = typeof result === 'string' ? result : (result.network || "");
      if (network.toUpperCase() !== "TESTNET") {
        setNetworkError("Please switch your Freighter wallet to Testnet.");
        return false;
      }
      setNetworkError(null);
      return true;
    } catch {
      setNetworkError("Failed to verify network.");
      return false;
    }
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setNetworkError(null);
    try {
      const connResult = await checkFreighterConnected();
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

      const isTestnet = await verifyNetwork();
      if (isTestnet) {
        setAddress(address);
        setIsConnected(true);
      } else {
        // Connected but wrong network
        setAddress(address);
        setIsConnected(true);
      }
    } catch (err: unknown) {
      console.error("Wallet connection failed:", err);
      if (err instanceof Error) {
        setNetworkError(err.message);
      } else {
        setNetworkError("Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setNetworkError(null);
  }, []);

  // Check initial connection state on mount
  useEffect(() => {
    (async () => {
      try {
        const connResult = await checkFreighterConnected();
        if (connResult.isConnected) {
          const allowedResult = await isAllowed();
          if (allowedResult.isAllowed) {
            const { address } = await getAddress();
            if (address) {
              setAddress(address);
              setIsConnected(true);
              await verifyNetwork();
            }
          }
        }
      } catch {
        // Ignore errors during initial silent check
      }
    })();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        networkError,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
