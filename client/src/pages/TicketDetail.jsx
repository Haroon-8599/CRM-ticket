/**
 * TicketDetail.jsx — Light & Vibrant Ticket Detail View
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Calendar, Clock,
  Loader2, CheckCircle2, ShieldAlert, Sparkles
} from 'lucide-react';
import { fetchTicket, updateTicket } from '../api/tickets';
import StatusPill from '../components/StatusPill';
import NoteThread from '../components/NoteThread';
import toast from 'react-hot-toast';

const VALID_STATUSES = ['Open', 'In Progress', 'Closed'];

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 space-y-4 bg-white">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-4 w-full max-w-lg" />
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="glass-card p-6 space-y-3 bg-white">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
      </div>
    </div>
  );
}

function NotFound({ ticketId }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center glass-card p-8 animate-fade-in max-w-lg mx-auto bg-white border border-slate-200">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert size={32} />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-1">Ticket Not Found</h2>
      <p className="text-slate-500 text-sm font-medium mb-6">
        No support ticket matching ID <span className="font-mono text-rose-600 font-bold">{ticketId}</span> was found in the database.
      </p>
      <button onClick={() => navigate('/')} className="btn-primary">
        <ArrowLeft size={16} /> Return to Dashboard
      </button>
    </div>
  );
}

export default function TicketDetail() {
  const { ticket_id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await fetchTicket(ticket_id);
      setTicket(data);
      setNotes(data.notes || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error('Failed to load ticket details');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticket_id]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;

    const previousStatus = ticket.status;
    setTicket((prev) => ({ ...prev, status: newStatus }));
    setStatusUpdating(true);

    try {
      const result = await updateTicket(ticket_id, { status: newStatus });
      setTicket((prev) => ({ ...prev, updated_at: result.updated_at }));
      toast.success(`Ticket status updated to "${newStatus}"`);
    } catch (err) {
      setTicket((prev) => ({ ...prev, status: previousStatus }));
      toast.error('Could not update status');
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleNoteAdded = (newNote) => {
    setNotes((prev) => [...prev, newNote]);
    setTicket((prev) => ({ ...prev, updated_at: newNote.created_at }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-4 w-28 mb-6" />
        <DetailSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotFound ticketId={ticket_id} />
      </div>
    );
  }

  const initial = ticket.customer_name ? ticket.customer_name.charAt(0).toUpperCase() : '?';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        id="back-to-dashboard"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Main Ticket Card Header */}
      <div className="glass-card p-6 sm:p-8 border border-slate-200 bg-white shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-extrabold text-indigo-700 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200">
                {ticket.ticket_id}
              </span>
              <StatusPill status={ticket.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap gap-6 text-xs text-slate-500 font-medium pt-4 border-t border-slate-100 mt-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-indigo-600" />
            Created: <strong className="text-slate-800">{fmt(ticket.created_at)}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-purple-600" />
            Updated: <strong className="text-slate-800">{fmt(ticket.updated_at)}</strong>
          </span>
        </div>
      </div>

      {/* Customer Info & Description */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Customer Card */}
        <div className="md:col-span-4 glass-card p-6 border border-slate-200 bg-white shadow-xl">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <User size={14} className="text-indigo-600" /> Customer Information
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
              {initial}
            </div>
            <div>
              <p className="text-slate-900 font-black text-base">{ticket.customer_name}</p>
              <span className="inline-block text-[11px] font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                Verified Account
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Email Address</label>
            <a
              href={`mailto:${ticket.customer_email}`}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 truncate"
            >
              <Mail size={14} />
              {ticket.customer_email}
            </a>
          </div>
        </div>

        {/* Status Changer & Issue Description */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Status Changer Controller */}
          <div className="glass-card p-6 border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" /> Status Controller
              </h2>
              {statusUpdating && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                  <Loader2 size={13} className="animate-spin" /> Updating...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5" id="status-changer">
              {VALID_STATUSES.map((s) => {
                const isActive = ticket.status === s;
                return (
                  <button
                    key={s}
                    id={`status-btn-${s.replace(' ', '-').toLowerCase()}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusUpdating}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                      isActive
                        ? s === 'Open'
                          ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-md shadow-amber-500/10'
                          : s === 'In Progress'
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-900 shadow-md shadow-indigo-500/10'
                          : 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    } disabled:opacity-50`}
                  >
                    {isActive && <CheckCircle2 size={14} />}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6 border border-slate-200 bg-white shadow-xl">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Issue Description
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">
                {ticket.description}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Notes Thread */}
      <NoteThread
        notes={notes}
        ticketId={ticket_id}
        onNoteAdded={handleNoteAdded}
      />

    </div>
  );
}
