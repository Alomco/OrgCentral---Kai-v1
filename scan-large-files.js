import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_THRESHOLD = 250;
const TS_EXTENSION = '.ts';
const TSX_EXTENSION = '.tsx';
const ROOT_DIRECTORY = 'E:/Web Development/studio/orgcentral/src';

function scanLargeFiles(rootDirectory, extension, threshold = DEFAULT_THRESHOLD) {
    const largeFiles = [];
    const directoryStack = [rootDirectory];

    while (directoryStack.length > 0) {
        const currentDirectory = directoryStack.pop();
        if (!currentDirectory) {
            continue;
        }

        const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDirectory, entry.name);

            if (entry.isDirectory()) {
                directoryStack.push(fullPath);
                continue;
            }

            if (path.extname(fullPath) !== extension) {
                continue;
            }

            const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/u).length;
            if (lines > threshold) {
                largeFiles.push({ path: fullPath, lines });
            }
        }
    }

    return largeFiles.sort((left, right) => right.lines - left.lines);
}

function renderLargeFiles(files, heading) {
    if (files.length === 0) {
        process.stdout.write(`${heading}: none\n`);
        return;
    }

    process.stdout.write(`${heading}:\n`);
    for (const file of files) {
        process.stdout.write(`${file.path}: ${file.lines} lines\n`);
    }
}

const largeTsFiles = scanLargeFiles(ROOT_DIRECTORY, TS_EXTENSION, DEFAULT_THRESHOLD);
const largeTsxFiles = scanLargeFiles(ROOT_DIRECTORY, TSX_EXTENSION, DEFAULT_THRESHOLD);

renderLargeFiles(largeTsFiles, 'Files with more than 250 lines (.ts)');
process.stdout.write('\n');
renderLargeFiles(largeTsxFiles, 'Files with more than 250 lines (.tsx)');