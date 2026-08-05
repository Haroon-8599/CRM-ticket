/**
 * Dashboard.jsx — Light & Vibrant CRM Workspace
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, RefreshCw, X, Filter, Sparkles } from 'lucide-react';
import { fetchTickets } from '../api/tickets';
import TicketTable from '../components/TicketTable';
import SkeletonRow from '../components/SkeletonRow';
import EmptyState from '../components/EmptyState';
import StatsCards from '../components/StatsCards';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Closed'];

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [allTickets, setAllTickets] = useState([]);

  const debounceTimer = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 300);
  };

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTickets({
        status,
        search: debouncedSearch,
      });
      setTickets(data);

      if (status === 'All' && !debouncedSearch) {
        setAllTickets(data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      toast.error('Could not connect to CRM API. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const isFiltered = debouncedSearch || status !== 'All';
  const isEmpty = !loading && tickets.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2 shadow-xs">
            <Sparkles size={13} className="text-indigo-600" />
            Datastraw Agent Dashboard
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Queues</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time tracking of customer queries, statuses, and team notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-btn"
            onClick={loadTickets}
            className="btn-secondary text-xs sm:text-sm"
            title="Refresh queue"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
            <span>Refresh</span>
          </button>

          <Link to="/tickets/new">
            <button id="dashboard-new-ticket-btn" className="btn-primary text-xs sm:text-sm shadow-indigo-500/25">
              <Plus size={16} />
              <span>Create Ticket</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <StatsCards tickets={allTickets.length > 0 ? allTickets : tickets} />

      {/* Search & Filter Controls */}
      <div className="glass-card p-4 mb-6 border border-slate-200 bg-white">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          
          {/* Live Search Input */}
          <div className="relative flex-1 flex items-center">
            <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by Ticket ID (e.g. TKT-001), name, email, or subject..."
              className="form-input icon-padding-left icon-padding-right py-2.5 text-sm"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 text-slate-400 hover:text-slate-700 transition-colors p-1"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Filter Segmented Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
            <span className="text-xs text-slate-500 font-bold px-2 hidden sm:flex items-center gap-1">
              <Filter size={12} /> Filter:
            </span>
            {STATUS_OPTIONS.map((opt) => {
              const active = status === opt;
              return (
                <button
                  key={opt}
                  id={`filter-${opt.replace(' ', '-').toLowerCase()}`}
                  onClick={() => setStatus(opt)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Ticket List / Loading / Empty State */}
      {loading ? (
        <div className="glass-card p-6 overflow-hidden bg-white">
          <div className="hidden md:block">
            <table className="w-full">
              <tbody>
                <SkeletonRow count={5} mode="table" />
              </tbody>
            </table>
          </div>
          <div className="md:hidden">
            <SkeletonRow count={4} mode="card" />
          </div>
        </div>
      ) : isEmpty ? (
        <EmptyState
          type={isFiltered ? 'no-results' : 'no-tickets'}
          searchTerm={debouncedSearch}
        />
      ) : (
        <div>
          <TicketTable tickets={tickets} />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-4 px-1">
            <span>Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
            {isFiltered && (
              <button onClick={() => { setStatus('All'); clearSearch(); }} className="text-indigo-600 hover:underline font-bold">
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
