import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export function CyberGridPattern({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern
                    id="cyber-grid"
                    width="10"
                    height="10"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M 10 0 L 0 0 0 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.1"
                        strokeOpacity="0.2"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cyber-grid)" />
            <motion.rect
                width="100%"
                height="100%"
                fill="url(#cyber-grid)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                style={{ mixBlendMode: 'overlay' }}
            />
        </svg>
    );
}

export function MeshGradientPattern({ className }: { className?: string }) {
    return (
        <div className={cn('absolute inset-0 overflow-hidden', className)}>
            <motion.div
                className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-40 blur-3xl"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary)) 0%, transparent 50%)',
                }}
                animate={{
                    transform: [
                        'translate(0%, 0%) scale(1)',
                        'translate(10%, 10%) scale(1.2)',
                        'translate(-5%, 5%) scale(0.9)',
                        'translate(0%, 0%) scale(1)',
                    ],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute top-0 right-0 w-[150%] h-[150%] opacity-30 blur-3xl"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, hsl(var(--accent)) 0%, transparent 60%)',
                }}
                animate={{
                    transform: [
                        'translate(0%, 0%) rotate(0deg)',
                        'translate(-10%, -10%) rotate(45deg)',
                        'translate(0%, 0%) rotate(0deg)',
                    ],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}
