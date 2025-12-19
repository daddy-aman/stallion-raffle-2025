import React, { useState, useMemo, useCallback } from 'react';
import Wheel from './components/Wheel';
import Controls from './components/Controls';
import WinnerModal from './components/WinnerModal';
import Snowfall from './components/Snowfall';
import ShippingDecorations from './components/ShippingDecorations';
import { RaffleConfig, WheelItem } from './types';
import { Star, Trash2 } from 'lucide-react';

/* =========================================================
   AUDIO — MOBILE & DESKTOP MATCHING (NO GLITCHES)
   ========================================================= */

const SPIN_REEL_URL =
  "https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/spinning-reel-27903.mp3";

const TICK_URL =
  "https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/spinning-roulette-wheel-429832.mp3";

const WIN_URL =
  "https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/spinning-reel-27903.mp3"; // use a different win sound if you want

const HORSE_URL =
  "https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/horse-neigh-sfx-373051.mp3";

const SILENT_MP3 =
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA";

let audioUnlocked = false;
let lastSpinAt = 0;

let spinReel: HTMLAudioElement | null = null;
let tickLoop: HTMLAudioElement | null = null;
let winSfx: HTMLAudioElement | null = null;
let horseSfx: HTMLAudioElement | null = null;

function unlockAudioOnce(volume: number) {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // Unlock audio on iOS
  const silent = new Audio(SILENT_MP3);
  silent.play().then(() => {
    silent.pause();
    silent.currentTime = 0;
  }).catch(() => {});

  // Create ALL sounds after user gesture
  spinReel = new Audio(SPIN_REEL_URL);
  spinReel.preload = "auto";
  spinReel.volume = volume;

  tickLoop = new Audio(TICK_URL);
  tickLoop.preload = "auto";
  tickLoop.loop = true;
  tickLoop.volume = Math.min(1, volume + 0.15);

  winSfx = new Audio(WIN_URL);
  winSfx.preload = "auto";
  winSfx.volume = volume;

  horseSfx = new Audio(HORSE_URL);
  horseSfx.preload = "auto";
  horseSfx.volume = volume;

  spinReel.load();
  tickLoop.load();
  winSfx.load();
  horseSfx.load();
}

function playOnce(a: HTMLAudioElement | null, volume: number) {
  if (!a) return;
  a.pause();
  a.currentTime = 0;
  a.volume = Math.max(0, Math.min(1, volume));
  a.play().catch(() => {});
}

function startTick(volume: number) {
  if (!tickLoop) return;
  tickLoop.currentTime = 0;
  tickLoop.volume = Math.max(0, Math.min(1, volume));
  tickLoop.play().catch(() => {});
}

function stopTick() {
  if (!tickLoop) return;
  tickLoop.pause();
  tickLoop.currentTime = 0;
}

/* =========================================================
   UI CONSTANTS
   ========================================================= */

const COLORS = ['#8B0000', '#2E8B57', '#F59E0B', '#A0522D', '#D4AF37'];
const TEXT_COLORS = ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#000000'];

/* =========================================================
   APP
   ========================================================= */

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
    let idx = 0;

    for (let i = config.min; i <= config.max; i++) {
      if (!config.excluded.includes(i)) {
        items.push({
          value: i,
          color: COLORS[idx % COLORS.length],
          textColor: TEXT_COLORS[idx % TEXT_COLORS.length],
        });
        idx++;
      }
    }
    return items;
  }, [config]);

  /* ======================
     SPIN
     ====================== */

  const handleSpin = useCallback(() => {
    const now = Date.now();
    if (now - lastSpinAt < 400) return; // prevent double-tap
    lastSpinAt = now;

    if (wheelItems.length === 0 || isSpinning) return;

    unlockAudioOnce(config.volume);

    playOnce(spinReel, config.volume);
    startTick(Math.min(1, config.volume + 0.15));

    const randomIndex = Math.floor(Math.random() * wheelItems.length);
    setWinner(wheelItems[randomIndex].value);

    setIsSpinning(true);
    setShowModal(false);
  }, [wheelItems, isSpinning, config.volume]);

  const handleSpinEnd = useCallback(() => {
    stopTick();

    setIsSpinning(false);
    setShowModal(true);
    setSpinCount(prev => prev + 1);

    // Winner sounds (mobile-safe because audio already unlocked)
    setTimeout(() => {
      playOnce(winSfx, config.volume);
      setTimeout(() => playOnce(horseSfx, config.volume), 120);
    }, 60);
  }, [config.volume]);

  /* ======================
     WINNER HANDLING
     ====================== */

  const handleClaimPrize = () => {
    if (winner !== null) {
      setConfig(prev => ({ ...prev, excluded: [...prev.excluded, winner] }));
      setWinnersHistory(prev => [...prev, winner]);
    }
    setWinner(null);
    setShowModal(false);
  };

  const handleResetAndClose = () => {
    setConfig(prev => ({ ...prev, excluded: [] }));
    setWinnersHistory([]);
    setWinner(null);
    setShowModal(false);
  };

  const handleResetExcludedExternal = () => {
    setConfig(prev => ({ ...prev, excluded: [] }));
    setWinnersHistory([]);
  };

  const clearWinnersHistory = () => {
    if (window.confirm("Clear history only?")) {
      setWinnersHistory([]);
    }
  };

  /* ======================
     RENDER
     ====================== */

  return (
    <div className="min-h-screen bg-[#FDD698] font-rye flex flex-col">
      <ShippingDecorations />
      <Snowfall />

      <header className="text-center mt-6">
        <h1 className="text-4xl md:text-7xl text-[#8B0000]">🤠 Stallion Holiday Raffle 🎄</h1>
        <p className="text-[#8B4513] mt-2 text-xl">
          Spin the wheel for a rootin' tootin' good time!
        </p>
      </header>

      <main className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-16 px-4 pb-32">
        <div className="scale-[0.6] sm:scale-[0.9] md:scale-100">
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
            className="bg-[#B91C1C] text-white px-10 py-3 rounded-full border-4 border-[#D4AF37]
                       shadow-[0_4px_0_#8B0000] active:translate-y-1 disabled:opacity-50"
          >
            🤠 SPIN THE WHEEL 🤠
          </button>

          {winnersHistory.length > 0 && (
            <div className="bg-[#FFF8DC] border-2 border-[#8B4513] rounded-lg p-4 max-w-xs">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[#8B0000] font-bold">🏆 Winners</h3>
                <button onClick={clearWinnersHistory}>
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
      </main>

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

