/**
 * SkeletonRow.jsx — Loading placeholder for ticket list
 *
 * Shows a shimmer animation while tickets are being fetched.
 * Uses the .skeleton class defined in index.css.
 */

import React from 'react';

// A single skeleton row (desktop table row)
function SkeletonTableRow() {
  return (
    <tr className="border-b border-surface-700">
      <td className="px-4 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-36" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-48" /></td>
      <td className="px-4 py-4"><div className="skeleton h-6 w-24 rounded-full" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-28" /></td>
    </tr>
  );
}

// A single skeleton card (mobile)
function SkeletonCard() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
      <div className="skeleton h-4 w-48" />
      <div className="skeleton h-3 w-32" />
    </div>
  );
}

export default function SkeletonRow({ count = 5, mode = 'table' }) {
  const rows = Array.from({ length: count });

  if (mode === 'card') {
    return (
      <div className="space-y-3">
        {rows.map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <>
      {rows.map((_, i) => <SkeletonTableRow key={i} />)}
    </>
  );
}
