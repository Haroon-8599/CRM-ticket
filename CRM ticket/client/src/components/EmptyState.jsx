/**
 * EmptyState.jsx — Friendly empty state illustration
 *
 * Shown when:
 *   - No tickets exist yet
 *   - A search/filter returns no results
 *
 * Props:
 *   type: 'no-tickets' | 'no-results'
 */

import React from 'react';
import { Search, Ticket } from 'lucide-react';

export default function EmptyState({ type = 'no-tickets', searchTerm = '' }) {
  const isNoResults = type === 'no-results';

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      {/* SVG illustration */}
      <div className="relative mb-6">
        {/* Outer glow ring */}
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/15 flex items-center justify-center">
            {isNoResults ? (
              <Search size={32} className="text-indigo-400" />
            ) : (
              <Ticket size={32} className="text-indigo-400" />
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-200 mb-2">
        {isNoResults
          ? `No tickets found for "${searchTerm}"`
          : 'No tickets yet'}
      </h3>

      <p className="text-sm text-surface-600 max-w-sm">
        {isNoResults
          ? 'Try adjusting your search term or clearing the status filter.'
          : 'When customers submit support requests, they\'ll appear here. Click "New Ticket" to create the first one.'}
      </p>
    </div>
  );
}
