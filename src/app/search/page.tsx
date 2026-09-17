import SearchClient from "@/components/SearchClient";
import { getSubjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Search — Study Dashboard" };

export default async function SearchPage() {
  const subjects = await getSubjects();
  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Search</h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">
          Search across every study record and syllabus topic — by name, status, subject or date.
        </p>
      </header>
      <div className="rise rise-1">
        <SearchClient subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
      </div>
    </div>
  );
}
