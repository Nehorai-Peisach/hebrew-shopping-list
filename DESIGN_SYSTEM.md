# Modern Design System - Color & Style Guide

## Primary Color Palette

### Primary - Indigo
- Main: `#6366f1`
- Shade (darker): `#4f46e5`
- Tint (lighter): `#818cf8`
- Use: Primary actions, headers, active states

### Secondary - Green
- Main: `#10b981`
- Shade: `#059669`
- Tint: `#34d399`
- Use: Success states, secondary actions

### Tertiary - Amber
- Main: `#f59e0b`
- Shade: `#d97706`
- Tint: `#fbbf24`
- Use: Warnings, highlights, special items

### Additional Colors
- **Success**: Green (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Danger**: Red (`#ef4444`)
- **Light**: Slate (`#f8fafc`)
- **Medium**: Slate (`#64748b`)
- **Dark**: Slate (`#1e293b`)

---

## Typography System

### Font Sizes
```
--font-size-xs:   12px
--font-size-sm:   14px
--font-size-base: 16px
--font-size-lg:   18px
--font-size-xl:   20px
--font-size-2xl:  24px
--font-size-3xl:  32px
```

### Font Family
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
'Helvetica Neue', 'Noto Sans Hebrew', 'Arial', 'David', sans-serif
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Shadow System

### Shadow Depths
```
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
--shadow-md:  0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
--shadow-xl:  0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.25)
```

**Usage:**
- `shadow-sm`: Subtle elements, borders
- `shadow-md`: Regular cards, inputs
- `shadow-lg`: Elevated cards, hovered states
- `shadow-xl`: Modal-like elements, important cards
- `shadow-2xl`: Full-screen overlays, modals

---

## Spacing Scale

```
--space-xs:  4px   (micro spacing)
--space-sm:  8px   (small gaps)
--space-md:  12px  (regular padding)
--space-lg:  16px  (standard spacing)
--space-xl:  24px  (section spacing)
--space-2xl: 32px  (large gaps)
```

**Usage Pattern:**
- Use consistent spacing for visual rhythm
- Combine spaces for larger gaps (e.g., `space-lg + space-md`)
- Mobile: Use tighter spacing
- Desktop: Can increase spacing for breathing room

---

## Border Radius

```
--ion-border-radius:      12px  (general elements)
--ion-card-border-radius: 16px  (cards)
--ion-button-border-radius: 8px  (buttons, inputs)
```

---

## Transitions & Animations

### Timing Functions
```
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Animation Names
- `fadeIn`: Opacity transition (0 → 1)
- `slideInRight`: Slide from left with fade
- `bounce`: Y-axis bounce effect
- `slideInTop`: Slide from top

### Apply Transitions
```scss
// Smooth hover effect
transition: all var(--transition-base);

// Quick feedback
transition: all var(--transition-fast);

// Smooth appearance
animation: fadeIn var(--transition-base);
```

---

## Component Styling Guidelines

### Cards
- `border-radius`: 16px
- `box-shadow`: `var(--shadow-md)`
- `padding`: `var(--space-lg)`
- Hover effect: Lift with `var(--shadow-lg)` and `translateY(-4px)`

### Buttons
- `border-radius`: 8px
- `height`: 44px (minimum touch target)
- `font-weight`: 600
- Gradient primary: `linear-gradient(135deg, #6366f1, #4f46e5)`
- Hover: Lift and increase shadow

### Inputs
- `border-radius`: 8px
- `background`: `var(--ion-color-light)`
- Focus: Add glow `box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1)`
- Padding: `var(--space-md)`

### Empty States
- Icon size: 80px
- Icon opacity: 0.2
- Title size: `font-size-2xl`
- Padding: `var(--space-2xl)`
- Animation: `fadeIn`

---

## Dark Mode Implementation

### System Detection
```scss
@media (prefers-color-scheme: dark) {
  :root {
    --ion-background-color: #0f172a;
    --ion-text-color: #f1f5f9;
    --ion-border-color: #334155;
  }
}
```

---

## RTL Support (Hebrew)

All directional properties are automatically handled:
- `left` ↔ `right`
- `start` ↔ `end`
- Text direction: `direction: rtl`

### Key RTL Classes
- `html[dir='rtl']`: Applied to all RTL contexts
- Flexbox with `direction: rtl` works automatically
- Icon flipping: `transform: scaleX(-1)` for back buttons

---

## Responsive Breakpoints

```scss
// Mobile First
// Small phones
@media (max-width: 576px) {
  // Tighter spacing, larger touch targets
}

// Tablets & larger
@media (min-width: 577px) {
  // More spacious layouts, multi-column grids
}

// Desktop
@media (min-width: 993px) {
  // Full width optimization, 3-column layouts
}
```

---

## Usage Examples

### Modern Card
```scss
ion-card {
  border-radius: var(--ion-card-border-radius);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}
```

### Modern Button
```scss
ion-button {
  border-radius: var(--ion-button-border-radius);
  font-weight: 600;
  height: 44px;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}
```

### Smooth Transition
```scss
.element {
  transition: all var(--transition-base);
  
  &:hover {
    color: var(--ion-color-primary);
    opacity: 0.9;
  }
}
```

---

## Best Practices

✅ **DO:**
- Use CSS custom properties for consistency
- Apply transitions for smooth interactions
- Use semantic color meanings (danger=red, success=green)
- Maintain minimum 44px touch targets
- Test dark mode compatibility
- Keep animations under 300ms for performance
- Use box-shadow for depth instead of borders

❌ **DON'T:**
- Mix different shadow systems
- Use arbitrary colors without CSS vars
- Create instantaneous state changes
- Forget RTL support
- Ignore dark mode styling
- Use animations longer than 500ms
- Forget accessibility (color contrast, focus states)

---

## Testing Checklist

- [ ] All colors have sufficient contrast (AA or AAA)
- [ ] Dark mode is visually balanced
- [ ] RTL layout is correct
- [ ] Animations are smooth on mobile
- [ ] Touch targets are at least 44x44px
- [ ] Focus states are visible
- [ ] Responsive design works at all breakpoints
- [ ] Transitions don't cause performance issues
- [ ] Fonts are readable at all sizes
- [ ] Empty states are helpful and beautiful
