/**
 * CreateTicket.jsx — Authenticated Ticket Creation Form
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, AlertCircle, Sparkles, User, Mail, FileText, AlignLeft, ShieldCheck } from 'lucide-react';
import { createTicket } from '../api/tickets';
import toast from 'react-hot-toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-rose-600">
      <AlertCircle size={14} />
      {message}
    </p>
  );
}

export default function CreateTicket({ currentUser }) {
  const navigate = useNavigate();
  const user = currentUser || JSON.parse(localStorage.getItem('crm_user') || 'null');

  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_email: prev.customer_email || user.email || '',
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.customer_name.trim())
      newErrors.customer_name = 'Customer name is required.';

    if (!form.customer_email.trim()) {
      newErrors.customer_email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(form.customer_email.trim())) {
      newErrors.customer_email = 'Please enter a valid email address.';
    }

    if (!form.subject.trim())
      newErrors.subject = 'Subject is required.';

    if (!form.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (form.description.trim().length < 15) {
      newErrors.description = 'Please provide at least 15 characters of detail.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await createTicket({
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
      });

      toast.success(`Ticket ${result.ticket_id} created successfully!`, {
        duration: 4500,
      });

      navigate(`/tickets/${result.ticket_id}`);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create ticket. Please try again.';
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Back Link */}
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
          <Sparkles size={13} className="text-indigo-600" />
          New Customer Ticket
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Support Ticket</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          A sequential ticket ID (e.g. TKT-007) will be assigned automatically.
        </p>
      </div>

      {/* Authenticated User Session Banner */}
      {user && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-900">Authenticated Session</p>
              <p className="text-xs text-indigo-700 font-medium">
                Signed in as <strong className="text-indigo-950">{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
            Verified Agent
          </span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} id="create-ticket-form" noValidate>
        <div className="glass-card p-6 sm:p-8 space-y-6 border border-slate-200 bg-white shadow-xl">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="customer_name" className="form-label flex items-center gap-1.5">
                <User size={15} className="text-indigo-600" />
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="customer_name"
                type="text"
                value={form.customer_name}
                onChange={handleChange('customer_name')}
                placeholder="e.g. Priya Sharma"
                className={`form-input ${errors.customer_name ? 'border-rose-500 focus:ring-rose-500' : ''}`}
              />
              <FieldError message={errors.customer_name} />
            </div>

            {/* Customer Email */}
            <div>
              <label htmlFor="customer_email" className="form-label flex items-center gap-1.5">
                <Mail size={15} className="text-indigo-600" />
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="customer_email"
                type="email"
                value={form.customer_email}
                onChange={handleChange('customer_email')}
                placeholder="e.g. priya@example.com"
                className={`form-input ${errors.customer_email ? 'border-rose-500 focus:ring-rose-500' : ''}`}
              />
              <FieldError message={errors.customer_email} />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="form-label flex items-center gap-1.5">
              <FileText size={15} className="text-indigo-600" />
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={handleChange('subject')}
              placeholder="Brief summary of the issue..."
              className={`form-input ${errors.subject ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            />
            <FieldError message={errors.subject} />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="form-label flex items-center gap-1.5">
              <AlignLeft size={15} className="text-indigo-600" />
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Provide complete steps to reproduce, error messages, and customer impact..."
              className={`form-input resize-none ${errors.description ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            />
            <div className="flex items-center justify-between mt-2">
              <FieldError message={errors.description} />
              <span className={`text-xs ml-auto font-semibold ${form.description.length < 15 ? 'text-slate-400' : 'text-emerald-600'}`}>
                {form.description.length} characters
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link to="/" className="btn-secondary text-sm">Cancel</Link>
            <button
              type="submit"
              id="create-ticket-submit"
              disabled={submitting}
              className="btn-primary text-sm shadow-indigo-500/25"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><Send size={16} /> Submit Ticket</>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
