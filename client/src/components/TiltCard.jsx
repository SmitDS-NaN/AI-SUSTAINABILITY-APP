import React, { useState } from 'react';

export default function TiltCard({ children, className = '', maxTilt = 6 }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, shadowX: 0, shadowY: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTilt({
      x: Number(tiltX.toFixed(2)),
      y: Number(tiltY.toFixed(2)),
      spotlightX: Number(((x / rect.width) * 100).toFixed(1)),
      spotlightY: Number(((y / rect.height) * 100).toFixed(1))
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, spotlightX: 50, spotlightY: 50 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out'
      }}
      className={`card-3d rounded-2xl relative overflow-hidden group ${className}`}
    >
      {/* Light Reflection Spotlight Overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(600px circle at ${tilt.spotlightX || 50}% ${tilt.spotlightY || 50}%, rgba(16, 185, 129, 0.08), transparent 40%)`
        }}
      />
      {children}
    </div>
  );
}
