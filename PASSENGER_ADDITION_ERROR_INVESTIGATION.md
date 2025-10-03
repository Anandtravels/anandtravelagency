# Passenger Addition Error Investigation

## Issue Analysis

When adding a new passenger in the Edit Booking Modal, the passenger is not being added and no clear error is shown.

## Root Cause

The regex pattern in `use-edit-booking-modal.ts` (line 93) is **too strict** and silently rejects passengers that don't match the exact format:

```typescript
const match = line.match(/^(.+?)\s*\((\d+)\s*yrs?,\s*(\w+)\)$/i);
```

### What This Regex Requires:
1. **Name** - Any characters (captured)
2. **Opening parenthesis** with optional spaces before it
3. **Age** - Must be digits only (captured)
4. **Literal text** "yrs" or "yr" 
5. **Comma and space** - Required
6. **Gender** - Word characters only (captured)
7. **Closing parenthesis** at the end

### Common User Input Errors That Cause Silent Failure:

| User Input | Why It Fails | Result |
|------------|--------------|--------|
| `John Doe (30, male)` | Missing "yrs" | Rejected (null) |
| `John Doe (30 years, male)` | "years" instead of "yrs" | Rejected (null) |
| `John Doe (thirty yrs, male)` | Age is not numeric | Rejected (null) |
| `John Doe (30yrs, male)` | No space before "yrs" | **Accepted** ✅ |
| `John Doe (30 yrs,male)` | No space after comma | Rejected (null) |
| `John Doe (30 yrs, Male)` | Capital M | **Accepted** ✅ (converted to lowercase) |

## Problems Identified

### 1. **Silent Failure**
```typescript
return null; // No error shown to user
}).filter(p => p !== null); // Silently removed
```

When a passenger doesn't match the format:
- Returns `null`
- Filtered out silently
- **No error message**
- **No indication why passenger wasn't added**
- User thinks it's a bug

### 2. **No Validation Feedback**
The textarea has no live validation showing:
- Which passengers are valid
- Which passengers have errors
- What the correct format should be

### 3. **Regex Too Strict**
Common variations that should work but don't:
- Missing "yrs" text
- Using "years" instead of "yrs"
- Missing space after comma
- Extra spaces in various places

## Solution Required

### Option 1: More Lenient Regex (Recommended)
Make the regex accept more formats:
```typescript
// Accept: "Name (Age yrs, Gender)" or "Name (Age, Gender)" or "Name (Age Gender)"
const match = line.match(/^(.+?)\s*\(?\s*(\d+)\s*(?:yrs?|years?)?\s*[,\s]+\s*(\w+)\s*\)?$/i);
```

### Option 2: Better Error Handling
Show validation errors for rejected passengers:
```typescript
if (!match) {
  toast({
    title: "Invalid Passenger Format",
    description: `Line "${line}" doesn't match format: Name (Age yrs, Gender)`,
    variant: "destructive"
  });
  return null;
}
```

### Option 3: Live Validation (Best UX)
Add real-time validation in the textarea:
- Show green checkmark for valid passengers
- Show red X for invalid passengers
- Show format hint below textarea
- Highlight invalid lines

## Testing Scenarios

### Test Case 1: Add passenger with missing "yrs"
**Input:** `John Doe (30, male)`
**Current Result:** Silently rejected ❌
**Expected:** Should accept or show error

### Test Case 2: Add passenger with "years" instead
**Input:** `John Doe (30 years, male)`
**Current Result:** Silently rejected ❌
**Expected:** Should accept or show error

### Test Case 3: Add passenger with no space after comma
**Input:** `John Doe (30 yrs,male)`
**Current Result:** Silently rejected ❌
**Expected:** Should accept or show error

### Test Case 4: Add valid passenger
**Input:** `John Doe (30 yrs, male)`
**Current Result:** Accepted ✅
**Expected:** Works correctly

## Recommended Fix

Implement **Option 1 + Option 2**:
1. Make regex more lenient to accept common variations
2. Add clear error messages for truly invalid formats
3. Consider adding live validation hints in future
