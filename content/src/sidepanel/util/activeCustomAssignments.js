// Map stored custom (user-added) assignments into the shape AssignmentCard
// expects. Completed entries are dropped, and `isOverdue` is computed from the
// due date so custom cards style themselves like Moodle-fetched ones.
export default function activeCustomAssignments(customAssignments = []) {
    const now = Date.now();
    return customAssignments
        .filter((c) => !c.completed)
        .map((c) => ({
            ...c,
            isOverdue: c.dueDate ? c.dueDate * 1000 < now : false,
        }));
}
