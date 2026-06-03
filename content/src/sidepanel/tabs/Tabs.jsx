import { MdMenuBook, MdDescription, MdAssignment, MdSettings } from "react-icons/md";

const TABS = [
    { id: "courses",     Icon: MdMenuBook,    label: "講義" },
    { id: "syllabus",    Icon: MdDescription, label: "シラバス" },
    { id: "assignments", Icon: MdAssignment,  label: "課題" },
    { id: "settings",    Icon: MdSettings,    label: "設定" },
];

function Tabs({ activeTab, setActiveTab }) {
    return (
        <div className="tabs">
            {TABS.map(({ id, Icon, label }) => (
                <button
                    key={id}
                    className={`tab ${activeTab === id ? "active" : ""}`}
                    onClick={() => setActiveTab(id)}
                    title={label}
                >
                    <Icon size={20} />
                </button>
            ))}
        </div>
    );
}

export default Tabs;
