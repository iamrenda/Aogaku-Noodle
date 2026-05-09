// Helper to format date strings
const formatDate = (dateStr) => {
    if (!dateStr) return "未定";
    return dateStr
        .replace(/年|月/g, "/")
        .replace(/日|\(.*\)/g, "")
        .trim();
};

export default formatDate;
