/**
 * NoteThread.jsx — Light & Vibrant Case Notes Thread
 */

import React, { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { updateTicket } from '../api/tickets';
import toast from 'react-hot-toast';

function formatNoteDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NoteBubble({ note }) {
  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center mt-0.5 font-bold shadow-xs">
        <MessageSquare size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500 mb-1">{formatNoteDate(note.created_at)}</p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-sm px-4 py-3 shadow-xs">
          <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
        </div>
      </div>
    </div>
  );
}

export default function NoteThread({ notes, ticketId, onNoteAdded }) {
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = noteText.trim();
    if (!text) return;

    setSubmitting(true);
    try {
      await updateTicket(ticketId, { notes: text });

      const newNote = {
        note_text: text,
        created_at: new Date().toISOString(),
      };
      onNoteAdded(newNote);
      setNoteText('');
      toast.success('Note added to ticket history');
    } catch (err) {
      toast.error('Failed to add note. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 bg-white border border-slate-200 shadow-xl">
      <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-indigo-600" />
        Notes &amp; Internal Comments
        {notes.length > 0 && (
          <span className="ml-auto bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {notes.length}
          </span>
        )}
      </h3>

      {notes.length === 0 ? (
        <p className="text-xs font-medium text-slate-500 mb-5 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
          No internal notes yet. Add a note below to update team history.
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {notes.map((note, i) => (
            <NoteBubble key={i} note={note} />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3" id="add-note-form">
        <textarea
          id="note-textarea"
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note or internal investigation update..."
          className="form-input resize-none text-sm"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            id="submit-note-btn"
            disabled={submitting || !noteText.trim()}
            className="btn-primary text-xs sm:text-sm font-bold shadow-indigo-500/25"
          >
            {submitting ? (
              <><Loader2 size={14} className="animate-spin" /> Adding...</>
            ) : (
              <><Send size={14} /> Add Note</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
