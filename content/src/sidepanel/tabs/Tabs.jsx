function Tabs({ activeTab, setActiveTab }) {
    return (
        <div className="tabs">
            <button
                className={`tab ${activeTab === "courses" ? "active" : ""}`}
                onClick={() => setActiveTab("courses")}
            >
                講義
            </button>
            <button
                className={`tab ${activeTab === "syllabus" ? "active" : ""}`}
                onClick={() => setActiveTab("syllabus")}
            >
                シラバス
            </button>
            <button
                className={`tab ${activeTab === "assignments" ? "active" : ""}`}
                onClick={() => setActiveTab("assignments")}
            >
                課題
            </button>
            <button
                className={`tab ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
            >
                設定
            </button>
        </div>
    );
}

export default Tabs;
