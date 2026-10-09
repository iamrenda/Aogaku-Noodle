import { TABS, type TabId } from "../const/tabs";
import Icon from "./Icon";

type Props = {
  tab: TabId;
  onChange: (tab: TabId) => void;
};

export default function TabBar({ tab, onChange }: Props) {
  const active = TABS.findIndex((t) => t.id === tab);
  const columns = TABS.map((_, i) => (i === active ? "1fr" : "48px")).join(" ");

  return (
    <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3">
      <div
        role="tablist"
        className="grid gap-1 rounded-2xl bg-wash p-1.5 transition-[grid-template-columns] duration-300"
        style={{ gridTemplateColumns: columns }}
      >
        {TABS.map((t) => {
          const isSelected = t.id === tab;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => onChange(t.id)}
              className={`flex h-10 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl border-0 whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-white text-brand shadow-[0_1px_3px_rgb(27_42_71/0.12)]"
                  : "bg-transparent text-ink-soft hover:text-ink"
              }`}
            >
              <Icon id={t.id} />
              {isSelected && <span className="text-[15px] font-bold">{t.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
