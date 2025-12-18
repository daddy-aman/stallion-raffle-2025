import React, { useState, useEffect } from 'react';
import { RaffleConfig } from '../types';
import { Volume2, VolumeX, Trash2 } from 'lucide-react';

interface ControlsProps {
  config: RaffleConfig;
  onUpdateConfig: (newConfig: RaffleConfig) => void;
  isSpinning: boolean;
  onResetExcluded: () => void;
  itemCount: number;
}

const Controls: React.FC<ControlsProps> = ({ config, onUpdateConfig, isSpinning, onResetExcluded }) => {
  const [excludedInput, setExcludedInput] = useState(config.excluded.join(', '));

  // Sync local input when prop changes
  useEffect(() => {
    setExcludedInput(config.excluded.join(', '));
  }, [config.excluded]);

  const handleConfigChange = (changes: Partial<RaffleConfig>) => {
    onUpdateConfig({ ...config, ...changes });
  };

  const handleExcludedBlur = () => {
     const excluded = excludedInput
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
    
    // Remove duplicates
    const uniqueExcluded = [...new Set(excluded)];
    onUpdateConfig({ ...config, excluded: uniqueExcluded });
  };

  const handleClearExclusions = () => {
    setExcludedInput('');
    onResetExcluded();
  };

  return (
    <div className="bg-[#EFE5D5] p-6 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.15)] border-2 border-[#C19A6B] max-w-sm w-full font-rye text-[#4A3728]">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-xl">🎰</span>
        <h2 className="text-xl text-[#1B4D3E] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">Raffle Settings</h2>
        <span className="text-xl">🎰</span>
      </div>

      <div className="space-y-5 font-sans">
        {/* Min / Max Inputs */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#6D4C41] mb-1 uppercase tracking-wide">Min Number</label>
            <input
              type="number"
              value={config.min}
              disabled={isSpinning}
              onChange={(e) => handleConfigChange({ min: parseInt(e.target.value) || 0 })}
              className="w-full h-12 text-center text-2xl font-bold rounded-lg border border-[#C19A6B] bg-[#FFF8F0] text-[#4A3728] focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513] transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#6D4C41] mb-1 uppercase tracking-wide">Max Number</label>
            <input
              type="number"
              value={config.max}
              disabled={isSpinning}
              onChange={(e) => handleConfigChange({ max: parseInt(e.target.value) || 0 })}
              className="w-full h-12 text-center text-2xl font-bold rounded-lg border border-[#C19A6B] bg-[#FFF8F0] text-[#4A3728] focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513] transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Volume Slider */}
        <div>
          <label className="block text-xs font-bold text-[#6D4C41] mb-2 uppercase tracking-wide">Sound Effects Volume</label>
          <div className="flex items-center gap-3 bg-[#D7C4A5]/20 p-2 rounded-lg border border-[#D7C4A5]/50">
             <button 
                onClick={() => handleConfigChange({ volume: config.volume === 0 ? 0.5 : 0 })}
                className="text-[#6D4C41] hover:text-[#8B4513] transition-colors"
             >
                {config.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
             <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={config.volume}
                onChange={(e) => handleConfigChange({ volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-[#C19A6B] rounded-lg appearance-none cursor-pointer accent-[#8B0000]"
             />
             <span className="text-sm font-bold w-10 text-right">{Math.round(config.volume * 100)}%</span>
          </div>
        </div>

        {/* Excluded Numbers Input */}
        <div>
          <label className="block text-xs font-bold text-[#6D4C41] mb-1 uppercase tracking-wide">Exclude Numbers (comma-separated)</label>
          <input
            type="text"
            value={excludedInput}
            disabled={isSpinning}
            onChange={(e) => setExcludedInput(e.target.value)}
            onBlur={handleExcludedBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleExcludedBlur()}
            placeholder="e.g. 3, 7, 12"
            className="w-full h-12 px-4 text-lg font-medium rounded-lg border border-[#C19A6B] bg-[#FFF8F0] text-[#4A3728] focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513] transition-all disabled:opacity-50 placeholder:text-[#C19A6B]/50"
          />
        </div>

        {/* Excluded Summary Box */}
        {config.excluded.length > 0 && (
            <div className="bg-[#E8C4C4]/40 border border-[#DFA3A3] rounded-lg p-3">
                <div className="flex justify-between items-start">
                    <div className="w-full">
                        <span className="font-bold text-[#8B0000] text-sm block mb-1">Excluded:</span>
                        <p className="text-sm text-[#8B0000]/90 font-medium break-words leading-snug">
                            {config.excluded.slice(0, 10).join(', ')}
                            {config.excluded.length > 10 && ` +${config.excluded.length - 10} more`}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleClearExclusions}
                    disabled={isSpinning}
                    className="text-[#B91C1C] hover:text-[#7F1D1D] text-xs font-bold underline mt-2 flex items-center gap-1 transition-colors"
                >
                    <Trash2 size={12} /> Clear all exclusions
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default Controls;