import { MODULE_LABELS } from "../const/moduleLabels";
import type { Assignment } from "../types/assignment";
import daysLeft from "../utils/daysLeft";
import formatDue from "../utils/formatDue";

export default function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const days = daysLeft(assignment.dueAt);
  const numColor = days <= 0 ? "text-alert" : "text-num";

  return (
    <a
      href={assignment.link}
      target="_blank"
      rel="noreferrer"
      className="flex items-stretch gap-4 rounded-xl border border-rule bg-white px-4 shadow-md shadow-ink/10 py-3.5 text-ink no-underline transition-colors hover:bg-wash focus-visible:bg-wash"
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
        <div className="flex items-start justify-between gap-2">
          <span
            className="line-clamp-2 min-w-0 text-base leading-snug font-bold"
            title={assignment.title}
          >
            {assignment.title}
          </span>
          <span className="shrink-0 rounded-md border border-rule px-1.5 py-0.5 text-[11px] leading-none text-ink-soft">
            {MODULE_LABELS[assignment.module]}
          </span>
        </div>
        <span className="truncate text-[14px] text-ink-soft" title={assignment.courseName}>
          {assignment.courseName}
        </span>
        <span className="flex items-center gap-1 text-[13px] text-ink-soft">
          {formatDue(assignment.dueAt)} 締切
        </span>
      </div>
    </a>
  );
}
