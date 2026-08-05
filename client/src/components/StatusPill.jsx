/**
 * StatusPill.jsx — Vibrant status badge component
 *
 * Statuses:
 *   Open        → Amber glow badge
 *   In Progress → Indigo/Sky glow badge
 *   Closed      → Emerald glow badge
 */

import React from 'react';

const STATUS_CONFIG = {
  'Open': {
    badgeStyle: 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10',
    dotStyle: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    pulse: true,
  },
  'In Progress': {
    badgeStyle: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10',
    dotStyle: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]',
    pulse: true,
  },
  'Closed': {
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10',
    dotStyle: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    pulse: false,
  },
};

export default function StatusPill({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    badgeStyle: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
    dotStyle: 'bg-slate-400',
    pulse: false,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${config.badgeStyle} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotStyle} ${config.pulse ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}
