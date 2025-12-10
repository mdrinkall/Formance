# Formance Styling Guide

**A comprehensive guide to styling and component development in Formance**

## Table of Contents
- [Overview](#overview)
- [Design System Structure](#design-system-structure)
- [Creating New Components](#creating-new-components)
- [Adding New Styles](#adding-new-styles)
- [Best Practices](#best-practices)
- [Code Quality Standards](#code-quality-standards)
- [Examples](#examples)

---

## Overview

Formance uses **React Native StyleSheet** with a centralized design system for consistent, scalable styling across iOS, Android, and Web.

### Why StyleSheet over NativeWind/Tailwind?
- ✅ **Cross-platform reliability** - Works perfectly on iOS, Android, AND Web
- ✅ **Type-safe** - Full TypeScript support with autocomplete
- ✅ **Performance** - Optimized for React Native
- ✅ **No dependencies** - No extra libraries needed
- ✅ **Scalable** - Centralized design tokens

---

## Design System Structure

```
app/
├── styles/                    # Design system (DO NOT modify without team discussion)
│   ├── spacing.ts            # Spacing values (4, 8, 16, 24, etc.)
│   ├── typography.ts         # Text styles (h1, h2, body, etc.)
│   ├── commonStyles.ts       # Reusable utilities (flex, alignment, etc.)
│   └── index.ts              # Barrel export
├── theme/                     # Theme configuration
│   ├── palette.ts            # Color palette with shades
│   └── index.ts              # Theme exports
├── constants/
│   └── colors.ts             # Quick color constants
└── components/
    └── ui/                    # Reusable UI components
        ├── Button.tsx
        ├── Card.tsx
        ├── Typography.tsx
        ├── Container.tsx
        └── ...
```

### Core Files

#### `styles/spacing.ts`
Standardized spacing values for margins, padding, and gaps.

```typescript
export const spacing = {
  xs: 4,      // Tiny spacing
  sm: 8,      // Small spacing
  md: 12,     // Medium-small
  base: 16,   // Base unit (MOST COMMON)
  lg: 20,     // Large
  xl: 24,     // Extra large
  xxl: 32,    // 2X large
  xxxl: 40,   // 3X large
  huge: 48,   // Huge
  massive: 64 // Massive
};
```

#### `styles/typography.ts`
Pre-configured text styles for consistent typography.

```typescript
export const typography = {
  h1: { fontSize: 48, fontWeight: '700', ... },
  h2: { fontSize: 36, fontWeight: '700', ... },
  body: { fontSize: 16, fontWeight: '400', ... },
  // ... more presets
};
```

#### `styles/commonStyles.ts`
Reusable style patterns for layouts and common patterns.

```typescript
export const commonStyles = StyleSheet.create({
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexCenter: { justifyContent: 'center', alignItems: 'center' },
  // ... 40+ utility styles
});
```

#### `theme/palette.ts`
Full color palette with shades (50-900) for both light and dark themes.

```typescript
export const palette = {
  primary: {
    50: '#e8f5ed',   // Lightest green
    900: '#1A4D2E',  // Darkest green (brand color)
  },
  secondary: {
    500: '#E9E5D6',  // Cream beige (brand color)
  },
  // ... full palette
};
```

---

## Creating New Components

### Component Template

Every new component should follow this structure:

```typescript
/**
 * [ComponentName] Component
 * [Brief description of what this component does]
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { spacing, typography, palette } from '@/styles';

interface [ComponentName]Props extends ViewProps {
  // Define your props here
  variant?: 'default' | 'elevated';
  children?: React.ReactNode;
}

export const [ComponentName]: React.FC<[ComponentName]Props> = ({
  variant = 'default',
  children,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, styles[variant], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    backgroundColor: palette.background.light,
    borderRadius: 12,
  },
  default: {
    // Default variant styles
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### Component Checklist

When creating a new component:

- [ ] Use TypeScript with proper types
- [ ] Import spacing, typography, and palette from `@/styles`
- [ ] Create StyleSheet at bottom of file
- [ ] Use design tokens (NO hardcoded values)
- [ ] Support `style` prop for extensibility
- [ ] Add JSDoc comment at top
- [ ] Export as named export
- [ ] Make it responsive where needed
- [ ] Support variants if applicable
- [ ] Keep it flat (avoid deep nesting)

---

## Adding New Styles

### ⚠️ IMPORTANT: When to Add to Design System

**DO ADD** to design system (`app/styles/`) when:
- ✅ The style will be used in 3+ places
- ✅ It's a core spacing/typography value
- ✅ It's a common layout pattern
- ✅ It's a brand color or color variant

**DON'T ADD** to design system when:
- ❌ It's component-specific styling
- ❌ It's a one-off custom value
- ❌ It's temporary/experimental

### How to Add New Spacing

```typescript
// app/styles/spacing.ts

export const spacing = {
  // ... existing values

  // Add your new value with a descriptive name
  newSize: 52, // Add comment explaining use case
};
```

### How to Add New Typography Style

```typescript
// app/styles/typography.ts

export const typography: Record<string, TextStyle> = {
  // ... existing styles

  // Add new text style preset
  myNewStyle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * lineHeight.normal,
    color: palette.text.light.primary,
  },
};
```

### How to Add New Common Style

```typescript
// app/styles/commonStyles.ts

export const commonStyles = StyleSheet.create({
  // ... existing styles

  // Add new reusable pattern
  myNewPattern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
});
```

### How to Add New Color

```typescript
// theme/palette.ts

export const palette = {
  // ... existing colors

  // Add new color with shades
  tertiary: {
    50: '#...',
    100: '#...',
    // ... through 900
  },
};
```

---

## Best Practices

### 1. Always Use Design Tokens

**❌ BAD:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: 16,           // Hardcoded
    fontSize: 18,          // Hardcoded
    color: '#1A4D2E',      // Hardcoded
  },
});
```

**✅ GOOD:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: spacing.base,           // From design system
    fontSize: typography.fontSize.lg, // From design system
    color: palette.primary[900],     // From design system
  },
});
```

### 2. Use Reusable Components

**❌ BAD:**
```typescript
<View style={styles.container}>
  <Text style={styles.title}>Welcome</Text>
  <Text style={styles.body}>Description text</Text>
</View>
```

**✅ GOOD:**
```typescript
import { Container } from '@/components/ui/Container';
import { Heading1, Body } from '@/components/ui/Typography';

<Container>
  <Heading1>Welcome</Heading1>
  <Body>Description text</Body>
</Container>
```

### 3. Compose Styles, Don't Duplicate

**❌ BAD:**
```typescript
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});
```

**✅ GOOD:**
```typescript
import { commonStyles } from '@/styles';

const styles = StyleSheet.create({
  header: {
    ...commonStyles.flexCenter,
    padding: spacing.base,
  },
  footer: {
    ...commonStyles.flexCenter,
    padding: spacing.lg,
  },
});
```

### 4. Keep Styles Flat and Organized

**❌ BAD:**
```typescript
// Styles scattered throughout component
<View style={{ flex: 1, padding: 16 }}>
  <Text style={{ fontSize: 24, color: '#000' }}>Title</Text>
</View>
```

**✅ GOOD:**
```typescript
// All styles defined in StyleSheet at bottom
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.base,
  },
  title: {
    ...typography.h2,
  },
});
```

### 5. Use Proper Naming Conventions

- **Components:** PascalCase (`MyComponent.tsx`)
- **Files:** camelCase or PascalCase (`myHelper.ts` or `MyHelper.ts`)
- **Style keys:** camelCase (`primaryButton`, `headerContainer`)
- **Constants:** camelCase or SCREAMING_SNAKE_CASE

### 6. Support Extensibility

Always allow style overrides via props:

```typescript
export const MyComponent: React.FC<Props> = ({ style, ...props }) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {/* content */}
    </View>
  );
};
```

---

## Code Quality Standards

### TypeScript Requirements

1. **Always use TypeScript** - No `.js` or `.jsx` files
2. **Define proper interfaces** for all props
3. **Extend base props** when possible (`ViewProps`, `TextProps`, etc.)
4. **No `any` types** - Use proper typing

### Code Organization

1. **One component per file**
2. **StyleSheet at bottom of file**
3. **Group related styles together**
4. **Comment complex styles**
5. **Export as named exports**

### Performance

1. **Use `StyleSheet.create`** - Never inline styles in render
2. **Memoize expensive calculations** with `useMemo`
3. **Avoid deep nesting** - Keep component trees flat
4. **Use `React.memo`** for pure components

### Accessibility

1. **Add accessibility labels** (`accessibilityLabel`, `accessibilityHint`)
2. **Support different text sizes** (use relative units where possible)
3. **Ensure proper color contrast** (use palette colors)
4. **Test on multiple screen sizes**

### Responsiveness

```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: width * 0.05, // 5% of screen width
  },
});
```

---

## Examples

### Example 1: Simple Component

```typescript
/**
 * Badge Component
 * Small label for status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { spacing, typography, palette } from '@/styles';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  style,
  ...props
}) => {
  return (
    <View style={[styles.badge, styles[variant], style]} {...props}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    color: palette.accent.white,
  },
  success: {
    backgroundColor: palette.success,
  },
  warning: {
    backgroundColor: palette.warning,
  },
  error: {
    backgroundColor: palette.error,
  },
  info: {
    backgroundColor: palette.info,
  },
});
```

### Example 2: Screen Layout

```typescript
/**
 * ExampleScreen
 * Shows how to structure a typical screen
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Container, Section } from '@/components/ui/Container';
import { Heading1, Body } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, palette } from '@/styles';

export default function ExampleScreen() {
  return (
    <Container>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <Section>
          <Heading1>Screen Title</Heading1>
          <Body>Screen description goes here.</Body>
        </Section>

        {/* Content Section */}
        <Section>
          <Card variant="elevated">
            <Body>Card content</Body>
          </Card>
        </Section>

        {/* Action Section */}
        <Section>
          <Button
            title="Primary Action"
            variant="primary"
            size="lg"
            onPress={() => {}}
            fullWidth
          />
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
```

### Example 3: Complex Component with Variants

```typescript
/**
 * StatCard Component
 * Displays a statistic with label and value
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { spacing, typography, palette, commonStyles } from '@/styles';

type StatCardSize = 'small' | 'medium' | 'large';

interface StatCardProps extends ViewProps {
  label: string;
  value: string | number;
  size?: StatCardSize;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  size = 'medium',
  trend = 'neutral',
  style,
  ...props
}) => {
  return (
    <View style={[styles.card, styles[`${size}Card`], style]} {...props}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, styles[`${size}Value`]]}>
        {value}
      </Text>
      {trend !== 'neutral' && (
        <Text style={[styles.trend, styles[`trend${trend}`]]}>
          {trend === 'up' ? '↑' : '↓'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.background.light,
    borderRadius: 12,
    ...commonStyles.shadow,
  },
  label: {
    ...typography.label,
    color: palette.text.light.secondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h3,
    color: palette.text.light.primary,
  },
  trend: {
    ...typography.caption,
    marginTop: spacing.xs,
  },

  // Size variants
  smallCard: {
    padding: spacing.sm,
  },
  mediumCard: {
    padding: spacing.base,
  },
  largeCard: {
    padding: spacing.lg,
  },

  smallValue: {
    fontSize: typography.fontSize.xl,
  },
  mediumValue: {
    fontSize: typography.fontSize['3xl'],
  },
  largeValue: {
    fontSize: typography.fontSize['4xl'],
  },

  // Trend variants
  trendup: {
    color: palette.success,
  },
  trenddown: {
    color: palette.error,
  },
});
```

---

## Quick Reference

### Import Paths

```typescript
// Design system
import { spacing, typography, commonStyles, palette } from '@/styles';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container, Section } from '@/components/ui/Container';
import { Heading1, Heading2, Body } from '@/components/ui/Typography';

// Theme
import { palette } from '@/theme/palette';
import { colors } from '@/constants/colors';
```

### Common Patterns

```typescript
// Flex layouts
<View style={commonStyles.flexRow}>
<View style={commonStyles.flexCenter}>
<View style={commonStyles.flexBetween}>

// Spacing
marginBottom: spacing.base
padding: spacing.lg
gap: spacing.md

// Typography
style={typography.h1}
style={typography.body}
style={typography.caption}

// Colors
backgroundColor: palette.primary[900]
color: palette.text.light.primary
borderColor: palette.border.light
```

---

## Getting Help

- **Styling issues?** Check `app/styles/README.md`
- **Color reference?** See `theme/palette.ts`
- **Component examples?** Look at existing UI components in `app/components/ui/`
- **Questions?** Ask the team before creating new design tokens

---

## Maintenance

### Before Adding to Design System

1. Check if it already exists
2. Discuss with team if it's needed globally
3. Follow naming conventions
4. Add comments explaining use case
5. Update this documentation

### Code Review Checklist

- [ ] Uses design tokens (no hardcoded values)
- [ ] Follows TypeScript best practices
- [ ] Has proper component structure
- [ ] StyleSheet is at bottom of file
- [ ] Supports style prop override
- [ ] Has JSDoc comment
- [ ] Is properly typed
- [ ] Is accessible
- [ ] Is responsive

---

**Last Updated:** December 2024
**Maintained by:** Formance Team

---

## Remember

> **"Consistency is key. Use the design system. Build for scale. Write quality code."**

When in doubt, look at existing components and follow the same patterns. Every component should be built with the mindset that it will be used across the entire application for years to come.
