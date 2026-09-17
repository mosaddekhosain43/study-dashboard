"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { batches, teacherBatches, topics, users } from "@/db/schema";
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
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create batch." };
  }
}

export async function deleteBatchAction(batchId: number) {
  await requireAdmin();
  try {
    await db.delete(batches).where(eq(batches.id, batchId));
    revalidatePath("/admin");
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
