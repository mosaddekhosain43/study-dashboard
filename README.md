# Alim Study Dashboard — 2nd Year

A **fully local** personal study tracker for Alim 2nd-year (Bangladesh) students, built around one idea:
you write your study update in plain, messy Bangla — the app understands it and keeps your syllabus
progress, remaining topics, daily log, study time, streaks, deadlines and revision plan automatically.

- **No cloud. No paid services. Works offline.** Data lives in a relational database on your own PC.
- **Natural-language updates** in Bangla/Banglish/English (fully local rule-based parser — no AI API needed).
- 13 papers pre-configured (Bangla 1st/2nd, English 1st/2nd, Aqaid 1st/2nd, Hadith, Quran, ICT,
  Balaghat, Arabic 1st/2nd, Civics/Pouroniti).

---

## 1. Architecture (brief)

```
Next.js (App Router)  ── one process: UI + API + actions
├── src/app/…                  pages (Dashboard, Update, Subjects, Remaining, Log, Analytics, Weekly, Syllabus, Search, Settings)
├── src/components/…           UI (StudyComposer, TopicManager, TimerWidget, charts…)
├── src/lib/parser.ts          ★ local Bangla NLU (subjects, statuses, topics, durations, dates)
├── src/lib/queries.ts         stats, streaks, alerts, targets, weekly review
├── src/actions/index.ts       server actions (save update, CRUD, timer, backup, demo data)
└── src/db/                    Drizzle ORM schema + client (PostgreSQL by default)
```

The parser is a single isolated module (`parseStudyUpdate`) called through one server action —
you can later layer an external AI model on top of it without touching anything else.

### Parser behavior (rule 26 respected)
Negation is checked **before** affirmation, so «কুরআন পড়ি নাই» never becomes "Completed":

| You write | Status detected |
|---|---|
| «শেষ», «শেষ হইছে», «পড়া শেষ», «হয়েছে» | 🟢 Completed |
| «পড়ছি», «চলতেছে», «শুরু করেছি», «অর্ধেক» | 🟡 In Progress |
| «শেষ হয়নি», «হই নাই», «পারি নাই», «বাকি আছে» | 🔴 Not Completed |
| «পড়ি নাই», «কিছুই পড়ি নাই», «কাল পড়ব» | ⚪ Not Started |

It also understands: paper numbers (১ম/২য়/প্রথম/দ্বিতীয়/1st/2nd), «tense আর narration পড়ছি» (status
inheritance), «২ নম্বর কবিতা» (reorders to "কবিতা ২"), durations («২ ঘণ্টা», «45 মিনিট»), and dates
(«গতকাল», «পরশু», «15 September»). Ambiguous messages (e.g. just «আরবি» without ১ম/২য়) are flagged
for confirmation before saving.

## 2. Requirements

- **Node.js 20+** (https://nodejs.org — LTS)
- **PostgreSQL 14+ running locally** (Windows installer: https://www.postgresql.org/download/windows/ —
  during install, keep the default port 5432 and remember the postgres password).
  The app can also point at any reachable PostgreSQL (e.g. in Docker).

## 3. Setup (once)

```bash
npm install
copy .env.example .env      # or create .env manually, see below
npx drizzle-kit push        # creates the tables in your local database
```

`.env` contents (adjust the password/db you created):

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/alim_study
```

Create the empty database once with any tool you like, e.g. in *SQL Shell (psql)*:

```sql
CREATE DATABASE alim_study;
```

## 4. Run it

```bash
npm run build
npm run start
```

Open http://localhost:3000 — done. For development use `npm run dev` instead.

### Windows one-click start
Double-click **`run.bat`** — it checks dependencies, applies the schema, builds if needed,
opens your browser and starts the dashboard. (`run.sh` does the same on macOS/Linux.)

## 5. Backup & restore

- **Export:** Settings → “Export JSON backup” (or simply visit `http://localhost:3000/api/backup`).
- **Restore:** Settings → “Restore from backup…” and pick the JSON file (replaces current data).
- **Syllabus CSV:** Syllabus page → import/export CSV (`Subject, Topic, Chapter` per line).

Data safety tip: keep exported JSON files in your Documents folder or a USB drive.

## 6. Daily usage

1. Open the dashboard → the big box asks «আজ কী কী পড়লে?».
2. Type naturally: `আরবি ২ পত্র কুরআন পড়া শেষ হইছে আর বাংলা ১ম এর ২ নম্বর কবিতা এখনো পড়ি নাই`
3. Press **“Understand my update”**, review the detected cards (fix anything), press **Save**.
4. Set up your real syllabus once in **Syllabus Setup** — progress bars, the Remaining page,
   daily targets and exams countdown become meaningful immediately.
5. Use the sidebar **Study Timer** for sessions; check **Daily Log**, **Weekly Review** and
   **Analytics** to see where your time goes.

## 7. Sample data for testing

Settings → **“Load demo data…”** inserts a realistic syllabus plus a month of study history
so you can explore every screen. Clear it later with **“Clear all study data…”**.

## 8. Project structure

| Path | Purpose |
|---|---|
| `src/lib/parser.ts` | Local Bangla study-update parser (isolated, offline) |
| `src/lib/queries.ts` | All read models: dashboard, stats, alerts, weekly, analytics |
| `src/lib/constants.ts` | Subjects, statuses, settings keys, month map |
| `src/actions/index.ts` | Mutations: save update, CRUD, timer, backup/restore, CSV, demo |
| `src/components/StudyComposer.tsx` | The natural-language input + confirmation flow |
| `src/db/schema.ts` | Tables: subjects, topics, updates, update_items, sessions, settings |
| `src/app/api/backup/route.ts` | GET /api/backup — JSON download |

## 9. Going offline

After `npm run build` + `npm run start`, the entire app runs locally; no internet connection is
required for studying, parsing, charts or backups.
