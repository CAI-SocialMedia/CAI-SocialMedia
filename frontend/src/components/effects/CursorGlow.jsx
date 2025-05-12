import React, { useState, useEffect } from 'react';

export const CursorGlow = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameId;

    const updateCursorPosition = (e) => {
      frameId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
      });
    };

    const handleMouseOut = (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest('body')) {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', updateCursorPosition);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', updateCursorPosition);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
      <div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden transition-opacity duration-300"
          style={{ opacity: isVisible ? 1 : 0 }}
      >
        {/* Dış halka - daha yumuşak ve düşük opaklık */}
        <div
            className="pointer-events-none absolute rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-3xl"
            style={{
              width: '100px',
              height: '100px',
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0})`,
              transition: 'transform 0.5s ease, opacity 0.5s ease'
            }}
        />

        {/* İç halka - daha küçük ve az belirgin */}
        <div
            className="pointer-events-none absolute rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
            style={{
              width: '80px',
              height: '80px',
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0})`,
              transition: 'transform 0.5s ease, opacity 0.5s ease'
            }}
        />
      </div>
  );
};
