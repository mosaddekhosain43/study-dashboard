import { getCurrentUser } from "@/lib/auth";
import { getMyFeedbacksAction } from "@/actions/feedback";
import FeedbackClient from "./FeedbackClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Feedback & Suggestions — Study Dashboard",
  description:
    "Share your feedback, feature requests, or report data/date issues to improve your study tracking experience.",
};

export default async function FeedbackPage() {
  const [user, myFeedbacksRes] = await Promise.all([
    getCurrentUser(),
    getMyFeedbacksAction().catch(() => ({ ok: true, feedbacks: [] })),
  ]);

  return (
    <div className="py-2 sm:py-4">
      <FeedbackClient
        initialMyFeedbacks={myFeedbacksRes.feedbacks || []}
        currentUser={
          user
            ? {
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null
        }
      />
    </div>
  );
}
