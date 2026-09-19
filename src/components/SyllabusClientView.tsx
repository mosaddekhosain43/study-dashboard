"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, RotateCcw, Sparkles } from "lucide-react";
import SyllabusOnboarding from "@/components/SyllabusOnboarding";
import SyllabusManager from "@/components/SyllabusManager";
import AddSubjectButton from "@/components/AddSubjectButton";
import type { SubjectDto, TopicDto } from "@/lib/queries";
import type { MasterBookView } from "@/actions/syllabus";

interface Batch {
  id: number;
  name: string;
  slug: string;
}

interface UserProfile {
  board?: string;
  classLevel?: string;
  streamGroup?: string;
}

interface Props {
  hasPersonalSyllabus: boolean;
  userBatch: Batch | null;
  userProfile?: UserProfile;
  availableBatches: Batch[];
  masterBooks: MasterBookView[];
  groups: { subject: SubjectDto; topics: TopicDto[] }[];
  totalTopics: number;
}

export default function SyllabusClientView({
  hasPersonalSyllabus,
  userBatch,
  userProfile,
  availableBatches,
  masterBooks,
  groups,
  totalTopics,
}: Props) {
  const [showOnboarding, setShowOnboarding] = useState(!hasPersonalSyllabus);

  if (!hasPersonalSyllabus || showOnboarding) {
    return (
      <SyllabusOnboarding
        userBatch={userBatch}
        userProfile={userProfile}
        availableBatches={availableBatches}
        masterBooks={masterBooks}
        isReconfiguring={hasPersonalSyllabus}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="rise flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf">
            <Sparkles className="size-3.5" />
            <span>Personalized Syllabus ({userBatch?.name || "My Class"})</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Personal Syllabus & Topics
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-[13px] leading-relaxed text-ink-faint">
            Manage your personal exam chapters and topics. Any additions, edits, or deletions here apply
            strictly to your personal study tracker.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowOnboarding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-leaf hover:text-leaf transition shadow-2xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Re-import / Select Books</span>
          </button>
          <AddSubjectButton />
        </div>
      </header>

      <div className="rise rise-1">
        <SyllabusManager groups={groups} />
      </div>
    </div>
  );
}
