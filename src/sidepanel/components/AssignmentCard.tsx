import { moduleLabel } from "../const/moduleLabels";
import type { Assignment } from "../types/assignment";
import daysLeft from "../utils/daysLeft";
import formatDue from "../utils/formatDue";

type Props = {
  assignment: Assignment;
  isHidden: boolean;
  onToggleHidden: () => void;
};

export default function AssignmentCard({ assignment, isHidden, onToggleHidden }: Props) {
  const days = daysLeft(assignment.dueAt);
  const numColor = days <= 0 ? "text-alert" : "text-num";

  // The title link stretches over the whole card (after:inset-0), and the hide button sits above it (z-10).
  // isolate keeps that z-10 inside the card, so it cannot paint over the sticky TabBar (also z-10).
  return (
    <div
      className={`flex items-stretch gap-4 relative isolate rounded-xl border border-rule bg-white px-4 shadow-md shadow-ink/10 py-3.5 text-ink transition-colors hover:bg-wash focus-within:bg-wash ${isHidden ? "opacity-60" : ""}`}
    >
      <div className="box-content flex w-12 shrink-0 flex-col items-center justify-center border-r border-rule pr-4">
        {days === 0 ? (
          <span className={`text-xl leading-none font-bold ${numColor}`}>今日</span>
        ) : (
          <>
            <span className={`text-4xl leading-none font-normal ${numColor}`}>
              {Math.abs(days)}
            </span>
            <span className="mt-1 text-[11px] text-ink-soft">{days < 0 ? "日超過" : "日後"}</span>
          </>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <a
          href={assignment.link}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-col gap-1 text-ink no-underline after:absolute after:inset-0 after:content-['']"
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className="line-clamp-2 min-w-0 text-base leading-snug font-bold"
              title={assignment.title}
            >
              {assignment.title}
            </span>
            <span className="shrink-0 rounded-md border border-rule px-1.5 py-0.5 text-[11px] leading-none text-ink-soft">
              {moduleLabel(assignment.module)}
            </span>
          </div>
          <span className="truncate text-[14px] text-ink-soft" title={assignment.courseName}>
            {assignment.courseName}
          </span>
        </a>
        <div className="flex items-center justify-between gap-2 text-[13px] text-ink-soft">
          <span>{formatDue(assignment.dueAt)} 締切</span>
          <button
            type="button"
            onClick={onToggleHidden}
            aria-label={`${assignment.title}を${isHidden ? "再表示" : "非表示"}`}
            className="relative z-10 shrink-0 cursor-pointer text-ink-soft underline hover:text-ink"
          >
            {isHidden ? "再表示" : "非表示"}
          </button>
        </div>
      </div>
    </div>
  );
}
