/**
 * Navbar.jsx — Light & Vibrant Top Navigation Bar
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Plus, LogOut, LayoutDashboard, Shield, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isNewTicketPage = location.pathname === '/tickets/new';
  const isLoginPage = location.pathname === '/login';

  const user = currentUser || JSON.parse(localStorage.getItem('crm_user') || 'null');

  const handleSignOut = () => {
    localStorage.removeItem('crm_user');
    if (onLogout) onLogout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/85 backdrop-blur-xl shadow-xs">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
            id="nav-brand"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Ticket size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Datastraw <span className="gradient-text">CRM</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                location.pathname === '/'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>

            <Link
              to="/login"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLoginPage
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield size={15} />
              Agent Portal
            </Link>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {user ? (
            <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-full py-1 pl-1 pr-3">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128"}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] font-semibold text-indigo-600 leading-tight">{user.role}</p>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-600 transition-colors ml-1 p-1"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-secondary text-xs py-1.5 px-3">
              <LogIn size={14} />
              Sign In / Up
            </Link>
          )}

          {!isNewTicketPage && (
            <Link to="/tickets/new" id="nav-new-ticket-btn">
              <button className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-indigo-500/25">
                <Plus size={16} />
                <span className="hidden sm:inline">New Ticket</span>
              </button>
            </Link>
          )}

        </div>
      </nav>
    </header>
  );
}
