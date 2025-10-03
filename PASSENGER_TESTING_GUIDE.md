# Passenger Addition - Quick Testing Guide

## 🎯 Quick Test Cases

### ✅ Test 1: Standard Format (Should Work)
```
Input: John Doe (30 yrs, male)
Expected: ✅ Added successfully
```

### ✅ Test 2: Without "yrs" (Should Work Now)
```
Input: Jane Smith (25, female)
Expected: ✅ Added successfully
```

### ✅ Test 3: With "years" (Should Work Now)
```
Input: Bob Johnson (40 years, male)
Expected: ✅ Added successfully
```

### ✅ Test 4: No Space After Comma (Should Work Now)
```
Input: Alice Brown (35 yrs,female)
Expected: ✅ Added successfully
```

### ✅ Test 5: Multiple Passengers (Should Work)
```
Input:
John Doe (30 yrs, male)
Jane Smith (25, female)
Bob Johnson (40 years, male)

Expected: ✅ All 3 added successfully
```

### ❌ Test 6: Invalid Format (Should Show Error)
```
Input: This is not a valid format
Expected: ❌ Error toast appears
          Shows: "Line 1: 'This is not a valid format'"
          Provides example of correct format
          Save process stopped
```

### ❌ Test 7: Mix Valid and Invalid (Should Show Error)
```
Input:
John Doe (30 yrs, male)
Invalid Line
Jane Smith (25, female)

Expected: ❌ Error toast appears
          Shows: "Line 2: 'Invalid Line'"
          Save stopped (no passengers added)
          User can fix line 2 and try again
```

---

## 🚀 Testing Steps

### Step 1: Start Application
```bash
npm run dev
```

### Step 2: Navigate to Admin Panel
1. Open browser to `http://localhost:5173`
2. Login as admin
3. Go to "Bookings" tab

### Step 3: Edit Existing Booking
1. Click "Edit" on any booking
2. Scroll to "Passenger Details" section
3. Clear existing passengers (optional)

### Step 4: Test Each Format
For each test case above:
1. Enter the passenger details in textarea
2. Click "Save Changes"
3. Verify result matches expected outcome

### Step 5: Verify Display
After successful save:
1. Close edit modal
2. Find the booking in the list
3. Click to expand/view details
4. Verify passenger displays correctly as:
   "Name (Age yrs, gender)"

---

## 📋 Acceptance Criteria

✅ **Format Flexibility:**
- [ ] Accepts "Name (Age yrs, Gender)"
- [ ] Accepts "Name (Age, Gender)"
- [ ] Accepts "Name (Age years, Gender)"
- [ ] Accepts formats with missing spaces

✅ **Error Handling:**
- [ ] Shows error for invalid formats
- [ ] Error includes line number
- [ ] Error shows exact invalid input
- [ ] Error prevents save
- [ ] User can correct and retry

✅ **User Experience:**
- [ ] Clear placeholder examples
- [ ] Help text shows accepted formats
- [ ] No silent failures
- [ ] Intuitive to use

✅ **Data Integrity:**
- [ ] Valid passengers saved correctly
- [ ] Invalid passengers rejected
- [ ] No partial saves
- [ ] Display format consistent

✅ **No Breaking Changes:**
- [ ] Existing passengers load correctly
- [ ] Old format still works
- [ ] Other booking features unaffected
- [ ] Mobile responsive maintained

---

## 🐛 Known Limitations

### What Still Won't Work:
1. **Age must be numeric**
   - ❌ `John Doe (thirty yrs, male)` - Age not a number
   - ❌ `John Doe (30-35 yrs, male)` - Age range not supported

2. **Name cannot be empty**
   - ❌ `(30 yrs, male)` - Missing name

3. **Gender cannot be empty**
   - ❌ `John Doe (30 yrs, )` - Missing gender

4. **At least one field required**
   - ❌ Empty line - Will be skipped

These are intentional - they represent truly invalid data.

---

## 🎯 Success Criteria

**Fix is successful if:**
1. ✅ Can add passengers with multiple format variations
2. ✅ Clear error messages for truly invalid formats
3. ✅ No silent failures
4. ✅ All existing functionality works
5. ✅ No TypeScript errors
6. ✅ No console errors
7. ✅ Mobile responsive maintained

---

## 📞 Support

If you encounter issues:

1. **Check browser console** - Look for error messages
2. **Verify format** - Ensure name, age (number), and gender present
3. **Check error toast** - Read the specific validation error
4. **Review examples** - Compare your input to placeholder examples
5. **Try standard format** - Use "Name (Age yrs, Gender)" as fallback

---

*Last Updated: October 3, 2025*  
*Quick Reference Version*
