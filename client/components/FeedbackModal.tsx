"use client";

import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !feedback.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1000));
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset after success
    setTimeout(() => {
      setIsSuccess(false);
      setFeedback("");
      setRating(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050510]/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c0c1d] shadow-2xl animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/30 hover:text-white/80 transition-colors"
          data-testid="close-modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-white">We Value Your Feedback</h2>
          <p className="mb-6 text-sm text-white/50">
            Help us improve MedLedger. What do you think so far?
          </p>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#34d399]/20 text-[#34d399]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white">Thank You!</p>
              <p className="text-sm text-white/50">Your feedback has been submitted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-transform hover:scale-110 ${rating && rating >= star ? "text-[#fbbf24]" : "text-white/20"}`}
                      data-testid={`star-${star}`}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={rating && rating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Comments</label>
                <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you love or what could be better..."
                    className="h-28 w-full resize-none rounded-[11px] bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/20 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!rating || !feedback.trim() || isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#7c6cf0] to-[#5b8cf0] py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(124,108,240,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
