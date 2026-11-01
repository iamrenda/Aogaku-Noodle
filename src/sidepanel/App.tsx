import { useState } from "react";
import SyllabusProgress from "./components/SyllabusProgress";
import TabBar from "./components/TabBar";
import useSyllabusProgress from "./hooks/useSyllabusProgress";
import Assignments from "./tabs/Assignments";
import Courses from "./tabs/Courses";
import Settings from "./tabs/Settings";
import type { TabId } from "./const/tabs";

export default function App() {
  const [tab, setTab] = useState<TabId>("courses");
  const progress = useSyllabusProgress((s) => s.progress);

  return (
    <div className="min-h-screen">
      {progress && <SyllabusProgress fetched={progress.fetched} total={progress.total} />}
      <TabBar tab={tab} onChange={setTab} />
      <main id="panel" role="tabpanel">
        {tab === "courses" && <Courses />}
        {tab === "assignments" && <Assignments />}
        {tab === "settings" && <Settings />}
      </main>
    </div>
  );
}
