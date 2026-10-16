import { MdAssignment, MdMenuBook, MdSettings } from "react-icons/md";
import type { TabId } from "../const/tabs";

const ICONS = {
  courses: MdMenuBook,
  assignments: MdAssignment,
  settings: MdSettings,
} satisfies Record<TabId, unknown>;

export default function Icon({ id }: { id: TabId }) {
  const Glyph = ICONS[id];
  return <Glyph size={22} aria-hidden="true" />;
}
