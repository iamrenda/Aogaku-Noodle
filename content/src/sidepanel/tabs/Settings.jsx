/* global chrome */
import { useState, useEffect } from "react";
import MajorPicker from "../components/MajorPicker";

function Settings() {
    const [defaultTab, setDefaultTab] = useState("courses");
    const [autoClosePanel, setAutoClosePanel] = useState(true);
    const [showSubmissionFeedback, setShowSubmissionFeedback] = useState(true);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [showMajorPicker, setShowMajorPicker] = useState(false);
    const [extensionEnabled, setExtensionEnabled] = useState(true);
    const [lmsRedesignEnabled, setLmsRedesignEnabled] = useState(true);
    const [quickAccessEnabled, setQuickAccessEnabled] = useState(true);
    const [gradeViewerEnabled, setGradeViewerEnabled] = useState(true);

    useEffect(() => {
        chrome.storage.local.get(
            [
                "defaultTab",
                "autoClosePanel",
                "showSubmissionFeedback",
                "selectedMajor",
                "extensionEnabled",
                "lmsRedesignEnabled",
                "quickAccessEnabled",
                "gradeViewerEnabled",
            ],
            (result) => {
                if (result.defaultTab) setDefaultTab(result.defaultTab);
                if (result.autoClosePanel !== undefined) setAutoClosePanel(result.autoClosePanel);
                if (result.showSubmissionFeedback !== undefined)
                    setShowSubmissionFeedback(result.showSubmissionFeedback);
                if (result.selectedMajor) setSelectedMajor(result.selectedMajor);
                if (result.extensionEnabled !== undefined) setExtensionEnabled(result.extensionEnabled);
                if (result.lmsRedesignEnabled !== undefined) setLmsRedesignEnabled(result.lmsRedesignEnabled);
                if (result.quickAccessEnabled !== undefined) setQuickAccessEnabled(result.quickAccessEnabled);
                if (result.gradeViewerEnabled !== undefined) setGradeViewerEnabled(result.gradeViewerEnabled);
            },
        );
    }, []);

    const handleDefaultTabChange = (e) => {
        const newTab = e.target.value;
        setDefaultTab(newTab);
        chrome.storage.local.set({ defaultTab: newTab });
    };

    const handleAutoClosePanelChange = (e) => {
        const newValue = e.target.checked;
        setAutoClosePanel(newValue);
        chrome.storage.local.set({ autoClosePanel: newValue });
    };

    const handleShowSubmissionFeedbackChange = (e) => {
        const newValue = e.target.checked;
        setShowSubmissionFeedback(newValue);
        chrome.storage.local.set({ showSubmissionFeedback: newValue });
    };

    const handleExtensionEnabledChange = (e) => {
        const newValue = e.target.checked;
        setExtensionEnabled(newValue);
        chrome.storage.local.set({ extensionEnabled: newValue });
    };

    const handleLmsRedesignEnabledChange = (e) => {
        const newValue = e.target.checked;
        setLmsRedesignEnabled(newValue);
        chrome.storage.local.set({ lmsRedesignEnabled: newValue });
    };

    const handleQuickAccessEnabledChange = (e) => {
        const newValue = e.target.checked;
        setQuickAccessEnabled(newValue);
        chrome.storage.local.set({ quickAccessEnabled: newValue });
    };

    const handleGradeViewerEnabledChange = (e) => {
        const newValue = e.target.checked;
        setGradeViewerEnabled(newValue);
        chrome.storage.local.set({ gradeViewerEnabled: newValue });
    };

    const handleClearData = () => {
        if (window.confirm("保存されているすべての講義と課題データを削除しますか？")) {
            chrome.storage.local.remove(["assignments", "courses", "syllabuses"], () => {
                alert("データを削除しました。Moodleのページを再読み込みしてデータを再取得してください。");
            });
        }
    };

    const handleMajorSelect = (majorLabel) => {
        setSelectedMajor(majorLabel);
        chrome.storage.local.set({ selectedMajor: majorLabel });
        setShowMajorPicker(false);
    };

    return (
        <>
            <div className="settings-list">
                <div className="settings-section">
                    <h2 className="settings-header">一般設定</h2>

                    <div className="setting-item">
                        <label htmlFor="default-tab-select" className="setting-label">
                            起動時に開くタブ
                        </label>
                        <select
                            id="default-tab-select"
                            value={defaultTab}
                            onChange={handleDefaultTabChange}
                            className="setting-select"
                        >
                            <option value="courses">講義</option>
                            <option value="syllabus">シラバス</option>
                            <option value="assignments">課題</option>
                            <option value="settings">設定</option>
                        </select>
                    </div>

                    <div className="setting-item checkbox-item">
                        <label htmlFor="auto-close-panel-checkbox" className="setting-label">
                            講義や課題をクリックした際にサイドパネルを閉じる
                        </label>
                        <input
                            type="checkbox"
                            id="auto-close-panel-checkbox"
                            checked={autoClosePanel}
                            onChange={handleAutoClosePanelChange}
                            className="setting-checkbox"
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h2 className="settings-header">学科設定</h2>

                    <div className="setting-item">
                        <div className="major-setting-row">
                            <span
                                className={`major-setting-value ${!selectedMajor ? "major-setting-value--unset" : ""}`}
                            >
                                {selectedMajor || "未選択"}
                            </span>
                            <button className="setting-button" onClick={() => setShowMajorPicker(true)}>
                                選択する
                            </button>
                        </div>
                    </div>

                    <p className="setting-description">シラバス検索に使用されます。</p>
                </div>

                <div className="settings-section">
                    <h2 className="settings-header">拡張機能</h2>

                    <div className="setting-item checkbox-item">
                        <label htmlFor="extension-enabled-checkbox" className="setting-label">
                            拡張機能を有効にする
                        </label>
                        <input
                            type="checkbox"
                            id="extension-enabled-checkbox"
                            checked={extensionEnabled}
                            onChange={handleExtensionEnabledChange}
                            className="setting-checkbox"
                        />
                    </div>

                    <p className="setting-description">無効にした場合、ページを再読み込みすると変更が反映されます。</p>
                </div>

                <div className={`settings-section ${!extensionEnabled ? "settings-section--disabled" : ""}`}>
                    <h2 className="settings-header">リニューアル設定</h2>

                    <div className="setting-item checkbox-item">
                        <label htmlFor="quick-access-enabled-checkbox" className="setting-label">
                            ホームページ
                        </label>
                        <input
                            type="checkbox"
                            id="quick-access-enabled-checkbox"
                            checked={quickAccessEnabled}
                            onChange={handleQuickAccessEnabledChange}
                            disabled={!extensionEnabled}
                            className="setting-checkbox"
                        />
                    </div>

                    <div className="setting-item checkbox-item">
                        <label htmlFor="lms-redesign-enabled-checkbox" className="setting-label">
                            マイコース
                        </label>
                        <input
                            type="checkbox"
                            id="lms-redesign-enabled-checkbox"
                            checked={lmsRedesignEnabled}
                            onChange={handleLmsRedesignEnabledChange}
                            disabled={!extensionEnabled}
                            className="setting-checkbox"
                        />
                    </div>

                    <div className="setting-item checkbox-item">
                        <label htmlFor="grade-viewer-enabled-checkbox" className="setting-label">
                            成績ビューア
                        </label>
                        <input
                            type="checkbox"
                            id="grade-viewer-enabled-checkbox"
                            checked={gradeViewerEnabled}
                            onChange={handleGradeViewerEnabledChange}
                            disabled={!extensionEnabled}
                            className="setting-checkbox"
                        />
                    </div>

                    <div className="setting-item checkbox-item">
                        <label htmlFor="show-submission-feedback-checkbox" className="setting-label">
                            課題提出時にエフェクトを表示する
                        </label>
                        <input
                            type="checkbox"
                            id="show-submission-feedback-checkbox"
                            checked={showSubmissionFeedback}
                            onChange={handleShowSubmissionFeedbackChange}
                            disabled={!extensionEnabled}
                            className="setting-checkbox"
                        />
                    </div>

                    <p className="setting-description">変更はページを再読み込みすると反映されます。</p>
                </div>

                <div className="settings-section">
                    <h2 className="settings-header">データ管理</h2>
                    <div className="setting-item">
                        <p className="setting-description">
                            講義や課題のデータが正しく表示されない場合や、リフレッシュしたい場合に利用してください。設定は保持されます。
                        </p>
                        <button onClick={handleClearData} className="setting-button danger">
                            データをクリア
                        </button>
                    </div>
                </div>

                <div className="settings-footer">
                    <p>Created by iamrenda</p>
                    <p>
                        Email: <a href="mailto:iamrenda.dev@gmail.com">iamrenda.dev@gmail.com</a>
                    </p>
                    <p className="copyright-text">
                        © 2026 iamrenda. 無断転載を禁じます。
                        本拡張機能は個人によって製作されたものであり，青山学院大学の公式の機能ではありません．本拡張機能の利用によって，利用者及び第三者に生じた損害においては，責任を負わないものとします．
                    </p>
                </div>
            </div>

            {showMajorPicker && (
                <MajorPicker
                    selectedMajor={selectedMajor}
                    onSelect={handleMajorSelect}
                    onClose={() => setShowMajorPicker(false)}
                />
            )}
        </>
    );
}

export default Settings;
