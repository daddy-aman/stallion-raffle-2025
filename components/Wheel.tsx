import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WheelItem } from '../types';

interface WheelProps {
  items: WheelItem[];
  isSpinning: boolean;
  onSpinEnd: () => void;
  onSpinTrigger: () => void;
  winner: number | null;
  volume: number;
}

// Helper to calculate arc path
const getCoordinatesForPercent = (percent: number, radius: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x * radius, y * radius];
};

const Wheel: React.FC<WheelProps> = ({ items, isSpinning, onSpinEnd, onSpinTrigger, winner, volume }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotation = useRef(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const spinSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [spinBuffer, setSpinBuffer] = useState<AudioBuffer | null>(null);
  
  // Track latest volume prop in ref for animation loop
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  
  const rafRef = useRef<number | null>(null);
  
  // Initialize Audio Context and Load Sound
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }

    // Load custom wheel sound
    fetch('https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/spinning-roulette-wheel-429832.mp3')
      .then(res => res.arrayBuffer())
      .then(buf => audioContextRef.current?.decodeAudioData(buf))
      .then(decoded => setSpinBuffer(decoded))
      .catch(err => console.error("Error loading wheel sound", err));

    return () => {
      if (spinSourceRef.current) {
        try { spinSourceRef.current.stop(); } catch(e) {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Handle Rotation Logic & Audio Sync
  useEffect(() => {
    if (isSpinning && winner !== null) {
      const winnerIndex = items.findIndex(item => item.value === winner);
      if (winnerIndex === -1) return;

      const segmentAngle = 360 / items.length;
      
      // Calculate final target rotation
      const spins = 3; 
      const segmentCenterAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
      
      // Target 12 o'clock (270 degrees)
      let targetRotation = 270 - segmentCenterAngle + (spins * 360);
      
      const currentMod = currentRotation.current % 360;
      const targetMod = targetRotation % 360;
      let diff = targetMod - currentMod;
      if (diff < 0) diff += 360; 
      
      const startRot = currentRotation.current;
      const finalRot = currentRotation.current + diff + (Math.floor(spins) * 360);

      // Update React state for CSS transition
      setRotation(finalRot);
      currentRotation.current = finalRot;

      // --- Start Audio ---
      if (audioContextRef.current && spinBuffer) {
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        // Stop previous
        if (spinSourceRef.current) {
            try { spinSourceRef.current.stop(); } catch(e) {}
        }

        const src = ctx.createBufferSource();
        src.buffer = spinBuffer;
        src.loop = true; // Loop in case sound is shorter than 10s

        const gain = ctx.createGain();
        // Initial volume set here, but will be overridden by animate loop immediately
        gain.gain.setValueAtTime(volumeRef.current, ctx.currentTime);
        gainNodeRef.current = gain;

        src.connect(gain);
        gain.connect(ctx.destination);
        
        // Start sound
        src.start(0);
        spinSourceRef.current = src;
      }
      // -------------------

      // Start Animation Loop (mostly for timing the end event and volume fade)
      const duration = 10000; // 10s spin
      const fadeStart = 0.6; // Start fading at 60% (6s)
      const fadeEnd = 0.85;   // Completely silent at 85% (8.5s)
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Volume Fade Logic
        if (gainNodeRef.current) {
            const baseVol = volumeRef.current;
            
            if (progress >= fadeEnd) {
                // Silence last 1.5 seconds
                gainNodeRef.current.gain.value = 0;
            } else if (progress > fadeStart) {
                // Linear fade out from 6s to 8.5s
                const fadeProgress = (progress - fadeStart) / (fadeEnd - fadeStart);
                gainNodeRef.current.gain.value = Math.max(0, baseVol * (1 - fadeProgress));
            } else {
                gainNodeRef.current.gain.value = baseVol;
            }
        }

        if (progress >= 1) {
            // Stop sound immediately
            if (spinSourceRef.current) {
                try { spinSourceRef.current.stop(); } catch(e) {}
                spinSourceRef.current = null;
            }
            onSpinEnd();
            return;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [isSpinning, winner, items, onSpinEnd, spinBuffer]);

  // Wheel Size Configuration
  const wheelSize = 600; 
  const radius = wheelSize / 2;
  const center = wheelSize / 2;

  const segments = useMemo(() => {
    const total = items.length;
    return items.map((item, index) => {
      const startAngle = index / total;
      const endAngle = (index + 1) / total;
      
      const [startX, startY] = getCoordinatesForPercent(startAngle, radius);
      const [endX, endY] = getCoordinatesForPercent(endAngle, radius);

      const largeArcFlag = 1 / total > 0.5 ? 1 : 0;
      const pathData = [
        `M ${center} ${center}`,
        `L ${center + startX} ${center + startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${center + endX} ${center + endY}`,
        `Z`
      ].join(' ');

      const midAngle = startAngle + (1 / total) / 2;
      const [textX, textY] = getCoordinatesForPercent(midAngle, radius * 0.85);

      const rotateAngle = midAngle * 360; 
      
      const fontSize = total > 100 
        ? Math.max(8, 400 / total) 
        : total > 50 
            ? Math.max(10, 600 / total) 
            : Math.max(16, Math.min(48, 800 / total));
            
      const fontWeight = total > 100 ? "normal" : "bold";

      return (
        <g key={item.value}>
          <path d={pathData} fill={item.color} stroke="#F5DEB3" strokeWidth={total > 100 ? 1 : 2} />
          <text
            x={center + textX}
            y={center + textY}
            fill={item.textColor}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontFamily="Rye, serif"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${rotateAngle}, ${center + textX}, ${center + textY})`}
            style={{ textShadow: total > 100 ? 'none' : '1px 1px 0px rgba(0,0,0,0.5)' }}
          >
            {item.value}
          </text>
        </g>
      );
    });
  }, [items, radius, center]);

  return (
    <div className="relative flex justify-center items-center select-none">
      {/* Outer Lights Ring */}
      <div 
        className="absolute rounded-full border-[12px] border-[#5D4037] bg-[#3E2723] shadow-2xl flex items-center justify-center"
        style={{ width: wheelSize + 48, height: wheelSize + 48 }}
      >
        {/* Blinking Lights */}
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full shadow-[0_0_8px_#FFD700] ${isSpinning ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: i % 2 === 0 ? '#FFD700' : '#FF4500',
              transform: `rotate(${i * (360/32)}deg) translate(${(wheelSize / 2) + 14}px)`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* The Spinning Wheel */}
      <div 
        ref={wheelRef}
        className="relative z-10 will-change-transform"
        style={{ 
          width: wheelSize, 
          height: wheelSize,
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 10s cubic-bezier(0.1, 0, 0.18, 1)' : 'none'
        }}
      >
        <svg 
            width={wheelSize} 
            height={wheelSize} 
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}
            className="rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
        >
          {segments}
        </svg>
      </div>

      {/* Center Spin Button */}
      <button 
        onClick={onSpinTrigger}
        disabled={isSpinning}
        className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group outline-none"
      >
        <div className="w-32 h-32 rounded-full border-[6px] border-[#D4AF37] shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform active:scale-95 group-hover:scale-105 cursor-pointer bg-white overflow-hidden relative">
             <img 
               src="https://raw.githubusercontent.com/daddy-aman/stallion-raffle-2025/main/Pram%20raffle.jpg" 
               alt="Spin" 
               className="w-full h-full object-cover" 
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
        </div>
      </button>

      {/* Pointer/Needle */}
      <div className="absolute z-30 top-[-60px] left-1/2 -translate-x-1/2 drop-shadow-xl">
           <svg width="50" height="60" viewBox="0 0 50 60">
             <path d="M 0 0 L 50 0 L 50 10 L 0 10 Z" fill="#8B4513" />
             <path d="M 5 10 L 45 10 L 25 50 Z" fill="#FDB931" stroke="#B8860B" strokeWidth="2" />
           </svg>
      </div>
    </div>
  );
};

export default Wheel;