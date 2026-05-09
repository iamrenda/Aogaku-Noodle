import { useState, useEffect } from "react";
import getTimeAgo from "../util/getTimeAgo";
import Loading from "../components/Loading";
import AssignmentCard from "../components/AssignmentCard";
import EmptyState from "../components/EmptyState";

function Assignments({ loading, assignments, lastUpdated }) {
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!lastUpdated) return;
        const timer = setInterval(() => {
            setTick((t) => t + 1);
        }, 30000); // Update every 30 seconds to be responsive
        return () => clearInterval(timer);
    }, [lastUpdated]);

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
            {isLastUpdatedVisible && (
                <div
                    className="last-updated"
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        textAlign: "right",
                        marginBottom: "-0.5rem",
                    }}
                >
                    最終更新: {formattedLastUpdated}
                </div>
            )}
            {assignments.map((assignment, index) => (
                <AssignmentCard key={index} assignment={assignment} index={index} />
            ))}
        </div>
    );
}

export default Assignments;
