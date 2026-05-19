import { useState, useEffect } from "react";
import getTimeAgo from "../util/getTimeAgo";
import Loading from "../components/Loading";
import AssignmentCard from "../components/AssignmentCard";
import EmptyState from "../components/EmptyState";

function Assignments({ loading, assignments, lastUpdated, onReload, canReload, hideHeader }) {
    const [, setTick] = useState(0);
    const [isReloading, setIsReloading] = useState(false);

    useEffect(() => {
        setIsReloading(false); // Clear reloading state when data actually updates
        if (!lastUpdated) return;
        const timer = setInterval(() => {
            setTick((t) => t + 1);
        }, 30000); // Update every 30 seconds to be responsive
        return () => clearInterval(timer);
    }, [lastUpdated]);

    const handleReload = () => {
        setIsReloading(true);
        onReload();
        // Fallback in case content script fails or no tab is open
        setTimeout(() => setIsReloading(false), 5000);
    };

    const formattedLastUpdated = getTimeAgo(lastUpdated);
    const isLastUpdatedVisible = !loading && formattedLastUpdated;

    if (loading) {
        return <Loading />;
    }

    if (assignments.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="assignments-list">
            {isLastUpdatedVisible && !hideHeader && (
                <div
                    className="last-updated"
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        textAlign: "right",
                        marginBottom: "-0.5rem",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <span>最終更新: {formattedLastUpdated}</span>
                    {canReload && (
                        <button 
                            className={`reload-button ${isReloading ? 'loading' : ''}`} 
                            onClick={handleReload}
                            disabled={isReloading}
                        >
                            {isReloading && <span className="spinner-icon"></span>}
                            {isReloading ? 'ローディング中...' : '更新する'}
                        </button>
                    )}
                </div>
            )}
            {assignments.map((assignment, index) => (
                <AssignmentCard key={index} assignment={assignment} index={index} />
            ))}
        </div>
    );
}

export default Assignments;
