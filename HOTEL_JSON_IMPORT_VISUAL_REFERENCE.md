# Hotel JSON Import - Visual Reference Guide

## 🎨 UI Overview

### Main Hotel Management Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Hotel Management                                               │
│  Manage hotels and room types                                   │
│                                                                 │
│  [Filter: All Hotels ▼]  [Import JSON]  [+ Add Hotel]         │
└─────────────────────────────────────────────────────────────────┘
```

**Button Location**: Top-right area, between Filter dropdown and Add Hotel button

**Button Style**:
- Outline variant (white background, border)
- Upload icon (📤) on the left
- Text: "Import JSON"

---

## 📱 JSON Import Modal

### Modal Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Import Hotels from JSON                                   [X] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Enter JSON data to import multiple hotels at once...         │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Example Format:                                         │  │
│  │ [                                                       │  │
│  │   {                                                     │  │
│  │     "State": "Maharashtra",                            │  │
│  │     "City": "Mumbai",                                  │  │
│  │     "Hotel Name": "Hilton Mumbai..."                   │  │
│  │   }                                                     │  │
│  │ ]                                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Required fields: State, City, Hotel Name                     │
│  Optional fields: description, address, pincode...            │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ JSON Data                                               │  │
│  │ ┌───────────────────────────────────────────────────┐   │  │
│  │ │ [{"State": "Maharashtra", "City": "Mumbai"...    │   │  │
│  │ │                                                   │   │  │
│  │ │ (Large textarea - 300px height)                  │   │  │
│  │ │                                                   │   │  │
│  │ └───────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│                                   [Cancel]  [📤 Import Hotels] │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Import Flow Visualization

### Step-by-Step Process

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Click "Import    │
│ JSON" Button     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Modal Opens      │
│ - Example shown  │
│ - Empty textarea │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ User Pastes      │
│ JSON Data        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Click "Import    │
│ Hotels" Button   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Loading State    │
│ - Spinner shown  │
│ - Button text:   │
│   "Importing..."│
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│   Validation             │
│ ┌────────┴─────────┐     │
│ │                  │     │
▼ ▼                  ▼     ▼
┌────┐              ┌────┐
│Pass│              │Fail│
└──┬─┘              └──┬─┘
   │                   │
   ▼                   ▼
┌────────────┐    ┌──────────────┐
│ Import     │    │ Show Error   │
│ Hotels     │    │ Message      │
└──┬─────────┘    └──────────────┘
   │
   ▼
┌──────────────────┐
│ Success Toast    │
│ "Successfully    │
│ imported X       │
│ hotel(s)"        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Modal Closes     │
│ Hotels Appear in │
│ List             │
└──────┬───────────┘
       │
       ▼
┌─────────────┐
│    End      │
└─────────────┘
```

---

## 🎯 Button States

### Import JSON Button

**Normal State**:
```
┌──────────────────┐
│ 📤 Import JSON   │
└──────────────────┘
```
- Outline border
- Hover: slight background color change
- Cursor: pointer

**Disabled State** (not applicable - always enabled for admin):
```
┌──────────────────┐
│ 📤 Import JSON   │
└──────────────────┘
```

### Import Hotels Button (in modal)

**Normal State**:
```
┌───────────────────────┐
│ 📤 Import Hotels      │
└───────────────────────┘
```
- Orange background (#FF6B35)
- White text
- Hover: darker orange

**Loading State**:
```
┌───────────────────────┐
│ ⏳ Importing...       │
└───────────────────────┘
```
- Spinner animation on left
- Button disabled
- Cannot close modal

**Disabled State**:
```
┌───────────────────────┐
│ 📤 Import Hotels      │  (grayed out)
└───────────────────────┘
```

---

## 📊 Notification Examples

### Success Notification

```
┌──────────────────────────────────────┐
│ ✅ Import Complete                   │
│                                      │
│ Successfully imported 5 hotel(s).    │
│                                      │
│                              [Dismiss]│
└──────────────────────────────────────┘
```
- Green checkmark icon
- Appears top-right
- Auto-dismisses after 5 seconds

### Partial Success

```
┌──────────────────────────────────────┐
│ ✅ Import Complete                   │
│                                      │
│ Successfully imported 4 hotel(s).    │
│ Failed to import 1 hotel(s).         │
│                                      │
│                              [Dismiss]│
└──────────────────────────────────────┘
```

### Error Notification

```
┌──────────────────────────────────────┐
│ ❌ Validation Errors                 │
│                                      │
│ 3 error(s) found. Check console     │
│ for details.                         │
│                                      │
│                              [Dismiss]│
└──────────────────────────────────────┘
```
- Red alert icon
- Appears top-right
- Stays until manually dismissed

### Invalid JSON Error

```
┌──────────────────────────────────────┐
│ ❌ Invalid JSON                      │
│                                      │
│ Unexpected token } in JSON at       │
│ position 45                          │
│                                      │
│                              [Dismiss]│
└──────────────────────────────────────┘
```

---

## 🖥️ Screen Layouts

### Desktop View (1920px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Navbar                                                              │
├──────────────────────────────────────────────────────────────────────┤
│  Admin Sidebar  │  Hotel Management                                  │
│                 │  ┌─────────────────────────────────────────────┐  │
│  Dashboard      │  │ [Filter▼] [Import JSON] [+ Add Hotel]      │  │
│  Bookings       │  └─────────────────────────────────────────────┘  │
│  Visa           │                                                    │
│  Hotels    <──  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  Analytics      │  │ Hotel  │ │ Hotel  │ │ Hotel  │ │ Hotel  │   │
│                 │  │ Card 1 │ │ Card 2 │ │ Card 3 │ │ Card 4 │   │
│                 │  └────────┘ └────────┘ └────────┘ └────────┘   │
│                 │                                                    │
│                 │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│                 │  │ Hotel  │ │ Hotel  │ │ Hotel  │ │ Hotel  │   │
│                 │  │ Card 5 │ │ Card 6 │ │ Card 7 │ │ Card 8 │   │
│                 │  └────────┘ └────────┘ └────────┘ └────────┘   │
└─────────────────┴──────────────────────────────────────────────────┘
```

### Tablet View (768px)

```
┌────────────────────────────────────────┐
│  Navbar                    [☰]         │
├────────────────────────────────────────┤
│  Hotel Management                      │
│  ┌──────────────────────────────────┐  │
│  │ [Filter▼]                        │  │
│  │ [Import JSON] [+ Add Hotel]      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ Hotel  │ │ Hotel  │ │ Hotel  │    │
│  │ Card 1 │ │ Card 2 │ │ Card 3 │    │
│  └────────┘ └────────┘ └────────┘    │
└────────────────────────────────────────┘
```

### Mobile View (375px)

```
┌────────────────────┐
│  Navbar      [☰]   │
├────────────────────┤
│  Hotel Management  │
│  ┌──────────────┐  │
│  │ [Filter ▼]   │  │
│  │ [Import JSON]│  │
│  │ [+ Add]      │  │
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │   Hotel      │  │
│  │   Card 1     │  │
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │   Hotel      │  │
│  │   Card 2     │  │
│  └──────────────┘  │
└────────────────────┘
```

---

## 🎨 Color Scheme

### Primary Colors

| Element | Color | Hex Code |
|---------|-------|----------|
| Import Button Border | Gray | #E5E7EB |
| Import Button Hover | Light Gray | #F3F4F6 |
| Import Hotels Button | Orange | #FF6B35 |
| Import Hotels Hover | Dark Orange | #E55A2B |
| Success Toast | Green | #10B981 |
| Error Toast | Red | #EF4444 |

### Text Colors

| Element | Color | Hex Code |
|---------|-------|----------|
| Modal Title | Dark Gray | #111827 |
| Description Text | Medium Gray | #6B7280 |
| Example Code | Dark | #1F2937 |
| Required Fields | Medium Gray | #6B7280 |

---

## 📐 Spacing & Dimensions

### Modal
- **Width**: 768px (max-w-3xl)
- **Max Height**: 90vh
- **Padding**: 24px
- **Border Radius**: 8px

### Textarea
- **Min Height**: 300px
- **Font**: Monospace
- **Font Size**: 14px (text-sm)
- **Padding**: 12px

### Buttons
- **Height**: 40px
- **Padding**: 8px 16px
- **Border Radius**: 6px
- **Gap Between**: 12px

### Example Box
- **Background**: #F3F4F6
- **Padding**: 16px
- **Border Radius**: 6px
- **Margin Bottom**: 16px

---

## 🔄 Animation Details

### Modal Open/Close
```
Duration: 200ms
Easing: ease-in-out
Transform: scale(0.95) → scale(1)
Opacity: 0 → 1
```

### Loading Spinner
```
Animation: spin
Duration: 1s
Timing: linear
Iteration: infinite
Size: 16px × 16px
Border: 2px solid
Color: white (transparent top)
```

### Button Hover
```
Duration: 150ms
Easing: ease-in-out
Transform: subtle scale or background change
```

### Toast Notification
```
Slide In: 300ms from right
Stay: 5s
Slide Out: 300ms to right
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Stacked buttons, full-width |
| Tablet | 640px - 1024px | 2-column grid, compact header |
| Desktop | > 1024px | 3-4 column grid, full header |

### Modal Responsive Behavior

**Desktop** (> 768px):
- Modal width: 768px
- Centered on screen
- Comfortable spacing

**Tablet** (640px - 768px):
- Modal width: 95% of screen
- Slightly reduced padding
- Maintains functionality

**Mobile** (< 640px):
- Modal width: 100%
- Full height on smaller devices
- Compact spacing
- Landscape mode recommended

---

## 🖱️ Interaction States

### Hover States

**Import JSON Button**:
```
Normal:  [📤 Import JSON]
Hover:   [📤 Import JSON]  ← background lightens
```

**Import Hotels Button**:
```
Normal:  [📤 Import Hotels]  ← orange
Hover:   [📤 Import Hotels]  ← darker orange
```

**Cancel Button**:
```
Normal:  [Cancel]
Hover:   [Cancel]  ← background lightens
```

### Focus States

**Textarea**:
```
Normal:  ┌─────────────┐
         │             │
         └─────────────┘

Focus:   ┌─────────────┐
         │ |cursor     │  ← blue border ring
         └─────────────┘
```

### Active/Pressed States

**Buttons**:
```
Normal:   [Button]
Pressed:  [Button]  ← slightly darker
```

---

## 🎯 Visual Hierarchy

### Importance Levels

**Level 1 - Most Important**:
- Modal title: "Import Hotels from JSON"
- Import Hotels button (orange)
- Error messages

**Level 2 - Important**:
- Example JSON format
- Required fields note
- JSON textarea

**Level 3 - Supporting**:
- Description text
- Optional fields note
- Cancel button

---

## 💡 Accessibility Features

### Keyboard Navigation
```
Tab Order:
1. Close button (X)
2. Textarea
3. Cancel button
4. Import Hotels button

ESC: Closes modal
Enter (in textarea): Line break
```

### Screen Reader
- Modal announced when opened
- Button states announced
- Error messages announced
- Success notifications announced

### Color Contrast
- All text meets WCAG AA standards
- Icons have proper aria-labels
- Focus indicators clearly visible

---

## 🖼️ Icon Reference

### Icons Used

| Icon | Symbol | Context | Size |
|------|--------|---------|------|
| Upload | 📤 | Import buttons | 16px |
| Plus | ➕ | Add Hotel button | 16px |
| Filter | 🔍 | Filter dropdown | 16px |
| Close | ✖️ | Modal close | 20px |
| Spinner | ⏳ | Loading state | 16px |
| Check | ✅ | Success toast | 20px |
| Alert | ❌ | Error toast | 20px |

---

## 🎨 Example Scenarios

### Scenario 1: First-Time User
```
1. User sees Import JSON button
2. Hovers → tooltip appears (optional)
3. Clicks → modal opens
4. Sees example format
5. Copies example
6. Modifies with real data
7. Clicks Import
8. Sees success message
```

### Scenario 2: Bulk Import User
```
1. User has CSV data
2. Converts to JSON online
3. Clicks Import JSON
4. Pastes large JSON array
5. Clicks Import
6. Waits (spinner shows)
7. Gets success notification
8. Sees hotels in list
```

### Scenario 3: Error Recovery
```
1. User pastes invalid JSON
2. Clicks Import
3. Gets "Invalid JSON" error
4. Checks JSON syntax
5. Fixes error
6. Clicks Import again
7. Success!
```

---

## 📊 Visual Checklist

Before using, verify:
- [ ] Import JSON button visible in header
- [ ] Button has upload icon
- [ ] Modal opens when clicked
- [ ] Example format displayed clearly
- [ ] Textarea is large enough (300px)
- [ ] Loading spinner appears during import
- [ ] Success toast shows hotel count
- [ ] Hotels appear in grid after import
- [ ] No layout shifts or breaking
- [ ] Works on mobile/tablet/desktop

---

**Last Updated**: November 2, 2025
**Component**: Hotel Management Tab
**Feature**: JSON Bulk Import
**Status**: ✅ Production Ready
