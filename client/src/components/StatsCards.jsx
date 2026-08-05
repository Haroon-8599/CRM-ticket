/**
 * StatsCards.jsx — Light & Vibrant Metric Indicators
 */

import React from 'react';
import { Ticket, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function StatsCards({ tickets = [] }) {
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const closedCount = tickets.filter((t) => t.status === 'Closed').length;

  const stats = [
    {
      title: 'Total Tickets',
      count: total,
      icon: Ticket,
      gradient: 'from-indigo-50/90 to-blue-50/90',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-600 text-white shadow-indigo-500/30',
      textColor: 'text-indigo-900',
      badge: 'All active cases',
    },
    {
      title: 'Open Queue',
      count: openCount,
      icon: AlertCircle,
      gradient: 'from-amber-50/90 to-orange-50/90',
      border: 'border-amber-200',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
      textColor: 'text-amber-900',
      badge: 'Requires attention',
    },
    {
      title: 'In Progress',
      count: inProgressCount,
      icon: Clock,
      gradient: 'from-sky-50/90 to-cyan-50/90',
      border: 'border-sky-200',
      iconBg: 'bg-sky-500 text-white shadow-sky-500/30',
      textColor: 'text-sky-900',
      badge: 'Active work',
    },
    {
      title: 'Resolved Cases',
      count: closedCount,
      icon: CheckCircle2,
      gradient: 'from-emerald-50/90 to-teal-50/90',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
      textColor: 'text-emerald-900',
      badge: 'Completed',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-5 border ${item.border} bg-gradient-to-br ${item.gradient} glass-card-hover group relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {item.title}
                </p>
                <h3 className={`text-3xl font-black tracking-tight ${item.textColor}`}>
                  {item.count}
                </h3>
              </div>

              <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent size={24} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200/80 font-medium">
              <span>{item.badge}</span>
              <span className="font-mono font-bold text-slate-700">
                {total > 0 ? Math.round((item.count / total) * 100) : 0}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
