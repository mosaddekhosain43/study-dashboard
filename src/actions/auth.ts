"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { batches, subjects, topics, users } from "@/db/schema";
import {
  clearSessionCookie,
  getCurrentUser,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export async function getBatchesAction() {
  return await db.select().from(batches).orderBy(batches.name);
}

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { ok: false, error: "Please provide both email and password." };
  }

  const userRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userRows[0];

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }

  let effectiveRole = user.role;
  if (user.email.toLowerCase() === "mosaddekhosain43@gmail.com") {
    effectiveRole = "admin";
    if (user.role !== "admin") {
      await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
    }
  }

  await setSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: effectiveRole as "admin" | "teacher" | "student",
    batchId: user.batchId,
  });

  revalidatePath("/", "layout");

  let redirectUrl = "/";
  if (effectiveRole === "admin") redirectUrl = "/admin";
  else if (effectiveRole === "teacher") redirectUrl = "/teacher";

  return { ok: true, role: effectiveRole, redirectUrl };
}

export async function registerStudentAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const batchIdRaw = formData.get("batchId") as string;
  const batchId = batchIdRaw ? parseInt(batchIdRaw, 10) : null;

  if (!name || !email || !password) {
    return { ok: false, error: "Please fill in all required fields." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters long." };
  }

  // Check existing user
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = hashPassword(password);

  const role = email === "mosaddekhosain43@gmail.com" ? "admin" : "student";

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role,
      batchId: Number.isInteger(batchId) ? batchId : null,
    })
    .returning();

  // Create default syllabus topics for the new student
  try {
    const allSubjects = await db.select().from(subjects);
    if (allSubjects.length > 0) {
      for (const sub of allSubjects) {
        // Add standard 2 starter topics per subject
        await db.insert(topics).values([
          {
            userId: newUser.id,
            subjectId: sub.id,
            name: `${sub.name} — Chapter 1 Overview`,
            chapter: "Chapter 1",
            sortOrder: 1,
            status: "not_started",
          },
          {
            userId: newUser.id,
            subjectId: sub.id,
            name: `${sub.name} — Core Concepts & Practice`,
            chapter: "Chapter 2",
            sortOrder: 2,
            status: "not_started",
          },
        ]);
      }
    }
  } catch (err) {
    console.error("Default topics seed error:", err);
  }

  await setSessionCookie({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: "student",
    batchId: newUser.batchId,
  });

  revalidatePath("/", "layout");
  return { ok: true, redirectUrl: "/" };
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  return { ok: true };
}
