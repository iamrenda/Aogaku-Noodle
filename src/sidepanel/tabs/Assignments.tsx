import { useState } from "react";
import AssignmentCard from "../components/AssignmentCard";
import Pagination from "../components/Pagination";
import RefreshPrompt from "../components/RefreshPrompt";
import { PAGE_SIZE } from "../const/assignments";
import type { Assignment } from "../types/assignment";
import useAssignments from "../hooks/useAssignments";
import useIsOnMoodle from "../hooks/useIsOnMoodle";
import useNow from "../hooks/useNow";
import daysLeft from "../utils/daysLeft";
import formatElapsed from "../utils/formatElapsed";

const sections = [
  { title: "期限切れ", match: (d: number) => d < 0, overdue: true },
  { title: "3日以内", match: (d: number) => d >= 0 && d <= 3, overdue: false },
  { title: "今週中", match: (d: number) => d > 3 && d <= 7, overdue: false },
  { title: "それ以降", match: (d: number) => d > 7, overdue: false },
];

export default function Assignments() {
  const { assignments, updatedAt, hiddenIds, error, isRefreshing, refresh, setHidden } =
    useAssignments();
  const isOnMoodle = useIsOnMoodle();
  const now = useNow();
  const elapsed = updatedAt === null ? null : formatElapsed(updatedAt, now);
  const [page, setPage] = useState(0);
  const [showHidden, setShowHidden] = useState(false);

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

  const hidden = new Set(hiddenIds);
  const unhidden = assignments.filter((a) => !hidden.has(a.id));
  // Hidden assignments are listed in their own section, all on one page
  const allHidden = assignments.filter((a) => hidden.has(a.id));
  const hiddenItems = showHidden ? allHidden : [];
  const pageCount = Math.ceil(unhidden.length / PAGE_SIZE);
  // Hiding the last card of a page can leave the page out of range
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));
  const pageItems = unhidden.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const renderCards = (items: Assignment[]) => (
    <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
      {items.map((a) => (
        <li key={a.id}>
          <AssignmentCard
            assignment={a}
            isHidden={hidden.has(a.id)}
            onToggleHidden={() => setHidden(a.id, !hidden.has(a.id))}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-white px-4 pt-2 pb-8">
      <div className="mb-4 flex items-center gap-3">
        {allHidden.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHidden(!showHidden)}
            aria-expanded={showHidden}
            className="shrink-0 cursor-pointer text-[13px] text-ink-soft underline hover:text-ink"
          >
            {showHidden ? "非表示を隠す" : `非表示を表示 (${allHidden.length})`}
          </button>
        )}
        <div className="ml-auto flex min-w-0 items-center gap-3">
          {error ? (
            <p className="m-0 text-[13px] text-alert">
              更新できませんでした。Moodleを開いた状態でもう一度お試しください。
            </p>
          ) : (
            <p
              className={`m-0 text-[13px] ${elapsed?.stale ? "font-bold text-alert" : "text-ink-soft"}`}
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
      </div>

      {unhidden.length === 0 && hiddenItems.length === 0 && (
        <p className="m-0 mt-6 text-center text-[13px] text-ink-soft">表示できる課題がありません</p>
      )}

      {hiddenItems.length > 0 && (
        <section>
          <h2 className="m-0 border-b border-rule pb-1.5 text-[15px] font-bold text-ink-soft">
            非表示
          </h2>
          {renderCards(hiddenItems)}
        </section>
      )}

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
            {renderCards(items)}
          </section>
        );
      })}
      <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
