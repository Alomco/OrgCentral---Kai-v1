---
description: Run the UI/UX Pro Max workflow with design-system generation and stack-aware implementation guidance.
tools:
  - codebase
  - search
  - editFiles
  - runCommands
---

# /ui-ux-pro-max

## Request
$ARGUMENTS

## Goal

Generate and apply an evidence-based design system before implementing UI changes.

## Procedure

1. Identify product type, user context, and preferred stack.
2. Run required design-system generation first.
3. Supplement with targeted domain searches (ux/style/typography/chart).
4. Apply stack guidance (default `html-tailwind` if unspecified).
5. Implement and report before/after rationale.

## Required Command

```bash
python .github/.shared/ui-ux-pro-max/scripts/search.py "<query>" --design-system
```

## Optional Commands

```bash
python .github/.shared/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
python .github/.shared/ui-ux-pro-max/scripts/search.py "<query>" --stack html-tailwind
```

## Output

```markdown
## UI/UX Pro Max Report
- Product type:
- Stack:
- Design system summary:

## Applied Changes
1. ...
2. ...

## Accessibility and Motion Notes
- ...

## Validation
- responsive checks:
- contrast/accessibility checks:
```
