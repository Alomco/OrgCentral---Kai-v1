#!/usr/bin/env python3
"""
Bundle Analyzer
Finds built JavaScript assets and reports largest bundles.

Usage:
    python bundle_analyzer.py <project_path>
"""

import gzip
import json
import sys
from pathlib import Path
from typing import Dict, List


def size_kb(size_bytes: int) -> float:
    return round(size_bytes / 1024, 2)


def find_bundle_dirs(project: Path) -> List[Path]:
    candidates = [
        project / ".next" / "static" / "chunks",
        project / "dist" / "assets",
        project / "build" / "static" / "js",
    ]
    return [path for path in candidates if path.exists() and path.is_dir()]


def analyze_file(path: Path) -> Dict:
    raw = path.read_bytes()
    gzipped = gzip.compress(raw, compresslevel=9)
    return {
        "file": str(path),
        "raw_kb": size_kb(len(raw)),
        "gzip_kb": size_kb(len(gzipped)),
    }


def main() -> int:
    project = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if not project.exists():
        print(json.dumps({"error": f"Project path does not exist: {project}"}))
        return 1

    warn_kb = 250.0
    fail_kb = 500.0

    bundle_dirs = find_bundle_dirs(project)
    if not bundle_dirs:
        print(
            json.dumps(
                {
                    "script": "bundle_analyzer",
                    "project": str(project),
                    "bundle_dirs": [],
                    "bundles_found": 0,
                    "passed": True,
                    "message": "No build output found (.next/dist/build). Run a production build first.",
                },
                indent=2,
            )
        )
        return 0

    files: List[Path] = []
    for directory in bundle_dirs:
        files.extend(directory.rglob("*.js"))
        files.extend(directory.rglob("*.mjs"))

    analyzed = [analyze_file(path) for path in files]
    analyzed.sort(key=lambda item: item["raw_kb"], reverse=True)

    warnings = [item for item in analyzed if warn_kb <= item["raw_kb"] < fail_kb]
    failures = [item for item in analyzed if item["raw_kb"] >= fail_kb]
    passed = len(failures) == 0

    output = {
        "script": "bundle_analyzer",
        "project": str(project),
        "bundle_dirs": [str(path) for path in bundle_dirs],
        "bundles_found": len(analyzed),
        "thresholds_kb": {"warn": warn_kb, "fail": fail_kb},
        "largest_bundles": analyzed[:10],
        "warnings": warnings[:20],
        "failures": failures[:20],
        "passed": passed,
    }

    print(json.dumps(output, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
