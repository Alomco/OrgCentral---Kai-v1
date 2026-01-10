'use client';

import {
    Mail,
    Phone,
    MapPin,
    Home,
    User,
    Copy
} from 'lucide-react';
import { toast } from 'sonner';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { formatOptionalText } from '../../employees/_components/employee-formatters';

interface ProfileDetailsSectionProps {
    profile: EmployeeProfile;
    className?: string;
}

export function ProfileDetailsSection({ profile, className }: ProfileDetailsSectionProps) {
    const copyToClipboard = async (text: string, label: string) => {
        if (!text) { return; }
        try {
            await navigator.clipboard.writeText(text);
            toast.info(`Copied ${label} to clipboard`);
        } catch {
            toast.error(`Unable to copy ${label}`);
        }
    };

    return (
        <Card className={cn('glass-card overflow-hidden', className)} data-ui-surface="container">
            <div className="p-6">
                <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    <User className="h-4 w-4" /> Personal Details
                </h3>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Work Contact */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-primary/70 uppercase">Work Contact</h4>
                        <DetailItem
                            icon={<Mail className="h-4 w-4" />}
                            label="Email"
                            value={profile.email ?? ''}
                            onCopy={() => copyToClipboard(profile.email ?? '', 'Email')}
                        />
                        <DetailItem
                            icon={<Phone className="h-4 w-4" />}
                            label="Work Phone"
                            value={formatOptionalText(profile.phone?.work)}
                            onCopy={() => copyToClipboard(profile.phone?.work ?? '', 'Work Phone')}
                        />
                    </div>

                    {/* Personal Contact */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-primary/70 uppercase">Personal Contact</h4>
                        <DetailItem
                            icon={<Mail className="h-4 w-4" />}
                            label="Personal Email"
                            value={formatOptionalText(profile.personalEmail)}
                            onCopy={() => copyToClipboard(profile.personalEmail ?? '', 'Personal Email')}
                        />
                        <DetailItem
                            icon={<Phone className="h-4 w-4" />}
                            label="Mobile"
                            value={formatOptionalText(profile.phone?.mobile)}
                            onCopy={() => copyToClipboard(profile.phone?.mobile ?? '', 'Mobile')}
                        />
                        <DetailItem
                            icon={<Home className="h-4 w-4" />}
                            label="Home Phone"
                            value={formatOptionalText(profile.phone?.home)}
                            onCopy={() => copyToClipboard(profile.phone?.home ?? '', 'Home Phone')}
                        />
                    </div>

                    {/* Emergency */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-destructive/70 uppercase">Emergency Contact</h4>
                        <DetailItem
                            icon={<User className="h-4 w-4" />}
                            label="Name"
                            value={formatOptionalText(profile.emergencyContact?.name)}
                        />
                        <DetailItem
                            icon={<UsersIcon className="h-4 w-4" />}
                            label="Relationship"
                            value={formatOptionalText(profile.emergencyContact?.relationship)}
                        />
                        <DetailItem
                            icon={<Phone className="h-4 w-4" />}
                            label="Phone"
                            value={formatOptionalText(profile.emergencyContact?.phone)}
                            onCopy={() => copyToClipboard(profile.emergencyContact?.phone ?? '', 'Emergency Phone')}
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[hsl(var(--border)/var(--ui-border-opacity))]">
                    <h4 className="mb-4 text-xs font-semibold text-primary/70 uppercase">Home Address</h4>
                    <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                            {profile.address ? (
                                <>
                                    <div className="font-medium">{profile.address.street}</div>
                                    <div className="text-muted-foreground">
                                        {profile.address.city}, {profile.address.state} {profile.address.postalCode}
                                    </div>
                                    <div className="text-muted-foreground">{profile.address.country}</div>
                                </>
                            ) : (
                                <span className="text-muted-foreground italic">Address not set</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function DetailItem({ icon, label, value, onCopy }: { icon: ReactNode, label: string, value: string, onCopy?: () => void }) {
    if (!value || value === 'Not set') { return null; }

    return (
        <div className="group flex items-center justify-between gap-2 rounded-md p-2 hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="text-muted-foreground">{icon}</div>
                <div className="min-w-0">
                    <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
                    <div className="truncate text-sm font-medium">{value}</div>
                </div>
            </div>
            {onCopy && (
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6" onClick={onCopy}>
                    <Copy className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
