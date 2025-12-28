/**
 * ✨ Floating Particles Component
 * 
 * Decorative floating particles for premium UI backgrounds.
 * Server Component - pure CSS animation.
 * 
 * @module components/theme/decorative/particles
 */

import { cn } from '@/lib/utils';
import styles from './particles.module.css';

// ============================================================================
// Types
// ============================================================================

export interface FloatingParticlesProps {
    /** Number of particles to render (max 8 for performance) */
    count?: 4 | 6 | 8;
    /** Additional class for the container */
    className?: string;
}

// ============================================================================
// Particle position configurations
// ============================================================================

const particleConfigs = [
    { left: '10%', top: '20%', size: 'Md', color: 'Primary', delay: '1' },
    { left: '25%', top: '60%', size: 'Sm', color: 'Accent', delay: '2' },
    { left: '45%', top: '30%', size: 'Lg', color: 'Primary', delay: '3' },
    { left: '60%', top: '70%', size: 'Md', color: 'Accent', delay: '4' },
    { left: '75%', top: '25%', size: 'Sm', color: 'Secondary', delay: '1' },
    { left: '85%', top: '55%', size: 'Md', color: 'Primary', delay: '2' },
    { left: '15%', top: '80%', size: 'Lg', color: 'Accent', delay: '3' },
    { left: '90%', top: '40%', size: 'Sm', color: 'Secondary', delay: '4' },
] as const;

// ============================================================================
// Component
// ============================================================================

/**
 * Floating particles overlay for decorative backgrounds.
 * Pure CSS animation - no client JS needed.
 */
export function FloatingParticles({
    count = 6,
    className,
}: FloatingParticlesProps) {
    const particles = particleConfigs.slice(0, count);

    return (
        <div className={cn(styles.particleContainer, className)} aria-hidden="true">
            {particles.map((config, index) => (
                <div
                    key={index}
                    className={cn(
                        styles.particle,
                        styles[`particle${config.size}` as keyof typeof styles],
                        styles[`particle${config.color}` as keyof typeof styles],
                        styles[`delay${config.delay}` as keyof typeof styles],
                        index % 2 === 0 && styles.slow,
                    )}
                    style={{ left: config.left, top: config.top }}
                />
            ))}
        </div>
    );
}
