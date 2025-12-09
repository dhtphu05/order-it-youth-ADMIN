'use client';

export type StatsRange = '7d' | '30d';

const DAY_MS = 24 * 60 * 60 * 1000;
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7

const toVietnamStartOfDay = (timestamp: number) => {
    const offsetTimestamp = timestamp + VIETNAM_OFFSET_MS;
    const startLocal = Math.floor(offsetTimestamp / DAY_MS) * DAY_MS;
    return startLocal - VIETNAM_OFFSET_MS;
};

const toVietnamEndOfDay = (timestamp: number) => {
    const start = toVietnamStartOfDay(timestamp);
    return start + DAY_MS - 1;
};

export function getStatsRangeDates(range: StatsRange) {
    const now = Date.now();
    const endTimestamp = toVietnamEndOfDay(now);
    const days = range === '30d' ? 29 : 6;
    const startAnchor = endTimestamp - days * DAY_MS;
    const startTimestamp = toVietnamStartOfDay(startAnchor);
    return {
        from: new Date(startTimestamp).toISOString(),
        to: new Date(endTimestamp).toISOString(),
    };
}
