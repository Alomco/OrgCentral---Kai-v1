import type { ReactNode } from 'react';

import { OrgSectionNav } from './_components/org-section-nav';

export default function OrgLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <div className="px-6 pt-6">
                <OrgSectionNav />
            </div>
            {children}
        </div>
    );
}
