import React, { useMemo } from 'react';

const Snowfall: React.FC = () => {
  const flakes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      opacity: Math.random(),
      size: Math.random() * 10 + 10,
      delay: `-${Math.random() * 10}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            opacity: flake.opacity,
            fontSize: `${flake.size}px`,
            animationDelay: flake.delay
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowfall;