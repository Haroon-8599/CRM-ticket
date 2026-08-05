/**
 * TicketTable.jsx — Light & Vibrant Ticket List
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusPill from './StatusPill';
import { ChevronRight } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getAvatarColor(name = '') {
  const colors = [
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
  ];
  let charCodeSum = 0;
  for (let i = 0; i < name.length; i++) charCodeSum += name.charCodeAt(i);
  return colors[charCodeSum % colors.length];
}

function TicketRow({ ticket, onClick }) {
  const avatarGradient = getAvatarColor(ticket.customer_name);
  const initial = ticket.customer_name ? ticket.customer_name.charAt(0).toUpperCase() : '?';

  return (
    <tr
      onClick={() => onClick(ticket)}
      className="border-b border-slate-200/70 cursor-pointer hover:bg-indigo-50/60 transition-all duration-200 group"
    >
      <td className="px-5 py-4 font-mono text-xs font-extrabold text-indigo-600">
        <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200">
          {ticket.ticket_id}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${avatarGradient} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
            {initial}
          </div>
          <div>
            <p className="text-slate-900 text-sm font-extrabold group-hover:text-indigo-600 transition-colors">
              {ticket.customer_name}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">{ticket.customer_email}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-slate-700 text-sm max-w-sm">
        <p className="font-semibold truncate group-hover:text-slate-900 transition-colors">{ticket.subject}</p>
      </td>

      <td className="px-5 py-4">
        <StatusPill status={ticket.status} />
      </td>

      <td className="px-5 py-4 text-slate-500 text-xs font-semibold whitespace-nowrap">
        {formatDate(ticket.created_at)}
      </td>

      <td className="px-4 py-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
        <ChevronRight size={18} />
      </td>
    </tr>
  );
}

function TicketCard({ ticket, onClick }) {
  const avatarGradient = getAvatarColor(ticket.customer_name);
  const initial = ticket.customer_name ? ticket.customer_name.charAt(0).toUpperCase() : '?';

  return (
    <div
      onClick={() => onClick(ticket)}
      className="glass-card p-4 cursor-pointer glass-card-hover border border-slate-200/90 active:scale-[0.99] bg-white"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="font-mono text-xs font-bold text-indigo-600 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
          {ticket.ticket_id}
        </span>
        <StatusPill status={ticket.status} />
      </div>

      <h4 className="text-slate-900 font-bold text-sm mb-3 leading-snug line-clamp-2">
        {ticket.subject}
      </h4>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 font-medium">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${avatarGradient} text-white font-bold text-[10px] flex items-center justify-center`}>
            {initial}
          </div>
          <span className="font-bold text-slate-800">{ticket.customer_name}</span>
        </div>
        <span>{formatDate(ticket.created_at)}</span>
      </div>
    </div>
  );
}

export default function TicketTable({ tickets }) {
  const navigate = useNavigate();

  const handleClick = (ticket) => {
    navigate(`/tickets/${ticket.ticket_id}`);
  };

  return (
    <>
      <div className="hidden md:block glass-card overflow-hidden animate-fade-in border border-slate-200 bg-white shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              <th className="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Ticket ID</th>
              <th className="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Subject</th>
              <th className="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <TicketRow key={ticket.ticket_id} ticket={ticket} onClick={handleClick} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 animate-fade-in">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.ticket_id} ticket={ticket} onClick={handleClick} />
        ))}
      </div>
    </>
  );
}
