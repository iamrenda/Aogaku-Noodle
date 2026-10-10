import { MOODLE_HOME_URL } from "../const/moodleUrl";
import type { RefreshError } from "../hooks/useCourses";

type Props = {
  error: RefreshError | null;
  isRefreshing: boolean;
  onRefresh: () => void;
};

const MESSAGES: Record<RefreshError | "empty", string> = {
  empty: "講義データがありません。Moodleを開いた状態で「講義を更新」を押してください。",
  "not-on-moodle": "Moodleのページが開かれていません。Moodleを開いてからもう一度更新してください。",
  failed: "講義を取得できませんでした。Moodleにログインしているか確認して、もう一度お試しください。",
};

export default function RefreshPrompt({ error, isRefreshing, onRefresh }: Props) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-11 rounded-lg border-0 bg-brand text-[15px] font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {isRefreshing ? "取得中..." : "講義を更新"}
      </button>

      <p className={`m-0 text-[15px] leading-relaxed ${error ? "text-alert" : "text-ink-soft"}`}>
        {MESSAGES[error ?? "empty"]}
      </p>

      {error === "not-on-moodle" && (
        <a
          href={MOODLE_HOME_URL}
          target="_blank"
          rel="noreferrer"
          className="text-[15px] font-bold text-brand underline underline-offset-2"
        >
          Moodleを開く
        </a>
      )}
    </div>
  );
}
