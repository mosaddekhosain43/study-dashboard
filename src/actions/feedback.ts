"use server";

import { desc, eq } from "drizzle-orm";
import { db, initializeDb } from "@/db";
import { feedbacks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface FeedbackItem {
  id: number;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  category: string;
  subject: string | null;
  message: string;
  rating: number | null;
  status: string;
  createdAt: Date;
}

export async function submitFeedbackAction(data: {
  category: "general" | "data_problem" | "feature_request" | "bug";
  subject?: string;
  message: string;
  rating?: number;
  userName?: string;
  userEmail?: string;
}): Promise<{ ok: boolean; error?: string; id?: number }> {
  try {
    await initializeDb();
    const user = await getCurrentUser();

    if (!data.message || !data.message.trim()) {
      return { ok: false, error: "Please write your feedback or problem details." };
    }

    const userName = user?.name || data.userName || "Anonymous Student";
    const userEmail = user?.email || data.userEmail || null;

    const [inserted] = await db
      .insert(feedbacks)
      .values({
        userId: user?.id ?? null,
        userName,
        userEmail,
        category: data.category || "general",
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
        rating: data.rating || null,
        status: "new",
      })
      .returning();

    revalidatePath("/feedback");
    revalidatePath("/admin");

    return { ok: true, id: inserted.id };
  } catch (err: any) {
    console.error("submitFeedbackAction error:", err);
    return { ok: false, error: err?.message || "Failed to submit feedback." };
  }
}

export async function getMyFeedbacksAction(): Promise<{
  ok: boolean;
  feedbacks: FeedbackItem[];
  error?: string;
}> {
  try {
    await initializeDb();
    const user = await getCurrentUser();
    if (!user) {
      return { ok: true, feedbacks: [] };
    }

    const rows = await db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, user.id))
      .orderBy(desc(feedbacks.createdAt));

    return { ok: true, feedbacks: rows as FeedbackItem[] };
  } catch (err: any) {
    console.error("getMyFeedbacksAction error:", err);
    return { ok: false, feedbacks: [], error: err?.message };
  }
}

export async function getAllFeedbacksAction(): Promise<{
  ok: boolean;
  feedbacks: FeedbackItem[];
  error?: string;
}> {
  try {
    await initializeDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { ok: false, feedbacks: [], error: "Unauthorized" };
    }

    const rows = await db
      .select()
      .from(feedbacks)
      .orderBy(desc(feedbacks.createdAt));

    return { ok: true, feedbacks: rows as FeedbackItem[] };
  } catch (err: any) {
    console.error("getAllFeedbacksAction error:", err);
    return { ok: false, feedbacks: [], error: err?.message };
  }
}

export async function updateFeedbackStatusAction(
  id: number,
  status: "new" | "reviewed" | "resolved"
): Promise<{ ok: boolean; error?: string }> {
  try {
    await initializeDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { ok: false, error: "Unauthorized" };
    }

    await db
      .update(feedbacks)
      .set({ status })
      .where(eq(feedbacks.id, id));

    revalidatePath("/admin");
    revalidatePath("/feedback");

    return { ok: true };
  } catch (err: any) {
    console.error("updateFeedbackStatusAction error:", err);
    return { ok: false, error: err?.message || "Failed to update feedback status." };
  }
}
