export interface SeederStats {
  employees: number;
  absences: number;
  timeEntries: number;
  training: number;
  reviews: number;
  security: number;
  notifications: number;
  invoices: number;
  policies: number;
  checklistInstances: number;
  leavePolicies: number;
}

export interface ISeederStatsRepository {
  getSeededStats(orgId: string, metadataKey: string): Promise<SeederStats>;
}
