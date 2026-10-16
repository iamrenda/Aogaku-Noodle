import { useState } from "react";
import TabBar from "./components/TabBar";
import Assignments from "./tabs/Assignments";
import Courses from "./tabs/Courses";
import Settings from "./tabs/Settings";
import type { TabId } from "./const/tabs";

export default function App() {
  const [tab, setTab] = useState<TabId>("courses");

  return (
    <div className="min-h-screen">
      <TabBar tab={tab} onChange={setTab} />
      <main id="panel" role="tabpanel">
        {tab === "courses" && <Courses />}
        {tab === "assignments" && <Assignments />}
        {tab === "settings" && <Settings />}
      </main>
    </div>
  );
}
