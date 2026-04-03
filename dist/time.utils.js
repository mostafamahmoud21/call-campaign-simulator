export function parseTimeToMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}
export function getNowMinutes(nowMs) {
    const now = new Date(nowMs);
    return now.getHours() * 60 + now.getMinutes();
}
export function isWithinWorkingHours(nowMs, startTime, endTime) {
    const now = getNowMinutes(nowMs);
    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);
    return now >= start && now < end;
}
export function getDelayUntilNextStart(nowMs, startTime, endTime) {
    const now = new Date(nowMs);
    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);
    const startHour = Math.floor(start / 60);
    const startMin = start % 60;
    const nextStart = new Date(now);
    nextStart.setHours(startHour, startMin, 0, 0);
    const currentMinutes = getNowMinutes(nowMs);
    if (currentMinutes >= end) {
        nextStart.setDate(nextStart.getDate() + 1);
    }
    return nextStart.getTime() - nowMs;
}
