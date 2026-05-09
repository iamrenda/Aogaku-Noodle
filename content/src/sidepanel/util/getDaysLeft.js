// Calculate days until deadline
const getDaysLeft = (timestamp) => {
    if (!timestamp) return null;
    // Timestamp is in seconds
    const diffMs = timestamp * 1000 - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "期限切れ";
    if (diffDays === 0) return "今日";
    return `残り${diffDays}日`;
};

export default getDaysLeft;
