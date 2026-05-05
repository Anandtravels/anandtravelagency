# Admin Wallet Edit Feature - Quick Reference

## 🎯 Feature Overview
Admin double-click on wallet balance → Edit dialog opens → Add admin entry → Updates everywhere

---

## 📍 Where to Use

| Location | Path | How to Access |
|----------|------|---------------|
| **Agents Tab** | Admin → Agents | Double-click wallet balance box |
| **Wallets Tab** | Admin → Agent Wallets | Double-click balance box on agent card |

---

## 🖱️ How to Use

### Step 1: Navigate to Agents Section
- Go to Admin Panel
- Click "Agents" or "Agent Wallets" tab

### Step 2: Find Agent Card
- Locate the agent you want to edit
- Find the "Wallet Balance" or "Balance" display

### Step 3: Double-Click Balance
- **Desktop**: Double-click the balance box
- **Mobile**: Double-tap the balance box
- Dialog automatically opens

### Step 4: Fill Form
```
Booking Type:     [Select: AC or Sleeper]
Received (₹):     [Enter amount or 0]
Ticket Fare (₹):  [Enter amount or 0]
Charges (₹):      [Enter amount or 0]
Notes (optional): [Enter reason/reference]
```

### Step 5: Review Preview
- Check "New Balance" calculation
- Verify: Current + Received - Fare - Charges
- Ensure calculation is correct

### Step 6: Submit
- Click "Add Entry" button
- Dialog closes
- Balance updates immediately

---

## 💡 Common Use Cases

### 1. Refund for Cancelled Booking
```
Received:  2000  (Refund amount)
Fare:      0
Charges:   0
Notes:     "Refund for cancelled booking #12345"
```

### 2. Manual Balance Correction
```
Received:  500   (Correction amount)
Fare:      0
Charges:   0
Notes:     "Balance correction - was short by 500"
```

### 3. Deduct Administrative Charges
```
Received:  0
Fare:      0
Charges:   100   (Admin fee)
Notes:     "Admin fee for account maintenance"
```

### 4. Record Transaction
```
Received:  5000
Fare:      3500
Charges:   200
Notes:     "AC booking B012 - Delhi to Mumbai"
```

---

## 🔍 What Happens After Submit

- ✅ Entry saved to wallet history
- ✅ Entry marked as admin-created
- ✅ Balance updated in summary
- ✅ Agent dashboard updates live
- ✅ Entry appears in agent wallet history
- ✅ Timestamp recorded
- ✅ Notes visible to agent

---

## 📊 Balance Calculation

**Formula**: `New Balance = Current Balance + Received - Fare - Charges`

**Examples**:
- Current: 1000, +Received: 500, -Fare: 0, -Charges: 0 = **1500**
- Current: 1000, +Received: 0, -Fare: 300, -Charges: 50 = **650**
- Current: 1000, +Received: 2000, -Fare: 500, -Charges: 100 = **2400**

---

## 🎨 Visual Indicators

### Balance Display
- **Green**: Positive balance (agent has credit)
- **Red**: Negative balance (agent owes money)
- **Hover**: Box highlights and shows tooltip

### Dialog
- **Current Balance**: Top-right shows existing balance
- **Preview Box**: Shows new balance calculation
- **Info Badge**: Explains admin entry behavior

---

## ⚠️ Important Notes

1. **Immutable**: Once saved, entries cannot be edited (only deleted if needed)
2. **Transparent**: Agent can see all admin entries in wallet history
3. **Audit Trail**: Every admin action is timestamped and marked
4. **Real-Time**: Updates appear immediately across all pages
5. **No Refresh**: You don't need to refresh to see updates

---

## 🔧 Troubleshooting

### Dialog won't open
- Double-click (not single-click) on balance
- Ensure you're on Agents or Agent Wallets tab
- Check if agent card is fully loaded

### Balance not updating
- Close and reopen page
- Check network connection
- Verify entry was submitted (no error toast)

### Entry not in wallet history
- Wait 1-2 seconds for sync
- Refresh agent's wallet view
- Check if admin entry shows in history

---

## 📱 Mobile Usage

- **Double-tap** wallet balance box
- Same form appears as desktop
- All fields responsive and touch-friendly
- Works on phones and tablets

---

## 🔐 Access Control

- **Admin Only**: Feature only visible to admin
- **Authentication**: Requires admin login
- **Audit Trail**: All entries marked as admin-created
- **Database**: Entries flagged with `entryType: 'admin'`

---

## 📞 Support

**Encountering Issues?**
- Check that you're logged in as admin
- Ensure stable internet connection
- Try refreshing the page
- Check browser console for errors
- Contact developer if issue persists

---

## 📋 Database Fields

Admin entries are saved with these fields:
- `agentEmail`: Agent's email
- `date`: Entry date (YYYY-MM-DD)
- `bookingType`: AC or Sleeper
- `receivedAmount`: Money received
- `ticketFare`: Fare deducted
- `charges`: Charges deducted
- `balance`: Running balance after entry
- `notes`: Admin notes/reference
- **`entryType: 'admin'`** - Marks as admin entry
- **`createdBy: 'admin'`** - Created by admin
- `createdAt`: Timestamp

---

## ✨ Key Features Summary

✅ Double-click to edit wallet  
✅ Form similar to agent payment entry  
✅ Real-time balance preview  
✅ Admin entries marked in database  
✅ Immediate balance update  
✅ Reflects in agent dashboard  
✅ Visible in wallet history  
✅ Full audit trail  
✅ Mobile compatible  
✅ No page refresh needed  

---

**Implementation Status**: ✅ Complete  
**Build Status**: ✅ Verified  
**Ready to Use**: ✅ Yes
