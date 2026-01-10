import type { HRPolicy } from '@/server/types/hr-ops-types';

import { PolicyAdminForm } from './policy-admin-form';
import { PolicyAdminRow } from './policy-admin-row';

export function PolicyAdminManager(props: {
    policies: HRPolicy[];
    policyCategories: readonly string[];
}) {
    return (
        <div className="space-y-6">
            <PolicyAdminForm policyCategories={props.policyCategories} />

            <div className="text-sm font-medium">Existing policies</div>
            {props.policies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No policies configured yet.</p>
            ) : (
                <div className="space-y-3">
                    {props.policies.map((policy) => (
                        <PolicyAdminRow
                            key={policy.id}
                            policy={policy}
                            policyCategories={props.policyCategories}
                            statusOptions={['draft', 'active']}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
