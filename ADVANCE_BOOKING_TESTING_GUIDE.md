# 🧪 Advance Booking - Testing Guide

## ✅ Pre-Testing Checklist

Before starting tests, ensure:
- [ ] Development server is running
- [ ] Firebase connection is active
- [ ] Admin credentials are ready
- [ ] Test user account available
- [ ] Browser console is open for error monitoring

---

## 🔍 Test Scenarios

### **Test Suite 1: User Interface**

#### Test 1.1: Toggle Visibility
**Steps:**
1. Navigate to booking page
2. Select different booking types

**Expected Results:**
- ✅ Toggle appears ONLY for "Train Ticket" booking
- ✅ Toggle is hidden for Bus, Flight, and Cab bookings
- ✅ Toggle is in default OFF state initially

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.2: Toggle Interaction
**Steps:**
1. Select "Train Ticket"
2. Click the toggle switch
3. Click again to turn off
4. Click again to turn on

**Expected Results:**
- ✅ Toggle switches smoothly from OFF → ON
- ✅ Background changes from gray to orange gradient
- ✅ Switch moves from left to right with animation
- ✅ Checkmark appears in ON state
- ✅ Label changes from "Regular Booking" to "Advance Booking"
- ✅ Status text changes from "Standard" to "Active"
- ✅ Info badge appears when ON
- ✅ All animations are smooth (300ms transition)

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.3: Toggle Reset on Booking Type Change
**Steps:**
1. Select "Train Ticket"
2. Enable advance booking toggle
3. Switch to "Bus Ticket"
4. Switch back to "Train Ticket"

**Expected Results:**
- ✅ Toggle resets to OFF when switching away from train
- ✅ Toggle is OFF when returning to train
- ✅ No info badge visible

**Status:** [ ] Pass [ ] Fail

---

### **Test Suite 2: Form Submission**

#### Test 2.1: Submit Regular Train Booking
**Steps:**
1. Select "Train Ticket"
2. Keep toggle OFF (Regular Booking)
3. Fill all required fields:
   - Name: "Test User"
   - Phone: "9876543210"
   - Email: "test@example.com"
   - From: "Mumbai"
   - To: "Delhi"
   - Journey Date: (future date)
   - Add passenger details
4. Submit form

**Expected Results:**
- ✅ Form submits successfully
- ✅ Success message appears
- ✅ Form resets
- ✅ Toggle resets to OFF
- ✅ Check Firebase: `advance_booking: false` or undefined

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.2: Submit Advance Train Booking
**Steps:**
1. Select "Train Ticket"
2. Enable toggle (Advance Booking)
3. Fill all required fields:
   - Name: "Test User Advance"
   - Phone: "9876543211"
   - Email: "testadvance@example.com"
   - From: "Chennai"
   - To: "Bangalore"
   - Journey Date: (future date)
   - Add passenger details
4. Submit form

**Expected Results:**
- ✅ Form submits successfully
- ✅ Success message appears
- ✅ Form resets
- ✅ Toggle resets to OFF
- ✅ Check Firebase: `advance_booking: true`

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.3: Multiple Submissions
**Steps:**
1. Submit 2 regular bookings (toggle OFF)
2. Submit 3 advance bookings (toggle ON)
3. Submit 1 more regular booking

**Expected Results:**
- ✅ All 6 bookings submitted successfully
- ✅ Toggle resets after each submission
- ✅ Check Firebase:
  - 3 bookings with `advance_booking: true`
  - 3 bookings with `advance_booking: false` or undefined

**Status:** [ ] Pass [ ] Fail

---

### **Test Suite 3: Admin Dashboard**

#### Test 3.1: Filter Dropdown
**Steps:**
1. Login to admin dashboard
2. Navigate to Bookings tab
3. Click status filter dropdown

**Expected Results:**
- ✅ Dropdown shows all options including "Advance Booking"
- ✅ "Advance Booking" is at the bottom of the list
- ✅ Dropdown is functional

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.2: Filter - All Statuses
**Steps:**
1. In admin dashboard → Bookings
2. Select "All Statuses" filter
3. Observe booking list

**Expected Results:**
- ✅ All bookings are visible (regular + advance)
- ✅ Advance bookings show "🚀 Advance" badge
- ✅ Regular bookings show no special badge
- ✅ Count matches total bookings

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.3: Filter - Advance Booking Only
**Steps:**
1. In admin dashboard → Bookings
2. Select "Advance Booking" filter
3. Observe booking list

**Expected Results:**
- ✅ Only advance bookings are displayed
- ✅ All displayed bookings have "🚀 Advance" badge
- ✅ Regular bookings are hidden
- ✅ Count matches number of advance bookings

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.4: Filter - Other Status Filters
**Steps:**
1. Select "Pending" filter
2. Select "Payment Done" filter
3. Select "In Process" filter
4. Select "Booked" filter
5. Select "Hold" filter

**Expected Results:**
- ✅ Each filter works correctly
- ✅ Advance bookings appear in these filters if they match the status
- ✅ Badge remains visible on advance bookings
- ✅ No errors in console

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.5: Badge Visibility
**Steps:**
1. View booking list in admin
2. Identify advance bookings
3. Check both mobile and desktop views

**Expected Results:**
- ✅ Badge appears on all advance bookings
- ✅ Badge shows "🚀 Advance" text
- ✅ Badge has orange gradient background
- ✅ Badge is visible in mobile view
- ✅ Badge is visible in desktop view
- ✅ Badge positioning is correct

**Status:** [ ] Pass [ ] Fail

---

### **Test Suite 4: Combined Filters**

#### Test 4.1: Booking Type + Advance Booking
**Steps:**
1. Select "Train" from booking type filter
2. Select "Advance Booking" from status filter

**Expected Results:**
- ✅ Shows only train bookings that are advance bookings
- ✅ All results have both "Train" badge and "🚀 Advance" badge
- ✅ Count is accurate

**Status:** [ ] Pass [ ] Fail

---

#### Test 4.2: Date Filter + Advance Booking
**Steps:**
1. Select a date filter (e.g., "Today")
2. Select "Advance Booking" from status filter

**Expected Results:**
- ✅ Shows only advance bookings for selected date
- ✅ Filters work together correctly
- ✅ No conflicts

**Status:** [ ] Pass [ ] Fail

---

#### Test 4.3: All Filters Combined
**Steps:**
1. Select "Train" from booking type filter
2. Select "Advance Booking" from status filter
3. Select "Today" from date filter

**Expected Results:**
- ✅ Shows only train advance bookings for today
- ✅ All three filters work together
- ✅ Results are accurate

**Status:** [ ] Pass [ ] Fail

---

### **Test Suite 5: Edge Cases**

#### Test 5.1: Empty State
**Steps:**
1. Select "Advance Booking" filter
2. (Assuming no advance bookings exist)

**Expected Results:**
- ✅ Shows "No advance booking bookings found" message
- ✅ No errors
- ✅ UI remains stable

**Status:** [ ] Pass [ ] Fail

---

#### Test 5.2: Old Bookings (Backward Compatibility)
**Steps:**
1. View bookings created before this feature
2. Check filter behavior

**Expected Results:**
- ✅ Old bookings (without advance_booking field) display normally
- ✅ Old bookings show no advance badge
- ✅ Old bookings do NOT appear in "Advance Booking" filter
- ✅ No errors or undefined values

**Status:** [ ] Pass [ ] Fail

---

#### Test 5.3: Rapid Toggle Switching
**Steps:**
1. Toggle ON/OFF rapidly 10 times
2. Submit form

**Expected Results:**
- ✅ Toggle handles rapid clicks smoothly
- ✅ Final state is correctly captured
- ✅ Submission uses final toggle state
- ✅ No animation glitches

**Status:** [ ] Pass [ ] Fail

---

#### Test 5.4: Form Validation with Toggle
**Steps:**
1. Enable advance booking toggle
2. Try to submit form with missing required fields
3. Fix validation errors
4. Submit

**Expected Results:**
- ✅ Form validation works normally
- ✅ Toggle state persists during validation errors
- ✅ Successful submission includes toggle state

**Status:** [ ] Pass [ ] Fail

---

### **Test Suite 6: Mobile Responsiveness**

#### Test 6.1: Mobile Toggle Display
**Device:** iPhone/Android (< 768px)
**Steps:**
1. Open booking page on mobile
2. Select "Train Ticket"
3. Interact with toggle

**Expected Results:**
- ✅ Toggle is fully visible
- ✅ Toggle is touch-friendly
- ✅ Animations work smoothly
- ✅ Text is readable
- ✅ Info badge displays correctly

**Status:** [ ] Pass [ ] Fail

---

#### Test 6.2: Mobile Admin View
**Device:** iPhone/Android (< 768px)
**Steps:**
1. Login to admin on mobile
2. View bookings with advance badge

**Expected Results:**
- ✅ Badge is visible and readable
- ✅ Badge doesn't break layout
- ✅ Filters work correctly
- ✅ Touch targets are adequate

**Status:** [ ] Pass [ ] Fail

---

### **Test Suite 7: Performance**

#### Test 7.1: Large Dataset
**Steps:**
1. Create 50+ bookings (mix of regular and advance)
2. Apply "Advance Booking" filter
3. Switch between filters rapidly

**Expected Results:**
- ✅ Filter responds quickly (< 1 second)
- ✅ No lag or freezing
- ✅ Memory usage is normal
- ✅ No performance warnings

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.2: Animation Performance
**Steps:**
1. Toggle ON/OFF multiple times
2. Monitor frame rate
3. Check animation smoothness

**Expected Results:**
- ✅ 60 FPS maintained
- ✅ No janky animations
- ✅ Smooth transitions

**Status:** [ ] Pass [ ] Fail

---

### **Test Suite 8: Browser Compatibility**

Test on multiple browsers:

#### Test 8.1: Chrome
- [ ] Toggle works
- [ ] Filters work
- [ ] Badge displays correctly
- [ ] No console errors

#### Test 8.2: Firefox
- [ ] Toggle works
- [ ] Filters work
- [ ] Badge displays correctly
- [ ] No console errors

#### Test 8.3: Safari
- [ ] Toggle works
- [ ] Filters work
- [ ] Badge displays correctly
- [ ] No console errors

#### Test 8.4: Edge
- [ ] Toggle works
- [ ] Filters work
- [ ] Badge displays correctly
- [ ] No console errors

---

### **Test Suite 9: Data Integrity**

#### Test 9.1: Firebase Data Structure
**Steps:**
1. Submit advance booking
2. Check Firebase console

**Expected Results:**
```json
{
  "advance_booking": true,
  "booking_type": "train",
  "name": "Test User",
  // ... other fields
  "status": "pending",
  "created_at": "Timestamp"
}
```
- ✅ Field exists
- ✅ Value is boolean
- ✅ No extra fields added

**Status:** [ ] Pass [ ] Fail

---

#### Test 9.2: Data Query Performance
**Steps:**
1. Query advance bookings from Firebase
2. Measure response time

**Expected Results:**
- ✅ Query completes in < 2 seconds
- ✅ Correct bookings returned
- ✅ No duplicate results

**Status:** [ ] Pass [ ] Fail

---

## 🐛 Bug Report Template

If any test fails, use this template:

```markdown
**Bug ID:** [Auto-increment]
**Test:** [Test number and name]
**Severity:** [Critical/High/Medium/Low]
**Browser:** [Browser and version]
**Device:** [Desktop/Mobile/Tablet]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Copy any error messages]

**Additional Notes:**
[Any other relevant information]
```

---

## 📊 Test Results Summary

### Overall Results
- **Total Tests:** 28
- **Passed:** ____ / 28
- **Failed:** ____ / 28
- **Skipped:** ____ / 28
- **Pass Rate:** _____%

### By Category
| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| User Interface | 3 | ___ | ___ |
| Form Submission | 3 | ___ | ___ |
| Admin Dashboard | 5 | ___ | ___ |
| Combined Filters | 3 | ___ | ___ |
| Edge Cases | 4 | ___ | ___ |
| Mobile Responsive | 2 | ___ | ___ |
| Performance | 2 | ___ | ___ |
| Browser Compat | 4 | ___ | ___ |
| Data Integrity | 2 | ___ | ___ |

---

## ✅ Sign-off

**Tested By:** _______________  
**Date:** _______________  
**Status:** [ ] Approved [ ] Needs Review [ ] Rejected  
**Notes:**

---

## 🔄 Regression Testing

After any code changes, re-run:
- [ ] Test Suite 2 (Form Submission)
- [ ] Test Suite 3 (Admin Dashboard)
- [ ] Test Suite 9 (Data Integrity)

---

## 📝 Additional Testing Notes

### Accessibility Testing (Optional)
- [ ] Screen reader compatibility
- [ ] Keyboard-only navigation
- [ ] Color contrast ratios
- [ ] ARIA labels

### Security Testing (Optional)
- [ ] Input sanitization
- [ ] Firebase security rules
- [ ] Data validation
- [ ] XSS prevention

---

**Testing Guide Complete** ✅

Use this guide to thoroughly test the advance booking feature before deploying to production.
