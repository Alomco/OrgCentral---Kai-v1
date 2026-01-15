# A11y Quick Reference Card

## Quick Scan Command
```bash
pnpm dev          # Terminal 1
pnpm a11y:scan    # Terminal 2
```

---

## Priority Fix Order
1. 🔴 **CRITICAL** → Fix immediately (blockers)
2. 🎨 **COLOR CONTRAST** → WCAG compliance
3. 🖼️ **ALT-TEXT** → Image accessibility  
4. 🟠 **SERIOUS** → Major usability issues
5. 🟡 **MODERATE** → Next sprint
6. 🟢 **MINOR** → As time permits

---

## Common Fixes

### 🎨 Color Contrast
**Rule**: 4.5:1 for normal text, 3:1 for large text

```tsx
❌ <p className="text-gray-400">Text</p>
✅ <p className="text-gray-700">Text</p>

❌ <button className="bg-blue-300 text-blue-100">Click</button>
✅ <button className="bg-blue-600 text-white">Click</button>
```

**Tool**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

### 🖼️ Image Alt Text
**Rule**: All `<img>` must have `alt` attribute

```tsx
// Informative images
❌ <img src="/logo.png" />
✅ <img src="/logo.png" alt="OrgCentral logo" />

// Decorative images (empty alt)
❌ <img src="/divider.svg" />
✅ <img src="/divider.svg" alt="" />

// Complex images
✅ <img src="/chart.png" alt="Sales growth chart showing 25% increase in Q4" />

// Avatar with text nearby
✅ <img src="/user.jpg" alt="" />  {/* Name shown in adjacent text */}
```

---

### 🏷️ Form Labels
**Rule**: Every form field needs a label

```tsx
// Explicit label (preferred)
❌ <input type="text" placeholder="Name" />
✅ <label htmlFor="name">Name</label>
   <input type="text" id="name" name="name" />

// Implicit label
✅ <label>
     Name
     <input type="text" name="name" />
   </label>

// Hidden label (if design requires)
✅ <label htmlFor="search" className="sr-only">Search</label>
   <input type="search" id="search" placeholder="Search..." />
```

---

### 🔘 Button Names
**Rule**: Buttons must have accessible names

```tsx
// Icon-only buttons
❌ <button><TrashIcon /></button>
✅ <button aria-label="Delete item"><TrashIcon /></button>

// Better: Icon + visible text
✅ <button>
     <TrashIcon />
     <span>Delete</span>
   </button>

// Link as button
❌ <a href="#"><TrashIcon /></a>
✅ <button onClick={handler} aria-label="Delete">
     <TrashIcon />
   </button>
```

---

### 🔗 Link Text
**Rule**: Links must have descriptive text

```tsx
❌ <a href="/docs">Click here</a>
❌ <a href="/docs">Read more</a>
✅ <a href="/docs">Read the documentation</a>

// Icon links
❌ <a href="/settings"><SettingsIcon /></a>
✅ <a href="/settings" aria-label="Settings">
     <SettingsIcon />
   </a>
```

---

### 📋 ARIA Attributes

```tsx
// Required ARIA
❌ <div role="button">Click</div>
✅ <button>Click</button>  {/* Use semantic HTML first */}

// Valid ARIA
❌ <button aria-label="">Click</button>  {/* Empty */}
✅ <button aria-label="Close dialog">Click</button>

// aria-required
✅ <input 
     type="text" 
     required 
     aria-required="true"
   />

// aria-invalid
✅ <input 
     type="email" 
     aria-invalid={hasError}
     aria-describedby="email-error"
   />
   {hasError && <span id="email-error">Invalid email</span>}
```

---

### 📊 Heading Hierarchy
**Rule**: Don't skip heading levels

```tsx
❌ <h1>Page Title</h1>
   <h3>Section</h3>  {/* Skipped h2 */}

✅ <h1>Page Title</h1>
   <h2>Main Section</h2>
   <h3>Subsection</h3>
```

---

### ⌨️ Keyboard Navigation

```tsx
// Interactive non-button elements
❌ <div onClick={handler}>Click me</div>
✅ <button onClick={handler}>Click me</button>

// Custom interactive element
✅ <div 
     role="button"
     tabIndex={0}
     onClick={handler}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         handler();
       }
     }}
   >
     Click me
   </div>

// Skip to content
✅ <a href="#main-content" className="sr-only focus:not-sr-only">
     Skip to main content
   </a>
   <main id="main-content">...</main>
```

---

### 🎯 Focus Management

```tsx
// Visible focus indicator
✅ button {
     @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
   }

// Focus trap in modals
import { Dialog } from '@radix-ui/react-dialog';

✅ <Dialog>
     <DialogContent>
       {/* Focus automatically trapped */}
     </DialogContent>
   </Dialog>

// Restore focus after action
✅ const buttonRef = useRef<HTMLButtonElement>(null);
   
   function handleClose() {
     setOpen(false);
     buttonRef.current?.focus();  // Restore focus
   }
```

---

## Screen Reader Only Content

```tsx
// Tailwind utility
<span className="sr-only">Hidden from visual users</span>

// CSS (add to globals.css if needed)
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## Testing Checklist

### Before Commit
- [ ] Run `pnpm a11y:scan`
- [ ] Fix all CRITICAL issues
- [ ] Address color contrast failures
- [ ] Add missing alt text

### Manual Tests
- [ ] Tab through page (keyboard only)
- [ ] Check focus indicators visible
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Zoom to 200% (text should reflow)
- [ ] Use keyboard shortcuts (no mouse)

### Screen Reader Commands

**NVDA (Windows)**
- Start: `Ctrl + Alt + N`
- Stop: `Insert + Q`
- Read line: `Insert + Up`
- Next heading: `H`
- Next link: `K`
- Next form field: `F`

**VoiceOver (Mac)**
- Start: `Cmd + F5`
- Stop: `Cmd + F5`
- Read item: `Ctrl + Option + A`
- Next heading: `Ctrl + Option + Cmd + H`
- Next link: `Ctrl + Option + Cmd + L`

---

## WCAG Quick Reference

| Level | Requirement | Rule |
|-------|------------|------|
| A | Color contrast (minimum) | 3:1 for large text |
| AA | Color contrast | 4.5:1 normal, 3:1 large |
| AAA | Color contrast (enhanced) | 7:1 normal, 4.5:1 large |
| AA | Images of text | Avoid when possible |
| AA | Resize text | Up to 200% without loss |
| AA | Focus visible | Clear focus indicators |

---

## Radix UI Components (Already Accessible)

Most Radix components are accessible by default:
- ✅ `Dialog` - Focus trap, ESC to close, ARIA
- ✅ `Dropdown` - Keyboard navigation, ARIA
- ✅ `Select` - Keyboard navigation, labels
- ✅ `Tabs` - Arrow key navigation, ARIA
- ✅ `Tooltip` - Hover + focus, ARIA
- ✅ `AlertDialog` - Focus management, ARIA

**But still check**:
- Color contrast on custom styles
- Alt text on images within
- Form labels if you add forms

---

## Resources

📖 [Full Guide](./a11y-scanning-guide.md)  
📋 [Implementation Summary](./a11y-implementation-summary.md)  
🔍 [WCAG Quick Ref](https://www.w3.org/WAI/WCAG21/quickref/)  
🎨 [Contrast Checker](https://webaim.org/resources/contrastchecker/)  
🛠️ [axe DevTools](https://www.deque.com/axe/devtools/)

---

**Last Updated**: 2026-01-15
