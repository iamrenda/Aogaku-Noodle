type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

const buttonClass =
  "rounded-lg border border-rule bg-white px-3 py-1.5 text-[13px] font-bold text-ink transition-colors hover:bg-wash disabled:cursor-default disabled:text-ink-soft disabled:opacity-50 disabled:hover:bg-white";

export default function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;

  return (
    <nav className="mt-6 flex items-center justify-between" aria-label="ページ">
      <button
        type="button"
        className={buttonClass}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        前へ
      </button>
      <span className="text-[13px] text-ink-soft">
        {page + 1} / {pageCount}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={page === pageCount - 1}
        onClick={() => onChange(page + 1)}
      >
        次へ
      </button>
    </nav>
  );
}
