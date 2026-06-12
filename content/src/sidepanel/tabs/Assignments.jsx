/* global chrome */
import { useState, useEffect } from "react";
import getTimeAgo from "../util/getTimeAgo";
import Loading from "../components/Loading";
import AssignmentCard from "../components/AssignmentCard";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const LMS_URL = "https://agulms45.aim.aoyama.ac.jp/?redirect=0";

function AssignmentsEmptyState({ isLmsActive, onFetch }) {
    const [fetching, setFetching] = useState(false);

    const handleFetch = () => {
        setFetching(true);
        onFetch?.();
    };

    if (isLmsActive) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h2>課題データがありません</h2>
                <p>ボタンを押してMoodleから課題を読み込んでください。</p>
                <button
                    className="fetch-courses-btn"
                    onClick={handleFetch}
                    disabled={fetching}
                >
                    {fetching ? "読み込み中…" : "更新する"}
                </button>
            </div>
        );
    }

    return (
        <div className="empty-state">
            <div className="empty-icon">🔑</div>
            <h2>課題データがありません</h2>
            <p>Moodleにログインして課題データを読み込んでください。</p>
            <a
                className="fetch-courses-btn fetch-courses-btn--link"
                href={LMS_URL}
                target="_blank"
                rel="noopener noreferrer"
            >
                Moodleを開く
            </a>
        </div>
    );
}

// Shared helper: persist hidden ids to storage
function persistHidden(next) {
    chrome.storage.local.set({ hiddenAssignments: [...next] });
}

/**
 * Assignments list.
 *
 * Hiding state can be controlled externally by passing:
 *   hiddenIdsExternal, showHiddenExternal, onHideExternal, onShowExternal, onToggleShowHiddenExternal, hideToggle
 * When those are omitted the component manages hiding internally and renders
 * the toggle link inline (side panel usage).
 */
function Assignments({
    loading,
    assignments,
    lastUpdated,
    onReload,
    canReload,
    isLmsActive,
    hideHeader,
    // controlled hiding (QuickAccess)
    hiddenIdsExternal,
    showHiddenExternal,
    onHideExternal,
    onShowExternal,
    onToggleShowHiddenExternal,
    onCompleteExternal,
    hideToggle,
}) {
    const [, setTick] = useState(0);
    const [isReloading, setIsReloading] = useState(false);
    const [hiddenIdsInternal, setHiddenIdsInternal] = useState(new Set());
    const [showHiddenInternal, setShowHiddenInternal] = useState(false);

    const isControlled = hiddenIdsExternal !== undefined;
    const hiddenIds = isControlled ? hiddenIdsExternal : hiddenIdsInternal;
    const showHidden = isControlled ? showHiddenExternal : showHiddenInternal;

    // Load persisted hidden IDs on mount (only when uncontrolled)
    useEffect(() => {
        if (isControlled) return;
        chrome.storage.local.get(["hiddenAssignments"], (result) => {
            if (result.hiddenAssignments) {
                setHiddenIdsInternal(new Set(result.hiddenAssignments));
            }
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setIsReloading(false);
        if (!lastUpdated) return;
        const timer = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(timer);
    }, [lastUpdated]);

    const handleReload = () => {
        setIsReloading(true);
        onReload();
        setTimeout(() => setIsReloading(false), 5000);
    };

    const handleHide = (id) => {
        if (isControlled) {
            onHideExternal?.(id);
        } else {
            setHiddenIdsInternal((prev) => {
                const next = new Set(prev);
                next.add(id);
                persistHidden(next);
                return next;
            });
        }
    };

    const handleShow = (id) => {
        if (isControlled) {
            onShowExternal?.(id);
        } else {
            setHiddenIdsInternal((prev) => {
                const next = new Set(prev);
                next.delete(id);
                persistHidden(next);
                return next;
            });
        }
    };

    const handleToggleShowHidden = (e) => {
        e.preventDefault();
        if (isControlled) {
            onToggleShowHiddenExternal?.();
        } else {
            setShowHiddenInternal((v) => !v);
        }
    };

    const formattedLastUpdated = getTimeAgo(lastUpdated);
    const isLastUpdatedVisible = !loading && formattedLastUpdated;

    if (loading) return <Loading />;
    if (assignments.length === 0) return <AssignmentsEmptyState isLmsActive={isLmsActive} onFetch={onReload} />;

    const visibleAssignments = assignments.filter((a) => !hiddenIds.has(a.id));
    const hiddenCount = assignments.length - visibleAssignments.length;
    const displayedAssignments = showHidden ? assignments : visibleAssignments;

    return (
        <div className="assignments-list">
            {!hideHeader && (isLastUpdatedVisible || (!hideToggle && hiddenCount > 0)) && (
                <div
                    className="last-updated"
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        marginBottom: "-0.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    {!hideToggle && hiddenCount > 0 ? (
                        <a className="assignments-hidden-toggle" onClick={handleToggleShowHidden} href="#" title={showHidden ? "非表示の課題を隠す" : `非表示の課題を表示する（${hiddenCount}件）`}>
                            {showHidden
                                ? <><MdVisibilityOff size={15} /><span>{hiddenCount}件</span></>
                                : <><MdVisibility size={15} /><span>{hiddenCount}件</span></>}
                        </a>
                    ) : <span />}
                    {isLastUpdatedVisible && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span>最終更新: {formattedLastUpdated}</span>
                            {canReload && (
                                <button
                                    className={`reload-button ${isReloading ? "loading" : ""}`}
                                    onClick={handleReload}
                                    disabled={isReloading}
                                >
                                    {isReloading && <span className="spinner-icon"></span>}
                                    {isReloading ? "ローディング中..." : "更新する"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {displayedAssignments.map((assignment, index) => (
                <AssignmentCard
                    key={assignment.id ?? index}
                    assignment={assignment}
                    index={index}
                    isHidden={hiddenIds.has(assignment.id)}
                    onHide={handleHide}
                    onShow={handleShow}
                    onComplete={onCompleteExternal}
                />
            ))}
        </div>
    );
}

export default Assignments;
