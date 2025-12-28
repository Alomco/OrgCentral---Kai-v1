/**
 * 🎨 Theme Layout Components
 * 
 * Barrel export for all premium layout primitives.
 * 
 * @module components/theme/layout
 */

// Containers & Page Structure
export {
    PageContainer,
    PageHeader,
    Section,
    ContentGrid,
    type PageContainerProps,
    type PageHeaderProps,
    type SectionProps,
    type ContentGridProps,
} from './containers';

// Topbar
export {
    Topbar,
    TopbarSearch,
    TopbarAction,
    type TopbarProps,
    type TopbarSearchProps,
    type TopbarActionProps,
} from './topbar';

// Footer
export {
    Footer,
    MinimalFooter,
    type FooterProps,
    type FooterLink,
    type MinimalFooterProps,
} from './footer';

// Breadcrumb
export {
    BreadcrumbNav,
    PageBreadcrumb,
    type BreadcrumbNavProps,
    type BreadcrumbSegment,
    type PageBreadcrumbProps,
} from './breadcrumb-nav';

// Sidebar Navigation
export {
    SidebarNavItem,
    SidebarNavSection,
    SidebarNavDivider,
    type NavItemProps,
    type NavSectionProps,
} from './sidebar-nav';

// Toaster
export { PremiumToaster, toast } from './premium-toaster';
