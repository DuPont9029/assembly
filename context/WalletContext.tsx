"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

interface WalletContextType {
  address: string | null;
  isRepresentative: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  contract: ethers.Contract | null;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setIsRepresentative(false);
    setContract(null);
    // We cannot disconnect MetaMask programmatically from the browser side,
    // but we can clear our local state to simulate a logout.
  }, []);

  const checkRepresentativeStatus = useCallback(
    async (
      userAddress: string,
      signerOrProvider: ethers.Signer | ethers.Provider
    ) => {
      try {
        if (!CONTRACT_ADDRESS) {
          console.warn("Contract address not set.");
          return false;
        }

        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signerOrProvider
        );
        setContract(contractInstance);

        // Call the smart contract to check if the user is a representative
        // The ABI has isRepresentative(address) -> bool
        const isRep = await contractInstance.isRepresentative(userAddress);
        console.log(`Address ${userAddress} is representative: ${isRep}`);
        return isRep;
      } catch (error) {
        console.error("Error checking representative status:", error);
        return false;
      }
    },
    []
  );

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Request permissions to open the account selection modal
        // This allows the user to switch accounts
        try {
          await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch (err) {
          console.error("Permissions request failed", err);
          // If user rejects, we might still proceed if they are already connected
        }

        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const userAddress = accounts[0];

        setAddress(userAddress);

        const isRep = await checkRepresentativeStatus(userAddress, signer);
        setIsRepresentative(isRep);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
      setLoading(false);
    }
  }, [checkRepresentativeStatus]);

  // Check if already connected
  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const userAddress = accounts[0].address;
          setAddress(userAddress);
          const isRep = await checkRepresentativeStatus(userAddress, signer);
          setIsRepresentative(isRep);
        }
      }
      setLoading(false);
    };
    init();
  }, [checkRepresentativeStatus]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setLoading(true);
          // Re-check status with new account
          const provider = new ethers.BrowserProvider(window.ethereum);
          provider.getSigner().then((signer) => {
            checkRepresentativeStatus(accounts[0], signer).then((isRep) => {
              setIsRepresentative(isRep);
              setLoading(false);
            });
          });
        } else {
          setAddress(null);
          setIsRepresentative(false);
          setContract(null);
        }
      });
    }
  }, [checkRepresentativeStatus]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isRepresentative,
        connectWallet,
        disconnectWallet,
        contract,
        loading,
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
