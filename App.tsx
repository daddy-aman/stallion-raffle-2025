import React, { useState, useMemo, useCallback } from 'react';
import Wheel from './components/Wheel';
import Controls from './components/Controls';
import WinnerModal from './components/WinnerModal';
import Snowfall from './components/Snowfall';
import ShippingDecorations from './components/ShippingDecorations';
import { RaffleConfig, WheelItem } from './types';
import { Star, Trash2 } from 'lucide-react';

// --- Mobile-safe audio handling ---
let spinSound: HTMLAudioElement | null = null;
let audioUnlocked = false;

function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // Create the audio element only after a user gesture (mobile requirement)
  spinSound = new Audio(
    "https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/spinning-reel-27903.mp3"
  );
  spinSound.preload = "auto";

  // Quick "unlock" attempt — some mobile browsers need *any* play call after gesture
  // If it fails, that's ok; the important part is we created the audio after gesture.
  spinSound.volume = 0; // silent unlock attempt
  spinSound.play().then(() => {
    if (spinSound) {
      spinSound.pause();
      spinSound.currentTime = 0;
      spinSound.volume = 0.7; // restore default
    }
  }).catch(() => {
    // Ignore; we'll try again on actual spin tap.
    if (spinSound) spinSound.volume = 0.7;
  });
}

function playSpinSound(volume: number) {
  if (!spinSound) return;
  spinSound.volume = Math.max(0, Math.min(1, volume));
  spinSound.currentTime = 0;
  spinSound.play().catch(() => {
    // If this fails on first try on mobile, user can tap again — but usually unlockAudioOnce prevents this.
  });
}
// --- end audio handling ---

const COLORS = [
  '#8B0000', // Dark Red
  '#2E8B57', // Sea Green (softer than forest)
  '#F59E0B', // Amber
  '#A0522D', // Sienna (Leather/Wood)
  '#D4AF37'  // Gold
];

const TEXT_COLORS = ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#000000'];

const App: React.FC = () => {
  // Config State
  const [config, setConfig] = useState<RaffleConfig>({
    min: 1,
    max: 20,
    excluded: [],
    volume: 0.5,
  });

  // Gameplay State
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [winnersHistory, setWinnersHistory] = useState<number[]>([]);

  // Derive valid items based on config
  const wheelItems: WheelItem[] = useMemo(() => {
    const items: WheelItem[] = [];
    let colorIndex = 0;

    for (let i = config.min; i <= config.max; i++) {
      if (!config.excluded.includes(i)) {
        items.push({
          value: i,
          color: COLORS[colorIndex % COLORS.length],
          textColor: TEXT_COLORS[colorIndex % COLORS.length]
        });
        colorIndex++;
      }
    }
    return items;
  }, [config.min, config.max, config.excluded]);

  // Handle Spin Logic
  const handleSpin = useCallback(() => {
    if (wheelItems.length === 0 || isSpinning) return;

    // IMPORTANT: unlock + play must happen as part of the user gesture (mobile)
    unlockAudioOnce();
    playSpinSound(config.volume ?? 0.7);

    // Pick random winner from available items
    const randomIndex = Math.floor(Math.random() * wheelItems.length);
    const selectedWinner = wheelItems[randomIndex].value;

    setIsSpinning(true);
    setWinner(selectedWinner);
    setShowModal(false);
  }, [wheelItems, isSpinning, config.volume]);

  // Handle Spin Complete
  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
    setShowModal(true);
    setSpinCount(prev => prev + 1);
  }, []);

  // Handle standard "Close & Spin Again"
  const handleClaimPrize = () => {
    if (winner !== null) {
      setConfig(prev => ({
        ...prev,
        excluded: [...prev.excluded, winner]
      }));
      setWinnersHistory(prev => [...prev, winner]);
    }
    setShowModal(false);
    setWinner(null);
  };

  // Handle "Reset All" from modal
  const handleResetAndClose = () => {
    setConfig(prev => ({ ...prev, excluded: [] }));
    setWinnersHistory([]);
    setShowModal(false);
    setWinner(null);
  };

  const handleResetExcludedExternal = () => {
    // Immediate reset without confirmation for better UX on the controls panel
    setConfig(prev => ({ ...prev, excluded: [] }));
    setWinnersHistory([]);
  };

  const clearWinnersHistory = () => {
    if (window.confirm("Clear only the history list? (Excluded numbers will remain excluded)")) {
      setWinnersHistory([]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDD698] text-slate-900 overflow-x-hidden relative selection:bg-[#FFD700] flex flex-col font-rye">
      <ShippingDecorations />
      <Snowfall />

      {/* Header Section */}
      <div className="relative z-20 pt-4 pb-2 md:pt-8 md:pb-4 text-center px-4">
        <div className="flex items-center justify-center gap-3 md:gap-4 text-2xl md:text-6xl text-[#8B0000] drop-shadow-md">
          <span className="filter drop-shadow-lg text-3xl md:text-6xl">🤠</span>
          <h1 className="tracking-wide text-3xl sm:text-4xl md:text-7xl">Stallion Holiday Raffle</h1>
          <span className="filter drop-shadow-lg text-3xl md:text-6xl">🎄</span>
        </div>
        <p className="text-[#8B4513] font-rye mt-2 md:mt-4 text-lg md:text-3xl drop-shadow-sm tracking-wide">
          Spin the wheel for a rootin' tootin' good time!
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-0 md:gap-8 xl:gap-24 relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-32">

        {/* Wheel Section */}
        <div className="relative flex-shrink-0 -my-24 md:my-0 py-10 md:py-0 w-full md:w-auto flex justify-center overflow-visible translate-x-1 md:translate-x-0">
          <div className="transform scale-[0.50] sm:scale-[0.85] md:scale-100 transition-transform duration-500 origin-center">
            {wheelItems.length > 0 ? (
              <Wheel
                items={wheelItems}
                isSpinning={isSpinning}
                onSpinEnd={handleSpinEnd}
                winner={winner}
                volume={config.volume}
                onSpinTrigger={handleSpin}
              />
            ) : (
              <div className="bg-[#FFF8DC] p-8 rounded-full border-8 border-[#8B4513] w-[400px] h-[400px] flex flex-col items-center justify-center text-center shadow-xl">
                <h3 className="text-3xl text-[#8B0000] mb-4">All Out!</h3>
                <p className="mb-6 font-sans text-xl">All numbers drawn.</p>
                <button
                  onClick={handleResetExcludedExternal}
                  className="bg-[#228B22] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1e7a1e]"
                >
                  Reset Game
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col items-center gap-4 relative z-20">
          <Controls
            config={config}
            onUpdateConfig={setConfig}
            isSpinning={isSpinning}
            onResetExcluded={handleResetExcludedExternal}
            itemCount={wheelItems.length}
          />

          {/* Item Count Display & External Spin Button */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="text-[#5D4037] font-bold text-lg flex items-center gap-2">
              <span>{wheelItems.length} numbers on the wheel</span>
              <Star size={16} fill="#D4AF37" className="text-[#D4AF37]" />
            </div>

            <button
              onClick={handleSpin}
              onTouchStart={handleSpin}
              disabled={isSpinning || wheelItems.length === 0}
              className="bg-[#B91C1C] hover:bg-[#C62828] text-white text-xl px-10 py-3 rounded-full border-4 border-[#D4AF37] shadow-[0_4px_0_#8B0000] active:shadow-none active:translate-y-1 font-rye transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              🤠 SPIN THE WHEEL 🤠
            </button>
          </div>

          {/* Footer Emojis */}
          <div className="flex gap-4 text-2xl mt-4 opacity-80 filter grayscale-[0.3]">
            <span>🎅</span>
            <span>🤠</span>
            <span>🎁</span>
            <span>🐴</span>
            <span>⭐</span>
            <span>🦌</span>
            <span>🎄</span>
          </div>

          {/* Footer Text */}
          <div className="text-xl md:text-2xl text-[#8B0000] font-christmas font-bold mt-2 drop-shadow-sm opacity-90">
            Merry Christmas & Happy Trails, Partner! 🤠🎄
          </div>

          {/* Winners History Field */}
          <div className={`w-full max-w-xs transition-all duration-300 ${winnersHistory.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            {winnersHistory.length > 0 && (
              <div className="bg-[#FFF8DC]/90 backdrop-blur-sm border-2 border-[#8B4513] rounded-lg p-3 shadow-lg">
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#8B4513]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <h3 className="text-[#8B0000] font-bold text-sm">Winners Circle</h3>
                  </div>
                  <button
                    onClick={clearWinnersHistory}
                    className="flex items-center gap-1 text-[#8B4513] hover:text-[#B91C1C] text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Trash2 size={12} /> Clear List
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-h-[120px] overflow-y-auto custom-scrollbar">
                  {winnersHistory.map((w, i) => (
                    <span
                      key={`${w}-${i}`}
                      className="bg-[#228B22] text-white font-rye text-sm px-2 py-0.5 rounded border-b-2 border-[#155e15] shadow-sm animate-in zoom-in duration-300"
                    >
                      #{w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {showModal && winner !== null && (
        <WinnerModal
          winner={winner}
          onClose={handleClaimPrize}
          onResetWinners={handleResetAndClose}
          volume={config.volume}
          spinCount={spinCount}
        />
      )}
    </div>
  );
};

export default App;
