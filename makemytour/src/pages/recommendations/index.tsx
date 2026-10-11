import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Sparkles,
  Hotel,
  Plane,
  MapPin,
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import {
  getRecommendations,
  submitRecommendationFeedback,
} from "../../api";

interface Recommendation {
  id: string;
  userId: string;
  itemType: "HOTEL" | "FLIGHT" | "DESTINATION";
  itemId: string;
  title: string;
  description: string;
  reason: string;
  algorithm: string;
  score: number;
  feedback: string;
}

export default function RecommendationsPage() {
  const router = useRouter();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [showReason, setShowReason] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [feedbackLoadingId, setFeedbackLoadingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!router.isReady) return;

    const queryUserId =
      typeof router.query.userId === "string" ? router.query.userId : "";

    setUserId(queryUserId);
  }, [router.isReady, router.query.userId]);

  const loadRecommendations = async () => {
    if (!userId) {
      setError("User ID missing. Open this page with ?userId=YOUR_USER_ID.");
      setRecommendations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getRecommendations(userId);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Recommendation loading error:", err);
      setError(
        "Could not load recommendations. Check that the backend is running and the user ID is valid."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    if (userId) {
      loadRecommendations();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, router.isReady]);

  const handleFeedback = async (
    recommendationId: string,
    feedback: "HELPFUL" | "IRRELEVANT"
  ) => {
    if (!userId) {
      setFeedbackError("User ID is missing.");
      return;
    }

    try {
      setFeedbackLoadingId(recommendationId);
      setFeedbackError("");

      const updated = await submitRecommendationFeedback(
        userId,
        recommendationId,
        feedback
      );

      setRecommendations((previous) =>
        previous.map((item) =>
          item.id === recommendationId
            ? { ...item, feedback: updated.feedback }
            : item
        )
      );
    } catch (err) {
      console.error("Feedback submission error:", err);
      setFeedbackError("Feedback save nahi hua. Please try again.");
    } finally {
      setFeedbackLoadingId(null);
    }
  };

  const getIcon = (type: string) => {
    if (type === "HOTEL") return <Hotel size={22} />;
    if (type === "FLIGHT") return <Plane size={22} />;
    return <MapPin size={22} />;
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-600">
              <Sparkles size={24} />
              <span className="font-semibold">Made for you</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Personalized Recommendations
            </h1>

            <p className="mt-2 text-gray-600">
              Discover hotels, flights and destinations selected around your
              travel history and preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRecommendations}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            Loading your recommendations...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p>{error}</p>
            <p className="mt-2 text-sm">
              For initial testing, open this page using
              /recommendations?userId=YOUR_USER_ID.
            </p>
          </div>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <Sparkles className="mx-auto mb-3 text-blue-500" size={36} />
            <h2 className="text-xl font-semibold">No recommendations yet</h2>
            <p className="mt-2 text-gray-600">
              Add some hotels or flights to your catalogue, or make a booking,
              to help personalize your suggestions.
            </p>
          </div>
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                    {getIcon(item.itemType)}
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {item.itemType}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h2>

                <p className="mt-2 flex-1 text-sm text-gray-600">
                  {item.description}
                </p>

                <div className="relative mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setShowReason(showReason === item.id ? null : item.id)
                    }
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                    aria-expanded={showReason === item.id}
                  >
                    <Info size={16} />
                    Why this recommendation?
                  </button>

                  {showReason === item.id && (
                    <div
                      role="tooltip"
                      className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-gray-700"
                    >
                      {item.reason || "Suggested based on available travel information."}
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="text-xs text-gray-500">
                    Recommendation method: {item.algorithm}
                  </p>

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    Was this recommendation useful?
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={feedbackLoadingId === item.id}
                      onClick={() => handleFeedback(item.id, "HELPFUL")}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50 ${
                        item.feedback === "HELPFUL"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <ThumbsUp size={16} />
                      Helpful
                    </button>

                    <button
                      type="button"
                      disabled={feedbackLoadingId === item.id}
                      onClick={() => handleFeedback(item.id, "IRRELEVANT")}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50 ${
                        item.feedback === "IRRELEVANT"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <ThumbsDown size={16} />
                      Irrelevant
                    </button>
                  </div>

                  {feedbackLoadingId === item.id && (
                    <p className="mt-2 text-xs text-gray-500">
                      Saving feedback...
                    </p>
                  )}

                  {item.feedback && item.feedback !== "NONE" && (
                    <p className="mt-2 text-xs text-gray-500">
                      Your feedback: {item.feedback}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {feedbackError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {feedbackError}
          </p>
        )}
      </div>
    </main>
  );
}
