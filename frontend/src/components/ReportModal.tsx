import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { db } from '../services/db';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  userId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, questionId, userId }) => {
  const [reason, setReason] = useState<'wrong_answer' | 'typo' | 'bad_code' | 'duplicate' | 'other'>('wrong_answer');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.reportQuestion({
      user_id: userId,
      question_id: questionId,
      reason,
      details,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#162035] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#23304D] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#23304D]">
          <div className="flex items-center gap-2.5 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Report Question</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C2A48]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback Received</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Thank you for helping us maintain high question quality. Our AI audit pipeline will review this item.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Issue Category
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#23304D] bg-white dark:bg-[#10182B] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7657F6]"
              >
                <option value="wrong_answer">Incorrect answer marked as correct</option>
                <option value="typo">Typo or confusing phrasing</option>
                <option value="bad_code">Syntax error or invalid code snippet</option>
                <option value="duplicate">Duplicate of another question</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Explain what is wrong or provide the correct solution..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#23304D] bg-white dark:bg-[#10182B] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7657F6]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1C2A48] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#7657F6] hover:bg-[#6543F4] rounded-xl shadow-md transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

