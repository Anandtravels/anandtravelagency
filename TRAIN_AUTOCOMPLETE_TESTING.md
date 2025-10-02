# Train Autocomplete Testing Guide

## Quick Testing Steps

### 1. Navigate to Booking Page
- Go to: `/booking` or click "Book Now" button
- Ensure "Train Ticket" is selected

### 2. Test Train Autocomplete Field

#### Test A: Search by Train Number
1. Click on "Preferred Trains (Optional)" field
2. Type: `12737`
3. **Expected**: Dropdown shows "Gowthami SF Express" with route info
4. Select the train
5. **Expected**: Field shows "Gowthami SF Express (12737)"

#### Test B: Search by Train Name
1. Clear the field
2. Type: `Rajdhani`
3. **Expected**: Dropdown shows multiple Rajdhani trains
4. Use Arrow Down to navigate
5. Press Enter to select
6. **Expected**: Field fills with selected train

#### Test C: Search by Station Name
1. Clear the field
2. Type: `Kakinada`
3. **Expected**: Shows trains from/to Kakinada
4. Click to select one
5. **Expected**: Field updates correctly

#### Test D: Keyboard Navigation
1. Type any search term
2. Press Arrow Down several times
3. **Expected**: Highlighted item moves down (blue background)
4. Press Arrow Up
5. **Expected**: Highlighted item moves up
6. Press Enter
7. **Expected**: Highlighted train is selected
8. Press Escape (on next search)
9. **Expected**: Dropdown closes

#### Test E: Invalid Search
1. Type: `zzzzz`
2. **Expected**: Shows "No trains found. You can still type the train information manually."
3. Type free text
4. **Expected**: Field accepts manual entry

### 3. Test Form Submission

1. Fill in all required fields:
   - From: Select a station
   - To: Select a station
   - Journey Date: Select future date
   - Passengers: Enter count
   - Booking Type: Select type
   - Class: Select class
   - Preferred Trains: Search and select a train

2. Click "Submit Booking"
3. **Expected**: 
   - Form submits successfully
   - Success message appears
   - All fields reset including Preferred Trains

### 4. Test Other Booking Types

1. Click "Bus Ticket" button
2. **Expected**: Preferred Trains field should NOT appear
3. Click "Flight Ticket"
4. **Expected**: Preferred Trains field should NOT appear
5. Click "Cab Service"
6. **Expected**: Preferred Trains field should NOT appear
7. Click "Train Ticket" again
8. **Expected**: Preferred Trains field reappears and is empty

### 5. Test Error Handling (Optional)

**Simulate JSON Load Failure:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Right-click on trains_numbers.json request → Block request URL
4. Refresh page and try autocomplete
5. **Expected**: Shows warning "Could not load train data" but field still works for manual entry

---

## Test Results Checklist

### Functionality Tests
- [ ] Train data loads when field is focused
- [ ] Can search by train number (e.g., "12737")
- [ ] Can search by train name (e.g., "Rajdhani")
- [ ] Can search by station name (e.g., "Kakinada")
- [ ] Dropdown shows train name, route, and number
- [ ] Arrow keys navigate through results
- [ ] Enter key selects highlighted train
- [ ] Escape key closes dropdown
- [ ] Mouse click selects train
- [ ] Selected train fills field with "Name (Number)" format

### Integration Tests
- [ ] Field appears only for Train Booking type
- [ ] Field does NOT appear for Bus/Flight/Cab bookings
- [ ] Form submission includes preferred_trains data
- [ ] Field resets when switching booking types
- [ ] Field resets after successful form submission
- [ ] No console errors in browser

### UI/UX Tests
- [ ] Loading spinner appears while loading data
- [ ] Dropdown is visually aligned with input
- [ ] Highlighted item has clear visual feedback
- [ ] Train number appears in colored badge
- [ ] Route information is readable
- [ ] Dropdown scrolls smoothly
- [ ] Component matches site design

### Error Handling Tests
- [ ] Shows warning if JSON fails to load
- [ ] Allows manual text entry on load failure
- [ ] Shows "No results" message for invalid searches
- [ ] No page crashes or JavaScript errors

### Mobile Tests (If available)
- [ ] Field works on mobile devices
- [ ] Dropdown is touch-friendly
- [ ] Keyboard appears correctly
- [ ] Selection works with touch

---

## Common Issues & Solutions

### Issue 1: Dropdown doesn't appear
**Check:**
- Browser console for errors
- Network tab - is trains_numbers.json loading?
- File exists at: `public/trains_numbers.json`

### Issue 2: No search results
**Check:**
- Type at least 1 character
- Check JSON file has correct structure
- Verify train data is loaded (console.log)

### Issue 3: Selection doesn't work
**Check:**
- onChange handler is connected
- setValue is updating form
- Hidden input has register() call

### Issue 4: Field doesn't reset
**Check:**
- setPreferredTrains("") is called on reset
- Form reset() is called
- State variable is properly cleared

---

## Sample Test Data

### Valid Train Numbers to Test:
- `12737` - Gowthami SF Express
- `12738` - Gowthami SF Express (return)
- `12775` - Cocanada AC Express
- `12776` - Cocanada AC Express (return)
- `20805` - Andhra Pradesh Express
- `20806` - Andhra Pradesh Express (return)

### Valid Train Names to Test:
- `Rajdhani` - Shows multiple Rajdhani trains
- `Express` - Shows many express trains
- `Gowthami` - Shows Gowthami SF Express trains
- `Cocanada` - Shows Cocanada AC Express

### Valid Station Names to Test:
- `Kakinada` - Shows trains from/to Kakinada
- `Visakhapatnam` - Shows trains from/to VSKP
- `Secunderabad` - Shows trains from/to SC
- `Delhi` - Shows trains from/to Delhi stations

---

## Performance Notes

- First load takes ~100-200ms (loading JSON)
- Subsequent searches are instant (data cached)
- Max 50 results shown (performance optimized)
- Dropdown renders smoothly even with many results

---

## Success Criteria

✅ **Implementation is successful if:**
1. Users can search trains by number or name
2. Autocomplete shows relevant suggestions quickly
3. Selection works via keyboard or mouse
4. Selected train is properly submitted with form
5. Field resets correctly after submission
6. No errors in console
7. Other booking types work normally
8. UI looks polished and professional

---

## Next Steps After Testing

1. **If tests pass**: Implementation is complete ✅
2. **If issues found**: 
   - Note the specific issue
   - Check browser console for errors
   - Review the troubleshooting section in main documentation
   - Fix and re-test

---

## Questions to Answer During Testing

1. Does the autocomplete feel fast and responsive? **[ YES / NO ]**
2. Are the search results accurate and relevant? **[ YES / NO ]**
3. Is the dropdown visually appealing? **[ YES / NO ]**
4. Does keyboard navigation feel natural? **[ YES / NO ]**
5. Does it match the rest of the site's design? **[ YES / NO ]**
6. Would you be comfortable using this feature? **[ YES / NO ]**

If all answers are YES, the implementation is successful! 🎉
