"use client";

import { Briefcase, Calendar, Users, Building, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { formatDate, formatEmploymentType } from '../../employees/_components/employee-formatters';

interface ProfileBentoGridProps {
    profile: EmployeeProfile;
    className?: string;
}

export function ProfileBentoGrid({ profile, className }: ProfileBentoGridProps) {

    const liftCardBase = 'glass-card p-6 transition-all hover:shadow-(--ui-card-shadow) hover:translate-y-(--ui-hover-lift)';
    const detailLabelClass = 'text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80';
    const contactRowClass = 'flex items-start gap-3';
    const recentlyJoinedLabel = 'Recently Joined';

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className={cn('grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4', className)}
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* 1. Employment Details (Large) */}
            <motion.div variants={item} className="md:col-span-2 lg:col-span-2">
                <Card className={cn(liftCardBase, 'h-full')} data-ui-surface="container">
                    <h3 className="mb-6 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Briefcase className="h-4 w-4" /> Employment
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <div className={detailLabelClass}>Department</div>
                            <div className="mt-1.5 text-base font-semibold text-foreground">{profile.departmentId ?? 'Not assigned'}</div>
                        </div>
                        <div>
                            <div className={detailLabelClass}>Employee ID</div>
                            <div className="mt-1.5 text-base font-mono font-medium text-foreground">{profile.employeeNumber}</div>
                        </div>
                        <div>
                            <div className={detailLabelClass}>Tenure</div>
                            <div className="mt-1.5 text-base font-semibold text-foreground flex flex-col">
                                <div className="mt-1 text-base font-medium text-foreground/90 flex flex-col">
                                    <span>{(() => {
                                        if (!profile.startDate) { return recentlyJoinedLabel; }
                                        const start = new Date(profile.startDate);
                                        if (isNaN(start.getTime()) || start.getFullYear() < 1980) { return recentlyJoinedLabel; }

                                        const now = new Date();
                                        const diffTime = Math.abs(now.getTime() - start.getTime());
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                        if (diffDays < 30) { return recentlyJoinedLabel; }

                                        const years = Math.floor(diffDays / 365);
                                        const months = Math.floor((diffDays % 365) / 30);
                                        const yearsLabel = years.toLocaleString();
                                        const monthsLabel = months.toLocaleString();

                                        if (years > 0) { return `${yearsLabel} Year${years > 1 ? 's' : ''}, ${monthsLabel} Month${months !== 1 ? 's' : ''}`; }
                                        return `${monthsLabel} Month${months !== 1 ? 's' : ''}`;
                                    })()}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {profile.startDate && new Date(profile.startDate).getFullYear() > 1980
                                            ? `Since ${formatDate(profile.startDate)}`
                                            : 'Start date not set'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Type</div>
                            <Badge variant="outline" className="mt-1 font-medium">{formatEmploymentType(profile.employmentType)}</Badge>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* 2. Quick Actions (Large - Row 1) */}
            <motion.div variants={item} className="md:col-span-2 lg:col-span-2 flex flex-col gap-4">
                {/* Quick Actions (Expanded) */}
                <Card className={cn(liftCardBase, 'flex-1')} data-ui-surface="container">
                    <h3 className="mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full items-center">
                        {[
                            { label: 'Leave', icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20 hover:border-blue-500/50' },
                            { label: 'Schedule', icon: Briefcase, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/20 hover:border-purple-500/50' },
                            { label: 'Documents', icon: Mail, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20 hover:border-amber-500/50' },
                            { label: 'Team', icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20 hover:border-emerald-500/50' },
                        ].map((action, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className={`h-28 flex flex-col items-center justify-center gap-3 border bg-card/60 hover:bg-card/90 ${action.border} transition-all duration-300 group/action shadow-sm`}
                            >
                                <div className={`p-3 rounded-2xl ${action.bg} group-hover/action:scale-110 group-hover/action:rotate-3 transition-transform duration-300 ${action.color} shadow-inner`}>
                                    <action.icon className="h-7 w-7" />
                                </div>
                                <span className="text-[11px] font-semibold tracking-wide text-foreground/90">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* 3. Manager (Moved to Row 2) */}
            <motion.div variants={item} className="md:col-span-1 lg:col-span-1">
                <Card className={cn(liftCardBase, 'h-full flex flex-col justify-between group cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary')} data-ui-surface="container">
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <Users className="h-4 w-4" /> Reporting To
                        </h3>
                        {profile.managerUserId ? (
                            <div className="mt-3">
                                <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{profile.managerUserId}</div>
                                <div className="text-xs font-medium text-muted-foreground">Direct Supervisor</div>
                            </div>
                        ) : (
                            <div className="mt-3 text-sm font-medium text-muted-foreground/80 italic">No manager assigned</div>
                        )}
                    </div>
                    <div className="self-end h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm border border-primary/20">
                        <Users className="h-5 w-5" />
                    </div>
                </Card>
            </motion.div>

            {/* 4. Contact (Row 2) */}
            <motion.div variants={item} className="md:col-span-1 lg:col-span-1">
                <Card className={cn(liftCardBase, 'h-full relative overflow-hidden')} data-ui-surface="container">
                    <div className="absolute -top-6 -right-6 p-4 opacity-[0.03]">
                        <Phone className="h-32 w-32 rotate-12" />
                    </div>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                        <Phone className="h-4 w-4" /> Contact
                    </h3>
                    <div className="space-y-4">
                        <div className={contactRowClass}>
                            <Mail className="h-4 w-4 mt-0.5 text-primary" />
                            <div className="text-sm truncate" title={profile.email ?? undefined}>{profile.email ?? 'Email not set'}</div>
                        </div>
                        {profile.phone?.mobile && (
                            <div className={contactRowClass}>
                                <Phone className="h-4 w-4 mt-0.5 text-primary" />
                                <div className="text-sm">{profile.phone.mobile}</div>
                            </div>
                        )}
                        {profile.address?.city && (
                            <div className={contactRowClass}>
                                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                                <div className="text-sm">{profile.address.city}, {profile.address.country}</div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* 5. Tenure / Status (Wide - Row 2) */}
            <motion.div variants={item} className="md:col-span-2 lg:col-span-2">
                <Card className={cn(liftCardBase, 'h-full flex items-center justify-between bg-linear-to-r from-[hsl(var(--card))] to-[hsl(var(--muted)/0.3)]')} data-ui-surface="container">
                    <div>
                        <h3 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                            Current Status
                        </h3>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <span className="capitalize">{profile.employmentStatus.toLowerCase().replace('_', ' ')}</span>
                        </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 ring-2 ring-green-500/20">
                        <Building className="h-6 w-6" />
                    </div>
                </Card>
            </motion.div>

        </motion.div >
    );
}
