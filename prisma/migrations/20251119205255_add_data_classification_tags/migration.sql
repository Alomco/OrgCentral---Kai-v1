-- AlterTable
ALTER TABLE "hr.hr_settings" ADD COLUMN     "dataClassification" "DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "residencyTag" "DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY';

-- AlterTable
ALTER TABLE "hr.notifications" ADD COLUMN     "dataClassification" "DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "residencyTag" "DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY';

-- AlterTable
ALTER TABLE "hr.policies" ADD COLUMN     "dataClassification" "DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "residencyTag" "DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY';

-- AlterTable
ALTER TABLE "hr.time_entries" ADD COLUMN     "dataClassification" "DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "residencyTag" "DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY';

-- AlterTable
ALTER TABLE "hr.unplanned_absences" ADD COLUMN     "dataClassification" "DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN     "residencyTag" "DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY';
