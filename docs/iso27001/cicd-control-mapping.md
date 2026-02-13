# ISO 27001 CI/CD Control Mapping

## Pipeline checks mapped to Annex A controls
| CI/CD check | Purpose | ISO control reference | Evidence |
| --- | --- | --- | --- |
| Type check (npx tsc --noEmit) | Prevent type-level defects | A.8.28 Secure coding | CI logs |
| Lint (pnpm lint --fix) | Enforce secure and consistent code | A.8.28 Secure coding | CI logs |
| Dependency audit (pnpm audit) | Detect known vulnerabilities | A.8.8 Technical vulnerabilities | Audit report |
| SAST scan | Identify code vulnerabilities | A.8.8 Technical vulnerabilities | SAST report |
| SBOM generation | Track components and versions | A.5.23 Information security in ICT supply chains | SBOM artifact |
| TLS config scan (release) | Verify crypto standards | A.8.24 Use of cryptography | Scan report |

## Evidence retention
- Store pipeline artifacts and reports for 12 months minimum.
