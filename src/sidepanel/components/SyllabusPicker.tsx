import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import type { Syllabus } from "../types/syllabus";

type Props = {
  syllabuses: Syllabus[];
  onSelect: (syllabus: Syllabus) => void;
  onClose: () => void;
};

/** Bottom sheet shown when a course matches several syllabuses */
export default function SyllabusPicker({ syllabuses, onSelect, onClose }: Props) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const selected = syllabuses.find((s) => s.url === selectedUrl);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-2147483647 flex items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="シラバスを選択"
        className="mx-auto flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-rule px-4 py-3">
          <h2 className="m-0 text-[15px] font-bold">シラバスを選択</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="cursor-pointer rounded-full border-0 bg-wash p-1 text-ink-soft"
          >
            <MdClose size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="m-0 px-4 pt-3 text-[13px] text-ink-soft">
          該当するシラバスが複数見つかりました。正しいものを選択してください。
        </p>

        <ul className="m-0 mt-2 list-none overflow-y-auto px-4 py-0">
          {syllabuses.map((s) => (
            <li key={s.url} className="border-b border-rule">
              <label className="flex cursor-pointer items-start gap-3 py-3">
                <input
                  type="radio"
                  name="syllabus"
                  checked={s.url === selectedUrl}
                  onChange={() => setSelectedUrl(s.url)}
                  className="mt-1"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-[13px]">
                  <span className="text-[14px] font-bold">{s.name}</span>
                  {s.subject && <span className="text-ink-soft">{s.subject}</span>}
                  <span className="text-ink-soft">
                    {[
                      s.campus,
                      s.term,
                      s.grade && `学年: ${s.grade}`,
                      s.credits && `単位: ${s.credits}`,
                    ]
                      .filter(Boolean)
                      .join(" / ")}
                  </span>
                  {s.note && <span className="text-ink-soft">{s.note}</span>}
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-[13px] text-brand"
                  onClick={(e) => e.stopPropagation()}
                >
                  開く
                </a>
              </label>
            </li>
          ))}
        </ul>

        <div className="shrink-0 border-t border-rule px-4 py-3">
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className="w-full cursor-pointer rounded-lg border border-brand bg-brand px-3 py-2 text-[14px] font-bold text-white transition-colors enabled:hover:bg-white enabled:hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            このシラバスを選択する
          </button>
        </div>
      </div>
    </div>
  );
}
