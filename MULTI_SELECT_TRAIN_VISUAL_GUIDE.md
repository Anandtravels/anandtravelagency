# Multi-Select Train Autocomplete - Visual Guide

## User Interface Overview

### Initial State (No Selections)
```
┌─────────────────────────────────────────────────────────────┐
│ Preferred Trains (Optional)                                 │
├─────────────────────────────────────────────────────────────┤
│ 🚂 Search by train number or name...           🔽          │
└─────────────────────────────────────────────────────────────┘
│ Press Enter to add a train, or select from suggestions.     │
│ Press Backspace to remove the last train.                   │
└─────────────────────────────────────────────────────────────┘
```

### With One Selection
```
┌─────────────────────────────────────────────────────────────┐
│ Preferred Trains (Optional)                                 │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐                │
│ │ Rajdhani Express (12301)              ✕ │                │
│ └─────────────────────────────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│ 🚂 Add another train...                      🔽            │
└─────────────────────────────────────────────────────────────┘
│ Press Enter to add a train, or select from suggestions.     │
│ Press Backspace to remove the last train.                   │
└─────────────────────────────────────────────────────────────┘
```

### With Multiple Selections
```
┌─────────────────────────────────────────────────────────────┐
│ Preferred Trains (Optional)                                 │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐ ┌───────────────────────────┐ │
│ │ Rajdhani Express (12301) ✕│ │ Gowthami SF Exp (12737) ✕│ │
│ └──────────────────────────┘ └───────────────────────────┘ │
│ ┌──────────────────────────┐                               │
│ │ Duranto Express (12213)  ✕│                               │
│ └──────────────────────────┘                               │
├─────────────────────────────────────────────────────────────┤
│ 🚂 Add another train...                      🔽            │
└─────────────────────────────────────────────────────────────┘
```

### With Dropdown Open
```
┌─────────────────────────────────────────────────────────────┐
│ Preferred Trains (Optional)                                 │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐                               │
│ │ Rajdhani Express (12301) ✕│                               │
│ └──────────────────────────┘                               │
├─────────────────────────────────────────────────────────────┤
│ 🚂 rajd                                      🔼            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ █ Rajdhani Express                         #12302 █         │
│ █ Mumbai Central → New Delhi                      █         │
├─────────────────────────────────────────────────────────────┤
│ Rajdhani Express                              #12303        │
│ New Delhi → Howrah                                          │
├─────────────────────────────────────────────────────────────┤
│ Rajdhani Express                              #12304        │
│ New Delhi → Chennai                                         │
└─────────────────────────────────────────────────────────────┘
Note: #12301 is already selected, so it doesn't appear in dropdown
```

---

## User Interaction Flows

### Flow 1: Adding Trains via Autocomplete

```
Step 1: User clicks input field
┌─────────────────────────────────────────┐
│ 🚂 Search by train number...  🔽       │ ← Cursor here
└─────────────────────────────────────────┘

Step 2: User types "12737"
┌─────────────────────────────────────────┐
│ 🚂 12737                      🔼        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Gowthami SF Express          #12737     │ ← Highlighted
│ Kakinada Port → Lingampalli             │
└─────────────────────────────────────────┘

Step 3: User presses Enter or clicks
┌─────────────────────────────────────────┐
│ ┌───────────────────────────────┐       │
│ │ Gowthami SF Express (12737) ✕ │       │ ← Chip appears
│ └───────────────────────────────┘       │
├─────────────────────────────────────────┤
│ 🚂 Add another train...       🔽        │ ← Input cleared
└─────────────────────────────────────────┘

Step 4: User types "rajdhani"
┌─────────────────────────────────────────┐
│ 🚂 rajdhani                   🔼        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Rajdhani Express             #12301     │
│ New Delhi → Mumbai Central              │
├─────────────────────────────────────────┤
│ Rajdhani Express             #12302     │
│ Mumbai Central → New Delhi              │
└─────────────────────────────────────────┘

Step 5: User selects #12301
┌─────────────────────────────────────────┐
│ ┌───────────────────────────────┐       │
│ │ Gowthami SF Express (12737) ✕ │       │
│ └───────────────────────────────┘       │
│ ┌───────────────────────────────┐       │
│ │ Rajdhani Express (12301)    ✕ │       │ ← New chip
│ └───────────────────────────────┘       │
├─────────────────────────────────────────┤
│ 🚂 Add another train...       🔽        │
└─────────────────────────────────────────┘

Result: Two trains selected
Form value: "Gowthami SF Express (12737), Rajdhani Express (12301)"
```

### Flow 2: Adding Custom Text

```
Step 1: User types custom text
┌─────────────────────────────────────────┐
│ 🚂 Any train to Delhi         🔽        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ No trains found. Press Enter to add     │
│ "Any train to Delhi" as custom text.    │
└─────────────────────────────────────────┘

Step 2: User presses Enter
┌─────────────────────────────────────────┐
│ ┌───────────────────────────────┐       │
│ │ Any train to Delhi          ✕ │       │ ← Custom chip
│ └───────────────────────────────┘       │
├─────────────────────────────────────────┤
│ 🚂 Add another train...       🔽        │
└─────────────────────────────────────────┘

Result: Custom text added
Form value: "Any train to Delhi"
```

### Flow 3: Removing Trains - Method 1 (Click X)

```
Before:
┌─────────────────────────────────────────┐
│ ┌─────────────────┐ ┌────────────────┐ │
│ │ Train A       ✕ │ │ Train B      ✕ │ │
│ └─────────────────┘ └────────────────┘ │
│ ┌─────────────────┐                    │
│ │ Train C       ✕ │ ← User clicks X    │
│ └─────────────────┘                    │
└─────────────────────────────────────────┘

After:
┌─────────────────────────────────────────┐
│ ┌─────────────────┐ ┌────────────────┐ │
│ │ Train A       ✕ │ │ Train B      ✕ │ │
│ └─────────────────┘ └────────────────┘ │
│                                         │ ← Train C removed
└─────────────────────────────────────────┘

Result: Train C removed
Form value: "Train A, Train B"
```

### Flow 4: Removing Trains - Method 2 (Backspace)

```
Before:
┌─────────────────────────────────────────┐
│ ┌─────────────────┐ ┌────────────────┐ │
│ │ Train A       ✕ │ │ Train B      ✕ │ │
│ └─────────────────┘ └────────────────┘ │
│ ┌─────────────────┐                    │
│ │ Train C       ✕ │                    │
│ └─────────────────┘                    │
├─────────────────────────────────────────┤
│ 🚂 |                          🔽        │ ← Empty input
└─────────────────────────────────────────┘
         User presses Backspace ⌫

After:
┌─────────────────────────────────────────┐
│ ┌─────────────────┐ ┌────────────────┐ │
│ │ Train A       ✕ │ │ Train B      ✕ │ │
│ └─────────────────┘ └────────────────┘ │
│                                         │ ← Train C removed
├─────────────────────────────────────────┤
│ 🚂 |                          🔽        │
└─────────────────────────────────────────┘
         Press Backspace again ⌫

After:
┌─────────────────────────────────────────┐
│ ┌─────────────────┐                    │
│ │ Train A       ✕ │                    │ ← Train B removed
│ └─────────────────┘                    │
└─────────────────────────────────────────┘

Result: Last trains removed in reverse order
Form value: "Train A"
```

---

## Keyboard Navigation Demo

### Arrow Key Navigation

```
Initial State:
┌─────────────────────────────────────────┐
│ 🚂 express                    🔼        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Rajdhani Express             #12301     │ ← Not highlighted
│ New Delhi → Mumbai                      │
├─────────────────────────────────────────┤
│ Duranto Express              #12213     │
│ Mumbai → New Delhi                      │
├─────────────────────────────────────────┤
│ Gowthami Express             #12737     │
│ Kakinada → Lingampalli                  │
└─────────────────────────────────────────┘

Press Arrow Down ↓
┌─────────────────────────────────────────┐
│ █ Rajdhani Express           #12301 █   │ ← Highlighted
│ █ New Delhi → Mumbai                █   │
├─────────────────────────────────────────┤
│ Duranto Express              #12213     │
│ Mumbai → New Delhi                      │
├─────────────────────────────────────────┤
│ Gowthami Express             #12737     │
│ Kakinada → Lingampalli                  │
└─────────────────────────────────────────┘

Press Arrow Down ↓ again
┌─────────────────────────────────────────┐
│ Rajdhani Express             #12301     │
│ New Delhi → Mumbai                      │
├─────────────────────────────────────────┤
│ █ Duranto Express            #12213 █   │ ← Highlighted
│ █ Mumbai → New Delhi                █   │
├─────────────────────────────────────────┤
│ Gowthami Express             #12737     │
│ Kakinada → Lingampalli                  │
└─────────────────────────────────────────┘

Press Enter ⏎
┌─────────────────────────────────────────┐
│ ┌───────────────────────────────┐       │
│ │ Duranto Express (12213)     ✕ │       │ ← Selected!
│ └───────────────────────────────┘       │
├─────────────────────────────────────────┤
│ 🚂 Add another train...       🔽        │ ← Dropdown closed
└─────────────────────────────────────────┘
```

---

## Chip States

### Normal Chip
```
┌─────────────────────────────┐
│ Rajdhani Express (12301)  ✕ │
└─────────────────────────────┘
Background: Deep Blue (#1e40af)
Text: White
```

### Hovered Chip
```
┌─────────────────────────────┐
│ Rajdhani Express (12301)  ✕ │ ← Mouse over
└─────────────────────────────┘
Background: Medium Blue (lighter)
Cursor: Pointer
Transition: Smooth
```

### Long Train Name (Truncated)
```
┌─────────────────────────────────────┐
│ Very Long Train Name That Doesn... ✕│
└─────────────────────────────────────┘
Max width: ~300px
Overflow: Ellipsis (...)
Full name shown on hover (via title attribute)
```

### Remove Button Hover
```
┌─────────────────────────────┐
│ Rajdhani Express (12301)  ⊗ │ ← X button hovered
└─────────────────────────────┘
X button background: White with opacity
X button becomes more prominent
Cursor: Pointer
```

---

## Responsive Behavior

### Desktop View (Wide Screen)
```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│ │ Train A   ✕ │ │ Train B   ✕ │ │ Train C   ✕ │          │
│ └─────────────┘ └─────────────┘ └─────────────┘          │
│ ┌─────────────┐ ┌─────────────┐                          │
│ │ Train D   ✕ │ │ Train E   ✕ │                          │
│ └─────────────┘ └─────────────┘                          │
└───────────────────────────────────────────────────────────┘
Chips displayed in rows, wrapping naturally
```

### Mobile View (Narrow Screen)
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │ Train A             ✕   │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Train B             ✕   │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Train C             ✕   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
Chips stack vertically on small screens
Full width for better touch targets
```

---

## Edge Cases Visualization

### Empty Input + Enter (Does Nothing)
```
Before:
┌─────────────────────────────┐
│ 🚂 |                    🔽  │ ← Empty, user presses Enter
└─────────────────────────────┘

After:
┌─────────────────────────────┐
│ 🚂 |                    🔽  │ ← No change
└─────────────────────────────┘
No empty chip added
```

### Trying to Add Duplicate
```
Current selections:
┌─────────────────────────────┐
│ ┌───────────────────────┐   │
│ │ Rajdhani Exp (12301) ✕│   │
│ └───────────────────────┘   │
└─────────────────────────────┘

User types "12301" and sees:
┌─────────────────────────────┐
│ 🚂 12301              🔽    │
└─────────────────────────────┘
┌─────────────────────────────┐
│ No trains found.            │ ← Already filtered out
│ Press Enter to add...       │
└─────────────────────────────┘

If user adds as custom text:
┌─────────────────────────────┐
│ ┌───────────────────────┐   │
│ │ Rajdhani Exp (12301) ✕│   │ ← Original stays
│ └───────────────────────┘   │
└─────────────────────────────┘
Silently ignored (duplicate detection)
```

### Loading State
```
┌─────────────────────────────┐
│ Preferred Trains (Optional) │
├─────────────────────────────┤
│ 🚂 🔄 Loading trains...     │ ← Spinner icon
│      (disabled)             │
└─────────────────────────────┘
Input disabled during load
Gray background
Spinner animation
```

### Error State
```
┌─────────────────────────────┐
│ Preferred Trains (Optional) │
├─────────────────────────────┤
│ 🚂 Search trains...    🔽   │
└─────────────────────────────┘
│ ⚠️ Could not load train data│
│ You can still type train    │
│ information manually.       │
└─────────────────────────────┘
Warning message (amber color)
Functionality still works
Manual entry allowed
```

---

## Form Submission Flow

### Visual Representation

```
User's View:
┌─────────────────────────────────────────┐
│ ┌───────────────────┐ ┌──────────────┐ │
│ │ Train A         ✕ │ │ Train B    ✕ │ │
│ └───────────────────┘ └──────────────┘ │
│ ┌───────────────────┐                  │
│ │ Train C         ✕ │                  │
│ └───────────────────┘                  │
└─────────────────────────────────────────┘

Form Data (Hidden):
{
  "preferred_trains": "Train A, Train B, Train C"
}

Sent to Admin:
Subject: New Train Booking Request
Preferred Trains: Train A, Train B, Train C

Admin View:
┌─────────────────────────────────────────┐
│ Booking #12345                          │
│ Preferred Trains:                       │
│ • Train A                               │
│ • Train B                               │
│ • Train C                               │
└─────────────────────────────────────────┘
```

---

## Color Scheme

### Chip Colors
```
┌─────────────────────────────┐
│ Selected Train            ✕ │ Background: #1e40af (travel-blue-dark)
└─────────────────────────────┘ Text: #ffffff (white)
                                 X icon: #ffffff (white)

On hover:
┌─────────────────────────────┐
│ Selected Train            ✕ │ Background: #3b82f6 (travel-blue-medium)
└─────────────────────────────┘

Remove button hover:
┌─────────────────────────────┐
│ Selected Train            ⊗ │ X background: rgba(255,255,255,0.2)
└─────────────────────────────┘
```

### Container Colors
```
Chips Container:
Background: #f9fafb (gray-50)
Border: #e5e7eb (gray-200)

Dropdown:
Background: #ffffff (white)
Border: #d1d5db (gray-300)
Highlighted: #1e40af (travel-blue-dark)

Input:
Normal: #ffffff (white)
Border: #d1d5db (gray-300)
Focus ring: #1e40af (travel-blue-dark)
```

---

## Animation & Transitions

### Chip Add Animation
```
Frame 1: (invisible)
Frame 2: Scale from 0.8 → 1.0
Frame 3: Fade in opacity 0 → 1
Duration: 150ms
Easing: ease-out
```

### Chip Remove Animation
```
Frame 1: Full size
Frame 2: Scale 1.0 → 0.8
Frame 3: Fade out opacity 1 → 0
Frame 4: Removed from DOM
Duration: 150ms
Easing: ease-in
```

### Hover Transitions
```
All hover effects:
Duration: 200ms
Easing: ease-in-out
Properties: background-color, transform
```

---

## Accessibility Indicators

### Focus States
```
Input focused:
┌─────────────────────────────┐
│ 🚂 Search...          🔽    │ ← Blue ring visible
└─────────────────────────────┘
Ring: 2px solid #1e40af
Offset: 2px

Remove button focused:
┌─────────────────────────────┐
│ Train Name            ⊗     │ ← Ring around X
└─────────────────────────────┘
Ring: 2px solid rgba(255,255,255,0.5)
```

### ARIA Labels
```html
<button aria-label="Remove Rajdhani Express (12301)">
  <X size={14} />
</button>
```

Screen reader announces:
"Remove Rajdhani Express (12301), button"

---

## Complete User Journey

```
┌────────────────────────────────────────────────────┐
│ Step 1: User arrives at booking page               │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 2: Selects "Train Ticket" booking type       │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 3: Fills From/To/Date fields                 │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 4: Scrolls to "Preferred Trains" field       │
│ Sees: 🚂 Search by train number...                │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 5: Types "12737"                             │
│ Dropdown shows: Gowthami SF Express                │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 6: Presses Enter or clicks                   │
│ Chip appears: [Gowthami SF Express (12737) ✕]     │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 7: Input clears, types "rajdhani"            │
│ Dropdown shows multiple Rajdhani trains            │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 8: Selects Rajdhani Express (12301)          │
│ Second chip appears                                │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 9: Types custom text "Any morning train"     │
│ Presses Enter                                      │
│ Third chip appears                                 │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 10: Reviews all 3 chips                      │
│ Decides to remove first one                        │
│ Clicks X on Gowthami SF Express                   │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 11: Now has 2 trains selected                │
│ • Rajdhani Express (12301)                         │
│ • Any morning train                                │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 12: Completes other form fields              │
│ Clicks Submit button                               │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 13: Form submitted with data:                │
│ preferred_trains: "Rajdhani Express (12301),       │
│                    Any morning train"              │
└───────────┬────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────┐
│ Step 14: Success! All fields reset                │
│ Chips cleared, ready for next booking              │
└────────────────────────────────────────────────────┘
```

---

**Visual Guide Summary**

This guide demonstrates the complete visual and interaction design of the multi-select train autocomplete feature. All UI states, user flows, and edge cases are covered with ASCII art representations for clarity.

**Key Takeaway:** The interface is intuitive, accessible, and provides clear visual feedback for all user actions.
