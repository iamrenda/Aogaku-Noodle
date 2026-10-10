import { useState } from "react";
import AssignmentCard from "../components/AssignmentCard";
import Pagination from "../components/Pagination";
import mockAssignments from "../data/mockAssignments";
import daysLeft from "../utils/daysLeft";

const PAGE_SIZE = 20;

const sections = [
  { title: "期限切れ", match: (d: number) => d < 0, overdue: true },
  { title: "3日以内", match: (d: number) => d >= 0 && d <= 3, overdue: false },
  { title: "今週中", match: (d: number) => d > 3 && d <= 7, overdue: false },
  { title: "それ以降", match: (d: number) => d > 7, overdue: false },
];

export default function Assignments() {
  const [page, setPage] = useState(0);

  const sortedAssignmentsByDue = [...mockAssignments].sort((a, b) => a.dueAt - b.dueAt);
  const pageCount = Math.ceil(sortedAssignmentsByDue.length / PAGE_SIZE);
  const pageItems = sortedAssignmentsByDue.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white px-4 pt-2 pb-8">
      {sections.map(({ title, match, overdue }) => {
        const items = pageItems.filter((a) => match(daysLeft(a.dueAt)));

        if (items.length === 0) return null;

        return (
          <section key={title} className="mt-6 first:mt-0">
            <h2
              className={`m-0 border-b border-rule pb-1.5 text-[15px] font-bold ${overdue ? "text-alert" : "text-brand"}`}
            >
              {title}
            </h2>
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
              {items.map((a) => (
                <li key={a.id}>
                  <AssignmentCard assignment={a} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
