type Props = {
  fetched: number;
  total: number;
};

export default function SyllabusProgress({ fetched, total }: Props) {
  const percent = total === 0 ? 0 : Math.round((fetched / total) * 100);

  return (
    <div role="status" className="bg-white px-4 pt-3">
      <div className="rounded-lg bg-wash px-3 py-2.5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="m-0 text-[13px] font-bold text-ink">シラバスを取得中…</p>
          <p className="m-0 text-[13px] font-bold text-brand tabular-nums">
            {fetched} / {total} 件
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={fetched}
          className="h-1.5 overflow-hidden rounded-full bg-white"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
