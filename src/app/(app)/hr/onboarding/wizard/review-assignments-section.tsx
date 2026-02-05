import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ListChecks, PlaneTakeoff } from 'lucide-react';

import type { OnboardingWizardValues } from './wizard.schema';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import type { LeaveType } from './assignments-step';
import type { OnboardingWorkflowTemplateRecord } from '@/server/types/hr/onboarding-workflow-templates';
import type { EmailSequenceTemplateRecord } from '@/server/types/hr/onboarding-email-sequences';
import type { DocumentTemplateRecord } from '@/server/types/records/document-templates';
import { LEAVE_TYPE_LABELS } from './review-utils';
import { ReviewSection } from './review-section';

export interface ReviewAssignmentsSectionProps {
    values: OnboardingWizardValues;
    leaveTypes: LeaveType[];
    selectedLeaveTypes: string[];
    selectedTemplate?: ChecklistTemplate;
    selectedWorkflow?: OnboardingWorkflowTemplateRecord;
    selectedEmailSequence?: EmailSequenceTemplateRecord;
    selectedDocuments?: DocumentTemplateRecord[];
    onEditStep?: (stepIndex: number) => void;
    stepIndex?: number;
}

export function ReviewAssignmentsSection({
    values,
    leaveTypes,
    selectedLeaveTypes,
    selectedTemplate,
    selectedWorkflow,
    selectedEmailSequence,
    selectedDocuments = [],
    onEditStep,
    stepIndex,
}: ReviewAssignmentsSectionProps) {
    const leaveTypeLabelMap = new Map(leaveTypes.map((leaveType) => [leaveType.code, leaveType.name]));

    return (
        <ReviewSection
            title="Assignments"
            icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
            stepIndex={stepIndex}
            onEdit={onEditStep}
        >
            <div className="space-y-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <PlaneTakeoff className="h-3.5 w-3.5" />
                        Leave Types
                    </div>
                    {selectedLeaveTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedLeaveTypes.map((code) => (
                                <Badge key={code} variant="secondary">
                                    {leaveTypeLabelMap.get(code) ?? LEAVE_TYPE_LABELS[code] ?? code}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No leave types assigned</p>
                    )}
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" />
                        Onboarding Checklist
                    </div>
                    {values.includeTemplate && selectedTemplate ? (
                        <div>
                            <p className="text-sm font-medium">{selectedTemplate.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {selectedTemplate.items.length} item{selectedTemplate.items.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No checklist assigned</p>
                    )}
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" />
                        Workflow Template
                    </div>
                    {selectedWorkflow ? (
                        <div>
                            <p className="text-sm font-medium">{selectedWorkflow.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {selectedWorkflow.templateType} • v{selectedWorkflow.version}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No workflow template selected</p>
                    )}
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" />
                        Email Sequence
                    </div>
                    {selectedEmailSequence ? (
                        <div>
                            <p className="text-sm font-medium">{selectedEmailSequence.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedEmailSequence.trigger}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No email sequence selected</p>
                    )}
                </div>

                <Separator />

                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" />
                        Required Documents
                    </div>
                    {selectedDocuments.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedDocuments.map((document_) => (
                                <Badge key={document_.id} variant="secondary">
                                    {document_.name}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No documents assigned</p>
                    )}
                </div>
            </div>
        </ReviewSection>
    );
}
