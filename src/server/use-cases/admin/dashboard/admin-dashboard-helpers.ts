import { PrismaEnhancedSecurityEventRepository } from '@/server/repositories/prisma/security/prisma-enhanced-security-event-repository';
import { PrismaSecurityMetricsRepository } from '@/server/repositories/prisma/security/prisma-security-metrics-repository';
import { SecurityMetricsService } from '@/server/services/security/security-metrics-service';

export function resolveSecurityMetricsService(): SecurityMetricsService {
    return new SecurityMetricsService({
        securityMetricsRepository: new PrismaSecurityMetricsRepository(),
    });
}

export function resolveSecurityEventRepository(): PrismaEnhancedSecurityEventRepository {
    return new PrismaEnhancedSecurityEventRepository();
}

export function resolveDateRange(daysBack: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date(end.getTime());
    start.setDate(start.getDate() - daysBack);
    return { start, end };
}
