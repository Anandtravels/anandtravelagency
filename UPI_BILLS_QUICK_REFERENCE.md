# UPI & Bills System - Quick Reference

## 🚀 Quick Start

### 1. Configure UPI (One-Time Setup)
```
Admin Dashboard → UPI Settings → Enter UPI ID → Save
```

### 2. Send Booking with Payment QR
```
Bookings Tab → WhatsApp Icon → Fill Details → Send
✓ QR Code auto-generated
✓ Bill auto-created
✓ Message sent to customer
```

### 3. Download Invoice
```
Bills Tab → Find Bill → Download PDF
```

---

## 📋 Navigation Paths

| Feature | Path | Shortcut |
|---------|------|----------|
| UPI Settings | Admin → UPI Settings | `/admin#upi-settings` |
| Bills | Admin → Bills | `/admin#bills` |
| Team Management | Admin → Team Management | `/admin#team-management` |

---

## 🔑 Key Files

### Components
- `UPISettingsTab.tsx` - UPI configuration UI
- `BillsManagementTab.tsx` - Bills listing
- `TeamManagementTab.tsx` - Team members (✅ Now working!)

### Hooks
- `useUPISettings.ts` - UPI CRUD
- `useEnhancedWhatsAppModal.ts` - Messaging + QR + Bills
- `useBills.ts` - Bills fetching
- `useTeamManagement.ts` - Team CRUD

### Utils
- `qrCodeUtils.ts` - QR generation
- `pdfGenerator.ts` - Invoice PDF
- `billUtils.ts` - Bill helpers

---

## 🗄️ Firebase Structure

```
Firestore:
  ├── admin_settings/
  │   └── upi_settings
  │       ├── upiId: string
  │       ├── accountHolderName: string
  │       ├── updatedAt: timestamp
  │       └── updatedBy: string
  │
  ├── bills/
  │   └── [auto-id]
  │       ├── billNumber: string
  │       ├── customerName: string
  │       ├── totalAmount: number
  │       ├── qrCodeUrl: string
  │       └── createdAt: timestamp
  │
  └── team_members/
      └── [auto-id]
          ├── name: string
          ├── role: string
          ├── bio: string
          ├── imageUrl: string
          ├── socialLinks: object
          └── order: number

Storage:
  └── qr-codes/
      └── ATA-YYYYMMDD-XXXXX.png
```

---

## 💰 Pricing Structure

| Booking Type | Charge per Passenger |
|-------------|---------------------|
| General     | ₹50                 |
| Tatkal      | ₹200                |
| Premium     | ₹250                |

**Total = (Ticket Cost × Passengers) + (Booking Charge × Passengers) - Discount**

---

## 📱 WhatsApp Message Format

```
Dear *Customer*,

Bill Number: ATA-20250101-12345

Booking Details:
Journey: From → To
Date: DD/MM/YYYY
Service: General Booking
Passengers: 2

Pricing:
Ticket Cost: ₹500 × 2 = ₹1000
Booking Charge: ₹50 × 2 = ₹100
Total: ₹1100

Payment:
UPI: 8985816481@paytm
[QR Code Link]

Thank you!
```

---

## 🎯 Feature Checklist

### UPI Settings ✅
- [x] Set UPI ID
- [x] Set account holder name
- [x] QR preview
- [x] Save to Firebase
- [x] Update existing settings

### WhatsApp Integration ✅
- [x] Open modal from bookings
- [x] Auto-calculate charges
- [x] Generate UPI QR code
- [x] Upload to Storage
- [x] Create bill record
- [x] Send formatted message
- [x] Loading states
- [x] Error handling

### Bills Management ✅
- [x] View all bills
- [x] Search functionality
- [x] Statistics dashboard
- [x] Download PDF
- [x] Real-time updates
- [x] Responsive design

### PDF Generation ✅
- [x] Company logo
- [x] Professional layout
- [x] Customer details
- [x] Pricing table
- [x] QR code section
- [x] Auto-download

### Team Management ✅ (Fixed!)
- [x] Add team members
- [x] Social media links
- [x] Photo upload
- [x] Display on About page
- [x] Tab navigation working

---

## 🔧 Dependencies

```bash
npm install qrcode jspdf jspdf-autotable @types/qrcode
```

---

## 🐛 Common Issues

### Issue: Team Management tab blank
**Solution:** ✅ Fixed! Added 'team-management' to useAdminNavigation.ts

### Issue: QR not generating
**Solution:** Check UPI ID format and Firebase Storage permissions

### Issue: PDF download fails
**Solution:** Ensure logo.png exists in src/assets/

### Issue: Bill not created
**Solution:** Verify Firebase rules allow writes to bills collection

---

## 📊 Admin Menu Structure

```
Admin Dashboard
├── 📊 Dashboard (Analytics)
├── 📅 Bookings
├── 📦 Packages
│   ├── Package Bookings
│   └── Package Management
├── 🏨 Hotels
│   ├── Hotel Bookings
│   ├── Hotel Management
│   └── Hotel Agents
├── 💬 Messages
├── 📄 E-Services
├── ✈️ Visa Applications
├── 👥 Agents
├── 👨‍💼 Team Management ✨ (Now Working!)
├── 💳 UPI Settings ✨ (New!)
├── 🧾 Bills ✨ (New!)
└── 🎫 Coupons
```

---

## 🎨 UI Components

### UPI Settings Tab
- Form with UPI ID input
- Account holder name input
- QR code preview card
- Save button with loading
- Info card with instructions

### Bills Tab
- Stats cards (Total, Revenue, Month)
- Search bar
- Bill cards with:
  - Bill number & date
  - Customer info
  - Journey details
  - Amount
  - Download button

### Team Management Tab
- Team member cards
- Add/Edit modal
- Photo upload
- Social media links
- Drag & drop ordering

---

## 🔐 Security Notes

1. Only `admin@anandtravels.com` can access
2. Firebase rules control data access
3. QR codes stored securely in Storage
4. All transactions logged with user email

---

## 📈 Statistics

Bills Tab shows:
- **Total Bills:** Count of all bills
- **Total Revenue:** Sum of all bill amounts
- **This Month:** Bills generated this month

---

## 🎉 Success Indicators

✅ UPI Settings saved → Toast: "UPI settings saved successfully"
✅ Message sent → Toast: "Message sent and bill generated successfully"
✅ PDF downloaded → Toast: "Bill downloaded successfully"
✅ Team member added → Toast: "Team member added successfully"

---

## 🚨 Error Messages

❌ UPI save failed → "Failed to save UPI settings"
❌ Message send failed → "Failed to send message. Please try again."
❌ PDF generation failed → "Failed to generate PDF"
❌ Team member failed → Check Firebase connection

---

## 📞 Quick Help

1. **UPI not working?** → Check Settings tab, ensure UPI ID is valid
2. **Bills not appearing?** → Refresh page, check Firebase console
3. **PDF issues?** → Check logo.png exists
4. **Team tab blank?** → ✅ Fixed in this update!
5. **WhatsApp not opening?** → Check popup blocker settings

---

## 🎯 Testing Steps

1. **Test UPI:**
   - Go to UPI Settings
   - Enter test UPI: `9999999999@paytm`
   - Save and verify QR preview

2. **Test Messaging:**
   - Go to Bookings
   - Click WhatsApp on any booking
   - Enter amount: ₹1000
   - Send and check WhatsApp opens

3. **Test Bills:**
   - After sending message
   - Go to Bills tab
   - Verify new bill appears
   - Download PDF

4. **Test Team:**
   - Go to Team Management
   - Add new member
   - Check About page

---

*Last Updated: November 1, 2025*
*All features tested and working! ✅*
