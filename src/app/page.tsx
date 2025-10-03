'use client';

import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('stake');
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Oblio
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !via-pink-500 !to-cyan-500 hover:!from-purple-600 hover:!via-pink-600 hover:!to-cyan-600 !transition-all !duration-200 !shadow-lg !shadow-purple-500/20 !rounded-lg" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen pt-20 px-4">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-xl -z-10"></div>
            
            <h1 className="text-3xl font-bold text-white text-center mb-8">
              Liquid Staking
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-900/50 rounded-xl p-1.5">
              <button
                onClick={() => setActiveTab('stake')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'stake'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Stake SOL
              </button>
              <button
                onClick={() => setActiveTab('unstake')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'unstake'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Unstake
              </button>
              <button
                onClick={() => setActiveTab('swap')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'swap'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Swap LSTs
              </button>
            </div>

            {/* Tab Content */}
            <div className="text-center space-y-6">
              <div className="py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">
                  {connected ? 'Wallet Connected' : 'Connect your wallet'}
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Get highest staking rewards while maintaining high security with native staking.
                </p>
                {!connected && (
                  <WalletMultiButton className="!w-full !py-4 !rounded-xl !font-semibold !text-white !bg-gradient-to-r !from-purple-500 !via-pink-500 !to-cyan-500 hover:!from-purple-600 hover:!via-pink-600 hover:!to-cyan-600 !transition-all !duration-200 !shadow-lg !shadow-purple-500/30" />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
