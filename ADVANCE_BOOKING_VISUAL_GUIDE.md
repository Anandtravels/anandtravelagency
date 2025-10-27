# 🎨 Advance Booking - Visual Reference Guide

## 🖥️ User Interface Components

### 1. Toggle Button States

#### **State 1: Regular Booking (Default)**
```
┌─────────────────────────────────────────────────────────────┐
│  📅 Booking Mode                                            │
│  Regular booking for immediate travel needs                 │
│                                                             │
│  ┌─────────────────┐                                       │
│  │ ○────────────   │  Regular Booking                      │
│  └─────────────────┘  Standard                             │
│                                                             │
│  Background: Gray (#D1D5DB)                                │
│  No additional info badge shown                            │
└─────────────────────────────────────────────────────────────┘
```

#### **State 2: Advance Booking (Activated)**
```
┌─────────────────────────────────────────────────────────────┐
│  📅 Booking Mode                                            │
│  Plan ahead! Book your tickets in advance for future dates │
│                                                             │
│  ┌─────────────────┐                                       │
│  │ ────────────✓ ○ │  Advance Booking                      │
│  └─────────────────┘  Active                               │
│                                                             │
│  Background: Orange Gradient (#F97316 → #EA580C)          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ✓ Advance Booking Selected                           │ │
│  │ Your booking will be marked for advance scheduling   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile View - Booking Cards

### Regular Booking Card
```
┌─────────────────────────────────────────┐
│ ☐ John Doe                              │
│    27 Oct 2025, 10:30 AM                │
│    [Train] [Pending]                    │
│                                         │
│ 📞 +91 9876543210                       │
│ ✉️  john@example.com                    │
│                                         │
│ Journey Details ▼                       │
│ Actions...                              │
└─────────────────────────────────────────┘
```

### Advance Booking Card (with badge)
```
┌─────────────────────────────────────────┐
│ ☐ Jane Smith                            │
│    27 Oct 2025, 11:15 AM                │
│    [Train] [Pending] [🚀 Advance]       │
│                     └─ NEW BADGE!       │
│ 📞 +91 9876543210                       │
│ ✉️  jane@example.com                    │
│                                         │
│ Journey Details ▼                       │
│ Actions...                              │
└─────────────────────────────────────────┘
```

---

## 💻 Desktop View - Booking Cards

### Regular Booking Card
```
┌────────────────────────────────────────────────────┐
│                                     [Pending ▼]    │
│ ☐ John Doe                                         │
│    27 Oct 2025, 10:30 AM  [Train]                 │
│                                                    │
│ 📞 +91 9876543210  ✉️ john@example.com            │
│                                                    │
│ ─────────────────────────────────────────────────│
│                                                    │
│ Journey Details | Passenger Info | Actions        │
│ ═══════════════                                   │
│ From: Mumbai                                       │
│ To: Delhi                                          │
│ Date: 01 Nov 2025                                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Advance Booking Card (with badge)
```
┌────────────────────────────────────────────────────┐
│                                     [Pending ▼]    │
│ ☐ Jane Smith                                       │
│    27 Oct 2025, 11:15 AM  [Train] [🚀 Advance]    │
│                                    └─ NEW BADGE!   │
│ 📞 +91 9876543210  ✉️ jane@example.com            │
│                                                    │
│ ─────────────────────────────────────────────────│
│                                                    │
│ Journey Details | Passenger Info | Actions        │
│ ═══════════════                                   │
│ From: Chennai                                      │
│ To: Bangalore                                      │
│ Date: 15 Nov 2025                                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🎛️ Admin Filter Dropdown

### Before (Old Filter Options)
```
┌────────────────────┐
│ All Statuses    ▼  │
├────────────────────┤
│ All Statuses       │
│ Pending            │
│ Payment Done       │
│ In Process         │
│ Booked             │
│ Hold               │
└────────────────────┘
```

### After (New Filter Options)
```
┌────────────────────┐
│ All Statuses    ▼  │
├────────────────────┤
│ All Statuses       │
│ Pending            │
│ Payment Done       │
│ In Process         │
│ Booked             │
│ Hold               │
│ Advance Booking    │ ← NEW OPTION
└────────────────────┘
```

---

## 🎨 Color Palette

### Toggle Button Colors
| State | Background | Text | Shadow |
|-------|-----------|------|--------|
| **Inactive** | `#D1D5DB` (Gray) | `#6B7280` | `shadow-md` |
| **Active** | `linear-gradient(to right, #F97316, #EA580C)` | `#FFFFFF` | `shadow-lg` |

### Badge Colors
| Type | Background | Text | Border |
|------|-----------|------|--------|
| **Regular** | `#EFF6FF` (Blue-50) | `#1D4ED8` (Blue-700) | None |
| **Advance** | `linear-gradient(to right, #F97316, #EA580C)` | `#FFFFFF` | None |

### Container Colors
| Element | Background | Border |
|---------|-----------|--------|
| **Toggle Container** | `linear-gradient(to right, #EFF6FF, #E0E7FF)` | `#BFDBFE` |
| **Info Badge** | `#FFFFFF` | `#BFDBFE` |

---

## 📐 Spacing & Dimensions

### Toggle Switch
- **Width**: 96px (24 tailwind units / w-24)
- **Height**: 48px (12 tailwind units / h-12)
- **Switch Circle**: 40px × 40px (h-10 w-10)
- **Translation**: 
  - Inactive: 4px (translate-x-1)
  - Active: 48px (translate-x-12)

### Container
- **Padding**: 24px (p-6)
- **Border Radius**: 12px (rounded-xl)
- **Border Width**: 2px (border-2)
- **Margin Bottom**: 24px (mb-6)

### Badge
- **Padding**: 8px 8px (px-2 py-0.5)
- **Font Size**: 12px (text-xs)
- **Font Weight**: 600 (font-semibold)
- **Border Radius**: 4px (rounded)

---

## 🎭 Animation Details

### Toggle Transition
```css
transition: all 300ms ease-in-out
```

### Elements Animated
1. **Background Color**: Gray → Orange gradient
2. **Switch Position**: Left → Right
3. **Shadow**: Medium → Large
4. **Focus Ring**: Appears on interaction

### Color Transition
```css
transition-colors duration-200
```

### Applied To
- Text labels
- Background highlights
- Border colors

---

## 🔍 Visual Hierarchy

### Primary Elements (Most Important)
1. **Toggle Switch** - Main interaction point
2. **Advance Badge** - Status indicator
3. **Booking Type** - Category identification

### Secondary Elements
4. **Status Labels** - Current state
5. **Info Messages** - Contextual help
6. **Descriptions** - Explanatory text

### Tertiary Elements
7. **Icons** - Visual aids
8. **Borders** - Visual separation

---

## 📊 Layout Structure

### Toggle Section in Booking Form
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Journey Date Field                                     │
│  [Calendar Icon] [Date Input]                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Gradient Background - Blue to Indigo]            │ │
│  │                                                    │ │
│  │  [Calendar Icon] Booking Mode     [Toggle]   [✓]  │ │
│  │  Description Text                Status Label     │ │
│  │                                                    │ │
│  │  [Info Badge - If Advance Selected]              │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Booking Type Dropdown                                  │
│  [Select: General/Tatkal/Premium]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎪 Interactive States

### Toggle Button
| State | Visual Feedback |
|-------|----------------|
| **Default** | Gray background, left position |
| **Hover** | Slight opacity change |
| **Active** | Orange gradient, right position, checkmark |
| **Focus** | Ring outline (keyboard navigation) |
| **Disabled** | N/A (always enabled for train bookings) |

### Info Badge (appears only when active)
| State | Visual Feedback |
|-------|----------------|
| **Visible** | White background, blue border, checkmark icon |
| **Hidden** | Toggle is off |

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Toggle remains same size
- Text wraps naturally
- Badge maintains visibility
- Stacked layout for toggle label and switch

### Tablet (768px - 1024px)
- Horizontal layout
- Toggle and labels side-by-side
- Full description text visible

### Desktop (> 1024px)
- Maximum width maintained
- Optimal spacing
- All elements fully visible
- Enhanced shadows and effects

---

## ✨ Special Effects

### 1. **Gradient Backgrounds**
```css
bg-gradient-to-r from-blue-50 to-indigo-50  /* Container */
bg-gradient-to-r from-travel-orange to-orange-500  /* Toggle Active */
bg-gradient-to-r from-orange-500 to-orange-600  /* Badge */
```

### 2. **Shadows**
- **Inactive Toggle**: `shadow-md`
- **Active Toggle**: `shadow-lg`
- **Badge**: `shadow-sm`
- **Container**: `shadow-sm`

### 3. **Icons**
- **Calendar**: `lucide-react` Calendar icon
- **Check**: `lucide-react` Check icon
- **Rocket Emoji**: 🚀 (native emoji)

---

## 🎯 Accessibility Features

### ARIA Attributes
```html
aria-label="Toggle advance booking"
```

### Keyboard Navigation
- **Tab**: Focus toggle button
- **Space/Enter**: Activate toggle
- **Tab**: Move to next field

### Visual Indicators
- High contrast colors
- Clear state differentiation
- Icon + text labels
- Focus ring visible

---

## 📸 Screenshot Placeholders

```
User Booking Form - Toggle OFF:
[────────────────────────────────]
[  📅 Regular Booking (Gray)     ]
[────────────────────────────────]

User Booking Form - Toggle ON:
[────────────────────────────────]
[  🚀 Advance Booking (Orange)   ]
[  ✓ Info Badge Visible          ]
[────────────────────────────────]

Admin Booking Card - Regular:
[────────────────────────────────]
[  John Doe                      ]
[  [Train] [Pending]             ]
[────────────────────────────────]

Admin Booking Card - Advance:
[────────────────────────────────]
[  Jane Smith                    ]
[  [Train] [🚀 Advance] [Pending]]
[────────────────────────────────]
```

---

## 🔄 State Transitions

### Toggle Animation Flow
```
State 1: Inactive
    ↓
  [Click]
    ↓
State 2: Animating (300ms)
  • Background: Gray → Orange
  • Position: Left → Right
  • Shadow: md → lg
  • Icon: Empty → Check
    ↓
State 3: Active
```

### Badge Appearance Flow
```
Toggle OFF → Badge Hidden
     ↓
  [Toggle ON]
     ↓
Badge Appears (fade in)
  • White background
  • Blue border
  • Check icon
  • Text: "Advance Booking Selected"
```

---

## 📏 Measurement Reference

### Desktop Grid
```
Container: 12 columns
├─ Left Section: 8 columns
│  ├─ Icon + Title: 6 columns
│  └─ Description: 6 columns
│
└─ Right Section: 4 columns
   ├─ Toggle: 2 columns
   └─ Label: 2 columns
```

### Mobile Stack
```
Full Width: 12 columns
├─ Icon + Title: 12 columns
├─ Description: 12 columns
├─ Toggle + Label: 12 columns
└─ Info Badge: 12 columns (if active)
```

---

**Visual Reference Complete** ✅

This guide provides all visual specifications needed to understand, maintain, or recreate the advance booking UI components.
