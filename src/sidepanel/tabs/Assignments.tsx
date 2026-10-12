import { useState } from "react";
import AssignmentCard from "../components/AssignmentCard";
import Pagination from "../components/Pagination";
import RefreshPrompt from "../components/RefreshPrompt";
import useAssignments from "../hooks/useAssignments";
import useIsOnMoodle from "../hooks/useIsOnMoodle";
import useNow from "../hooks/useNow";
import daysLeft from "../utils/daysLeft";
import formatElapsed from "../utils/formatElapsed";

const PAGE_SIZE = 20;

const sections = [
  { title: "期限切れ", match: (d: number) => d < 0, overdue: true },
  { title: "3日以内", match: (d: number) => d >= 0 && d <= 3, overdue: false },
  { title: "今週中", match: (d: number) => d > 3 && d <= 7, overdue: false },
  { title: "それ以降", match: (d: number) => d > 7, overdue: false },
];

export default function Assignments() {
  const { assignments, updatedAt, error, isRefreshing, refresh } = useAssignments();
  const isOnMoodle = useIsOnMoodle();
  const now = useNow();
  const elapsed = updatedAt === null ? null : formatElapsed(updatedAt, now);
  const [page, setPage] = useState(0);

  if (assignments === null) return null;

  if (assignments.length === 0) {
    return (
      <div className="min-h-screen bg-white px-4 pt-2 pb-8">
        <RefreshPrompt
          subject="課題"
          error={error}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
        />
      </div>
    );
  }

  const pageCount = Math.ceil(assignments.length / PAGE_SIZE);
  const pageItems = assignments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-4 pt-2 pb-8">
      <div className="mb-4 flex items-center gap-3">
        {error ? (
          <p className="m-0 text-[13px] text-alert">
            更新できませんでした。Moodleを開いた状態でもう一度お試しください。
          </p>
        ) : (
          <p
            className={`m-0 text-[13px] ml-auto ${elapsed?.stale ? "font-bold text-alert" : "text-ink-soft"}`}
          >
            {elapsed && `最終更新: ${elapsed.text}`}
          </p>
        )}
        {isOnMoodle && (
          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            className="shrink-0 rounded-lg border border-rule bg-white px-3 py-1.5 text-[13px] font-bold text-ink transition-colors hover:bg-wash disabled:opacity-50"
          >
            {isRefreshing ? "取得中..." : "更新"}
          </button>
        )}
      </div>

      {sections.map(({ title, match, overdue }) => {
        const items = pageItems.filter((a) => match(daysLeft(a.dueAt)));

        if (items.length === 0) return null;

        return (
          <section key={title} className="mt-6 first:mt-0">
            <h2
              className={`m-0 border-b border-rule pb-1.5 text-[15px] font-bold ${overdue ? "text-alert" : "text-brand"}`}
            >
              {title}
            </h2>
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
              {items.map((a) => (
                <li key={a.id}>
                  <AssignmentCard assignment={a} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
