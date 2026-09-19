"use server";

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  batches,
  batchMaterials,
  batchMessages,
  lessons,
  subjects,
  teacherBatches,
  topics,
  users,
} from "@/db/schema";
import { getCurrentUser, hashPassword } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return user;
}

export async function getAdminDataAction() {
  await requireAdmin();

  const [allBatches, allUsers, allTeacherBatches, allTopics] = await Promise.all([
    db.select().from(batches).orderBy(batches.name),
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(teacherBatches),
    db.select().from(topics),
  ]);

  const teachers = allUsers
    .filter((u) => u.role === "teacher")
    .map((t) => {
      const assignedBatchIds = allTeacherBatches
        .filter((tb) => tb.teacherId === t.id)
        .map((tb) => tb.batchId);
      const assignedBatches = allBatches.filter((b) =>
        assignedBatchIds.includes(b.id)
      );
      return {
        id: t.id,
        name: t.name,
        email: t.email,
        assignedBatches: assignedBatches.map((b) => b.name),
        assignedBatchIds,
        createdAt: t.createdAt,
      };
    });

  const students = allUsers
    .filter((u) => u.role === "student")
    .map((s) => {
      const batch = allBatches.find((b) => b.id === s.batchId);
      const studentTopics = allTopics.filter((tp) => tp.userId === s.id);
      const totalTopics = studentTopics.length;
      const completedTopics = studentTopics.filter(
        (tp) => tp.status === "completed"
      ).length;
      const progressPercent =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        batchName: batch?.name || "No Batch",
        totalTopics,
        completedTopics,
        progressPercent,
        createdAt: s.createdAt,
      };
    });

  return {
    batches: allBatches.map((b) => ({
      ...b,
      studentCount: allUsers.filter(
        (u) => u.role === "student" && u.batchId === b.id
      ).length,
    })),
    teachers,
    students,
  };
}

export async function createBatchAction(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { ok: false, error: "Batch name is required." };

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    await db.insert(batches).values({ name, slug, description });
    revalidatePath("/admin");
    revalidatePath("/teacher");
    revalidatePath("/register");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create batch." };
  }
}

export async function deleteBatchAction(batchId: number) {
  await requireAdmin();
  try {
    // Unassign students from this batch
    await db.update(users).set({ batchId: null }).where(eq(users.batchId, batchId));
    // Remove teacher mappings
    await db.delete(teacherBatches).where(eq(teacherBatches.batchId, batchId));
    // Remove batch materials
    await db.delete(batchMaterials).where(eq(batchMaterials.batchId, batchId));
    // Remove batch messages
    await db.delete(batchMessages).where(eq(batchMessages.batchId, batchId));
    // Remove batch
    await db.delete(batches).where(eq(batches.id, batchId));
    revalidatePath("/admin");
    revalidatePath("/teacher");
    revalidatePath("/register");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete batch." };
  }
}

export async function createTeacherAction(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const batchIdsRaw = formData.getAll("batchIds") as string[];

  if (!name || !email || !password) {
    return { ok: false, error: "Name, email, and password are required." };
  }

  // Check email
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = hashPassword(password);

  try {
    const [teacher] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "teacher",
      })
      .returning();

    // Assign batches
    const batchIds = batchIdsRaw
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    for (const bId of batchIds) {
      await db.insert(teacherBatches).values({
        teacherId: teacher.id,
        batchId: bId,
      });
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create teacher." };
  }
}

export async function deleteUserAction(userId: number) {
  await requireAdmin();
  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete user." };
  }
}

export async function updateBatchAction(batchId: number, name: string, description?: string | null) {
  await requireAdmin();
  const cleanName = name.trim();
  if (!cleanName) return { ok: false, error: "Class/Batch name cannot be empty." };
  const slug = cleanName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    await db
      .update(batches)
      .set({
        name: cleanName,
        slug,
        description: description?.trim() || null,
      })
      .where(eq(batches.id, batchId));

    revalidatePath("/admin");
    revalidatePath("/teacher");
    revalidatePath("/register");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to update class." };
  }
}

// ── Master Curriculum Management (Admin Template) ──────────────────────────

export async function getMasterCurriculumAction(batchId?: number) {
  await requireAdmin();

  // If batchId is specified, filter by that batch.
  const subConditions = [isNull(subjects.userId)];
  if (batchId) {
    subConditions.push(eq(subjects.batchId, batchId));
  }

  const [masterSubjects, masterLessons, masterTopics, allBatches] = await Promise.all([
    db
      .select()
      .from(subjects)
      .where(and(...subConditions))
      .orderBy(subjects.sortOrder, subjects.id),
    db
      .select()
      .from(lessons)
      .where(isNull(lessons.userId))
      .orderBy(lessons.sortOrder, lessons.id),
    db
      .select()
      .from(topics)
      .where(isNull(topics.userId))
      .orderBy(topics.sortOrder, topics.id),
    db.select().from(batches).orderBy(batches.name),
  ]);

  const tree = masterSubjects.map((s) => {
    const sLessons = masterLessons.filter((l) => l.subjectId === s.id);
    return {
      ...s,
      lessons: sLessons.map((l) => {
        const lTopics = masterTopics.filter((t) => t.lessonId === l.id);
        return {
          ...l,
          topics: lTopics,
        };
      }),
    };
  });

  return {
    batches: allBatches,
    curriculum: tree,
  };
}

export async function createMasterSubjectAction(data: {
  batchId: number;
  name: string;
  nameBn?: string;
  sortOrder?: number;
}) {
  await requireAdmin();
  const name = data.name.trim();
  if (!name) return { ok: false, error: "Subject name is required." };
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + `-${Date.now().toString(36)}`;

  try {
    const [sub] = await db
      .insert(subjects)
      .values({
        batchId: data.batchId,
        userId: null,
        name,
        slug,
        nameBn: data.nameBn?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();

    // Default first chapter for convenience
    await db.insert(lessons).values({
      subjectId: sub.id,
      userId: null,
      name: "অধ্যায় ১ / Chapter 1",
      sortOrder: 1,
    });

    revalidatePath("/admin");
    return { ok: true, subject: sub };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create master subject." };
  }
}

export async function updateMasterSubjectAction(
  subjectId: number,
  data: { name: string; nameBn?: string; batchId?: number; sortOrder?: number }
) {
  await requireAdmin();
  const name = data.name.trim();
  if (!name) return { ok: false, error: "Subject name is required." };

  try {
    await db
      .update(subjects)
      .set({
        name,
        nameBn: data.nameBn?.trim() || null,
        ...(data.batchId ? { batchId: data.batchId } : {}),
        ...(typeof data.sortOrder === "number" ? { sortOrder: data.sortOrder } : {}),
      })
      .where(and(eq(subjects.id, subjectId), isNull(subjects.userId)));

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to update master subject." };
  }
}

export async function deleteMasterSubjectAction(subjectId: number) {
  await requireAdmin();
  try {
    await db.delete(subjects).where(and(eq(subjects.id, subjectId), isNull(subjects.userId)));
    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete master subject." };
  }
}

export async function createMasterChapterAction(subjectId: number, name: string, sortOrder?: number) {
  await requireAdmin();
  const cleanName = name.trim();
  if (!cleanName) return { ok: false, error: "Chapter name is required." };

  try {
    const max = await db
      .select({ m: sql<number>`coalesce(max(${lessons.sortOrder}), 0)` })
      .from(lessons)
      .where(and(eq(lessons.subjectId, subjectId), isNull(lessons.userId)));

    const [created] = await db
      .insert(lessons)
      .values({
        subjectId,
        userId: null,
        name: cleanName,
        sortOrder: sortOrder ?? Number(max[0]?.m ?? 0) + 1,
      })
      .returning();

    revalidatePath("/admin");
    return { ok: true, chapter: created };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create master chapter." };
  }
}

export async function updateMasterChapterAction(chapterId: number, name: string) {
  await requireAdmin();
  const cleanName = name.trim();
  if (!cleanName) return { ok: false, error: "Chapter name cannot be empty." };

  try {
    await db
      .update(lessons)
      .set({ name: cleanName, updatedAt: new Date() })
      .where(and(eq(lessons.id, chapterId), isNull(lessons.userId)));

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to update master chapter." };
  }
}

export async function deleteMasterChapterAction(chapterId: number) {
  await requireAdmin();
  try {
    await db.delete(lessons).where(and(eq(lessons.id, chapterId), isNull(lessons.userId)));
    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete master chapter." };
  }
}

export async function createMasterTopicAction(
  subjectId: number,
  chapterId: number,
  name: string,
  sortOrder?: number
) {
  await requireAdmin();
  const cleanName = name.trim();
  if (!cleanName) return { ok: false, error: "Topic name is required." };

  try {
    const max = await db
      .select({ m: sql<number>`coalesce(max(${topics.sortOrder}), 0)` })
      .from(topics)
      .where(and(eq(topics.subjectId, subjectId), isNull(topics.userId)));

    const [created] = await db
      .insert(topics)
      .values({
        subjectId,
        lessonId: chapterId,
        userId: null,
        name: cleanName,
        sortOrder: sortOrder ?? Number(max[0]?.m ?? 0) + 1,
        status: "not_started",
      })
      .returning();

    revalidatePath("/admin");
    return { ok: true, topic: created };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create master topic." };
  }
}

export async function updateMasterTopicAction(topicId: number, name: string) {
  await requireAdmin();
  const cleanName = name.trim();
  if (!cleanName) return { ok: false, error: "Topic name cannot be empty." };

  try {
    await db
      .update(topics)
      .set({ name: cleanName, updatedAt: new Date() })
      .where(and(eq(topics.id, topicId), isNull(topics.userId)));

    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to update master topic." };
  }
}

export async function deleteMasterTopicAction(topicId: number) {
  await requireAdmin();
  try {
    await db.delete(topics).where(and(eq(topics.id, topicId), isNull(topics.userId)));
    revalidatePath("/admin");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete master topic." };
  }
}
