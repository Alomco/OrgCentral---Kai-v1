/**
 * 🎨 Class-Based UI System
 * 
 * Barrel export for the object-oriented UI component system.
 * 
 * @module classes/ui
 */

// Design Tokens
export {
    // Token Types
    type DesignTokens,
    type InteractiveTokens,
    type LayoutTokens,

    // Token Objects
    cardTokens,
    popoverTokens,
    buttonTokens,
    interactiveTokens,
    layoutTokens,

    // Helper Functions
    getCardStyles,
    getPopoverStyles,
    getInteractiveCardStyles,
    getButtonStyles,
} from './design-tokens';

// Base Classes
export {
    BaseUIComponent,
    BaseCardComponent,
    BaseInteractiveCard,
    BaseStatWidget,
    BasePanelComponent,
} from './BaseUIComponent';

// Concrete Components
export { StatsCard, createStatsCard } from './components/StatsCard';
