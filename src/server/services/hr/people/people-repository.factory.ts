import { buildPeopleServiceDependencies } from '@/server/repositories/providers/hr/people-service-dependencies';

export function createEmployeeProfileRepository() {
    const { profileRepo } = buildPeopleServiceDependencies();
    return profileRepo;
}

export function createEmploymentContractRepository() {
    const { contractRepo } = buildPeopleServiceDependencies();
    return contractRepo;
}
