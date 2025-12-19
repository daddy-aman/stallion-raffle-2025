import React, { useState, useMemo, useCallback } from 'react';
import Wheel from './components/Wheel';
import Controls from './components/Controls';
import WinnerModal from './components/WinnerModal';
import Snowfall from './components/Snowfall';
import ShippingDecorations from './components/ShippingDecorations';
import { RaffleConfig, WheelItem } from './types';
import { Star, Trash2 } from 'lucide-react';

/* =========================
   MOBILE-SAFE AUDIO SETUP
   ========================= */

// REAL spin sound
const SPIN_SFX_URL =
  "https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/spinning-reel-27903.mp3";

// Tiny silent mp3 ONLY for unlocking iOS audio
const SILENT_MP3 =
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA";

let spinSound: HTMLAudioElement | null = null;
let audioUnlocked = false;
let lastSpinTriggerAt = 0;

function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // Unlock audio on iOS using SILENT sound
  const silent = new Audio(SILENT_MP3);
  silent.play().then(() => {
    silent.pause();
    silent.currentTime = 0;
  }).catch(() => {});

  // Prepare the REAL spin sound (do NOT play yet)
  spinSound = new Audio(SPIN_SFX_URL);
  spinSound.preload = "auto";
  spinSound.load();
}

function playSpinSound(volume: number) {
  if (!spinSound) return;

  spinSound.pause();
  spinSound.currentTime = 0;
  spinSound.volume = Math.max(0, Math.min(1, volume));

  spinSound.play().catch(() => {});
}

/* =========================
   UI CONSTANTS
   ========================= */

const COLORS = [
  '#8B0000',
  '#2E8B57',
  '#F59E0B',
  '#A0522D',
  '#D4AF37'
];

const TEXT_COLORS = ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#000000'];

/* =========================
   APP
   ========================= */

const App: React.FC = () => {
  const [config, setConfig] = useState<RaffleConfig>({
    min: 1,
    max: 20,
    excluded: [],
    volume: 0.5,
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [winnersHistory, setWinnersHistory] = useState<number[]>([]);

  const wheelItems: WheelItem[] = useMemo(() => {
    const items: WheelItem[] = [];
    let colorIndex = 0;

    for (let i = config.min; i <= config.max; i++) {
      if (!config.excluded.includes(i)) {
        items.push({
          value: i,
          color: COLORS[colorIndex % COLORS.length],
          textColor: TEXT_COLORS[colorIndex % COLORS.length],
        });
        colorIndex++;
      }
    }
    return items;
  }, [config.min, config.max, config.excluded]);

  /* =========================
     SPIN HANDLER (FIXED)
     ========================= */

  const handleSpin = useCallback(() => {
    const now = Date.now();
    if (now - lastSpinTriggerAt < 350) return; // prevents double-tap glitch
    lastSpinTriggerAt = now;

    if (wheelItems.length === 0 || isSpinning) return;

    unlockAudioOnce();
    playSpinSound(config.volume ?? 0.5);

    const randomIndex = Math.floor(Math.random() * wheelItems.length);
    const selectedWinner = wheelItems[randomIndex].value;

    setIsSpinning(true);
    setWinner(selectedWinner);
    setShowModal(false);
  }, [wheelItems, isSpinning, config.volume]);

  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
    setShowModal(true);
    setSpinCount(prev => prev + 1);
  }, []);

  const handleClaimPrize = () => {
    if (winner !== null) {
      setConfig(prev => ({
        ...prev,
        excluded: [...prev.excluded, winner],
      }));
      setWinnersHistory(prev => [...prev, winner]);
    }
    setShowModal(false);
    setWinner(null);
  };

  const handleResetAndClose = () => {
    setConfig(prev => ({ ...prev, excluded: [] }));
    setWinnersHistory([]);
    setShowModal(false);
    setWinner(null);
  };

  const handleResetExcludedExternal = () => {
    setConfig(prev => ({ ...prev, excluded: [] }));
    setWinnersHistory([]);
  };

  const clearWinnersHistory = () => {
    if (window.confirm("Clear only the history list? (Excluded numbers will remain excluded)")) {
      setWinnersHistory([]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDD698] text-slate-900 overflow-x-hidden relative flex flex-col font-rye">
      <ShippingDecorations />
      <Snowfall />

      {/* HEADER */}
      <div className="pt-6 text-center">
        <h1 className="text-4xl md:text-7xl text-[#8B0000]">
          🤠 Stallion Holiday Raffle 🎄
        </h1>
        <p className="mt-2 text-xl text-[#8B4513]">
          Spin the wheel for a rootin' tootin' good time!
        </p>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-16 px-4 pb-32">

        <div className="scale-[0.55] sm:scale-[0.9] md:scale-100">
          <Wheel
            items={wheelItems}
            isSpinning={isSpinning}
            onSpinEnd={handleSpinEnd}
            winner={winner}
            volume={config.volume}
            onSpinTrigger={handleSpin}
          />
        </div>

        <div className="flex flex-col items-center gap-6">
          <Controls
            config={config}
            onUpdateConfig={setConfig}
            isSpinning={isSpinning}
            onResetExcluded={handleResetExcludedExternal}
            itemCount={wheelItems.length}
          />

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleSpin();
            }}
            disabled={isSpinning || wheelItems.length === 0}
            className="bg-[#B91C1C] hover:bg-[#C62828] text-white text-xl px-10 py-3 rounded-full border-4 border-[#D4AF37] shadow-[0_4px_0_#8B0000] active:translate-y-1 transition-all disabled:opacity-50"
          >
            🤠 SPIN THE WHEEL 🤠
          </button>

          {winnersHistory.length > 0 && (
            <div className="bg-[#FFF8DC] border-2 border-[#8B4513] rounded-lg p-4 max-w-xs">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[#8B0000] font-bold">🏆 Winners</h3>
                <button onClick={clearWinnersHistory} className="text-sm text-red-700">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {winnersHistory.map((w, i) => (
                  <span key={i} className="bg-green-700 text-white px-2 py-1 rounded">
                    #{w}
                  </span>
                ))}
              </div>
            </div>
          )}
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
