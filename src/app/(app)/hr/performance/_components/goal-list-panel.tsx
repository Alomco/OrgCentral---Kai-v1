'use client';

import { useState } from 'react';
import { Target, Plus, Check, CheckCircle, Circle, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Goal {
    id: string;
    title: string;
    description?: string;
    progress: number;
    dueDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    category: string;
}

interface GoalListPanelProps {
    goals: Goal[];
    onGoalClick?: (goalId: string) => void;
    onAddGoal?: () => void;
}

function getStatusDetails(status: Goal['status']): {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof Circle;
} {
    switch (status) {
        case 'completed':
            return { label: 'Completed', variant: 'default', icon: CheckCircle };
        case 'in_progress':
            return { label: 'In Progress', variant: 'secondary', icon: Circle };
        case 'overdue':
            return { label: 'Overdue', variant: 'destructive', icon: Circle };
        case 'not_started':
        default:
            return { label: 'Not Started', variant: 'outline', icon: Circle };
    }
}

function formatDueDate(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);

    if (days < 0) {return 'Overdue';}
    if (days === 0) {return 'Due today';}
    if (days === 1) {return 'Due tomorrow';}
    if (days <= 7) {return `${String(days)} days left`;}
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GoalListPanel({ goals, onGoalClick, onAddGoal }: GoalListPanelProps) {
    const hasGoals = goals.length > 0;
    const completedCount = goals.filter((g) => g.status === 'completed').length;
    const overallProgress =
        goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Goals
                    </CardTitle>
                    <CardDescription>
                        {completedCount} of {goals.length} goals completed • {overallProgress}% overall
                    </CardDescription>
                </div>
                <Button size="sm" onClick={onAddGoal}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall Progress Bar */}
                {hasGoals ? (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Overall Progress</span>
                            <span>{overallProgress}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                    </div>
                ) : null}

                {/* Goals List */}
                {hasGoals ? (
                    <div className="space-y-3">
                        {goals.map((goal) => {
                            const statusDetails = getStatusDetails(goal.status);
                            const StatusIcon = statusDetails.icon;

                            return (
                                <button
                                    key={goal.id}
                                    type="button"
                                    onClick={() => onGoalClick?.(goal.id)}
                                    className="w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            <StatusIcon
                                                className={`h-5 w-5 mt-0.5 shrink-0 ${goal.status === 'completed'
                                                        ? 'text-emerald-500'
                                                        : goal.status === 'overdue'
                                                            ? 'text-red-500'
                                                            : 'text-muted-foreground'
                                                    }`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm">{goal.title}</p>
                                                {goal.description ? (
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {goal.description}
                                                    </p>
                                                ) : null}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs font-normal"
                                                    >
                                                        {goal.category}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDueDate(goal.dueDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 w-16">
                                            <div className="text-xs text-muted-foreground text-right mb-1">
                                                {goal.progress}%
                                            </div>
                                            <Progress value={goal.progress} className="h-1.5" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium">No Goals Set</p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Set goals to track your progress and achievements
                        </p>
                        <Button size="sm" onClick={onAddGoal}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Your First Goal
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
