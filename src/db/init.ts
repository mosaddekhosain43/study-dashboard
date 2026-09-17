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
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name_bn TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
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
    } catch {
      // ignore
    }

    // 1. Seed default subjects
    const existingSubjects = await rawQuery("SELECT COUNT(*) as count FROM subjects");
    const subCount = Number(existingSubjects.rows?.[0]?.count || existingSubjects[0]?.count || 0);
    if (subCount === 0) {
      for (let i = 0; i < SUBJECT_DEFS.length; i++) {
        const s = SUBJECT_DEFS[i];
        await rawQuery(
          "INSERT INTO subjects (name, slug, name_bn, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
          [s.name, s.slug, s.nameBn, i + 1]
        );
      }
    }

    // 2. Seed default batches (Alim 2027, Dakhil 2027, Class 8)
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

    // 3. Seed default Admin account (admin@alim.edu / admin123)
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
