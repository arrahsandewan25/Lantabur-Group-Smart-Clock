import React, { useEffect, useState } from 'react';

export const Backdrop: React.FC = () => {
  const [stars, setStars] = useState<{ id: number; top: number; left: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate simple high-efficiency floating particles/stars
    const newStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 bg-galaxy -z-50 select-none overflow-hidden">
      {/* Drifting star dust */}
      <div className="star-dust"></div>

      {/* Floating Aurora Waves */}
      <div className="aurora-wave aurora-1"></div>
      <div className="aurora-wave aurora-2"></div>
      <div className="aurora-wave aurora-3"></div>

      {/* High-efficiency particles with CSS drift */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-amber-200 opacity-60 animate-pulse"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.size * 3 + 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
export default Backdrop;
