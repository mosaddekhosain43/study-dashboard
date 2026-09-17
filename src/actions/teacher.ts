"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  batches,
  batchMaterials,
  batchMessages,
  teacherBatches,
  topics,
  updates,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function requireTeacherOrAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    throw new Error("Unauthorized: Teacher access required.");
  }
  return user;
}

export async function getTeacherDashboardData() {
  const user = await requireTeacherOrAdmin();

  let assignedBatchIds: number[] = [];

  if (user.role === "admin") {
    // Admin can view all batches
    const allB = await db.select({ id: batches.id }).from(batches);
    assignedBatchIds = allB.map((b) => b.id);
  } else {
    const tb = await db
      .select()
      .from(teacherBatches)
      .where(eq(teacherBatches.teacherId, user.id));
    assignedBatchIds = tb.map((r) => r.batchId);
  }

  if (assignedBatchIds.length === 0) {
    return {
      teacherName: user.name,
      batches: [],
    };
  }

  const [assignedBatches, allStudents, allTopics, allUpdates, allMaterials, allMessages, allUsers] =
    await Promise.all([
      db.select().from(batches).where(inArray(batches.id, assignedBatchIds)),
      db
        .select()
        .from(users)
        .where(inArray(users.batchId, assignedBatchIds)),
      db.select().from(topics),
      db.select().from(updates).orderBy(desc(updates.createdAt)),
      db
        .select()
        .from(batchMaterials)
        .where(inArray(batchMaterials.batchId, assignedBatchIds))
        .orderBy(desc(batchMaterials.createdAt)),
      db
        .select()
        .from(batchMessages)
        .where(inArray(batchMessages.batchId, assignedBatchIds))
        .orderBy(desc(batchMessages.createdAt)),
      db.select({ id: users.id, name: users.name, role: users.role }).from(users),
    ]);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const batchesWithDetails = assignedBatches.map((batch) => {
    const batchStudents = allStudents
      .filter((s) => s.batchId === batch.id && s.role === "student")
      .map((student) => {
        const studentTopics = allTopics.filter((t) => t.userId === student.id);
        const totalTopics = studentTopics.length;
        const completedTopics = studentTopics.filter(
          (t) => t.status === "completed"
        ).length;
        const inProgressTopics = studentTopics.filter(
          (t) => t.status === "in_progress"
        ).length;
        const progressPercent =
          totalTopics > 0
            ? Math.round((completedTopics / totalTopics) * 100)
            : 0;

        const latestUpdate = allUpdates.find((u) => u.userId === student.id);

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          totalTopics,
          completedTopics,
          inProgressTopics,
          progressPercent,
          latestUpdateText: latestUpdate?.rawText || null,
          latestUpdateDate: latestUpdate?.date || null,
        };
      });

    const materials = allMaterials.filter((m) => m.batchId === batch.id);

    const messages = allMessages
      .filter((m) => m.batchId === batch.id)
      .map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        senderName: userMap.get(m.userId)?.name || "User",
        senderRole: userMap.get(m.userId)?.role || "student",
        isSelf: m.userId === user.id,
      }));

    return {
      id: batch.id,
      name: batch.name,
      slug: batch.slug,
      description: batch.description,
      students: batchStudents,
      materials,
      messages: messages.slice(0, 50),
    };
  });

  return {
    teacherName: user.name,
    batches: batchesWithDetails,
  };
}

export async function postBatchMaterialAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const batchId = parseInt(formData.get("batchId") as string, 10);
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const fileUrl = (formData.get("fileUrl") as string)?.trim() || null;
  const fileName = (formData.get("fileName") as string)?.trim() || null;
  const dueDate = (formData.get("dueDate") as string)?.trim() || null;

  if (!batchId || !title) {
    return { ok: false, error: "Title and Batch are required." };
  }

  try {
    await db.insert(batchMaterials).values({
      batchId,
      teacherId: user.id,
      title,
      description,
      fileUrl,
      fileName,
      dueDate,
    });
    revalidatePath("/teacher");
    revalidatePath("/");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to post material." };
  }
}

export async function deleteBatchMaterialAction(materialId: number) {
  await requireTeacherOrAdmin();
  try {
    await db.delete(batchMaterials).where(eq(batchMaterials.id, materialId));
    revalidatePath("/teacher");
    revalidatePath("/");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete material." };
  }
}

export async function sendBatchMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please log in to chat." };
  }

  const batchId = parseInt(formData.get("batchId") as string, 10);
  const content = (formData.get("content") as string)?.trim();

  if (!batchId || !content) {
    return { ok: false, error: "Message cannot be empty." };
  }

  const isPinned =
    formData.get("isPinned") === "true" &&
    (user.role === "teacher" || user.role === "admin");

  try {
    await db.insert(batchMessages).values({
      batchId,
      userId: user.id,
      content,
      isPinned,
    });
    revalidatePath("/teacher");
    revalidatePath("/classroom");
    revalidatePath("/");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to send message." };
  }
}

export async function togglePinBatchMessageAction(messageId: number, pinState: boolean) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return { ok: false, error: "Only teachers or admins can pin announcements." };
  }

  try {
    await db
      .update(batchMessages)
      .set({ isPinned: pinState })
      .where(eq(batchMessages.id, messageId));
    revalidatePath("/teacher");
    revalidatePath("/classroom");
    revalidatePath("/");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to update pin state." };
  }
}
