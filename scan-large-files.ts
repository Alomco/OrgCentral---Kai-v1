import fs from 'node:fs';
import path from 'node:path';

interface LargeFile {
    filePath: string;
    lineCount: number;
}

function scanLargeFiles(
    directory: string,
    extension = '.ts',
    threshold = 250,
): LargeFile[] {
    const largeFiles: LargeFile[] = [];

    const scanDirectory = (currentDirectory: string): void => {
        const items = fs.readdirSync(currentDirectory);

        for (const item of items) {
            const fullPath = path.join(currentDirectory, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanDirectory(fullPath);
                continue;
            }

            if (path.extname(fullPath) !== extension) {
                continue;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            const lineCount = content.split(/\r\n|\r|\n/).length;

            if (lineCount > threshold) {
                largeFiles.push({ filePath: fullPath, lineCount });
            }
        }
    };

    scanDirectory(directory);
    return largeFiles.sort((left, right) => right.lineCount - left.lineCount);
}

function writeLine(value: string): void {
    process.stdout.write(`${value}\n`);
}

const projectSourcePath = 'E:/Web Development/studio/orgcentral/src';

const largeTypeScriptFiles = scanLargeFiles(projectSourcePath, '.ts', 250);
writeLine('Files with more than 250 lines:');
for (const file of largeTypeScriptFiles) {
    writeLine(`${file.filePath}: ${String(file.lineCount)} lines`);
}

const largeTypeScriptReactFiles = scanLargeFiles(projectSourcePath, '.tsx', 250);
writeLine('\nTSX Files with more than 250 lines:');
for (const file of largeTypeScriptReactFiles) {
    writeLine(`${file.filePath}: ${String(file.lineCount)} lines`);
}
