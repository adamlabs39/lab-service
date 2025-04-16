export default function calculatePersen(value, total) {
    if (value === undefined || value === null || total === undefined || total === null) {
        return 0;
    }
    if (total === 0) {
        return 0;
    }
    if (value < 0) {
        return 0;
    }
    return Math.round((value / total) * 100);
}