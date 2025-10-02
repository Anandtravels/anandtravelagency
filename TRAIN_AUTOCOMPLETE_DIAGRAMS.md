# Train Autocomplete - Visual Flow Diagram

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Booking.tsx (Page)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Train Booking Form                         │  │
│  │                                                       │  │
│  │  [From Station] ◄── StationAutocomplete              │  │
│  │  [To Station]   ◄── StationAutocomplete              │  │
│  │  [Journey Date] ◄── Date Input                       │  │
│  │  [Booking Type] ◄── Select Dropdown                  │  │
│  │  [Train Class]  ◄── Select Dropdown                  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  [Preferred Trains] ◄── TrainAutocomplete     │  │  │
│  │  │                                                │  │  │
│  │  │  State: preferredTrains                       │  │  │
│  │  │  onChange: setPreferredTrains + setValue      │  │  │
│  │  │  Data Source: /public/trains_numbers.json     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  [Submit Button]                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────┐
│   User      │
│   Types:    │
│  "12737"    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│   TrainAutocomplete Component       │
│                                     │
│   1. handleInputChange()            │
│   2. Filter trains array            │
│   3. Show dropdown                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Dropdown Renders                  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Gowthami SF Express  #12737 │◄─── Highlighted
│   │ Kakinada Port → Lingampalli │  │
│   └─────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   User Selects (Click/Enter)       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   handleSelectTrain()               │
│   - Format: "Name (Number)"         │
│   - Update input value              │
│   - Call onChange handler           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Booking.tsx State Update          │
│   - setPreferredTrains(value)       │
│   - setValue("preferred_trains")    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Form Submission                   │
│   - Include preferred_trains        │
│   - Send to Firebase                │
│   - Admin receives data             │
└─────────────────────────────────────┘
```

## Component Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│                    COMPONENT MOUNT                         │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  useEffect()          │
         │  Load JSON            │
         │  /trains_numbers.json │
         └───────┬───────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │  Parse JSON           │
         │  Convert to Array     │
         │  Set trains state     │
         └───────┬───────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │  Ready for Input      │
         └───────────────────────┘
```

## Search Algorithm

```
Input: "kaki"
  │
  ▼
┌─────────────────────────────────────┐
│ Filter trains array where:          │
│ - train.number contains "kaki"  OR  │
│ - train.name contains "kaki"    OR  │
│ - train.from contains "kaki"    OR  │
│ - train.to contains "kaki"          │
│ (case-insensitive)                  │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Results:     │
    │ - 12775      │
    │ - 12776      │
    │ (Kakinada)   │
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Limit to 50  │
    │ for speed    │
    └──────────────┘
```

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER ACTIONS                           │
└─────────────────────────────────────────────────────────────┘

1. CLICK FIELD
   │
   ├─► Input focuses
   ├─► Cursor appears
   └─► Ready for typing

2. TYPE CHARACTER
   │
   ├─► handleInputChange()
   ├─► Filter trains
   ├─► Show dropdown
   └─► Display results

3. NAVIGATE (Keyboard)
   │
   ├─► Arrow Down → highlightedIndex++
   ├─► Arrow Up → highlightedIndex--
   ├─► Enter → Select train
   └─► Escape → Close dropdown

4. NAVIGATE (Mouse)
   │
   ├─► onMouseEnter → Set highlighted
   └─► onClick → Select train

5. SELECT TRAIN
   │
   ├─► Format value
   ├─► Update input
   ├─► Update form
   └─► Close dropdown

6. SUBMIT FORM
   │
   ├─► Validate fields
   ├─► Send to Firebase
   ├─► Show success
   └─► Reset all fields
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                 TrainAutocomplete States                    │
├─────────────────────────────────────────────────────────────┤
│  trains: Train[]           ← Loaded from JSON               │
│  isLoading: boolean        ← true during fetch              │
│  loadError: string | null  ← Error message if load fails    │
│  inputValue: string        ← Current input text             │
│  isOpen: boolean           ← Dropdown visible?              │
│  highlightedIndex: number  ← Currently highlighted item     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Booking.tsx States                       │
├─────────────────────────────────────────────────────────────┤
│  preferredTrains: string   ← Selected train value           │
│  trainFromStation: string  ← From station (StationAC)       │
│  trainToStation: string    ← To station (StationAC)         │
│  bookingType: string       ← train/bus/flight/cab           │
│  passengerCount: number    ← Number of passengers           │
│  ...                       ← Other form fields              │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              React Hook Form (useForm)                      │
├─────────────────────────────────────────────────────────────┤
│  register()    ← Register form fields                       │
│  setValue()    ← Programmatically set values                │
│  reset()       ← Clear all form values                      │
│  handleSubmit()← Form submission handler                    │
│  errors        ← Validation errors                          │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌────────────────────────────────────────┐
│  Fetch trains_numbers.json             │
└─────────────┬──────────────────────────┘
              │
              ├───► SUCCESS
              │     │
              │     ├─► Parse JSON
              │     ├─► Set trains array
              │     └─► Enable autocomplete
              │
              └───► FAILURE
                    │
                    ├─► Set loadError
                    ├─► Show warning message
                    ├─► Allow manual entry
                    └─► Page continues working
```

## Dropdown Rendering Logic

```
Conditions for dropdown to show:
  │
  ├─► isOpen === true
  ├─► isLoading === false
  ├─► loadError === null
  └─► filteredTrains.length > 0
      │
      └─► YES → Render dropdown
      │
      └─► NO → Check if inputValue exists
              │
              └─► YES → Show "No results" message
              │
              └─► NO → Show nothing
```

## Form Reset Flow

```
Form Submitted Successfully
  │
  ├─► reset() ← Clear react-hook-form
  ├─► setPassengerCount(1)
  ├─► setPassengers([...])
  ├─► setTrainFromStation("")
  ├─► setTrainToStation("")
  ├─► setPreferredTrains("") ◄─── NEW
  └─► clearAppliedCoupon()
      │
      └─► All fields cleared ✓
```

## Keyboard Event Handling

```
Key Pressed
  │
  ├─► ArrowDown
  │   └─► highlightedIndex = Math.min(index + 1, maxIndex)
  │
  ├─► ArrowUp
  │   └─► highlightedIndex = Math.max(index - 1, 0)
  │
  ├─► Enter
  │   └─► Select filteredTrains[highlightedIndex]
  │
  ├─► Escape
  │   └─► setIsOpen(false)
  │
  └─► Tab
      └─► setIsOpen(false) + Move to next field
```

## Visual States

```
┌─────────────────────────────────────────────────────────────┐
│                     LOADING STATE                           │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🔄 Loading trains...                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      NORMAL STATE                           │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🚂 Search by train number or name...    🔽         │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Rajdhani Express              #12301               │    │
│  │ New Delhi → Mumbai Central                         │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Rajdhani Express              #12302               │◄─ Hover
│  │ Mumbai Central → New Delhi                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   HIGHLIGHTED STATE                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🚂 rajd                                  🔽         │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ █ Rajdhani Express            #12301 █            │◄─ Selected
│  │ █ New Delhi → Mumbai Central           █            │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Rajdhani Express              #12302               │    │
│  │ Mumbai Central → New Delhi                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ERROR STATE                            │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🚂 Search trains...                      🔽         │    │
│  └────────────────────────────────────────────────────┘    │
│  ⚠️ Could not load train data. You can still type      │    │
│     the train information manually.                     │    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   NO RESULTS STATE                          │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🚂 zzzzz                                 🔽         │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │           No trains found. You can still           │    │
│  │        type the train information manually.        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## File Dependencies

```
TrainAutocomplete.tsx
  │
  ├─► Imports
  │   ├─► react (useState, useEffect, useRef, useMemo)
  │   └─► lucide-react (Train, ChevronDown, Loader2)
  │
  ├─► Fetches
  │   └─► /public/trains_numbers.json
  │
  └─► Used By
      └─► src/pages/Booking.tsx

trains_numbers.json
  │
  ├─► Location: /public/trains_numbers.json
  ├─► Size: ~50KB
  ├─► Format: JSON object
  └─► Contains: 150+ train entries

Booking.tsx
  │
  ├─► Imports TrainAutocomplete
  ├─► Manages preferredTrains state
  ├─► Integrates with react-hook-form
  └─► Submits to Firebase
```

## Summary Diagram

```
┌────────────────────────────────────────────────────────────┐
│  USER INTERFACE                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Preferred Trains (Optional)                     │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │ 🚂 Search trains...              🔽       │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  │  ▼ Dropdown (when typing)                        │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │ Rajdhani Express         #12301           │  │    │
│  │  │ New Delhi → Mumbai                         │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│  COMPONENT LOGIC (TrainAutocomplete.tsx)                   │
│  - Load JSON data                                          │
│  - Filter trains by search term                            │
│  - Handle keyboard/mouse events                            │
│  - Render dropdown with results                            │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│  FORM INTEGRATION (Booking.tsx)                            │
│  - preferredTrains state                                   │
│  - setValue("preferred_trains", value)                     │
│  - Include in form submission                              │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│  FIREBASE / DATABASE                                       │
│  - Store booking with preferred_trains field               │
│  - Admin can view selected train information               │
└────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- `┌─┐` = Container/Component
- `│` = Flow direction
- `▼` = Next step
- `◄─` = Highlighted/Selected
- `█` = Background color (blue)
- `🚂` = Train icon
- `🔽` = Dropdown indicator
- `⚠️` = Warning icon
- `🔄` = Loading spinner
