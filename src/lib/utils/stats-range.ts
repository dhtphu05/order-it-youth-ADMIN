'use client';

import { endOfDay, formatISO, startOfDay, subDays } from 'date-fns';

export type StatsRange = '7d' | '30d';

export function getStatsRangeDates(range: StatsRange) {
    const today = new Date();
    const end = endOfDay(today);
    const days = range === '30d' ? 29 : 6;
    const start = startOfDay(subDays(end, days));
    return {
        from: formatISO(start),
        to: formatISO(end),
    };
}
