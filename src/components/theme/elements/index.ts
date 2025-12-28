/**
 * 🎨 Theme Elements
 * 
 * Barrel export for all premium UI elements.
 * 
 * @module components/theme/elements
 */

// Avatar
export {
    PremiumAvatar,
    AvatarGroup,
    type PremiumAvatarProps,
    type AvatarGroupProps,
} from './avatar';

// Stats
export {
    StatCard,
    InlineStat,
    ProgressStat,
    type StatCardProps,
    type InlineStatProps,
    type ProgressStatProps,
} from './stats';

// Accordion
export {
    PremiumAccordion,
    PremiumAccordionItem,
    type PremiumAccordionProps,
    type PremiumAccordionItemProps,
} from './accordion';

// Charts
export {
    SimpleBarChart,
    SimpleDonutChart,
    Sparkline,
    type BarChartItem,
    type SimpleBarChartProps,
    type DonutChartProps,
    type SparklineProps,
} from './charts';

// Modals
export {
    PremiumModal,
    ConfirmModal,
    type PremiumModalProps,
    type ConfirmModalProps,
} from './modals';

// Cards
export {
    FeatureCard,
    InfoCard,
    ActionCard,
    type FeatureCardProps,
    type InfoCardProps,
    type ActionCardProps,
} from './cards';

// Data Display
export {
    DataList,
    KeyValueGrid,
    Timeline,
    EmptyState,
    type DataListProps,
    type DataListItem,
    type KeyValueGridProps,
    type TimelineItem,
    type TimelineProps,
    type EmptyStateProps,
} from './data-display';
