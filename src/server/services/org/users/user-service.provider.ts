import { UserService, type UserServiceDependencies } from './user-service';
import { buildUserServiceDependencies, type UserServiceDependencyOptions } from '@/server/repositories/providers/org/user-service-dependencies';

type ProviderPrismaOptions = UserServiceDependencyOptions['prismaOptions'];

export interface UserServiceProviderOptions {
    prismaOptions?: ProviderPrismaOptions;
}

export class UserServiceProvider {
    private readonly prismaOptions?: ProviderPrismaOptions;
    private readonly defaultDependencies: UserServiceDependencies;
    private readonly sharedService: UserService;

    constructor(options?: UserServiceProviderOptions) {
        this.prismaOptions = options?.prismaOptions;
        this.defaultDependencies = this.createDependencies(this.prismaOptions);
        this.sharedService = new UserService(this.defaultDependencies);
    }

    getService(overrides?: Partial<UserServiceDependencies>): UserService {
        if (!overrides || Object.keys(overrides).length === 0) {
            return this.sharedService;
        }

        const deps = this.createDependencies(this.prismaOptions, overrides);

        return new UserService(deps);
    }

    private createDependencies(
        prismaOptions?: ProviderPrismaOptions,
        overrides?: Partial<UserServiceDependencies>,
    ): UserServiceDependencies {
        const dependencies = buildUserServiceDependencies({
            prismaOptions: prismaOptions,
            overrides: overrides,
        });

        return {
            userRepository: dependencies.userRepository,
        };
    }
}

const defaultUserServiceProvider = new UserServiceProvider();

export function getUserService(
    overrides?: Partial<UserServiceDependencies>,
    options?: UserServiceDependencyOptions,
): UserService {
    const provider = options ? new UserServiceProvider({ prismaOptions: options.prismaOptions }) : defaultUserServiceProvider;
    return provider.getService(overrides);
}

export type UserServiceContract = Pick<
    UserService,
    'listUsersInOrganization' | 'listUsersInOrganizationPaged' | 'countUsersInOrganization'
>;
