'use client';

import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('stake');
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#141420] to-[#0f0f1a] relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Oblio Logo" className="w-8 h-8 flex-shrink-0" />
            <div className="text-2xl font-bold bg-gradient-to-r from-[#9945FF] via-[#C44AFF] to-[#14F195] bg-clip-text text-transparent">
              Oblio
            </div>
            <span className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 border border-[#9945FF]/30 rounded-full text-[#14F195]">
              BETA
            </span>
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-[#9945FF] !to-[#14F195] hover:!from-[#7d38cc] hover:!to-[#10c276] !transition-all !duration-300 !shadow-lg !shadow-[#9945FF]/25 hover:!shadow-[#14F195]/25 !rounded-xl !font-medium" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen pt-20 px-4">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] via-[#C44AFF] to-[#14F195] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            
            {/* Main card */}
            <div className="relative bg-gradient-to-b from-[#1a1a2e]/90 to-[#16162a]/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#9945FF]/5 via-transparent to-[#14F195]/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Confidential Liquid Staking
                  </h1>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-[#9945FF]/10 to-transparent border border-[#9945FF]/20 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-1">APY</div>
                    <div className="text-2xl font-bold text-white">7.2%</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#14F195]/10 to-transparent border border-[#14F195]/20 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-1">Total Staked</div>
                    <div className="text-2xl font-bold text-white">24.5K SOL</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-black/30 rounded-2xl p-1.5 border border-white/5">
                  <button
                    onClick={() => setActiveTab('stake')}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'stake'
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-lg shadow-[#9945FF]/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => setActiveTab('unstake')}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'unstake'
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-lg shadow-[#9945FF]/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Unstake
                  </button>
                  <button
                    onClick={() => setActiveTab('swap')}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'swap'
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-lg shadow-[#9945FF]/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Swap
                  </button>
                </div>

                {/* Tab Content */}
                {!connected ? (
                  <div className="text-center space-y-6">
                    <div className="py-12">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full blur-md opacity-50"></div>
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center shadow-xl">
                          <svg 
                            className="w-12 h-12 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M13 10V3L4 14h7v7l9-11h-7z" 
                            />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-2xl font-semibold text-white mb-3">
                        Connect your wallet
                      </h2>
                      <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Get highest staking rewards while maintaining privacy and security with confidential liquid staking on Solana.
                      </p>
                      <WalletMultiButton className="!w-full !py-4 !rounded-xl !font-semibold !text-white !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] hover:!from-[#7d38cc] hover:!to-[#10c276] !transition-all !duration-300 !shadow-lg !shadow-[#9945FF]/40 hover:!shadow-[#14F195]/40" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Stake SOL Tab */}
                    {activeTab === 'stake' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Amount to Stake
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="0.00"
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-[#9945FF] transition-colors"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors">
                              MAX
                            </button>
                          </div>
                          <div className="flex justify-between mt-2 text-sm text-gray-500">
                            <span>Balance: 0.00 SOL</span>
                            <span>≈ $0.00</span>
                          </div>
                        </div>
                        <button className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-[#7d38cc] hover:to-[#10c276] transition-all duration-300 shadow-lg shadow-[#9945FF]/30">
                          Stake SOL
                        </button>
                      </div>
                    )}

                    {/* Unstake Tab */}
                    {activeTab === 'unstake' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Staked Amount
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value="0.00"
                              readOnly
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white text-lg cursor-not-allowed opacity-70"
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-sm text-gray-500">
                            <span>Your Stake: 0.00 SOL</span>
                            <span>Rewards: 0.00 SOL</span>
                          </div>
                        </div>
                        <button className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-[#7d38cc] hover:to-[#10c276] transition-all duration-300 shadow-lg shadow-[#9945FF]/30">
                          Unstake
                        </button>
                      </div>
                    )}

                    {/* Swap LSTs Tab */}
                    {activeTab === 'swap' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {/* From Token */}
                          <div className="flex-1 bg-black/30 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]"></div>
                              <span className="font-semibold text-white">SOL</span>
                            </div>
                            <input
                              type="number"
                              placeholder="0.00"
                              className="bg-transparent text-white text-xl focus:outline-none w-full mb-1"
                            />
                            <div className="text-xs text-gray-500">Balance: 0.00</div>
                          </div>

                          {/* Swap Icon */}
                          <button className="w-10 h-10 bg-black/50 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>

                          {/* To Token */}
                          <div className="flex-1 bg-black/30 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#14F195] to-[#9945FF]"></div>
                              <span className="font-semibold text-white">oSOL</span>
                            </div>
                            <input
                              type="number"
                              placeholder="0.00"
                              readOnly
                              className="bg-transparent text-white text-xl focus:outline-none w-full cursor-not-allowed mb-1"
                            />
                            <div className="text-xs text-gray-500">Balance: 0.00</div>
                          </div>
                        </div>

                        <button className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-[#7d38cc] hover:to-[#10c276] transition-all duration-300 shadow-lg shadow-[#9945FF]/30">
                          Swap
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
