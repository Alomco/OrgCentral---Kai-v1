import type { ComplianceTemplateCreateState } from '../compliance-template-form-utils';

export const initialCreateState: ComplianceTemplateCreateState = {
    status: 'idle',
    values: {
        name: '',
        categoryKey: '',
        version: '',
        itemsJson: '',
    },
};
