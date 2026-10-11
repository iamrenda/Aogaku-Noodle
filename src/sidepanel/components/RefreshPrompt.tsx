import { MOODLE_HOME_URL } from "../const/moodleUrl";
import type { AssignmentsError } from "../hooks/useAssignments";

type Props = {
  error: AssignmentsError | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  subject?: string; // what is being refreshed
};

const MESSAGES: Record<AssignmentsError | "empty", (subject: string) => string> = {
  empty: (s) => `${s}データがありません。Moodleを開いた状態で「${s}を更新」を押してください。`,
  "not-on-moodle": () => "Moodleのページが開かれていません。Moodleを開いてからもう一度更新してください。",
  failed: (s) => `${s}を取得できませんでした。Moodleにログインしているか確認して、もう一度お試しください。`,
  "no-courses": () => "講義データがありません。先に講義タブで講義を更新してください。",
};

/**
 * Prompt to show when no data is available
 * Button will show to refresh
 */
export default function RefreshPrompt({ error, isRefreshing, onRefresh, subject = "講義" }: Props) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-11 rounded-lg border-0 bg-brand text-[15px] font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {isRefreshing ? "取得中..." : `${subject}を更新`}
      </button>

      <p className={`m-0 text-[15px] leading-relaxed ${error ? "text-alert" : "text-ink-soft"}`}>
        {MESSAGES[error ?? "empty"](subject)}
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
