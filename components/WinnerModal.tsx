import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Smile } from 'lucide-react';

interface WinnerModalProps {
  winner: number;
  onClose: () => void;
  onResetWinners: () => void;
  volume: number;
  spinCount: number;
}

const LOGISTICS_JOKES = [
  "Why did the bubble wrap lose its job? It just couldn't handle the pressure.",
  "Customer: 'I paid for overnight shipping!' Support: 'Sir, with all due respect, it was a very long night.'",
  "My boss shouted 'Secure the cargo!', so I gave the box a blanket and told it everything will be okay.",
  "Why did the cardboard box go to the gym? It wanted to get ripped.",
  "Why did the shipping container go to therapy? It had way too much emotional baggage.",
  "Customer: 'It says delivered but I don't have it.' Me: 'Have you checked your neighbor's roof?'",
  "Why did the forklift get a promotion? He was really uplifting the team.",
  "Why don't packages play hide and seek? Because good luck finding anything in this warehouse.",
  "Why do logistics managers make terrible comedians? Their delivery is always late.",
  "Customer: 'Where is my package?' Me: 'It's currently on a spiritual journey. It will arrive when it finds itself.'"
];

// Fisher-Yates Shuffle to randomize joke order once on load
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Create a static randomized list of jokes so order is consistent per session but random
const SHUFFLED_JOKES = shuffleArray(LOGISTICS_JOKES);

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, onResetWinners, volume, spinCount }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Use the shuffled array. Use modulus to loop if spinCount exceeds joke count.
  const joke = SHUFFLED_JOKES[(spinCount - 1) % SHUFFLED_JOKES.length];

  useEffect(() => {
    // 1. Setup Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        if (volume > 0) {
            const now = ctx.currentTime;

            // Helper to play a single note
            const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sawtooth') => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.type = type;
                osc.frequency.value = freq;

                // Bright brassy sound
                filter.type = 'lowpass';
                filter.frequency.value = 2000;

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                // Envelope
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.2 * volume, startTime + 0.05); // Attack
                gain.gain.setValueAtTime(0.2 * volume, startTime + duration - 0.1); // Sustain
                gain.gain.linearRampToValueAtTime(0, startTime + duration); // Release

                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            // Fanfare Sequence (Ba-da-da-DAAA!)
            playNote(392.00, now + 0.0, 0.15); // G4
            playNote(523.25, now + 0.15, 0.15); // C5
            playNote(659.25, now + 0.30, 0.15); // E5
            
            // Big chord finish
            const hold = 1.5;
            playNote(523.25, now + 0.5, hold); // C5
            playNote(659.25, now + 0.5, hold); // E5
            playNote(783.99, now + 0.5, hold); // G5
            playNote(1046.50, now + 0.5, hold); // C6
            playNote(261.63, now + 0.5, hold, 'square'); // C4 Bass

            // Load and Play Horse Sound (async)
            fetch('https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/horse-neigh-sfx-373051.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    // Check if component is still mounted (context not closed)
                    if (ctx.state === 'closed') return;

                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    
                    const gain = ctx.createGain();
                    gain.gain.value = volume;
                    
                    source.connect(gain);
                    gain.connect(ctx.destination);

                    // Schedule to play after the fanfare (1.0s delay), or immediately if late
                    const targetTime = now + 1.0;
                    const playTime = Math.max(ctx.currentTime, targetTime);
                    source.start(playTime);
                })
                .catch(e => console.error("Failed to play horse sound", e));
        }
    }

    // 2. Confetti Animation
    const duration = 1500; // Reduced from 3000ms
    const end = Date.now() + duration;

    const colors = ['#8B0000', '#228B22', '#FFD700', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Big burst in center
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['star'],
        scalar: 1.2
    });

    return () => {
      if (audioContextRef.current) {
        // Allow sound to tail off before closing
        const ctx = audioContextRef.current;
        setTimeout(() => {
             if(ctx.state !== 'closed') ctx.close();
        }, 3000);
      }
    };

  }, [volume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#FFF8DC] border-8 border-[#8B4513] rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_0_50px_rgba(255,215,0,0.5)] transform animate-in zoom-in-50 duration-300 leather-texture">
        {/* Decorative Corner Stars */}
        <div className="absolute top-4 left-4 text-[#8B0000]"><Trophy size={32} /></div>
        <div className="absolute top-4 right-4 text-[#8B0000]"><Trophy size={32} /></div>
        
        <h2 className="font-christmas text-4xl md:text-5xl text-[#228B22] mb-2 font-bold drop-shadow-sm">
          We Have a Winner!
        </h2>
        
        <div className="py-6">
            <div className="font-rye text-[120px] leading-none text-[#8B0000] drop-shadow-[4px_4px_0_#FFD700]">
                {winner}
            </div>
            <div className="text-[#8B4513] font-rye text-xl mt-4">
                Congratulations, Stallion!
            </div>
            
            {/* Joke Section */}
            <div className="mt-8 bg-white/60 p-5 rounded-xl border-2 border-[#8B4513]/20 shadow-inner relative mx-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#228B22] text-white p-1.5 rounded-full">
                    <Smile size={20} />
                </div>
                <p className="text-[#5D4037] font-sans font-medium italic text-lg leading-relaxed">
                   "{joke}"
                </p>
            </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
            <button
            onClick={onClose}
            className="w-full bg-[#228B22] hover:bg-[#1a6b1a] text-white font-rye text-2xl py-4 rounded-xl border-b-8 border-[#155e15] active:border-b-0 active:translate-y-2 transition-all shadow-lg"
            >
            Close & Spin Again
            </button>
            
            <button 
                onClick={() => {
                    onResetWinners();
                    onClose();
                }}
                className="text-[#8B4513] underline font-bold text-sm hover:text-[#8B0000]"
            >
                Reset All Winners & Start Over
            </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;