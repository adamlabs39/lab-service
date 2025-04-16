export default function calculateRupiah(presentase, total) {
    if (presentase === undefined || presentase === null || total === undefined || total === null) {
        return 0;
    }
    if (total === 0) {
        return 0;
    }
    if (presentase < 0) {
        return 0;
    }
    return presentase * total;
}