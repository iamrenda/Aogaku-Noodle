import { useState } from "react";
import MajorPicker from "../components/MajorPicker";
import useMajor from "../hooks/useMajor";

export default function Settings() {
  const { major, selectMajor } = useMajor();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const deleteData = async () => {
    if (
      !window.confirm(
        "保存されているデータ（講義・課題・学科）をすべて削除しますか？この操作は元に戻せません。",
      )
    )
      return;
    await chrome.storage.local.clear();
    window.alert("保存データを削除しました。");
  };

  return (
    // 80px is the height of the sticky tab bar
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white px-4 pt-2 pb-6">
      <section>
        <h2 className="m-0 border-b border-rule pb-1.5 text-[15px] font-bold text-ink">学科設定</h2>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className={`text-[14px] ${major ? "font-bold text-ink" : "text-ink-soft"}`}>
            {major ?? "未選択"}
          </span>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="cursor-pointer rounded-lg border border-brand bg-brand px-3 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-white hover:text-brand"
          >
            選択する
          </button>
        </div>
        <p className="m-0 mt-2 text-[13px] text-ink-soft">シラバス検索に使用されます。</p>
      </section>

      <section className="mt-8">
        <h2 className="m-0 border-b border-rule pb-1.5 text-[15px] font-bold text-alert">
          データの削除
        </h2>
        <p className="m-0 mt-3 text-[13px] text-ink-soft">
          この拡張機能が保存した講義・課題・学科のデータをすべて削除します。
        </p>
        <button
          type="button"
          onClick={deleteData}
          className="mt-3 rounded-lg border border-alert bg-alert px-3 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-white hover:text-alert"
        >
          保存データを削除
        </button>
      </section>

      <p className="m-0 mt-auto pt-8 text-center text-xs text-ink-soft">
        この拡張機能は非公式です。@iamrenda が制作しました。
      </p>

      {isPickerOpen && (
        <MajorPicker
          selected={major}
          onSelect={(label) => {
            selectMajor(label);
            setIsPickerOpen(false);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
