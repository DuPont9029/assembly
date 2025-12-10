"use client";

import { useWallet } from "@/context/WalletContext";
import { Loader2, Wallet, ShieldAlert, LogOut } from "lucide-react";
import AssemblyRequest from "./AssemblyRequest";

export default function Dashboard() {
  const {
    address,
    isRepresentative,
    connectWallet,
    disconnectWallet,
    loading,
  } = useWallet();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Student Council
        </h1>
        {address ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <button
              onClick={disconnectWallet}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Disconnetti"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto">
        {!address ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-500 mb-6">
              Please connect your wallet to continue.
            </p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              Connect MetaMask
            </button>
          </div>
        ) : !isRepresentative ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-500">
              Only Student Council representatives can access the points
              management system.
            </p>
          </div>
        ) : (
          <AssemblyRequest />
        )}
      </main>
    </div>
  );
}
