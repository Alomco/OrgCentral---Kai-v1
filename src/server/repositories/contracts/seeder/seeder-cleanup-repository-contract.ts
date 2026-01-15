export interface ISeederCleanupRepository {
  clearSeededData(orgId: string, metadataKey: string): Promise<void>;
}
