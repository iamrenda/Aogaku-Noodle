import { MdLightbulb } from "react-icons/md";

/** Shown above the course list while no major is selected */
export default function SyllabusNotice() {
  return (
    <div role="note" className="mb-4 flex items-start gap-2.5 rounded-lg bg-amber-100 px-3 py-2.5">
      <MdLightbulb size={20} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
      <p className="m-0 text-[13px] leading-relaxed font-bold text-ink">
        設定で学科を選択すると、各講義のシラバスにもアクセスできるようになります。
      </p>
    </div>
  );
}
