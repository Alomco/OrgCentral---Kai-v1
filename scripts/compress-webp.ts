 
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

type Source = string;

async function main() {
    const input = process.argv[2];
    const quality = Number(process.argv[3] ?? 82);

    if (!input) {
        console.error('Usage: pnpm tsx scripts/compress-webp.ts <file-or-dir> [quality=82]');
        process.exit(1);
    }

    const stats = fs.statSync(input);
    if (stats.isDirectory()) {
        const entries = fs.readdirSync(input);
        for (const entry of entries) {
            const full = path.join(input, entry);
            if (isImage(full)) {
                await convert(full, quality);
            }
        }
    } else {
        await convert(input, quality);
    }
}

async function convert(source: Source, quality: number) {
    const { dir, name } = path.parse(source);
    const target = path.join(dir, `${name}.webp`);
    await sharp(source)
        .webp({ quality, effort: 4 })
        .toFile(target);
    console.log(
        `Compressed ${path.basename(source)} -> ${path.basename(target)} (q=${String(quality)})`,
    );
}

function isImage(file: string): boolean {
    return /\.(png|jpe?g|webp)$/i.test(file);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
});
