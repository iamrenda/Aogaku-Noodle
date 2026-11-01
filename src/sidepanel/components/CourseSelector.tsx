import { useEffect } from "react";
import { MdClose } from "react-icons/md";
import type { Course } from "../types/course";
import { MdRefresh } from "react-icons/md";
import CourseSelectSection from "./CourseSelectItem";

type Props = {
  courses: Course[];
  included: Set<number>;
  onToggle: (id: number) => void;
  onClose: () => void;
};

/**
 * Bottom sheet to choose which courses are used (講義 tab and 課題 fetching).
 * Two plain lists (進行中 / その他), no weekday grouping.
 */
export default function CourseSelector({ courses, included, onToggle, onClose }: Props) {
  const inProgress = courses.filter((c) => c.isInProgress !== false);
  const others = courses.filter((c) => c.isInProgress === false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="使用する講義を選択"
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-rule px-4 py-3">
          <h2 className="m-0 text-[15px] font-bold text-ink">使用する講義を選択</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="cursor-pointer rounded-full border-0 bg-wash p-1 text-ink-soft"
          >
            <MdClose size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-3">
          <p className="m-0 text-[12px] text-ink-soft">
            講義の一覧が古い場合は、Moodleから取得し直してください。
          </p>
          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-brand bg-white px-2.5 py-1 text-[12px] font-bold text-brand hover:bg-brand hover:text-white"
          >
            <MdRefresh size={16} aria-hidden="true" />
            更新
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-4">
          <CourseSelectSection
            title="進行中"
            courses={inProgress}
            emptyMessage="進行中の講義がありません。"
            included={included}
            onToggle={onToggle}
          />
          <CourseSelectSection
            title="その他"
            courses={others}
            emptyMessage="更新すると、過去の講義がここに表示されます。"
            included={included}
            onToggle={onToggle}
          />
        </div>
      </div>
    </div>
  );
}
