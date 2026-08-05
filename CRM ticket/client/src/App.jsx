/**
 * App.jsx — Application Router & Authentication Guard
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import LoginPage from './pages/LoginPage';
import toast from 'react-hot-toast';

// Protected Route wrapper requiring active user session
function ProtectedRoute({ children, currentUser }) {
  const location = useLocation();
  const user = currentUser || JSON.parse(localStorage.getItem('crm_user') || 'null');

  if (!user) {
    toast.error('Please sign in or create an account to create a ticket.', {
      id: 'auth-required-toast',
    });
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crm_user') || 'null');
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <CreateTicket currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route path="/tickets/:ticket_id" element={<TicketDetail />} />
        </Routes>
      </main>
    </div>
  );
}
