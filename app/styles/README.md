# Design System

This directory contains the core design system for Formance, providing reusable style utilities and constants.

## Structure

- **spacing.ts** - Standardized spacing values
- **typography.ts** - Text style presets and font configurations
- **commonStyles.ts** - Reusable style patterns and utilities
- **index.ts** - Barrel export for easy imports

## Usage

### Import Everything

```typescript
import { spacing, typography, commonStyles, palette } from '@/styles';
```

### Or Import Individually

```typescript
import { spacing } from '@/styles/spacing';
import { typography } from '@/styles/typography';
import { commonStyles } from '@/styles/commonStyles';
```

## Examples

### Using Spacing

```typescript
import { spacing } from '@/styles';

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,      // 16px
    marginBottom: spacing.xl,    // 24px
  },
});
```

### Using Typography

```typescript
import { typography } from '@/styles';

const styles = StyleSheet.create({
  heading: typography.h1,
  body: typography.body,
  // Can also combine with custom styles
  customHeading: {
    ...typography.h2,
    color: '#custom-color',
  },
});
```

### Using Common Styles

```typescript
import { commonStyles } from '@/styles';

// Use directly in components
<View style={[commonStyles.flexRow, commonStyles.alignCenter]}>
  <Text style={typography.body}>Content</Text>
</View>

// Or combine with custom styles
const styles = StyleSheet.create({
  header: {
    ...commonStyles.flexBetween,
    paddingHorizontal: spacing.base,
  },
});
```

### Using UI Components

Instead of writing styles manually, use the pre-built components:

```typescript
import { Container, Section } from '@/components/ui/Container';
import { Heading1, Body } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// In your component
<Container>
  <Section>
    <Heading1>Welcome</Heading1>
    <Body>This is a body text.</Body>
  </Section>

  <Card variant="elevated">
    <Body>Card content</Body>
  </Card>

  <Button
    title="Get Started"
    variant="primary"
    size="lg"
    onPress={handlePress}
  />
</Container>
```

## Color System

Colors are defined in:
- `theme/palette.ts` - Full color palette with shades
- `constants/colors.ts` - Quick access color constants

```typescript
import { palette } from '@/styles';

const styles = StyleSheet.create({
  primary: {
    backgroundColor: palette.primary[900],  // Dark green
  },
  secondary: {
    backgroundColor: palette.secondary[500], // Cream beige
  },
});
```

## Best Practices

1. **Use design tokens** - Always use spacing, typography, and color constants instead of hardcoded values
2. **Compose styles** - Combine reusable styles with custom ones using array syntax
3. **Use UI components** - Prefer `<Heading1>` over `<Text style={typography.h1}>`
4. **Keep it flat** - Avoid deep nesting, use the provided utilities
5. **Extend, don't override** - Use `...typography.body` to extend base styles

## Adding New Styles

When adding new reusable styles:

1. **Spacing** - Add to `spacing.ts` if it's a common spacing value
2. **Text styles** - Add to `typography.ts` for text presets
3. **Common patterns** - Add to `commonStyles.ts` for layout utilities
4. **Component-specific** - Keep in the component file if it's unique to that component
