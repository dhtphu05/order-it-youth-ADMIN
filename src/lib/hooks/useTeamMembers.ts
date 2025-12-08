'use client';

import { useMemo } from 'react';
import { usePosControllerGetTeamMembers } from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type { AdminTeamMemberDto } from '@/lib/api/generated/models';

export type TeamMember = AdminTeamMemberDto & {
    phone?: string | null;
    status?: string | null;
};

const normalizeMembers = (payload: unknown): TeamMember[] => {
    if (!payload) {
        return [];
    }

    if (Array.isArray(payload)) {
        return payload as TeamMember[];
    }

    if (Array.isArray((payload as any)?.data)) {
        return (payload as any).data as TeamMember[];
    }

    if (Array.isArray((payload as any)?.members)) {
        return (payload as any).members as TeamMember[];
    }

    return [];
};

export function useTeamMembers(teamId?: string) {
    const query = usePosControllerGetTeamMembers<any>(teamId ?? '', {
        query: {
            enabled: Boolean(teamId),
        },
    });

    const members = useMemo(() => normalizeMembers(query.data), [query.data]);

    return {
        ...query,
        members,
    };
}
