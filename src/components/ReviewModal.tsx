"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { submitReview } from "@/lib/actions/referrals";
import { useToast } from "@/components/Toast";

interface ReviewModalProps {
  referralId: string;
  role: "business" | "referrer";
  /** The name of the person being reviewed (for display in the modal) */
  revieweeName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ReviewModal({
  referralId,
  role,
  revieweeName,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    const result = await submitReview(referralId, role, rating, review);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Review submitted!");
      onSubmitted();
    }
  }

  const displayRating = hovered || rating;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-border p-6 shadow-xl animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)]">
              Leave a Review
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              How was your experience with{" "}
              <span className="text-text-secondary font-medium">{revieweeName}</span>?
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 rounded-lg shrink-0 ml-4"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div>
            <label className="text-xs font-medium text-text-muted mb-2 block uppercase tracking-wider">
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500 rounded"
                  aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                >
                  <Star
                    size={32}
                    className={
                      star <= displayRating
                        ? "text-warning fill-warning"
                        : "text-navy-700"
                    }
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-text-secondary">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label
              htmlFor="review-text"
              className="text-xs font-medium text-text-muted mb-1 block uppercase tracking-wider"
            >
              Written Review <span className="normal-case text-text-muted">(optional)</span>
            </label>
            <textarea
              id="review-text"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              maxLength={500}
              className="textarea-field"
            />
            <p className="text-xs text-text-muted mt-1 text-right">
              {review.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-4 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
