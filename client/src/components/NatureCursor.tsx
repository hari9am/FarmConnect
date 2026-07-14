import React, { useEffect, useState } from 'react';

interface TrailItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  rotation: number;
}

const EMOJIS = ['🍃', '🌿', '🌱', '🥦', '🥕', '🍅', '🌽', '🥬', '🍄'];

export const NatureCursor: React.FC = () => {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - lastPos.x, e.clientY - lastPos.y);
      
      // Only add a new item if the mouse has moved a certain distance
      if (dist > 50) {
        const newItem: TrailItem = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          rotation: Math.random() * 360,
        };

        setTrail((prev) => [...prev.slice(-15), newItem]);
        setLastPos({ x: e.clientX, y: e.clientY });

        // Remove item after 1 second
        setTimeout(() => {
          setTrail((prev) => prev.filter((item) => item.id !== newItem.id));
        }, 800);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [lastPos]);

  // Don't show on mobile as it's a cursor effect
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }

  return (
    <>
      {trail.map((item) => (
        <div
          key={item.id}
          className="cursor-trail animate-fade-out"
          style={{
            left: item.x,
            top: item.y,
            transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
            opacity: 0.6,
          }}
        >
          {item.emoji}
        </div>
      ))}
      <style>{`
        @keyframes fade-out {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -100%) scale(0.2); opacity: 0; }
        }
        .animate-fade-out {
          animation: fade-out 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
};
