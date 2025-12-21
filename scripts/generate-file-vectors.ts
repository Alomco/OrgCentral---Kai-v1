import { mkdirSync, writeFileSync } from 'node:fs';
import { stdout } from 'node:process';
import path from 'node:path';
import { hrAbsenceVectorJson } from '../src/tools/file-connectivity/maps/hr-absences';
import { hrLeaveVectorJson } from '../src/tools/file-connectivity/maps/hr-leave';
import { hrTimeTrackingVectorJson } from '../src/tools/file-connectivity/maps/hr-time-tracking';

const OUTPUT_DIR = path.resolve(process.cwd(), 'var/cache/file-connectivity');
const OUTPUTS = [
    { filename: 'hr-absences.vectors.json', payload: hrAbsenceVectorJson },
    { filename: 'hr-leave.vectors.json', payload: hrLeaveVectorJson },
    { filename: 'hr-time-tracking.vectors.json', payload: hrTimeTrackingVectorJson },
];

mkdirSync(OUTPUT_DIR, { recursive: true });

OUTPUTS.forEach(({ filename, payload }) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    writeFileSync(filePath, payload, 'utf8');
    stdout.write(`File connectivity vectors written to ${filePath}\n`);
});
