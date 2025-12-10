# Formance

Cross-platform React Native + Expo app (iOS, Android, Web). Golf-green brand (#1A4D2E) with cream accents (#E9E5D6).

## Quick Reference

```bash
npx expo start --ios      # iOS
npx expo start --android  # Android  
npx expo start --web      # Web (test first - fastest iteration)
```

## Project Structure

```
app/
├── styles/           # Design system tokens (spacing, typography, commonStyles)
├── theme/palette.ts  # Color palette with shades (50-900)
├── components/ui/    # Reusable components (Button, Card, Container, Typography)
└── constants/colors.ts
```

## Design System Imports

```typescript
import { spacing, typography, commonStyles } from '@/styles';
import { palette } from '@/theme/palette';
```

### Spacing (4pt grid)
`xs:4 | sm:8 | md:12 | base:16 | lg:20 | xl:24 | xxl:32 | xxxl:40 | huge:48 | massive:64`

### Typography
`h1 | h2 | h3 | h4 | body | label | caption` - Always use these presets

### Colors
`palette.primary[50-900]` (greens), `palette.secondary[500]` (cream), `palette.text.light.primary/secondary`

---

## Component Creation Rules

**ALWAYS do these when creating components:**

1. **Use design tokens** - NEVER hardcode colors, spacing, or font sizes
   ```typescript
   // ✅ YES
   padding: spacing.base,
   color: palette.primary[900],
   
   // ❌ NO
   padding: 16,
   color: '#1A4D2E',
   ```

2. **StyleSheet at bottom** - All styles in `StyleSheet.create()`, never inline

3. **Support style override prop**
   ```typescript
   export const MyComponent: React.FC<Props> = ({ style, ...props }) => (
     <View style={[styles.container, style]} {...props} />
   );
   ```

4. **Touch targets minimum 44×44pt** (iOS/Web) or 48×48dp (Android)

5. **Body text minimum 16px** - Use `typography.body` or larger

6. **Cross-platform shadows**
   ```typescript
   ...Platform.select({
     ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
     android: { elevation: 3 },
     web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
   })
   ```

7. **Web cursor/hover states**
   ```typescript
   ...Platform.select({
     web: { cursor: 'pointer', userSelect: 'none' },
   })
   ```

8. **Accessibility labels** on all interactive elements

---

## Cross-Platform Requirements

**⚠️ CRITICAL: All features MUST work on iOS, Android, AND Web**

### Never Use (Platform-Specific)
- `Alert.alert()` → Use custom Modal or `react-native-toast-message`
- `ActionSheetIOS` → Use `@expo/react-native-action-sheet`
- `localStorage` → Use `@react-native-async-storage/async-storage`

### Always Test on Web First
Web has the fastest iteration cycle and catches most issues early.

---

## Component Template

```typescript
/**
 * [ComponentName] - Brief description
 */
import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';
import { spacing, typography, commonStyles } from '@/styles';
import { palette } from '@/theme/palette';

interface ComponentNameProps extends ViewProps {
  variant?: 'default' | 'elevated';
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  return (
    <View 
      style={[styles.container, styles[variant], style]} 
      accessibilityRole="button"
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    backgroundColor: palette.background.light,
    borderRadius: 12,
    minHeight: 44, // Touch target
  },
  default: {},
  elevated: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    }),
  },
});
```

---

## UX Principles

- **Minimalism**: Only essential UI - no clutter
- **One action per screen**: Clear visual hierarchy, single primary CTA
- **Immediate feedback**: Loading states for actions >1 second
- **Error recovery**: Always provide retry/back options
- **Platform conventions**: Bottom tabs (3-5 max), standard gestures

---

## Before Creating a Component

1. Check if it exists in `app/components/ui/`
2. Check `commonStyles` for reusable patterns (flexCenter, flexRow, shadow, etc.)
3. Look at similar existing components for patterns
4. Compose styles using spread: `...commonStyles.flexCenter`

---

## Files to Reference

- `app/styles/spacing.ts` - All spacing values
- `app/styles/typography.ts` - Text style presets  
- `app/styles/commonStyles.ts` - 40+ reusable style utilities
- `app/theme/palette.ts` - Full color palette
- `app/components/ui/Button.tsx` - Reference for interactive components
- `app/components/ui/Card.tsx` - Reference for container components