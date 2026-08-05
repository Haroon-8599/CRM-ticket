/**
 * LoginPage.jsx — Support Agent & Manager Sign In / Sign Up Portal
 * 
 * Features:
 *  - Sign In & Sign Up Tabbed Workflow
 *  - High-visibility email and password inputs with icon-padding-left
 *  - Account Registration (saved to local storage user registry)
 *  - 1-Click Demo Fill / Auto-login buttons for rapid testing
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn, UserPlus, Sparkles, CheckCircle2, User, Briefcase, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = location.state?.from || '/';
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState('Support Agent');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Quick fill helper for Sign In
  const handleQuickFill = (name, email, role) => {
    setSignInEmail(email);
    setSignInPassword('DemoPassword123!');
    toast.success(`Filled demo credentials for ${name}`);
  };

  // Sign In Handler
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      toast.error('Please enter your work email');
      return;
    }
    if (!signInPassword.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Check registered users in storage
      const registeredUsers = JSON.parse(localStorage.getItem('crm_users_db') || '[]');
      const found = registeredUsers.find(u => u.email.toLowerCase() === signInEmail.trim().toLowerCase());

      const user = found || {
        name: signInEmail.split('@')[0].replace('.', ' ').toUpperCase(),
        email: signInEmail.trim(),
        role: 'Support Specialist',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      };

      localStorage.setItem('crm_user', JSON.stringify(user));
      if (onLoginSuccess) onLoginSuccess(user);

      toast.success(`Welcome back, ${user.name}!`);
      setLoading(false);
      navigate(redirectTarget);
    }, 500);
  };

  // Sign Up Handler
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!signUpName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      toast.error('Please enter a valid work email');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = {
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        role: signUpRole,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256`,
      };

      // Save to registered DB
      const existing = JSON.parse(localStorage.getItem('crm_users_db') || '[]');
      existing.push(newUser);
      localStorage.setItem('crm_users_db', JSON.stringify(existing));

      // Auto sign-in
      localStorage.setItem('crm_user', JSON.stringify(newUser));
      if (onLoginSuccess) onLoginSuccess(newUser);

      toast.success(`Account created! Welcome, ${newUser.name}`);
      setLoading(false);
      navigate(redirectTarget);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 glass-card overflow-hidden border border-slate-200/90 shadow-2xl animate-fade-in bg-white">
        
        {/* Left Visual Panel — Vibrant Gradient Graphic */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-yellow-400/20 blur-2xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold mb-6 shadow-sm">
              <Sparkles size={14} className="text-yellow-300" />
              Datastraw CRM v2.4
            </div>

            <h2 className="text-3xl font-black tracking-tight mb-3 leading-tight">
              Customer Support <br /><span className="text-yellow-300">Management Suite</span>
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed mb-8 font-medium">
              Create an account or sign in to access live ticket queues, search case histories, and collaborate with team notes.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
                <div className="w-9 h-9 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Full Ticket Lifecycle</p>
                  <p className="text-[11px] text-indigo-100">Create, update status, and append case notes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
                <div className="w-9 h-9 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Real-Time Search</p>
                  <p className="text-[11px] text-indigo-100">Instant lookup across customer queries</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-indigo-100 font-medium">
            <span>Datastraw Internal Suite</span>
            <span className="flex items-center gap-1 text-white font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> System Ready
            </span>
          </div>
        </div>

        {/* Right Form Panel — Tabbed Sign In / Sign Up */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-50/50">
          <div className="max-w-md mx-auto w-full">
            
            {/* Tabs Header */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-200/80 rounded-xl mb-8 border border-slate-300/60">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'signin'
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn size={15} />
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'signup'
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus size={15} />
                Sign Up
              </button>
            </div>

            {/* TAB 1: SIGN IN FORM */}
            {activeTab === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-5" id="signin-form">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Welcome Back</h3>
                  <p className="text-xs text-slate-500 mb-5">Sign in to your support agent account</p>
                </div>

                {/* Email Field */}
                <div>
                  <label className="form-label" htmlFor="signin-email">Work Email</label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                    <input
                      id="signin-email"
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="agent@datastraw.in"
                      className="form-input icon-padding-left"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="form-label mb-0" htmlFor="signin-password">Password</label>
                    <a
                      href="#forgot"
                      onClick={(e) => { e.preventDefault(); toast('Password reset link sent to admin', { icon: '🔑' }); }}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                    <input
                      id="signin-password"
                      type={showSignInPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="form-input icon-padding-left icon-padding-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3.5 z-10 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Remember session
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-indigo-500/25"
                  id="signin-submit-btn"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Sign In to Dashboard
                    </>
                  )}
                </button>

                {/* Quick Fill Demo Accounts */}
                <div className="pt-5 border-t border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Quick Demo Credentials Fill:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Alex Rivera', 'alex.rivera@datastraw.in', 'Support Lead')}
                      className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left text-xs text-indigo-900 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold block">Alex Rivera</span>
                        <span className="text-[10px] text-indigo-600">Support Lead</span>
                      </div>
                      <ArrowRight size={14} className="text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill('Sarah Connor', 'sarah.c@datastraw.in', 'Tier 2 Agent')}
                      className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left text-xs text-purple-900 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold block">Sarah Connor</span>
                        <span className="text-[10px] text-purple-600">Tier 2 Agent</span>
                      </div>
                      <ArrowRight size={14} className="text-purple-600" />
                    </button>
                  </div>
                </div>

              </form>
            ) : (
              /* TAB 2: SIGN UP FORM */
              <form onSubmit={handleSignUpSubmit} className="space-y-4" id="signup-form">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Create Account</h3>
                  <p className="text-xs text-slate-500 mb-4">Register a new support agent profile</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="form-label" htmlFor="signup-name">Full Name</label>
                  <div className="relative flex items-center">
                    <User size={18} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                    <input
                      id="signup-name"
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="form-input icon-padding-left"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label className="form-label" htmlFor="signup-email">Work Email</label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                    <input
                      id="signup-email"
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="rahul.sharma@datastraw.in"
                      className="form-input icon-padding-left"
                    />
                  </div>
                </div>

                {/* Role / Department */}
                <div>
                  <label className="form-label" htmlFor="signup-role">Role / Department</label>
                  <div className="relative flex items-center">
                    <Briefcase size={18} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                    <select
                      id="signup-role"
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value)}
                      className="form-input icon-padding-left appearance-none bg-white cursor-pointer"
                    >
                      <option value="Support Agent">Support Agent</option>
                      <option value="Support Lead">Support Lead</option>
                      <option value="Customer Success Specialist">Customer Success Specialist</option>
                      <option value="Tier 2 Technical Support">Tier 2 Technical Support</option>
                    </select>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label" htmlFor="signup-password">Password</label>
                    <div className="relative flex items-center">
                      <Lock size={16} className="absolute left-3 z-10 text-slate-400 pointer-events-none" />
                      <input
                        id="signup-password"
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="form-input icon-padding-left text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="signup-confirm-password">Confirm Password</label>
                    <div className="relative flex items-center">
                      <Lock size={16} className="absolute left-3 z-10 text-slate-400 pointer-events-none" />
                      <input
                        id="signup-confirm-password"
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="form-input icon-padding-left text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-indigo-500/25 mt-2"
                  id="signup-submit-btn"
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Complete Registration
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
