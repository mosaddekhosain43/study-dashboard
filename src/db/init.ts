import { SUBJECT_DEFS } from "@/lib/constants";
import { hashPassword } from "@/lib/auth";
import { NCTB_CURRICULUM_DATA } from "@/lib/nctbCurriculum";

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
  board TEXT,
  class_level TEXT,
  stream_group TEXT,
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
  board TEXT,
  class_level TEXT,
  stream_group TEXT,
  subject_type TEXT NOT NULL DEFAULT 'compulsory',
  structure_type TEXT NOT NULL DEFAULT 'chapter',
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
      await rawExec("ALTER TABLE users ADD COLUMN IF NOT EXISTS board TEXT;");
      await rawExec("ALTER TABLE users ADD COLUMN IF NOT EXISTS class_level TEXT;");
      await rawExec("ALTER TABLE users ADD COLUMN IF NOT EXISTS stream_group TEXT;");
      await rawExec("ALTER TABLE subjects ADD COLUMN IF NOT EXISTS board TEXT;");
      await rawExec("ALTER TABLE subjects ADD COLUMN IF NOT EXISTS class_level TEXT;");
      await rawExec("ALTER TABLE subjects ADD COLUMN IF NOT EXISTS stream_group TEXT;");
      await rawExec(
        "ALTER TABLE subjects ADD COLUMN IF NOT EXISTS subject_type TEXT NOT NULL DEFAULT 'compulsory';"
      );
      await rawExec(
        "ALTER TABLE subjects ADD COLUMN IF NOT EXISTS structure_type TEXT NOT NULL DEFAULT 'chapter';"
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
        const lessonName = (row.chapter || "Chapter 1 / অধ্যায় ১").trim();
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

      // Rename any existing "Lesson" references in lessons table to "Chapter"
      await rawQuery(
        "UPDATE lessons SET name = REPLACE(name, 'Lesson ', 'Chapter ') WHERE name LIKE '%Lesson %'"
      );
    } catch {
      // ignore
    }

    // 1. Seed default batches safely without unique constraint collision
    try {
      const existingBatchesRes = await rawQuery("SELECT id, name, slug FROM batches");
      const existingBatches = existingBatchesRes.rows || existingBatchesRes || [];
      const hasBatch = (slug: string, name: string) =>
        existingBatches.some((b: any) => b.slug === slug || b.name === name);

      const defaultBatches = [
        ["SSC 2027", "ssc-2027", "SSC Examination Batch 2027 (General Education Board)"],
        ["HSC 2027", "hsc-2027", "HSC Examination Batch 2027 (General Education Board)"],
        ["Dakhil 2027", "dakhil-2027", "Dakhil Examination Batch 2027 (Madrasah Board)"],
        ["Alim 2027", "alim-2027", "Alim 2nd Year Examination Batch 2027 (Madrasah Board)"],
      ];

      for (const [name, slug, description] of defaultBatches) {
        if (!hasBatch(slug, name)) {
          try {
            await rawQuery(
              "INSERT INTO batches (name, slug, description) VALUES ($1, $2, $3)",
              [name, slug, description]
            );
          } catch {
            // ignore duplicate
          }
        }
      }
    } catch {
      // ignore
    }

    // Clean up deprecated batches and legacy class levels
    try {
      await rawExec("DELETE FROM batches WHERE slug IN ('class-10', 'class-8');");
      await rawExec("UPDATE subjects SET class_level = 'ssc' WHERE class_level = 'class_10';");
      await rawExec("UPDATE subjects SET class_level = 'dakhil' WHERE class_level = 'class_8';");
      await rawExec("UPDATE users SET class_level = 'ssc' WHERE class_level = 'class_10';");
      await rawExec("UPDATE users SET class_level = 'dakhil' WHERE class_level = 'class_8';");
    } catch {
      // ignore
    }

    const firstBatchRes = await rawQuery("SELECT id FROM batches ORDER BY id ASC LIMIT 1");
    const firstBatchId = firstBatchRes.rows?.[0]?.id || firstBatchRes[0]?.id || 1;

    // Build map of class levels to batch IDs
    const allBatchesRes = await rawQuery("SELECT id, slug FROM batches");
    const batchRows = allBatchesRes.rows || allBatchesRes || [];
    const batchMap: Record<string, number> = {};
    for (const b of batchRows) {
      if (b.slug?.includes("ssc")) batchMap["ssc"] = b.id;
      if (b.slug?.includes("hsc")) batchMap["hsc"] = b.id;
      if (b.slug?.includes("dakhil")) batchMap["dakhil"] = b.id;
      if (b.slug?.includes("alim")) batchMap["alim"] = b.id;
    }

    // 2. Remove old legacy stub master subjects (which only had 0 or dummy topics)
    try {
      const legacyStubSlugs = [
        "bangla-1", "bangla-2", "english-1", "english-2",
        "aqaid-1", "aqaid-2", "hadith", "quran", "ict",
        "balaghat", "arabic-1", "arabic-2", "civics"
      ];
      for (const oldSlug of legacyStubSlugs) {
        await rawQuery("DELETE FROM subjects WHERE user_id IS NULL AND slug = $1", [oldSlug]);
      }
    } catch {
      // ignore
    }

    // 3. Seed comprehensive NCTB Curriculum data (SSC, HSC, Dakhil, Alim - 40 authentic books)
    try {
      const existingSlugsRes = await rawQuery("SELECT id, slug FROM subjects WHERE user_id IS NULL");
      const existingRows = existingSlugsRes.rows || existingSlugsRes || [];
      const existingMap = new Map<string, number>();
      for (const r of existingRows) {
        existingMap.set(r.slug, r.id);
      }

      for (let i = 0; i < NCTB_CURRICULUM_DATA.length; i++) {
        const def = NCTB_CURRICULUM_DATA[i];
        const effectiveBatchId = batchMap[def.classLevel] || firstBatchId;

        let subId = existingMap.get(def.slug);
        if (!subId) {
          const subRes = await rawQuery(
            `INSERT INTO subjects (batch_id, user_id, name, name_bn, slug, sort_order, board, class_level, stream_group, subject_type, structure_type)
             VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [
              effectiveBatchId,
              def.name,
              def.nameBn,
              def.slug,
              i + 1,
              def.board,
              def.classLevel,
              def.streamGroup,
              def.subjectType,
              def.structureType,
            ]
          );
          subId = subRes.rows?.[0]?.id || subRes[0]?.id;
          if (subId) existingMap.set(def.slug, subId);
        } else {
          // Update metadata in case board or classLevel changed
          await rawQuery(
            `UPDATE subjects SET batch_id = $1, name = $2, name_bn = $3, sort_order = $4, board = $5, class_level = $6, stream_group = $7, subject_type = $8, structure_type = $9
             WHERE id = $10`,
            [
              effectiveBatchId,
              def.name,
              def.nameBn,
              i + 1,
              def.board,
              def.classLevel,
              def.streamGroup,
              def.subjectType,
              def.structureType,
              subId,
            ]
          );
        }

        if (!subId) continue;

        // Check how many topics exist for this master subject
        const topicCountRes = await rawQuery(
          "SELECT count(*) as count FROM topics WHERE subject_id = $1 AND user_id IS NULL",
          [subId]
        );
        const topCount = Number(topicCountRes.rows?.[0]?.count || topicCountRes[0]?.count || 0);

        // If no topics exist, populate authentic NCTB chapters and topics
        if (topCount === 0) {
          // Clean any empty lessons first
          await rawQuery("DELETE FROM lessons WHERE subject_id = $1 AND user_id IS NULL", [subId]);

          for (let chIdx = 0; chIdx < def.chaptersOrModules.length; chIdx++) {
            const ch = def.chaptersOrModules[chIdx];
            const lessonRes = await rawQuery(
              `INSERT INTO lessons (subject_id, user_id, name, sort_order)
               VALUES ($1, NULL, $2, $3)
               RETURNING id`,
              [subId, ch.name, chIdx + 1]
            );
            const lessonId = lessonRes.rows?.[0]?.id || lessonRes[0]?.id;
            if (!lessonId) continue;

            for (let tIdx = 0; tIdx < ch.topics.length; tIdx++) {
              await rawQuery(
                `INSERT INTO topics (subject_id, lesson_id, user_id, name, chapter, sort_order, status)
                 VALUES ($1, $2, NULL, $3, $4, $5, 'not_started')`,
                [subId, lessonId, ch.topics[tIdx], ch.name, tIdx + 1]
              );
            }
          }
        }
      }
    } catch (nctbErr) {
      console.error("Error seeding NCTB curriculum:", nctbErr);
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
