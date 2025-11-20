import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const prismaDirectory = path.resolve(process.cwd(), "prisma");
const baseSchemaPath = path.join(prismaDirectory, "base.prisma");
const modulesDirectory = path.join(prismaDirectory, "modules");
const outputPath = path.join(prismaDirectory, "schema.prisma");

const moduleFiles = readdirSync(modulesDirectory)
    .filter((file) => file.endsWith(".prisma"))
    .sort();

const parts = [
    "/// AUTO-GENERATED. Edit prisma/base.prisma or prisma/modules/*.prisma",
    readFileSync(baseSchemaPath, "utf8").trim(),
    ...moduleFiles.map((file) => {
        const fullPath = path.join(modulesDirectory, file);
        return readFileSync(fullPath, "utf8").trim();
    }),
];

const composed = parts.filter(Boolean).join("\n\n") + "\n";

writeFileSync(outputPath, composed, "utf8");
