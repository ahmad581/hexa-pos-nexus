# Theme System Documentation

This project uses a unified CSS variable-based theming system following shadcn/ui conventions. All colors are defined in HSL format in `src/index.css`.

## Color Variables

### Core Colors (Dark Theme)

| Variable | HSL Value | Hex Equivalent | Usage |
|----------|-----------|----------------|-------|
| `--background` | `222 47% 7%` | #111827 | Main app background |
| `--foreground` | `0 0% 100%` | #FFFFFF | Primary text color |
| `--card` | `217 33% 17%` | #1F2937 | Card backgrounds, elevated surfaces |
| `--card-foreground` | `0 0% 100%` | #FFFFFF | Text on cards |
| `--popover` | `217 33% 17%` | #1F2937 | Dropdowns, dialogs, popovers |
| `--popover-foreground` | `0 0% 100%` | #FFFFFF | Text in popovers |
| `--primary` | `142 76% 36%` | #16A34A | Primary actions, buttons, links |
| `--primary-foreground` | `0 0% 100%` | #FFFFFF | Text on primary elements |
| `--secondary` | `218 17% 27%` | #374151 | Secondary backgrounds |
| `--secondary-foreground` | `0 0% 100%` | #FFFFFF | Text on secondary elements |
| `--muted` | `218 17% 27%` | #374151 | Muted backgrounds, disabled states |
| `--muted-foreground` | `218 11% 75%` | #B0B8C4 | Muted/secondary text |
| `--accent` | `217 33% 17%` | #1F2937 | Hover states, accents |
| `--accent-foreground` | `0 0% 100%` | #FFFFFF | Text on accent elements |
| `--destructive` | `0 62.8% 30.6%` | #7F1D1D | Destructive actions |
| `--destructive-foreground` | `210 40% 98%` | #F8FAFC | Text on destructive elements |
| `--border` | `218 17% 27%` | #374151 | Borders |
| `--input` | `218 17% 27%` | #374151 | Input backgrounds |
| `--ring` | `142 76% 36%` | #16A34A | Focus rings |

### Sidebar Colors

| Variable | Usage |
|----------|-------|
| `--sidebar-background` | Sidebar background |
| `--sidebar-foreground` | Sidebar text |
| `--sidebar-primary` | Active/selected items |
| `--sidebar-accent` | Hover states |
| `--sidebar-border` | Sidebar borders |

## Usage Guidelines

### ✅ DO: Use Semantic Tokens

```tsx
// Backgrounds
<div className="bg-background">       // Main background
<div className="bg-card">             // Cards, elevated surfaces
<div className="bg-muted">            // Muted/secondary backgrounds
<div className="bg-primary">          // Primary actions

// Text
<p className="text-foreground">       // Primary text
<p className="text-muted-foreground"> // Secondary/muted text
<p className="text-primary">          // Accent text

// Borders
<div className="border-border">       // Standard borders
<input className="border-input">      // Input borders

// Interactive
<button className="bg-primary hover:bg-primary/90">
<div className="hover:bg-accent">
```

### ❌ DON'T: Use Hardcoded Colors

```tsx
// Avoid these:
<div className="bg-gray-900">         // Use bg-background
<div className="bg-gray-800">         // Use bg-card
<div className="bg-gray-700">         // Use bg-muted
<p className="text-white">            // Use text-foreground
<p className="text-gray-400">         // Use text-muted-foreground
<button className="bg-green-600">     // Use bg-primary
<div className="border-gray-700">     // Use border-border
```

## Semantic Status Colors (Exception)

These colors represent specific states and should remain hardcoded:

```tsx
// Success states
<span className="bg-green-500/20 text-green-400">Available</span>

// Error states
<span className="bg-red-500/20 text-red-400">Error</span>

// Warning states
<span className="bg-yellow-500/20 text-yellow-400">Pending</span>

// Info states
<span className="bg-blue-500/20 text-blue-400">Info</span>
```

## Component Examples

### Card
```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content here
  </CardContent>
</Card>
```

### Dialog
```tsx
<DialogContent className="bg-card border-border text-foreground">
  <DialogHeader>
    <DialogTitle>Dialog Title</DialogTitle>
  </DialogHeader>
  {/* Content */}
</DialogContent>
```

### Form Input
```tsx
<Input className="bg-muted border-border text-foreground" />
<Select>
  <SelectTrigger className="bg-muted border-border">
    <SelectValue />
  </SelectTrigger>
  <SelectContent className="bg-card border-border">
    <SelectItem>Option</SelectItem>
  </SelectContent>
</Select>
```

### Table
```tsx
<Table>
  <TableHeader className="bg-muted">
    <TableRow className="border-border">
      <TableHead className="text-muted-foreground">Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-border hover:bg-muted/50">
      <TableCell className="text-foreground">Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Light Theme

The light theme variables are also defined in `src/index.css` under `:root`. The system automatically applies the correct theme based on the `dark` class on the root element.

## Adding New Colors

1. Define the HSL value in `src/index.css` under both `:root` and `.dark`
2. Add the Tailwind mapping in `tailwind.config.ts`
3. Use the semantic token in components

```css
/* src/index.css */
:root {
  --custom-color: 200 50% 50%;
}
.dark {
  --custom-color: 200 60% 40%;
}
```

```ts
// tailwind.config.ts
colors: {
  custom: 'hsl(var(--custom-color))',
}
```
