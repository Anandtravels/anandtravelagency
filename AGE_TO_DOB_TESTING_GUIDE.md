# Age to DOB - Quick Testing Guide

## 🚀 Quick Test Steps

### **1. Test User Booking Form**

**Steps:**
1. Open the booking page (`/booking`)
2. Select "Train Ticket"
3. Fill in journey details
4. Add passenger details:
   - Name: Test User
   - **Age: 25** (type number)
   - Gender: Male
5. Check if DOB appears below age input: "DOB: 01/01/2000"
6. Submit the booking
7. Verify booking success

**Expected Result:**
- ✅ Age input accepts numbers
- ✅ DOB automatically displays below in DD/MM/YYYY format
- ✅ Booking submits successfully
- ✅ No errors in console

---

### **2. Test Admin Dashboard Display**

**Steps:**
1. Login to admin dashboard
2. Go to Bookings tab
3. Find the test booking you just created
4. Expand passenger details
5. Verify passenger information shows:
   - Name (Age yrs, Gender)
   - DOB: DD/MM/YYYY

**Expected Result:**
- ✅ Age is displayed: "Test User (25 yrs, male)"
- ✅ DOB is displayed on new line: "DOB: 01/01/2000"
- ✅ Both mobile and desktop views work
- ✅ Layout looks clean

---

### **3. Test WhatsApp Message**

**Steps:**
1. In admin dashboard, click "WhatsApp" button for the booking
2. Fill in pricing details
3. Click "Send WhatsApp Message"
4. Check the pre-filled message format

**Expected Format:**
```
*Passengers:* 1
   1. Test User (25 yrs, male) - DOB: 01/01/2000
```

**Expected Result:**
- ✅ Age is included in message
- ✅ DOB is included after age
- ✅ Format is clean and readable

---

### **4. Test Edit Booking Modal**

**Steps:**
1. Click "Edit" button on the test booking
2. Check passenger details field shows:
   ```
   Test User (25 yrs, male)
   ```
3. Change age to 30:
   ```
   Test User (30 yrs, male)
   ```
4. Click "Save Changes"
5. Verify booking updated
6. Check passenger display now shows:
   - Age: 30 yrs
   - DOB: 01/01/1995

**Expected Result:**
- ✅ Edit modal opens correctly
- ✅ Passenger format is editable
- ✅ Save updates age and DOB correctly
- ✅ DOB recalculated from new age

---

### **5. Test Other Booking Types (Regression)**

**Steps:**
1. Create a Bus booking
2. Create a Flight booking
3. Create a Cab booking
4. Verify all bookings work normally

**Expected Result:**
- ✅ Other booking types unaffected
- ✅ Forms submit successfully
- ✅ Admin dashboard shows all bookings
- ✅ No UI breakage

---

### **6. Test Edge Cases**

**Test A: Empty Age**
1. Try to submit booking without entering age
2. **Expected:** Validation error - "Age is required"

**Test B: Invalid Age (negative)**
1. Try to enter age: -5
2. **Expected:** Input rejects or shows error

**Test C: Invalid Age (too high)**
1. Try to enter age: 150
2. **Expected:** Input accepts but shows validation error

**Test D: Legacy Booking (no DOB)**
1. View an old booking that doesn't have DOB field
2. **Expected:** Shows age only, no DOB line, no errors

**Test E: Date Parsing Error**
1. Manually add invalid DOB in database: "invalid-date"
2. View booking in admin
3. **Expected:** Shows age, DOB not displayed, no crashes

---

## ✅ Success Criteria

All tests should pass with these results:
- ✅ Age input works in booking form
- ✅ DOB calculates and displays correctly
- ✅ Admin dashboard shows both age and DOB
- ✅ WhatsApp messages include DOB
- ✅ Edit modal updates DOB when age changes
- ✅ Other booking types work normally
- ✅ No console errors
- ✅ No UI breakage
- ✅ Edge cases handled gracefully

---

## 🐛 If Issues Found

### **Issue: DOB not showing in booking form**
**Fix:** Check if age is entered correctly (non-empty, valid number)

### **Issue: DOB format wrong**
**Fix:** Verify formatDateToDDMMYYYY function is working

### **Issue: Admin dashboard not showing DOB**
**Fix:** Check if passenger.dob exists in database

### **Issue: Edit saves wrong DOB**
**Fix:** Verify calculateDOBFromAge calculation logic

### **Issue: WhatsApp message missing DOB**
**Fix:** Check formatPassengerInfo function in use-whatsapp-modal.ts

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

[ ] User Booking Form - Age Input
[ ] User Booking Form - DOB Display
[ ] User Booking Form - Submission
[ ] Admin Dashboard - Age Display
[ ] Admin Dashboard - DOB Display
[ ] WhatsApp Message - Format
[ ] Edit Modal - Age Change
[ ] Edit Modal - DOB Update
[ ] Bus Booking - Works
[ ] Flight Booking - Works
[ ] Cab Booking - Works
[ ] Edge Case - Empty Age
[ ] Edge Case - Invalid Age
[ ] Edge Case - Legacy Booking
[ ] Edge Case - Date Parse Error

Overall Status: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Quick Checklist

Before deploying to production:

- [ ] All user booking forms tested
- [ ] All admin dashboard views tested
- [ ] WhatsApp messages verified
- [ ] Edit modal functionality verified
- [ ] Other booking types still work
- [ ] Edge cases handled
- [ ] No console errors
- [ ] Mobile view tested
- [ ] Desktop view tested
- [ ] Performance is good (no slowdowns)

---

✅ **Ready for Testing!**
