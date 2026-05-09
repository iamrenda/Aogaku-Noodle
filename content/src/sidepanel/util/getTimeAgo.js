export default function getTimeAgo(timestamp) {
    if (!timestamp) return null;

    const now = Date.now();
    const date = new Date(timestamp);
    const diff = now - date.getTime();
    
    if (isNaN(diff)) return null;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "たった今";
    } else if (minutes < 60) {
        return `${minutes}分前`;
    } else if (hours < 24) {
        return `${hours}時間前`;
    } else if (days < 30) {
        return `${days}日前`;
    } else {
        return "かなり前";
    }
}
