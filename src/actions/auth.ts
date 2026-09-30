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
    board: user.board,
    classLevel: user.classLevel,
    streamGroup: user.streamGroup,
  });

  revalidatePath("/", "layout");

  let redirectUrl = "/";
  if (effectiveRole === "admin") redirectUrl = "/admin";
  else if (effectiveRole === "teacher") redirectUrl = "/teacher";

  return { ok: true, role: effectiveRole, redirectUrl };
}

export async function registerStudentAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const batchIdRaw = formData.get("batchId") as string;
  const batchId = batchIdRaw ? parseInt(batchIdRaw, 10) : null;

  if (!name || !phone || !email || !password || !batchId) {
    return {
      ok: false,
      error: "Please fill in all required fields (Name, Phone Number, Email, Batch, and Password).",
    };
  }
  if (phone.length < 10) {
    return { ok: false, error: "Please provide a valid phone number (e.g. 01XXXXXXXXX)." };
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
      phone,
      email,
      passwordHash,
      role,
      batchId: Number.isInteger(batchId) ? batchId : null,
    })
    .returning();

  await setSessionCookie({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: "student",
    batchId: newUser.batchId,
  });

  revalidatePath("/", "layout");
  return { ok: true, redirectUrl: "/syllabus" };
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function findAccountForRecoveryAction(emailInput: string) {
  const email = emailInput?.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Please enter your registered email address." };
  }

  const userRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userRows[0];
  if (!user) {
    return {
      ok: false,
      error: "No account found with this email address. Please check and try again.",
    };
  }

  return {
    ok: true,
    name: user.name,
    email: user.email,
    hasPhone: Boolean(user.phone),
    maskedPhone: user.phone
      ? user.phone.slice(0, 3) + "•••••" + user.phone.slice(-3)
      : null,
  };
}

export async function resetPasswordWithEmailAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phoneVerification = (formData.get("phoneVerification") as string)?.trim();
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email) {
    return { ok: false, error: "Email address is required." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "New password must be at least 6 characters long." };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "Passwords do not match. Please re-type." };
  }

  const userRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userRows[0];
  if (!user) {
    return { ok: false, error: "No account found with this email address." };
  }

  // If the user has a phone registered, verify phone number (digits only matching)
  if (user.phone) {
    const normalizeDigits = (val: string) => val.replace(/\D/g, "");
    const cleanUserPhone = normalizeDigits(user.phone);
    const cleanInputPhone = normalizeDigits(phoneVerification || "");

    const matches =
      cleanInputPhone &&
      (cleanUserPhone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(cleanUserPhone));

    if (!matches) {
      return {
        ok: false,
        error:
          "Verification failed. The phone number does not match your registered phone number.",
      };
    }
  }

  const newPasswordHash = hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash: newPasswordHash })
    .where(eq(users.id, user.id));

  return {
    ok: true,
    message: "Password reset successfully! You can now log in with your new password.",
  };
}

