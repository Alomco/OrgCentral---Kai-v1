import {
    buildAuthOrganizationBridgeServiceDependencies,
    type AuthOrganizationBridgeServiceOptions,
} from '@/server/repositories/providers/auth/auth-organization-bridge-service-dependencies';
import { AuthOrganizationBridgeService } from './auth-organization-bridge-service';

export interface AuthOrganizationBridgeServiceProviderOptions {
    prismaOptions?: AuthOrganizationBridgeServiceOptions['prismaOptions'];
}

export function getAuthOrganizationBridgeService(
    options?: AuthOrganizationBridgeServiceProviderOptions,
): AuthOrganizationBridgeService {
    const dependencies = buildAuthOrganizationBridgeServiceDependencies(options);

    return new AuthOrganizationBridgeService(dependencies);
}