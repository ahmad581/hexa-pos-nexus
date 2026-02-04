
# Theme Unification Plan

## Problem Analysis

The codebase currently uses **two conflicting styling approaches**:

1. **CSS Variables (shadcn/ui standard)** - Defined in `src/index.css` using HSL values
   - Used in: `Dashboard.tsx`, UI components
   - Example: `bg-background`, `text-foreground`, `bg-card`

2. **Hardcoded Tailwind classes** - Direct gray/green color values
   - Used in: `Layout.tsx`, `Sidebar.tsx`, `Header.tsx`, `Login.tsx`, `CallCenter.tsx`, `Employees.tsx`, and 47+ other files
   - Example: `bg-gray-900`, `bg-gray-800`, `text-gray-400`, `bg-green-600`

## Solution Strategy

Unify to **CSS Variables** (Option 1) because:
- It's the shadcn/ui standard and already partially implemented
- Enables future theme switching (light/dark mode)
- Single source of truth for colors
- Better maintainability

## Technical Approach

### Step 1: Update CSS Variables to Match Current Dark Theme

Update `src/index.css` dark theme values to exactly match the current hardcoded colors:

| Current Hardcoded | CSS Variable | HSL Value |
|-------------------|--------------|-----------|
| `bg-gray-900` (#111827) | `--background` | `220 26% 8%` |
| `bg-gray-800` (#1F2937) | `--card`, `--secondary` | `220 20% 17%` |
| `bg-gray-700` (#374151) | `--muted` | `220 14% 27%` |
| `border-gray-700` | `--border` | `220 14% 27%` |
| `text-white` | `--foreground`, `--card-foreground` | `0 0% 100%` |
| `text-gray-300` (#D1D5DB) | `--muted-foreground` | `216 13% 84%` |
| `text-gray-400` (#9CA3AF) | (new) `--muted-foreground-dim` | `218 11% 65%` |
| `bg-green-600` (#16A34A) | `--primary` | `142 76% 36%` |
| `bg-green-700` (#15803D) | (hover state) | `142 71% 29%` |

### Step 2: Add Custom Utility Classes (Optional Enhancement)

Add semantic color aliases in the CSS for clarity:
```css
/* In src/index.css */
.dark {
  --success: 142 76% 36%;        /* green-600 equivalent */
  --success-foreground: 0 0% 100%;
}
```

### Step 3: Update Component Files

Replace hardcoded classes with CSS variable-based classes in the following files:

**Core Layout Components (Priority 1)**
- `src/components/Layout.tsx`
- `src/components/Sidebar.tsx`  
- `src/components/Header.tsx`
- `src/components/StatCard.tsx`

**Pages (Priority 2)**
- `src/pages/Login.tsx`
- `src/pages/CallCenter.tsx`
- `src/pages/Employees.tsx`
- `src/pages/Tables.tsx`
- `src/pages/SystemMasterDashboard.tsx`
- All business-specific pages (45+ files)

**Replacement Mapping:**

| Hardcoded Class | Unified Class |
|-----------------|---------------|
| `bg-gray-900` | `bg-background` |
| `bg-gray-800` | `bg-card` |
| `bg-gray-700` | `bg-muted` |
| `border-gray-700` | `border-border` |
| `border-gray-600` | `border-input` |
| `text-white` | `text-foreground` |
| `text-gray-300` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground/70` or custom variable |
| `bg-green-600` | `bg-primary` |
| `bg-green-700` | `hover:bg-primary/90` |
| `text-green-400` | `text-primary` |
| `hover:bg-gray-800` | `hover:bg-accent` |

### Step 4: Handle Special Cases

**Status Colors** (keep as-is for semantic meaning):
- `bg-green-500/20 text-green-400` - Success/Available states
- `bg-red-500/20 text-red-400` - Error/Destructive states  
- `bg-yellow-500/20 text-yellow-400` - Warning states
- `bg-blue-500/20 text-blue-400` - Info states

These semantic status colors should remain hardcoded as they represent specific states, not theme colors.

**Purple accent** (SystemMaster):
- Keep `bg-purple-600` for SystemMaster-specific elements as a role indicator

---

## Files to Modify

### CSS Variables (1 file)
- `src/index.css` - Update dark theme HSL values

### Core Components (4 files)
- `src/components/Layout.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Header.tsx`
- `src/components/StatCard.tsx`

### Pages (10+ files - highest impact)
- `src/pages/Login.tsx`
- `src/pages/CallCenter.tsx`
- `src/pages/Employees.tsx`
- `src/pages/Tables.tsx`
- `src/pages/SystemMasterDashboard.tsx`
- `src/pages/hotel/Rooms.tsx`
- `src/pages/hotel/Services.tsx`
- And remaining business-specific pages

### Call Center Components (5 files)
- `src/components/call-center/TransferDialog.tsx`
- `src/components/call-center/CallCenterSessionCard.tsx`
- `src/components/call-center/CallCenterStats.tsx`
- `src/components/call-center/CallHistoryTable.tsx`
- `src/components/call-center/CallQueueCard.tsx`

### Inventory Components (4 files)
- `src/components/inventory/InventoryReports.tsx`
- `src/components/inventory/InventoryItemDialog.tsx`
- `src/components/inventory/CreateWarehouseDialog.tsx`
- `src/components/inventory/CreateCategoryDialog.tsx`

### Other Components (10+ files)
- Various dialog and card components

---

## Implementation Order

1. **Update `src/index.css`** - Define correct HSL values for dark theme
2. **Update core layout** - `Layout.tsx`, `Sidebar.tsx`, `Header.tsx`
3. **Update authentication** - `Login.tsx`
4. **Update main pages** - Dashboard-adjacent pages
5. **Update business pages** - All industry-specific pages
6. **Update dialog/card components** - Remaining UI components

---

## Expected Outcome

- All 47+ files will use consistent CSS variable-based styling
- The visual appearance will remain exactly the same
- Future theme changes require only updating `src/index.css`
- Code is more maintainable and follows shadcn/ui conventions
