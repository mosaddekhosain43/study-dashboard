import { SUBJECT_DEFS } from "@/lib/constants";
import { hashPassword } from "@/lib/auth";

export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_batches (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS batch_materials (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  due_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_messages (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES batch_materials(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  name_bn TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  chapter TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started',
  notes TEXT,
  completed_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS updates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS update_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  update_id INTEGER NOT NULL REFERENCES updates(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
  topic_text TEXT,
  status TEXT NOT NULL,
  minutes INTEGER,
  notes TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  minutes INTEGER NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
`;

export async function runInitAndSeed(
  rawQuery: (sqlText: string, params?: any[]) => Promise<any>,
  rawExec: (sqlText: string) => Promise<any> = rawQuery
) {
  try {
    await rawExec(INIT_SQL);
    try {
      await rawExec(
        "ALTER TABLE batch_messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;"
      );
      await rawExec(
        "ALTER TABLE subjects ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;"
      );
      await rawExec(
        "CREATE TABLE IF NOT EXISTS lessons (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE, name TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());"
      );
      await rawExec(
        "ALTER TABLE subjects ADD COLUMN IF NOT EXISTS batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE;"
      );
    } catch {
      // ignore
    }

    // Auto-migrate topics that do not have a lesson_id yet
    try {
      const unlinked = await rawQuery(
        "SELECT id, subject_id, chapter, user_id FROM topics WHERE lesson_id IS NULL"
      );
      const rows = unlinked.rows || unlinked || [];
      for (const row of rows) {
        const lessonName = (row.chapter || "Lesson 1 / অধ্যায় ১").trim();
        const existingLesson = await rawQuery(
          "SELECT id FROM lessons WHERE subject_id = $1 AND name = $2 LIMIT 1",
          [row.subject_id, lessonName]
        );
        let lessonId = existingLesson.rows?.[0]?.id || existingLesson[0]?.id;
        if (!lessonId) {
          const inserted = await rawQuery(
            "INSERT INTO lessons (subject_id, user_id, name, sort_order) VALUES ($1, $2, $3, 1) RETURNING id",
            [row.subject_id, row.user_id || null, lessonName]
          );
          lessonId = inserted.rows?.[0]?.id || inserted[0]?.id;
        }
        if (lessonId) {
          await rawQuery("UPDATE topics SET lesson_id = $1 WHERE id = $2", [lessonId, row.id]);
        }
      }
    } catch {
      // ignore
    }

    // 1. Seed default batches (Alim 2027, Dakhil 2027, Class 8)
    const existingBatches = await rawQuery("SELECT COUNT(*) as count FROM batches");
    const batchCount = Number(existingBatches.rows?.[0]?.count || existingBatches[0]?.count || 0);
    if (batchCount === 0) {
      await rawQuery(
        "INSERT INTO batches (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        ["Alim 2027", "alim-2027", "Alim 2nd Year Examination Batch 2027"]
      );
      await rawQuery(
        "INSERT INTO batches (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        ["Dakhil 2027", "dakhil-2027", "Dakhil Examination Batch 2027"]
      );
      await rawQuery(
        "INSERT INTO batches (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        ["Class 8", "class-8", "Junior Dakhil / Class 8 Batch"]
      );
    }

    const firstBatchRes = await rawQuery("SELECT id FROM batches ORDER BY id ASC LIMIT 1");
    const firstBatchId = firstBatchRes.rows?.[0]?.id || firstBatchRes[0]?.id || 1;

    // 2. Seed default subjects
    const existingSubjects = await rawQuery("SELECT COUNT(*) as count FROM subjects WHERE user_id IS NULL");
    const subCount = Number(existingSubjects.rows?.[0]?.count || existingSubjects[0]?.count || 0);
    if (subCount === 0) {
      for (let i = 0; i < SUBJECT_DEFS.length; i++) {
        const s = SUBJECT_DEFS[i];
        await rawQuery(
          "INSERT INTO subjects (batch_id, name, slug, name_bn, sort_order) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
          [firstBatchId, s.name, s.slug, s.nameBn, i + 1]
        );
      }
    } else {
      // Ensure master subjects are linked to a batch
      await rawQuery("UPDATE subjects SET batch_id = $1 WHERE user_id IS NULL AND batch_id IS NULL", [firstBatchId]);
    }

    // 3. Seed default Master Chapters (Lessons) & Topics for master subjects if empty
    try {
      const masterSubjects = await rawQuery("SELECT id, name FROM subjects WHERE user_id IS NULL");
      const mSubRows = masterSubjects.rows || masterSubjects || [];
      for (const sub of mSubRows) {
        const existingMasterLessons = await rawQuery("SELECT count(*) as count FROM lessons WHERE subject_id = $1 AND user_id IS NULL", [sub.id]);
        const lCount = Number(existingMasterLessons.rows?.[0]?.count || existingMasterLessons[0]?.count || 0);
        if (lCount === 0) {
          // Add default chapters
          const ch1 = await rawQuery("INSERT INTO lessons (subject_id, user_id, name, sort_order) VALUES ($1, NULL, $2, 1) RETURNING id", [sub.id, "অধ্যায় ১: মৌলিক ধারণা (Chapter 1)"]);
          const ch1Id = ch1.rows?.[0]?.id || ch1[0]?.id;
          if (ch1Id) {
            await rawQuery("INSERT INTO topics (subject_id, lesson_id, user_id, name, sort_order, status) VALUES ($1, $2, NULL, $3, 1, 'not_started')", [sub.id, ch1Id, "ভূমিকা ও পটভূমি (Introduction & Background)"]);
            await rawQuery("INSERT INTO topics (subject_id, lesson_id, user_id, name, sort_order, status) VALUES ($1, $2, NULL, $3, 2, 'not_started')", [sub.id, ch1Id, "প্রধান পাঠ ও পর্যালোচনা (Core Concepts & Analysis)"]);
          }

          const ch2 = await rawQuery("INSERT INTO lessons (subject_id, user_id, name, sort_order) VALUES ($1, NULL, $2, 2) RETURNING id", [sub.id, "অধ্যায় ২: প্রয়োগ ও অনুশীলন (Chapter 2)"]);
          const ch2Id = ch2.rows?.[0]?.id || ch2[0]?.id;
          if (ch2Id) {
            await rawQuery("INSERT INTO topics (subject_id, lesson_id, user_id, name, sort_order, status) VALUES ($1, $2, NULL, $3, 1, 'not_started')", [sub.id, ch2Id, "গুরুত্বপূর্ণ প্রশ্নোত্তর (Important Questions)"]);
            await rawQuery("INSERT INTO topics (subject_id, lesson_id, user_id, name, sort_order, status) VALUES ($1, $2, NULL, $3, 2, 'not_started')", [sub.id, ch2Id, "পরীক্ষামূলক মডেল টেস্ট (Model Practice)"]);
          }
        }
      }
    } catch {
      // ignore
    }

    // 4. Seed default Admin account (admin@alim.edu / admin123)
    const adminRows = await rawQuery("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const hasAdmin = (adminRows.rows?.length || adminRows.length || 0) > 0;
    if (!hasAdmin) {
      const hash = hashPassword("admin123");
      await rawQuery(
        "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') ON CONFLICT DO NOTHING",
        ["Super Admin", "admin@alim.edu", hash]
      );
    }

    // 4. Ensure owner/developer email always has Admin role
    await rawQuery(
      "UPDATE users SET role = 'admin' WHERE LOWER(email) = 'mosaddekhosain43@gmail.com'"
    );
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}
