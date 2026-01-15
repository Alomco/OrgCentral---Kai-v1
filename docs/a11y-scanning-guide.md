# Accessibility Scanning Guide

## Overview
Automated accessibility testing using axe-core to verify WCAG 2.1 AA compliance with focus on:
- **Color Contrast**: Ensures text has sufficient contrast ratios (4.5:1 for normal text, 3:1 for large)
- **Alt Text Coverage**: Verifies all images have appropriate alternative text
- **ARIA Compliance**: Checks proper use of ARIA attributes
- **Semantic HTML**: Validates proper use of semantic elements

## Prerequisites
- Next.js development server must be running on `localhost:3000`
- Chromium browser (auto-installed via Playwright)

## Usage

### Step 1: Start Development Server
```bash
# Terminal 1
pnpm dev
```

Wait for the server to fully start (watch for "Ready on http://localhost:3000")

### Step 2: Run Accessibility Scan
```bash
# Terminal 2
pnpm a11y:scan
```

## What Gets Scanned
The scanner tests the following routes by default:
- `/` (Home page)
- `/login`
- `/dashboard`
- `/hr`
- `/hr/employees`
- `/settings`

To scan additional routes, edit `scripts/a11y-scan-simple.ts` and add URLs to the `ROUTES_TO_SCAN` array.

## Output

### Console Report
The scanner provides a comprehensive console report with:

1. **Executive Summary**
   - Total violations and affected elements
   - Breakdown by severity (Critical, Serious, Moderate, Minor)
   - Breakdown by category (Color Contrast, Alt Text, Other)

2. **Priority 1: Critical Issues**
   - Issues that prevent users from accessing content
   - Must be fixed immediately
   - Examples with element selectors and HTML snippets

3. **Priority 2: Color Contrast Issues**
   - Elements failing WCAG contrast requirements
   - Current contrast ratios shown
   - Grouped by page URL

4. **Priority 3: Image Alt-Text Issues**
   - Images missing alt attributes
   - Complete list of affected images
   - Grouped by page URL

5. **Priority 4: Other Serious Issues**
   - ARIA attribute problems
   - Form label issues
   - Heading hierarchy problems
   - Link and button naming issues

6. **Quick Wins**
   - Top 5 issues ranked by number of affected elements
   - Focus here for maximum impact

7. **Action Plan**
   - Immediate priorities (this sprint)
   - Short-term goals (next sprint)
   - Long-term recommendations
   - Technical best practices

### JSON Report
Detailed results are saved to `var/a11y-scan-results.json` including:
- Full violation details for each page
- Element selectors and HTML
- Severity and impact information
- Links to WCAG documentation
- Timestamp and scan metadata

## Understanding Severity Levels

### 🔴 Critical
- **Impact**: Prevents users from accessing content
- **Action**: Fix immediately (blocker for release)
- **Examples**: Missing form labels, inaccessible interactive elements

### 🟠 Serious
- **Impact**: Significantly impacts usability for assistive technology users
- **Action**: Fix in current sprint
- **Examples**: Insufficient color contrast, missing ARIA attributes

### 🟡 Moderate
- **Impact**: Noticeable difficulty for some users
- **Action**: Fix in next sprint
- **Examples**: Heading hierarchy issues, minor ARIA problems

### 🟢 Minor
- **Impact**: Small inconvenience
- **Action**: Fix as time permits
- **Examples**: Enhancement opportunities, best practice violations

## Common Fixes

### Color Contrast
```tsx
// ❌ Bad: Insufficient contrast
<p className="text-gray-400">Important text</p>

// ✅ Good: WCAG AA compliant
<p className="text-gray-700">Important text</p>
```

### Image Alt Text
```tsx
// ❌ Bad: Missing alt attribute
<img src="/logo.png" />

// ✅ Good: Descriptive alt text
<img src="/logo.png" alt="OrgCentral - Employee Management System" />

// ✅ Good: Decorative image (empty alt)
<img src="/decoration.svg" alt="" />
```

### Form Labels
```tsx
// ❌ Bad: No label association
<input type="text" />

// ✅ Good: Explicit label
<label htmlFor="email">Email</label>
<input type="text" id="email" name="email" />

// ✅ Good: Implicit label
<label>
  Email
  <input type="text" name="email" />
</label>
```

### ARIA Attributes
```tsx
// ❌ Bad: Button without accessible name
<button><IconTrash /></button>

// ✅ Good: Accessible name provided
<button aria-label="Delete item"><IconTrash /></button>

// ✅ Better: Visual text + icon
<button>
  <IconTrash />
  <span>Delete</span>
</button>
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm start & # Start production server
      - run: sleep 10 # Wait for server
      - run: pnpm a11y:scan
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report
          path: var/a11y-scan-results.json
```

### Pre-commit Hook
```bash
#!/bin/sh
# .husky/pre-commit

# Run quick a11y check on changed components
pnpm a11y:scan || {
  echo "⚠️  Accessibility issues detected"
  echo "Run 'pnpm a11y:scan' to see details"
  exit 1
}
```

## Customization

### Scan Different Routes
Edit `scripts/a11y-scan-simple.ts`:
```typescript
const ROUTES_TO_SCAN = [
  'http://localhost:3000',
  'http://localhost:3000/your-route',
  'http://localhost:3000/another-route',
];
```

### Configure axe-core Rules
Modify the `rules` section in `scanPage()` function:
```typescript
rules: {
  'color-contrast': { enabled: true },
  'image-alt': { enabled: true },
  'label': { enabled: true },
  // Add or disable rules as needed
}
```

### Change WCAG Level
Update the `runOnly` configuration:
```typescript
runOnly: {
  type: 'tag',
  values: ['wcag2aaa'], // For AAA compliance
}
```

## Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Troubleshooting

### Server Not Running
```
❌ ERROR: Dev server is not running on localhost:3000
```
**Solution**: Start dev server first: `pnpm dev`

### Routes Return 404
**Solution**: Ensure routes exist in your app or remove them from `ROUTES_TO_SCAN`

### Timeout Errors
**Solution**: Increase timeout in `scanPage()` function:
```typescript
await page.goto(url, { 
  waitUntil: 'networkidle', 
  timeout: 60000 // Increase to 60 seconds
});
```

### Browser Installation Issues
**Solution**: Manually install browsers:
```bash
npx playwright install chromium
```

## Next Steps
1. Run initial scan: `pnpm a11y:scan`
2. Review console report and identify priorities
3. Fix Critical and Serious issues first
4. Re-run scan to verify fixes
5. Integrate into CI/CD pipeline
6. Schedule regular scans (weekly/monthly)
7. Train team on accessibility best practices
