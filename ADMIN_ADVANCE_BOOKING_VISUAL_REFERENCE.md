# Admin Advance Booking Edit - Visual Reference

## 🎨 Complete Visual Guide

This document provides a comprehensive visual reference for the admin advance booking edit feature.

---

## 📍 Location in Admin Dashboard

### Navigation Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │  Bookings   │  │  Packages   │  │   Messages   │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  All Status ▼  [🔍 Search]                           │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  📋 John Doe - Train - Delhi to Mumbai     [Edit]    │  │
│  │                                                       │  │  ← Click Edit
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Edit Booking Modal                        │
│  [Customer Details] [Journey Details] [Train Details]       │
│  [Special Requirements] [Ticket Details]                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📅 Booking Mode Section          ← NEW SECTION    │    │
│  │                                                     │    │
│  │  📅 Advance Booking              [──────────✓]    │    │
│  │     Book well in advance                           │    │
│  │                                                     │    │
│  │  ℹ️ About Booking Modes                           │    │
│  │  • Advance Booking: Future travel dates            │    │
│  │  • Regular Booking: Immediate/near-term travel     │    │
│  └────────────────────────────────────────────────────┘    │
│  [Pricing & Commission Details]                             │
│                                                              │
│  [Cancel]  [Save Changes]                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 Toggle States

### State 1: Regular Booking (OFF)

```
┌──────────────────────────────────────────────────────────────┐
│ Booking Mode                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │   📅    Regular Booking                    ○       │    │
│  │         Standard booking               ────────    │    │
│  │                                                     │    │
│  │                  Gray Background                    │    │
│  │                  Calendar Icon                      │    │
│  │                  Left Position                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ℹ️ About Booking Modes                                     │
│  ✓ Advance Booking: Book well in advance                   │
│  • Regular Booking: Standard booking                        │
└──────────────────────────────────────────────────────────────┘
```

**CSS Details:**
- Background: `bg-gradient-to-r from-gray-300 to-gray-400`
- Circle Position: `left-1`
- Icon: Calendar (📅)
- Label: "Regular Booking"
- Description: "Standard booking"

---

### State 2: Advance Booking (ON)

```
┌──────────────────────────────────────────────────────────────┐
│ Booking Mode                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │   📅    Advance Booking                        ✓   │    │
│  │         Book well in advance            ────────   │    │
│  │                                                     │    │
│  │                Green Background                     │    │
│  │                Checkmark Icon                       │    │
│  │                Right Position                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ℹ️ About Booking Modes                                     │
│  ✓ Advance Booking: Book well in advance                   │
│  • Regular Booking: Standard booking                        │
└──────────────────────────────────────────────────────────────┘
```

**CSS Details:**
- Background: `bg-gradient-to-r from-green-500 to-emerald-600`
- Circle Position: `left-[calc(100%-2.75rem)]` (right side)
- Icon: Checkmark (✓)
- Label: "Advance Booking"
- Description: "Book well in advance"

---

## 📱 Responsive Layouts

### Mobile View (< 640px)

```
┌─────────────────────────────┐
│  Booking Mode               │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │  📅 Advance Booking │   │
│  │     Book in advance │   │
│  │                     │   │
│  │     [──────────✓]   │   │  ← 64px toggle
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  ℹ️ About Modes            │
│  • Advance: Future dates   │
│  • Regular: Near-term      │
│                             │
└─────────────────────────────┘

Vertical Stack Layout
Toggle: 64px × 32px
Icon: 24px × 24px
Text: text-base
Padding: p-4
```

---

### Tablet View (640px - 768px)

```
┌─────────────────────────────────────────────────┐
│  Booking Mode                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │  📅  Advance Booking      [──────────✓]  │ │  ← 80px toggle
│  │      Book well in advance                │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ℹ️ About Booking Modes                        │
│  ✓ Advance Booking: Book well in advance      │
│  • Regular Booking: Standard booking           │
│                                                 │
└─────────────────────────────────────────────────┘

Horizontal Layout
Toggle: 80px × 40px
Icon: 32px × 32px
Text: text-lg
Padding: p-6
```

---

### Desktop View (> 768px)

```
┌────────────────────────────────────────────────────────────────┐
│  Booking Mode                                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │   📅    Advance Booking             [──────────────✓]   │ │  ← 96px toggle
│  │         Book well in advance for future travel dates    │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ℹ️ About Booking Modes                                       │
│  ✓ Advance Booking: Bookings made well in advance for future │
│    travel dates                                               │
│  • Regular Booking: Standard bookings for immediate or near-  │
│    term travel                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Horizontal Layout
Toggle: 96px × 48px
Icon: 40px × 40px
Text: text-xl
Padding: p-6
```

---

## 🎯 Toggle Animation

### Click Interaction Flow

```
Step 1: Initial State (OFF)
┌─────────────────────┐
│  ○──────────        │
│  └─ Gray            │
└─────────────────────┘

Step 2: Click Event
┌─────────────────────┐
│  ○──────────        │  ← Click!
│  └─ Animating       │
└─────────────────────┘

Step 3: Transition (300ms)
┌─────────────────────┐
│     ○──────         │  ← Moving...
│     └─ Green        │
└─────────────────────┘

Step 4: Final State (ON)
┌─────────────────────┐
│      ──────────✓    │
│      └─ Green       │
└─────────────────────┘
```

**Animation Properties:**
- Duration: `300ms`
- Easing: `ease-in-out`
- Transform: `scale(1.05)` on hover
- Shadow: `shadow-lg` → `shadow-xl` on hover

---

## 🏷️ Badge Display in Booking List

### Before Toggle ON

```
┌─────────────────────────────────────────────────────┐
│  📋 John Doe                                        │
│  📍 Delhi → Mumbai                                  │
│  📅 Jan 15, 2025                                    │
│  💼 Train                                           │
│                                                     │
│  [Pending]                                          │
│  [View] [Edit] [Delete]                            │
└─────────────────────────────────────────────────────┘
```

### After Toggle ON

```
┌─────────────────────────────────────────────────────┐
│  📋 John Doe                                        │
│  📍 Delhi → Mumbai                                  │
│  📅 Jan 15, 2025                                    │
│  💼 Train                                           │
│                                                     │
│  [Pending] [🚀 Advance]  ← NEW BADGE               │
│  [View] [Edit] [Delete]                            │
└─────────────────────────────────────────────────────┘
```

**Badge Styling:**
```css
Mobile:
class="inline-flex items-center gap-1 px-2 py-1 
       text-xs font-semibold text-purple-700 
       bg-purple-100 rounded-full"

Desktop:
class="inline-block px-2 py-1 text-xs font-medium 
       text-purple-700 bg-purple-100 rounded-full"
```

---

## 🎨 Color Palette

### Regular Booking (OFF State)
```
Background Gradient:
├─ from-gray-300 (#D1D5DB)
└─ to-gray-400   (#9CA3AF)

Toggle Circle:
└─ bg-white (#FFFFFF)

Icon Color:
└─ text-gray-600 (#4B5563)

Border:
└─ border-gray-300 (#D1D5DB)
```

### Advance Booking (ON State)
```
Background Gradient:
├─ from-green-500 (#10B981)
└─ to-emerald-600 (#059669)

Toggle Circle:
└─ bg-white (#FFFFFF)

Icon Color:
└─ text-green-600 (#059669)

Border:
└─ border-green-500 (#10B981)
```

### Info Box
```
Background:
└─ bg-blue-50 (#EFF6FF)

Border:
└─ border-blue-100 (#DBEAFE)

Text:
├─ text-blue-800 (#1E40AF) - Heading
└─ text-blue-700 (#1D4ED8) - Body
```

### Badge
```
Background:
└─ bg-purple-100 (#F3E8FF)

Text:
└─ text-purple-700 (#7C3AED)

Border:
└─ rounded-full
```

---

## 📐 Dimensions

### Toggle Button Sizes

| Breakpoint | Container | Circle | Icon | Label |
|------------|-----------|--------|------|-------|
| Mobile     | 64×32px   | 24×24px| 12×12px | 14px |
| Tablet     | 80×40px   | 32×32px| 16×16px | 16px |
| Desktop    | 96×48px   | 40×40px| 20×20px | 18px |

### Spacing

```
Section Padding:
Mobile:  p-4 (16px)
Desktop: p-6 (24px)

Gap Between Elements:
Mobile:  gap-4 (16px)
Desktop: gap-6 (24px)

Border Radius:
Container: rounded-xl (12px)
Toggle:    rounded-full
Badge:     rounded-full
```

---

## 🔄 State Transitions

### Toggle Movement

```css
OFF → ON Transition:
┌────────────────────────────────┐
│ ○                              │  Start: left-1 (4px)
│   →  →  →  →  →  →  →  →  →   │  300ms transition
│                              ✓ │  End: calc(100% - 2.75rem)
└────────────────────────────────┘

Color Transition:
Gray (#9CA3AF) → Green (#10B981)
Duration: 300ms
Easing: ease-in-out

Icon Transition:
📅 Calendar → ✓ Checkmark
Fade out/in: 150ms each
```

---

## 🎭 Interactive States

### Hover Effect
```
Normal:
┌─────────────────────┐
│  [──────────✓]      │
│  shadow-lg          │
└─────────────────────┘

Hover:
┌─────────────────────┐
│  [──────────✓]      │  ← Slightly larger
│  shadow-xl          │  ← Deeper shadow
│  scale-105          │  ← 5% bigger
└─────────────────────┘
```

### Active (Click) Effect
```
Pressed:
┌─────────────────────┐
│  [──────────✓]      │
│  scale-100          │  ← Returns to normal
│  brightness-95      │  ← Slightly darker
└─────────────────────┘
```

---

## 📱 Complete Modal Layout

### Full Edit Modal Structure

```
┌────────────────────────────────────────────────────────┐
│  Edit Booking                                    [×]   │  ← Header
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 👤 Customer Details                              │ │
│  │  Name: John Doe                                  │ │
│  │  Phone: +91-9876543210                           │ │
│  │  Email: john@example.com                         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🚂 Journey Details                               │ │
│  │  From: Delhi (NDLS)                              │ │
│  │  To: Mumbai (CSTM)                               │ │
│  │  Date: 2025-01-15                                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🚆 Train Booking Details                         │ │
│  │  Booking Type: General                           │ │
│  │  Class: AC 3-Tier (3A)                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📝 Special Requirements                          │ │
│  │  Lower berth preferred                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🎫 Ticket Details                                │ │
│  │  Ticket Number: 123456                           │ │
│  │  PNR: 1234567890                                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │  ← NEW SECTION
│  │ 📅 Booking Mode                                  │ │
│  │                                                  │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │  📅 Advance Booking      [──────────✓]    │ │ │
│  │  │     Book well in advance                   │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │                                                  │ │
│  │  ℹ️ About Booking Modes                         │ │
│  │  ✓ Advance Booking: Future travel dates        │ │
│  │  • Regular Booking: Immediate/near-term        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 💰 Pricing & Commission Details                  │ │
│  │  Ticket Cost: ₹1000                              │ │
│  │  Actual Price: ₹1200                             │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
├────────────────────────────────────────────────────────┤
│  [Cancel]                          [Save Changes]     │  ← Footer
└────────────────────────────────────────────────────────┘
```

---

## 🔍 Visibility Rules

### When Section Appears
```
✅ SHOWS when:
   - booking_type === "train"
   - Edit modal is open
   - User is admin

❌ HIDES when:
   - booking_type === "bus"
   - booking_type === "flight"
   - booking_type === "cab"
   - booking_type is undefined/empty
```

### Conditional Rendering Code
```tsx
{formData.booking_type === "train" && (
  <section id="booking-mode-section">
    {/* Toggle UI */}
  </section>
)}
```

---

## 🎬 Complete User Flow

### Scenario: Change Regular → Advance

```
Step 1: View Booking List
┌───────────────────────────┐
│ John Doe - Train          │
│ [Pending]                 │  ← No advance badge
│ [Edit]                    │
└───────────────────────────┘
         ↓ Click Edit

Step 2: Modal Opens
┌───────────────────────────┐
│ Edit Booking              │
│ ...                       │
│ Booking Mode:             │
│ ○──────────  OFF          │  ← Toggle is OFF
│ Regular Booking           │
└───────────────────────────┘
         ↓ Click Toggle

Step 3: Toggle Changes
┌───────────────────────────┐
│ Edit Booking              │
│ ...                       │
│ Booking Mode:             │
│ ──────────✓  ON           │  ← Toggle is ON
│ Advance Booking           │
└───────────────────────────┘
         ↓ Click Save

Step 4: Saving...
┌───────────────────────────┐
│ 🎉 Changes Saved          │
│ Booking details updated   │
└───────────────────────────┘
         ↓ Modal closes

Step 5: Updated List
┌───────────────────────────┐
│ John Doe - Train          │
│ [Pending] [🚀 Advance]    │  ← Badge appears!
│ [Edit]                    │
└───────────────────────────┘
```

---

## 🎨 CSS Class Reference

### Main Container
```css
.booking-mode-section {
  @apply scroll-mt-32;
  @apply bg-white rounded-xl;
  @apply p-6 border border-gray-100;
  @apply shadow-sm;
}
```

### Toggle Container
```css
.toggle-container {
  @apply flex flex-col sm:flex-row;
  @apply items-start sm:items-center;
  @apply gap-4 sm:gap-6;
  @apply p-4 sm:p-6;
  @apply bg-gradient-to-br from-blue-50 to-purple-50;
  @apply rounded-xl border-2 border-blue-100;
}
```

### Toggle Button (OFF)
```css
.toggle-button-off {
  @apply relative flex-shrink-0;
  @apply transition-all duration-300 ease-in-out;
  @apply rounded-full shadow-lg;
  @apply h-8 w-16 sm:h-10 sm:w-20 md:h-12 md:w-24;
  @apply bg-gradient-to-r from-gray-300 to-gray-400;
  @apply shadow-gray-200;
  @apply hover:shadow-xl transform hover:scale-105;
}
```

### Toggle Button (ON)
```css
.toggle-button-on {
  @apply relative flex-shrink-0;
  @apply transition-all duration-300 ease-in-out;
  @apply rounded-full shadow-lg;
  @apply h-8 w-16 sm:h-10 sm:w-20 md:h-12 md:w-24;
  @apply bg-gradient-to-r from-green-500 to-emerald-600;
  @apply shadow-green-200;
  @apply hover:shadow-xl transform hover:scale-105;
}
```

### Toggle Circle
```css
.toggle-circle {
  @apply absolute top-1;
  @apply transition-all duration-300 ease-in-out;
  @apply bg-white rounded-full shadow-md;
  @apply flex items-center justify-center;
  @apply h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10;
}

/* Position when OFF */
.toggle-circle-off {
  @apply left-1;
}

/* Position when ON */
.toggle-circle-on {
  @apply left-[calc(100%-1.75rem)];
  @apply sm:left-[calc(100%-2.25rem)];
  @apply md:left-[calc(100%-2.75rem)];
}
```

### Info Box
```css
.info-box {
  @apply mt-4 p-4;
  @apply bg-blue-50 rounded-lg;
  @apply border border-blue-100;
}
```

---

## 📊 Comparison Table

### User Form vs Admin Edit

| Feature | User Booking Form | Admin Edit Modal |
|---------|------------------|------------------|
| **Toggle Size (Mobile)** | 64px | 64px |
| **Toggle Size (Desktop)** | 96px | 96px |
| **Layout (Mobile)** | Vertical | Vertical |
| **Layout (Desktop)** | Horizontal | Horizontal |
| **Colors (OFF)** | Gray gradient | Gray gradient |
| **Colors (ON)** | Green gradient | Green gradient |
| **Icons** | Calendar/Check | Calendar/Check |
| **Info Box** | Yes | Yes |
| **Location** | Main form | Edit modal |
| **Visibility** | Train only | Train only |
| **When Editable** | Creation time | Anytime after creation |

---

## ✨ Visual Highlights

### Key Design Elements

1. **Gradient Backgrounds**
   - Creates depth and visual interest
   - Smooth color transitions
   - Professional appearance

2. **Rounded Corners**
   - Modern, friendly design
   - Consistent border-radius throughout
   - `rounded-xl` for sections, `rounded-full` for toggle

3. **Shadow Effects**
   - Subtle elevation: `shadow-lg`
   - Enhanced on hover: `shadow-xl`
   - Colored shadows match state: `shadow-green-200` / `shadow-gray-200`

4. **Responsive Typography**
   - Mobile: `text-base` (16px)
   - Tablet: `text-lg` (18px)
   - Desktop: `text-xl` (20px)

5. **Icon Integration**
   - Consistent sizing across breakpoints
   - SVG icons for scalability
   - Contextual colors

---

## 🎯 Accessibility

### Visual Indicators
- ✅ Color is not the only indicator (text labels included)
- ✅ Sufficient color contrast ratios
- ✅ Large touch targets (minimum 44px)

### ARIA Labels
```html
aria-label="Switch to Advance Booking" (when OFF)
aria-label="Switch to Regular Booking" (when ON)
```

### Keyboard Support
- ✅ `type="button"` for proper keyboard navigation
- ✅ Focus states visible
- ✅ Enter/Space activates toggle

---

**Document Version**: 1.0.0  
**Last Updated**: January 11, 2025  
**Status**: Complete Visual Reference  
**Related Docs**: 
- ADMIN_ADVANCE_BOOKING_EDIT_FEATURE.md
- ADMIN_ADVANCE_BOOKING_QUICK_GUIDE.md
