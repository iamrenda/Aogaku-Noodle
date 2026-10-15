import { useEffect } from "react";
import { MdClose } from "react-icons/md";
import { FACULTIES } from "../const/majors";

type Props = {
  selected: string | null;
  onSelect: (label: string) => void;
  onClose: () => void;
};

/** Bottom sheet over the side panel. Picking a major selects it and closes the sheet. */
export default function MajorPicker({ selected, onSelect, onClose }: Props) {
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
        aria-label="学科を選択"
        className="flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-rule px-4 py-3">
          <h2 className="m-0 text-[15px] font-bold text-ink">学科を選択</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="cursor-pointer rounded-full border-0 bg-wash p-1 text-ink-soft"
          >
            <MdClose size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-4">
          {FACULTIES.map(({ faculty, accent, majors }) => (
            <section key={faculty} className="mt-4">
              <h3
                className="m-0 border-b border-rule pb-1 text-[13px] font-bold"
                style={{ color: accent }}
              >
                {faculty}
              </h3>
              <ul className="m-0 list-none p-0">
                {majors.map(({ label }) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => onSelect(label)}
                      className={`flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-1 py-2 text-left text-[14px] text-ink hover:bg-wash ${
                        label === selected ? "font-bold" : ""
                      }`}
                    >
                      {label}
                      {label === selected && <span className="text-xs">選択済み</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
