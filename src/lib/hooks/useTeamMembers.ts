'use client';

import { useMemo } from 'react';
import { useAdminTeamsControllerGet } from '@/lib/api/generated/endpoints/orderITYouthAdminAPI';
import type { AdminTeamMemberDto } from '@/lib/api/generated/models';

export type TeamMember = AdminTeamMemberDto & {
    phone?: string | null;
    status?: string | null;
};

export function useTeamMembers(teamId?: string) {
    const query = useAdminTeamsControllerGet<any>(teamId ?? '', {
        query: {
            enabled: Boolean(teamId),
        },
    });

    const members = useMemo<TeamMember[]>(() => {
        const rawMembers = query.data?.members;
        if (Array.isArray(rawMembers)) {
            return rawMembers as TeamMember[];
        }
        return [];
    }, [query.data]);

    return {
        ...query,
        members,
    };
}
