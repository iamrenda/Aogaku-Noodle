/* global chrome */
import { useState, useEffect } from "react";
import MajorPicker from "../components/MajorPicker";

function Settings() {
    const [defaultTab, setDefaultTab] = useState("courses");
    const [autoClosePanel, setAutoClosePanel] = useState(true);
    const [showSubmissionFeedback, setShowSubmissionFeedback] = useState(true);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [showMajorPicker, setShowMajorPicker] = useState(false);

    useEffect(() => {
        chrome.storage.local.get(
            ["defaultTab", "autoClosePanel", "showSubmissionFeedback", "selectedMajor"],
            (result) => {
                if (result.defaultTab) setDefaultTab(result.defaultTab);
                if (result.autoClosePanel !== undefined) setAutoClosePanel(result.autoClosePanel);
                if (result.showSubmissionFeedback !== undefined) setShowSubmissionFeedback(result.showSubmissionFeedback);
                if (result.selectedMajor) setSelectedMajor(result.selectedMajor);
            }
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

    const handleClearData = () => {
        if (window.confirm("保存されているすべての講義と課題データを削除しますか？")) {
            chrome.storage.local.remove(["assignments", "courses"], () => {
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
                    <h2 className="settings-header">シラバス設定</h2>
                    <div className="setting-item">
                        <label className="setting-label">所属学科</label>
                        <div className="major-setting-row">
                            <span className={`major-setting-value ${!selectedMajor ? "major-setting-value--unset" : ""}`}>
                                {selectedMajor || "未選択"}
                            </span>
                            <button
                                className="setting-button"
                                onClick={() => setShowMajorPicker(true)}
                            >
                                学科を選択する
                            </button>
                        </div>
                    </div>
                </div>

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

                    <div className="setting-item checkbox-item">
                        <label htmlFor="show-submission-feedback-checkbox" className="setting-label">
                            課題提出時にエフェクトを表示する
                        </label>
                        <input
                            type="checkbox"
                            id="show-submission-feedback-checkbox"
                            checked={showSubmissionFeedback}
                            onChange={handleShowSubmissionFeedbackChange}
                            className="setting-checkbox"
                        />
                    </div>
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
