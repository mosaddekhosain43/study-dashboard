import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Batches / Classes (e.g. Alim 2027, Dakhil 2027, Class 8)
 */
export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * System users: Student, Teacher, or Super Admin
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("student"), // 'admin' | 'teacher' | 'student'
    batchId: integer("batch_id").references(() => batches.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("users_role_idx").on(t.role), index("users_batch_idx").on(t.batchId)]
);

/**
 * Maps teachers to the batches they teach
 */
export const teacherBatches = pgTable(
  "teacher_batches",
  {
    id: serial("id").primaryKey(),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("tb_teacher_idx").on(t.teacherId),
    index("tb_batch_idx").on(t.batchId),
  ]
);

/**
 * Assignments, homework, and PDF notes shared by teachers with a batch
 */
export const batchMaterials = pgTable(
  "batch_materials",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    fileUrl: text("file_url"),
    fileName: text("file_name"),
    fileSize: text("file_size"),
    dueDate: text("due_date"), // yyyy-mm-dd
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("bm_batch_idx").on(t.batchId),
    index("bm_teacher_idx").on(t.teacherId),
  ]
);

/**
 * Class discussion and Q&A chat for a batch (supports Bangla and English)
 */
export const batchMessages = pgTable(
  "batch_messages",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    materialId: integer("material_id").references(() => batchMaterials.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("bmsg_batch_idx").on(t.batchId),
    index("bmsg_user_idx").on(t.userId),
  ]
);

/**
 * The 13 Alim 2nd-year papers. Seeded automatically on first run.
 */
export const subjects = pgTable(
  "subjects",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id").references(() => batches.id, {
      onDelete: "cascade",
    }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    nameBn: text("name_bn"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("subjects_batch_idx").on(t.batchId),
    index("subjects_user_idx").on(t.userId),
  ]
);

/**
 * Lessons / Chapters inside a Subject
 */
export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("lessons_subject_idx").on(t.subjectId),
    index("lessons_user_idx").on(t.userId),
  ]
);

/**
 * Syllabus topics — scoped to student and lesson
 */
export const topics = pgTable(
  "topics",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id").references(() => lessons.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    chapter: text("chapter"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("not_started"), // completed | in_progress | not_completed | not_started
    notes: text("notes"),
    completedAt: text("completed_at"), // date key yyyy-mm-dd
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("topics_subject_idx").on(t.subjectId),
    index("topics_lesson_idx").on(t.lessonId),
    index("topics_user_idx").on(t.userId),
  ]
);

/**
 * A raw natural-language study update as written by the user.
 */
export const updates = pgTable(
  "updates",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    rawText: text("raw_text").notNull(),
    date: text("date").notNull(), // yyyy-mm-dd
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("updates_user_idx").on(t.userId)]
);

/**
 * Structured items extracted from one update
 */
export const updateItems = pgTable(
  "update_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    updateId: integer("update_id")
      .notNull()
      .references(() => updates.id, { onDelete: "cascade" }),
    subjectId: integer("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    topicId: integer("topic_id").references(() => topics.id, {
      onDelete: "set null",
    }),
    topicText: text("topic_text"),
    status: text("status").notNull(),
    minutes: integer("minutes"),
    notes: text("notes"),
    date: text("date").notNull(), // yyyy-mm-dd
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("items_date_idx").on(t.date),
    index("items_subject_idx").on(t.subjectId),
    index("items_update_idx").on(t.updateId),
    index("items_user_idx").on(t.userId),
  ]
);

/**
 * Timed study sessions (Study Timer)
 */
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    subjectId: integer("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    minutes: integer("minutes").notNull(),
    date: text("date").notNull(), // yyyy-mm-dd of start
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("sessions_date_idx").on(t.date),
    index("sessions_user_idx").on(t.userId),
  ]
);

/**
 * Key-value app settings
 */
export const settings = pgTable(
  "settings",
  {
    key: text("key").notNull(),
    value: text("value").notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [index("settings_key_user_idx").on(t.key, t.userId)]
);
