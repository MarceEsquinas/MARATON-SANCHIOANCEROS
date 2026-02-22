import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => (
  <svg
    width="250"
    height="150"
    viewBox="0 0 250 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Road/Asphalt */}
    <path d="M20 130H230" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
    
    {/* Don Quijote (Tall and thin) */}
    <g transform="translate(60, 40)">
      {/* Body */}
      <path d="M20 30L25 70L15 70L20 30Z" fill="#3B82F6" /> {/* Blue shirt */}
      <circle cx="20" cy="20" r="8" fill="#FDE68A" /> {/* Head */}
      <path d="M16 15L24 15L20 5L16 15Z" fill="#9CA3AF" /> {/* Simple helmet */}
      {/* Lance */}
      <path d="M35 10L10 80" stroke="#4B5563" strokeWidth="2" />
      {/* Legs (running) */}
      <path d="M20 70L10 90" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 70L30 85" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Sancho Panza (Short and round) */}
    <g transform="translate(140, 60)">
      {/* Body */}
      <circle cx="20" cy="50" r="20" fill="#3B82F6" /> {/* Blue shirt */}
      <circle cx="20" cy="25" r="10" fill="#FDE68A" /> {/* Head */}
      <path d="M10 20C10 20 20 10 30 20" stroke="#4B5563" strokeWidth="2" fill="none" /> {/* Hat */}
      {/* Lance (shorter) */}
      <path d="M40 30L20 70" stroke="#4B5563" strokeWidth="2" />
      {/* Legs (running) */}
      <path d="M15 70L5 80" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 70L35 78" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Text */}
    <text x="125" y="145" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="#1D4ED8">
      QUIJOTE RUN
    </text>
  </svg>
);
