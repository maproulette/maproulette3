import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import { FormattedDate, FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import {
  fetchChallengeReviewSummary,
  fetchChallengeReviews,
  fetchUserChallengeReview,
  removeChallengeReview,
  submitChallengeReview,
} from "../../services/Challenge/ChallengeReview";
import BusySpinner from "../BusySpinner/BusySpinner";
import External from "../External/External";
import Modal from "../Modal/Modal";
import messages from "./Messages";

const ESTIMATED_TIME_LABELS = {
  "1min": "~1 min",
  "5min": "~5 min",
  "15min": "~15 min",
  "30min": "~30 min",
  "30plus": "30+ min",
};

const DIFFICULTY_LABELS = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

const StarRating = ({ value, onChange, disabled = false, size = "mr-text-2xl" }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="mr-inline-flex mr-gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={classNames(
            size,
            "mr-transition-colors mr-duration-100",
            disabled ? "mr-cursor-default" : "mr-cursor-pointer",
            (hovered || value) >= star ? "mr-text-yellow" : "mr-text-white-40",
          )}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => onChange?.(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const CategoryRating = ({ label, value, onChange }) => (
  <div className="mr-flex mr-items-center mr-justify-between mr-mb-2">
    <span className="mr-text-sm mr-mr-3">{label}</span>
    <StarRating value={value} onChange={onChange} size="mr-text-lg" />
  </div>
);

const ReviewForm = ({ challengeId, existingReview, onSubmitted }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [instructionsClear, setInstructionsClear] = useState(
    existingReview?.instructionsClear || 0,
  );
  const [challengeInteresting, setChallengeInteresting] = useState(
    existingReview?.challengeInteresting || 0,
  );
  const [imagerySuitable, setImagerySuitable] = useState(existingReview?.imagerySuitable || 0);
  const [estimatedTime, setEstimatedTime] = useState(existingReview?.estimatedTime || "");
  const [difficulty, setDifficulty] = useState(existingReview?.difficulty || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) return;
    setSubmitting(true);
    const reviewData = {
      rating,
      ...(instructionsClear > 0 && { instructionsClear }),
      ...(challengeInteresting > 0 && { challengeInteresting }),
      ...(imagerySuitable > 0 && { imagerySuitable }),
      ...(estimatedTime && { estimatedTime }),
      ...(difficulty && { difficulty }),
      ...(comment.trim() && { comment: comment.trim() }),
    };
    await submitChallengeReview(challengeId, reviewData);
    setSubmitting(false);
    onSubmitted?.();
  };

  const handleRemove = async () => {
    setSubmitting(true);
    await removeChallengeReview(challengeId);
    setRating(0);
    setInstructionsClear(0);
    setChallengeInteresting(0);
    setImagerySuitable(0);
    setEstimatedTime("");
    setDifficulty("");
    setComment("");
    setSubmitting(false);
    onSubmitted?.();
  };

  return (
    <div className="mr-bg-black-15 mr-rounded mr-p-4 mr-mb-4">
      <h4 className="mr-text-md mr-font-bold mr-mb-3">
        <FormattedMessage {...messages.reviewFormTitle} />
      </h4>

      <div className="mr-mb-3">
        <span className="mr-text-sm mr-text-yellow mr-mr-2">
          <FormattedMessage {...messages.reviewOverallRating} />
        </span>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="mr-mb-3">
        <p className="mr-text-xs mr-text-white-50 mr-mb-2">
          <FormattedMessage {...messages.reviewOptionalFeedback} />
        </p>
        <CategoryRating
          label={<FormattedMessage {...messages.reviewInstructionsClear} />}
          value={instructionsClear}
          onChange={setInstructionsClear}
        />
        <CategoryRating
          label={<FormattedMessage {...messages.reviewChallengeInteresting} />}
          value={challengeInteresting}
          onChange={setChallengeInteresting}
        />
        <CategoryRating
          label={<FormattedMessage {...messages.reviewImagerySuitable} />}
          value={imagerySuitable}
          onChange={setImagerySuitable}
        />
      </div>

      <div className="mr-flex mr-gap-4 mr-mb-3">
        <div className="mr-flex-1">
          <label className="mr-text-xs mr-text-white-50 mr-block mr-mb-1">
            <FormattedMessage {...messages.reviewEstimatedTime} />
          </label>
          <select
            className="mr-bg-black-15 mr-text-white mr-rounded mr-p-1 mr-w-full mr-text-sm"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          >
            <option value="">--</option>
            {Object.entries(ESTIMATED_TIME_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="mr-flex-1">
          <label className="mr-text-xs mr-text-white-50 mr-block mr-mb-1">
            <FormattedMessage {...messages.reviewDifficulty} />
          </label>
          <select
            className="mr-bg-black-15 mr-text-white mr-rounded mr-p-1 mr-w-full mr-text-sm"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">--</option>
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mr-mb-3">
        <label className="mr-text-xs mr-text-white-50 mr-block mr-mb-1">
          <FormattedMessage {...messages.reviewComment} />
        </label>
        <textarea
          className="mr-bg-black-15 mr-text-white mr-rounded mr-p-2 mr-w-full mr-text-sm"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
        />
      </div>

      <div className="mr-flex mr-gap-2">
        <button
          className={classNames("mr-button mr-button--small", {
            "mr-opacity-50 mr-cursor-not-allowed": rating < 1 || submitting,
          })}
          disabled={rating < 1 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <BusySpinner inline />
          ) : existingReview ? (
            <FormattedMessage {...messages.reviewUpdate} />
          ) : (
            <FormattedMessage {...messages.reviewSubmit} />
          )}
        </button>
        {existingReview && (
          <button
            className="mr-button mr-button--small mr-button--danger"
            disabled={submitting}
            onClick={handleRemove}
          >
            <FormattedMessage {...messages.reviewRemove} />
          </button>
        )}
      </div>
    </div>
  );
};

const SummaryBar = ({ label, value, max = 5 }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mr-flex mr-items-center mr-mb-1">
      <span className="mr-text-xs mr-w-40 mr-mr-2">{label}</span>
      <div className="mr-flex-1 mr-bg-black-15 mr-rounded mr-h-2 mr-overflow-hidden">
        <div className="mr-bg-yellow mr-h-2 mr-rounded" style={{ width: `${pct}%` }} />
      </div>
      <span className="mr-text-xs mr-ml-2 mr-w-8 mr-text-right">{value?.toFixed(1)}</span>
    </div>
  );
};

const ReviewSummarySection = ({ summary, onViewAll }) => {
  if (!summary || summary.totalReviews === 0) {
    return (
      <p className="mr-text-sm mr-text-white-50 mr-mb-4">
        <FormattedMessage {...messages.reviewNoReviews} />
      </p>
    );
  }

  return (
    <div className="mr-bg-black-15 mr-rounded mr-p-4 mr-mb-4">
      <div className="mr-flex mr-items-center mr-mb-3">
        <span className="mr-text-3xl mr-font-bold mr-text-yellow mr-mr-2">
          {summary.avgRating?.toFixed(1)}
        </span>
        <div>
          <StarRating value={Math.round(summary.avgRating)} disabled />
          <p className="mr-text-xs mr-text-white-50">
            <FormattedMessage
              {...messages.reviewCount}
              values={{ count: summary.totalReviews }}
            />
          </p>
        </div>
      </div>

      {summary.avgInstructionsClear != null && (
        <SummaryBar
          label={<FormattedMessage {...messages.reviewInstructionsClear} />}
          value={summary.avgInstructionsClear}
        />
      )}
      {summary.avgChallengeInteresting != null && (
        <SummaryBar
          label={<FormattedMessage {...messages.reviewChallengeInteresting} />}
          value={summary.avgChallengeInteresting}
        />
      )}
      {summary.avgImagerySuitable != null && (
        <SummaryBar
          label={<FormattedMessage {...messages.reviewImagerySuitable} />}
          value={summary.avgImagerySuitable}
        />
      )}

      <div className="mr-flex mr-gap-4 mr-mt-3 mr-text-xs mr-text-white-50">
        {summary.topDifficulty && (
          <span>
            <FormattedMessage {...messages.reviewDifficulty} />:{" "}
            <span className="mr-text-white">
              {DIFFICULTY_LABELS[summary.topDifficulty] || summary.topDifficulty}
            </span>
          </span>
        )}
        {summary.topEstimatedTime && (
          <span>
            <FormattedMessage {...messages.reviewEstimatedTime} />:{" "}
            <span className="mr-text-white">
              {ESTIMATED_TIME_LABELS[summary.topEstimatedTime] || summary.topEstimatedTime}
            </span>
          </span>
        )}
      </div>

      {onViewAll && (
        <button
          className="mr-text-green-lighter mr-text-sm hover:mr-text-white mr-mt-3"
          onClick={onViewAll}
        >
          <FormattedMessage {...messages.reviewViewAll} />
        </button>
      )}
    </div>
  );
};

const AllReviewsModal = ({ challengeId, summary, onClose }) => {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const loadPage = useCallback(async (pageOffset) => {
    setLoading(true);
    const result = await fetchChallengeReviews(challengeId, PAGE_SIZE, pageOffset);
    const items = Array.isArray(result) ? result : Array.isArray(result?.result) ? result.result : [];
    if (pageOffset === 0) {
      setAllReviews(items);
    } else {
      setAllReviews((prev) => [...prev, ...items]);
    }
    setHasMore(items.length === PAGE_SIZE);
    setLoading(false);
  }, [challengeId]);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  const loadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    loadPage(nextOffset);
  };

  return (
    <External>
      <Modal isActive wide onClose={onClose}>
        <div className="mr-p-4">
          <h3 className="mr-text-lg mr-font-bold mr-mb-4">
            <FormattedMessage {...messages.reviewAllReviewsTitle} />
          </h3>
          {summary && summary.totalReviews > 0 && (
            <div className="mr-bg-black-15 mr-rounded mr-p-3 mr-mb-4">
              <div className="mr-flex mr-items-center mr-mb-3">
                <span className="mr-text-2xl mr-font-bold mr-text-yellow mr-mr-2">
                  {summary.avgRating?.toFixed(1)}
                </span>
                <div>
                  <StarRating value={Math.round(summary.avgRating)} disabled size="mr-text-sm" />
                  <p className="mr-text-xs mr-text-white-50">
                    <FormattedMessage {...messages.reviewCount} values={{ count: summary.totalReviews }} />
                  </p>
                </div>
              </div>
              {summary.avgInstructionsClear != null && (
                <SummaryBar label={<FormattedMessage {...messages.reviewInstructionsClear} />} value={summary.avgInstructionsClear} />
              )}
              {summary.avgChallengeInteresting != null && (
                <SummaryBar label={<FormattedMessage {...messages.reviewChallengeInteresting} />} value={summary.avgChallengeInteresting} />
              )}
              {summary.avgImagerySuitable != null && (
                <SummaryBar label={<FormattedMessage {...messages.reviewImagerySuitable} />} value={summary.avgImagerySuitable} />
              )}
              <div className="mr-flex mr-gap-4 mr-mt-2 mr-text-xs mr-text-white-50">
                {summary.topDifficulty && (
                  <span>
                    <FormattedMessage {...messages.reviewDifficulty} />:{" "}
                    <span className="mr-text-white">{DIFFICULTY_LABELS[summary.topDifficulty] || summary.topDifficulty}</span>
                  </span>
                )}
                {summary.topEstimatedTime && (
                  <span>
                    <FormattedMessage {...messages.reviewEstimatedTime} />:{" "}
                    <span className="mr-text-white">{ESTIMATED_TIME_LABELS[summary.topEstimatedTime] || summary.topEstimatedTime}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mr-max-h-96 mr-overflow-y-auto">
            {allReviews.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
            {loading && (
              <div className="mr-flex mr-justify-center mr-py-2">
                <BusySpinner />
              </div>
            )}
            {!loading && allReviews.length === 0 && (
              <p className="mr-text-sm mr-text-white-50">
                <FormattedMessage {...messages.reviewNoReviews} />
              </p>
            )}
          </div>
          {hasMore && !loading && (
            <button
              className="mr-button mr-button--small mr-mt-3"
              onClick={loadMore}
            >
              <FormattedMessage {...messages.showMore} />
            </button>
          )}
        </div>
      </Modal>
    </External>
  );
};

const ReviewItem = ({ review }) => (
  <div className="mr-bg-black-15 mr-rounded mr-p-3 mr-mb-2">
    <div className="mr-flex mr-items-center mr-justify-between mr-mb-1">
      <StarRating value={review.rating} disabled size="mr-text-sm" />
      <span className="mr-text-xs mr-text-white-50">
        <FormattedDate value={review.modified || review.created} year="numeric" month="short" day="numeric" />
      </span>
    </div>
    {(review.instructionsClear || review.challengeInteresting || review.imagerySuitable) && (
      <div className="mr-flex mr-gap-4 mr-mt-2 mr-text-xs mr-text-white-50">
        {review.instructionsClear && (
          <span>
            <FormattedMessage {...messages.reviewInstructionsClear} />:{" "}
            <span className="mr-text-yellow">{"★".repeat(review.instructionsClear)}{"☆".repeat(5 - review.instructionsClear)}</span>
          </span>
        )}
        {review.challengeInteresting && (
          <span>
            <FormattedMessage {...messages.reviewChallengeInteresting} />:{" "}
            <span className="mr-text-yellow">{"★".repeat(review.challengeInteresting)}{"☆".repeat(5 - review.challengeInteresting)}</span>
          </span>
        )}
        {review.imagerySuitable && (
          <span>
            <FormattedMessage {...messages.reviewImagerySuitable} />:{" "}
            <span className="mr-text-yellow">{"★".repeat(review.imagerySuitable)}{"☆".repeat(5 - review.imagerySuitable)}</span>
          </span>
        )}
      </div>
    )}
    <div className="mr-flex mr-gap-3 mr-mt-1 mr-text-xs mr-text-white-50">
      {review.difficulty && <span>{DIFFICULTY_LABELS[review.difficulty]}</span>}
      {review.estimatedTime && <span>{ESTIMATED_TIME_LABELS[review.estimatedTime]}</span>}
    </div>
    {review.comment && <p className="mr-text-sm mr-mt-2">{review.comment}</p>}
  </div>
);

export const ChallengeReviewPane = ({ challengeId, user }) => {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [summaryResult, reviewsResult, userReviewResult] = await Promise.all([
      fetchChallengeReviewSummary(challengeId),
      fetchChallengeReviews(challengeId),
      user ? fetchUserChallengeReview(challengeId) : Promise.resolve(null),
    ]);

    setSummary(summaryResult || null);
    setReviews(Array.isArray(reviewsResult) ? reviewsResult : []);

    if (userReviewResult && userReviewResult.rating) {
      setUserReview(userReviewResult);
    } else {
      setUserReview(null);
    }

    setLoading(false);
  }, [challengeId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="mr-py-4 mr-flex mr-justify-center">
        <BusySpinner />
      </div>
    );
  }

  return (
    <div className="mr-mt-4">
      <ReviewSummarySection summary={summary} onViewAll={() => setShowAllModal(true)} />

      {user && (
        <ReviewForm
          challengeId={challengeId}
          existingReview={userReview}
          onSubmitted={loadData}
        />
      )}

      {reviews.length > 0 && (
        <div>
          <div className="mr-flex mr-items-center mr-justify-between mr-mb-2">
            <h4 className="mr-text-md mr-font-bold">
              <FormattedMessage {...messages.reviewRecentReviews} />
            </h4>
            <button
              className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
              onClick={() => setShowAllModal(true)}
            >
              <FormattedMessage {...messages.reviewViewAll} />
            </button>
          </div>
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </div>
      )}

      {showAllModal && (
        <AllReviewsModal
          challengeId={challengeId}
          summary={summary}
          onClose={() => setShowAllModal(false)}
        />
      )}
    </div>
  );
};
