'use client';

import { useState, useMemo, useEffect } from 'react';
//import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';


const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => ({ default: mod.WalletMultiButton })),
  { ssr: false }
);
export default function Home() {
  const [activeTab, setActiveTab] = useState('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isSwapped, setIsSwapped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { connected } = useWallet();

  // Ensure component is mounted before generating random values
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate estimated rewards per year
  const calculateEstimatedRewards = (amount: string, apy: number) => {
    const numAmount = parseFloat(amount) || 0;
    return (numAmount * apy / 100).toFixed(4);
  };

  const apy = 6.5;
  const estimatedRewards = calculateEstimatedRewards(stakeAmount, apy);

  // Generate star data only after component is mounted to prevent hydration mismatches
  const starData = useMemo(() => {
    if (!isMounted) {
      return {
        largeStars: [],
        mediumStars: [],
        smallStars: [],
        coloredStars: [],
      };
    }

    const generateStars = (count: number, sizeRange: [number, number]) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        width: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        height: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.7 + 0.3,
        animationDelay: Math.random() * 3,
        animationDuration: Math.random() * 3 + 2,
        boxShadow: Math.random() * 4 + 2,
      }));
    };

    const generateColoredStars = (count: number) => {
      return Array.from({ length: count }, (_, i) => {
        const isBlue = Math.random() > 0.5;
        return {
          id: i,
          width: Math.random() * 2 + 1,
          height: Math.random() * 2 + 1,
          top: Math.random() * 100,
          left: Math.random() * 100,
          isBlue,
          opacity: Math.random() * 0.4 + 0.2,
          animationDelay: Math.random() * 3,
          animationDuration: Math.random() * 4 + 3,
          boxShadow: Math.random() * 6 + 3,
        };
      });
    };

    const generateMediumStars = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        width: Math.random() * 2 + 0.5,
        height: Math.random() * 2 + 0.5,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.2,
        animationDelay: Math.random() * 4,
      }));
    };

    const generateSmallStars = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.4 + 0.1,
      }));
    };

    return {
      largeStars: generateStars(50, [1, 4]),
      mediumStars: generateMediumStars(100),
      smallStars: generateSmallStars(200),
      coloredStars: generateColoredStars(20),
    };
  }, [isMounted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#141420] to-[#0f0f1a] relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large stars */}
        {starData.largeStars.map((star) => (
          <div
            key={`star-large-${star.id}`}
            className="absolute rounded-full bg-white animate-pulse-slow"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
              boxShadow: `0 0 ${star.boxShadow}px rgba(255, 255, 255, 0.8)`
            }}
          />
        ))}
        
        {/* Medium stars */}
        {starData.mediumStars.map((star) => (
          <div
            key={`star-medium-${star.id}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animation: `pulse ${star.animationDelay + 3}s ease-in-out infinite`,
              animationDelay: `${star.animationDelay}s`
            }}
          />
        ))}
        
        {/* Small stars - distant */}
        {starData.smallStars.map((star) => (
          <div
            key={`star-small-${star.id}`}
            className="absolute rounded-full bg-white"
            style={{
              width: '1px',
              height: '1px',
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity
            }}
          />
        ))}
        
        {/* Colored accent stars - purple/cyan */}
        {starData.coloredStars.map((star) => (
          <div
            key={`star-colored-${star.id}`}
            className="absolute rounded-full animate-pulse-slow"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              backgroundColor: star.isBlue ? '#14F195' : '#9945FF',
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
              boxShadow: `0 0 ${star.boxShadow}px ${star.isBlue ? 'rgba(20, 241, 149, 0.6)' : 'rgba(153, 69, 255, 0.6)'}`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 opacity-0 animate-bubble-in" style={{ animationDelay: '1900ms' }}>
        <div className="mx-auto px-6 py-4 lg:px-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Oblio Logo" className="w-8 h-8 flex-shrink-0" />
            <div className="text-2xl font-bold bg-gradient-to-r from-[#9945FF] via-[#C44AFF] to-[#14F195] bg-clip-text text-transparent">
              Oblio
            </div>
            <span className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 border border-[#9945FF]/30 rounded-full text-[#14F195]">
              BETA
            </span>
          </div>
          
          {/* Confidential Liquid Staking Title - Desktop only */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
            <div className="relative group/title">
              {/* <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF]/20 via-[#C44AFF]/20 to-[#14F195]/20 rounded-full blur-sm"></div> */}
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2">
                <h1 className="text-sm font-semibold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-center tracking-tight whitespace-nowrap">
                  Confidential Liquid Staking
                </h1>
              </div>
            </div>
          </div>
          
          <WalletMultiButton className="no-wrap"/>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen px-4 pt-12 md:pt-20">
        <div className="w-full flex flex-col items-center justify-center gap-4 md:gap-0">
          {/* Confidential Liquid Staking Title - Mobile only */}
          <div className="md:hidden flex items-center justify-center">
            <div className="relative group/title">
              {/* <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF]/20 via-[#C44AFF]/20 to-[#14F195]/20 rounded-full blur-sm"></div> */}
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2">
                <h1 className="text-sm font-semibold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-center tracking-tight whitespace-nowrap">
                  Confidential Liquid Staking
                </h1>
              </div>
            </div>
          </div>
          
          {/* Card */}
          <div className="relative group">
            {/* Outer rotating glow effect */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-spin-slow">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] via-[#C44AFF] to-[#14F195] rounded-full"></div>
            </div>
            
            {/* SVG Rotating Waves - Logo Style */}
            <div className="absolute inset-0 w-[600px] h-[600px] animate-spin-slow">
              <svg viewBox="0 0 600 600" className="w-full h-full">
                <defs>
                  <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9945FF" />
                    <stop offset="50%" stopColor="#C44AFF" />
                    <stop offset="100%" stopColor="#14F195" />
                  </linearGradient>
                  <linearGradient id="wave2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#14F195" />
                    <stop offset="50%" stopColor="#C44AFF" />
                    <stop offset="100%" stopColor="#9945FF" />
                  </linearGradient>
                </defs>
                
                {/* First Wave - Top Right */}
                <path
                  d="M 450 150 Q 500 200 520 280 Q 530 320 520 360 Q 510 390 490 410"
                  stroke="url(#wave1)"
                  strokeWidth="40"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                
                {/* Second Wave - Bottom Left */}
                <path
                  d="M 150 450 Q 100 400 80 320 Q 70 280 80 240 Q 90 210 110 190"
                  stroke="url(#wave2)"
                  strokeWidth="40"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                
                {/* Accent dots - Top Right */}
                <circle cx="540" cy="230" r="8" fill="#14F195" opacity="0.8" />
                <circle cx="560" cy="280" r="6" fill="#14F195" opacity="0.6" />
                <circle cx="570" cy="320" r="4" fill="#14F195" opacity="0.4" />
                
                {/* Accent dots - Bottom Left */}
                <circle cx="60" cy="370" r="8" fill="#9945FF" opacity="0.8" />
                <circle cx="40" cy="320" r="6" fill="#9945FF" opacity="0.6" />
                <circle cx="30" cy="280" r="4" fill="#9945FF" opacity="0.4" />
              </svg>
            </div>
            
            {/* Counter-rotating inner waves */}
            <div className="absolute inset-0 w-[600px] h-[600px] animate-spin-reverse">
              <svg viewBox="0 0 600 600" className="w-full h-full">
                {/* Inner wave accent - Top Left */}
                <path
                  d="M 200 120 Q 150 150 130 200"
                  stroke="#C44AFF"
                  strokeWidth="30"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                
                {/* Inner wave accent - Bottom Right */}
                <path
                  d="M 400 480 Q 450 450 470 400"
                  stroke="#C44AFF"
                  strokeWidth="30"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </div>
            
            {/* Pulsating inner ring */}
            <div className="absolute inset-4 rounded-full border-2 border-[#9945FF]/20 animate-pulse-slow"></div>
            
            {/* Main card */}
            <div className="relative bg-gradient-to-b from-[#1a1a2e]/90 to-[#16162a]/90 backdrop-blur-xl rounded-full p-12 shadow-2xl w-[600px] h-[600px] flex items-center justify-center overflow-hidden animate-spin-grow-in" style={{
              border: '3px solid transparent',
              backgroundImage: 'linear-gradient(#1a1a2e, #16162a), conic-gradient(from 0deg, #9945FF, #C44AFF, #14F195, #C44AFF, #9945FF)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: 'inset 0 0 120px 40px rgba(0, 0, 0, 0.8), inset 0 0 80px 20px rgba(0, 0, 0, 0.6), inset 0 0 40px 10px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#9945FF]/5 via-transparent to-[#14F195]/5 animate-gradient"></div>
              
              <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center justify-center opacity-0 animate-bubble-in" style={{ animationDelay: '1900ms' }}>
                {/* Stats bar */}
                <div className="grid grid-cols-2 gap-3 mb-6 w-full">
                  <div className="relative group/stat">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9945FF]/20 to-transparent rounded-full blur-sm group-hover/stat:blur-md transition-all"></div>
                    <div className="relative bg-black/40 backdrop-blur-sm border border-[#9945FF]/30 rounded-full p-4 hover:border-[#9945FF]/50 transition-all aspect-square flex flex-col items-center justify-center">
                      <div className="text-[10px] font-medium text-[#9945FF] mb-0.5 uppercase tracking-wider">APY</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-white to-[#9945FF] bg-clip-text text-transparent">{apy}%</div>
                    </div>
                  </div>
                  <div className="relative group/stat">
                  <div className="absolute inset-0 bg-[rgba(153,69,255,0.1)] border border-white/10 rounded-full blur-sm group-hover/stat:blur-md transition-all"></div>
                  <div className="relative bg-black/40 backdrop-blur-sm border border-[#9945FF]/30 rounded-full p-4 hover:border-[#9945FF]/50 transition-all aspect-square flex flex-col items-center justify-center">
                  <div className="text-[10px] font-medium text-[#9945FF] mb-0.5 uppercase tracking-wider text-center">Rewards</div>
                      <div className="text-xl font-bold bg-gradient-to-r from-white to-[#9945FF] bg-clip-text text-transparent">{estimatedRewards}</div>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                {!connected ? (
                  <div className="space-y-5 w-full mt-10">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-white mb-2">
                        Connect Wallet
                      </h2>
                      <p className="text-gray-400 mb-5 text-xs leading-relaxed">
                        Start earning rewards with confidential staking
                      </p>
                        <WalletMultiButton />
                    </div>
                  </div>
                ) : (
                  <>
                <div className="flex gap-2 mb-6 w-full">
                  <button
                    onClick={() => setActiveTab('stake')}
                    className={`flex-1 py-2.5 px-3 rounded-full font-semibold text-xs transition-all duration-300 relative overflow-hidden border border-white/10 ${
                      activeTab === 'stake'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {activeTab === 'stake' && (
                      <>
                        <div className="absolute inset-0 bg-[rgba(153,69,255,0.1)]"></div>
                      </>
                    )}
                    <span className="relative z-10">Stake</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('unstake')}
                    className={`flex-1 py-2.5 px-3 rounded-full border border-white/10 font-semibold text-xs transition-all duration-300 relative overflow-hidden ${
                      activeTab === 'unstake'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {activeTab === 'unstake' && (
                      <>
                        <div className="absolute inset-0 bg-[rgba(153,69,255,0.1)]"></div>
                      </>
                    )}
                    <span className="relative z-10">Unstake</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('swap')}
                    className={`flex-1 py-2.5 px-3 border border-white/10 rounded-full font-semibold text-xs transition-all duration-300 relative overflow-hidden ${
                      activeTab === 'swap'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {activeTab === 'swap' && (
                      <>
                        <div className="absolute inset-0 bg-[rgba(153,69,255,0.1)]"></div>
                      </>
                    )}
                    <span className="relative z-10">Swap</span>
                  </button>
                </div>

                  <div className="space-y-5 w-full">
                    {/* Stake SOL Tab */}
                    {activeTab === 'stake' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-2">
                            Amount to Stake
                          </label>
                          <div className="relative group/input">
                            <div className="absolute inset-0 bg-[rgba(153,69,255,0.1)] border border-white/10 rounded-full blur-sm opacity-0 transition-opacity"></div>
                            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden hover:border-[#9945FF]/50 transition-all">
                              <input
                                type="number"
                                placeholder="0.00"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                className="w-full bg-transparent px-4 py-3 text-white text-base focus:outline-none"
                              />
                              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-[rgba(153,69,255,0.1)] border border-white/10 hover:bg-[rgba(153,69,255,0.15)] active:bg-[rgba(153,69,255,0.25)] active:border-[#9945FF]/50 active:scale-95 rounded-full text-[10px] font-bold text-white transition-all uppercase tracking-wider">
                                MAX
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                            <span>Balance: 0.00 SOL</span>
                            <span>≈ $0.00</span>
                          </div>
                        </div>
                        <div className="relative group/btn">
                          <div className="absolute inset-0 rounded-full blur-md opacity-50 group-hover/btn:opacity-75 transition-opacity"></div>
                          <button className="relative w-full py-3 border border-white/10  rounded-full font-bold text-sm text-white bg-[rgba(153,69,255,0.1)] hover:bg-[rgba(153,69,255,0.1)] transition-all duration-300 shadow-xl">
                            Stake SOL
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Unstake Tab */}
                    {activeTab === 'unstake' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-2">
                            Staked Amount
                          </label>
                          <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden pointer-events-none">
                            <input
                              type="text"
                              value="0.00"
                              readOnly
                              className="w-full bg-transparent px-4 py-3 text-white text-base cursor-not-allowed opacity-70 outline-none"
                            />
                          </div>
                          <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                            <span>Your Stake: 0.00 SOL</span>
                            <span>Rewards: 0.00 SOL</span>
                          </div>
                        </div>
                        <div className="relative group/btn">
                          <div className="absolute inset-0 blur-md opacity-50 group-hover/btn:opacity-75 transition-opacity"></div>
                          <button className="relative w-full border border-white/10 rounded-full py-3 font-bold text-sm text-white bg-[rgba(153,69,255,0.1)] transition-all duration-300 shadow-xl">
                            Unstake
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Swap LSTs Tab */}
                    {activeTab === 'swap' && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          {/* From Token */}
                          <div className="relative group/input">
                            <div className="absolute inset-0 bg-[rgba(153,69,255,0.1)] border border-white/10 rounded-full blur-sm opacity-0 group-hover/input:opacity-100 transition-opacity"></div>
                            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2 hover:border-[#9945FF]/50 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-[rgba(153,69,255,0.1)] border border-white/20 flex items-center justify-center">
                                    {!isSwapped ? (
                                      <img src="/solanaLogoMark.png" alt="Solana" className="w-2.5 h-2.5" />
                                    ) : (
                                      <img src="/logo.png" alt="Oblio" className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                  <span className="font-bold text-white text-xs">{!isSwapped ? 'SOL' : 'oSOL'}</span>
                                </div>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  className="bg-transparent text-white text-sm font-semibold focus:outline-none w-full text-right"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Swap Icon */}
                          <div className="flex justify-center">
                            <button 
                              onClick={() => setIsSwapped(!isSwapped)}
                              className="relative w-8 h-8 bg-[rgba(153,69,255,0.1)] border border-white/20 rounded-full flex items-center justify-center hover:bg-[rgba(153,69,255,0.1)] transition-all group/swap"
                            >
                              <svg className="w-4 h-4 text-white group-hover/swap:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </button>
                          </div>

                          {/* To Token */}
                          <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-[rgba(153,69,255,0.1)] border border-white/20 flex items-center justify-center">
                                  {!isSwapped ? (
                                    <img src="/logo.png" alt="Oblio" className="w-3.5 h-3.5" />
                                  ) : (
                                    <img src="/solanaLogoMark.png" alt="Solana" className="w-2.5 h-2.5" />
                                  )}
                                </div>
                                <span className="font-bold text-white text-xs">{!isSwapped ? 'oSOL' : 'SOL'}</span>
                              </div>
                              <input
                                type="number"
                                placeholder="0.00"
                                readOnly
                                className="bg-transparent text-white text-sm font-semibold focus:outline-none w-full text-right cursor-not-allowed opacity-70"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="relative group/btn">
                          <div className="absolute inset-0 rounded-full blur-md opacity-50 group-hover/btn:opacity-75 transition-opacity"></div>
                          <button className="relative w-full py-3 border border-white/10 rounded-full font-bold text-sm text-white bg-[rgba(153,69,255,0.1)] hover:bg-[rgba(153,69,255,0.1)] transition-all duration-300 shadow-xl">
                            Swap
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
