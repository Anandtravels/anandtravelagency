# Professional Invoice PDF - Quick Visual Reference

## 🎨 Invoice Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    BLUE HEADER BAR (85px)                   │
│                                                             │
│                    [CENTERED LOGO]                          │
│                      (65 x 32px)                            │
│                                                             │
│              ANAND TRAVEL AGENCY (22px bold)                │
│           Travel Services & Ticket Booking (11px)           │
│     📞 8985816481 / 9676138010  •  📧 contact@... (10px)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                    INVOICE (26px bold, centered)

┌─────────────────────────────────────────────────────────────┐
│  Invoice No: ATA-20250102-00001    Date: 02/11/2025        │
│                    (Light gray box)                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌────────────────────────────┐
│ BILL TO (Blue bar)   │         │ JOURNEY DETAILS (Blue bar) │
├──────────────────────┤         ├────────────────────────────┤
│ John Doe (Bold)      │         │ From: Hyderabad            │
│ 📞 9876543210        │         │ To: Bangalore              │
│ 📧 john@email.com    │         │ Date: 05/11/2025          │
└──────────────────────┘         └────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Service Description │ Type    │ Pass │  Rate  │  Amount     │
├─────────────────────┼─────────┼──────┼────────┼─────────────┤
│ Ticket Cost         │ Tatkal  │  2   │ ₹1,000 │ ₹2,000      │
│ Booking Charge      │ Tatkal  │  2   │ ₹100   │ ₹200        │
│ Discount (SAVE10)   │         │      │        │ - ₹200      │
└─────────────────────────────────────────────────────────────┘

                               ┌──────────────────────┐
                               │ TOTAL AMOUNT: (Blue) │
                               │     ₹2,000           │
                               └──────────────────────┘

┌──────────────────┐    ┌────────────────────────────────────┐
│ SCAN TO PAY      │    │ Payment Instructions:              │
│ (Blue title bar) │    │ 1. Open any UPI app on your phone  │
├──────────────────┤    │ 2. Scan the QR code shown on left  │
│                  │    │ 3. Verify amount & complete payment│
│   [QR CODE]      │    │ 4. Share screenshot for confirm... │
│   (50x50px)      │    │                                    │
│                  │    └────────────────────────────────────┘
│ 💳 Anand Travel  │
│ PhonePe•GPay•... │
└──────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Thank you for choosing Anand Travel Agency!
    For queries, contact us at the above details • Safe travels!
```

## 🎯 Key Design Elements

### **Colors Used:**
```
Primary Blue:    RGB(41, 128, 185)   #2980B9
Dark Gray:       RGB(51, 51, 51)     #333333
Light Gray:      RGB(128, 128, 128)  #808080
Background:      RGB(245, 248, 250)  #F5F8FA
White:           RGB(255, 255, 255)  #FFFFFF
```

### **Font Sizes:**
```
Company Name:        22px (bold)
Invoice Title:       26px (bold)
Section Headers:     12px (bold, white on blue)
Body Text:           10-11px
Total Amount:        16px (bold, white on blue)
Footer:              8-11px
```

### **Spacing:**
```
Header Height:       85px
Section Gaps:        25-35px
Box Padding:         5-8px
Rounded Corners:     2-3px
Logo Size:           65 x 32px (centered)
QR Code Size:        50 x 50px
```

## 📐 Layout Measurements

### **Page Dimensions:**
- Width: 210mm (A4 standard)
- Height: 297mm (A4 standard)
- Margins: 15px left/right

### **Section Heights:**
- Blue Header: 85px
- Invoice Title: ~20px
- Bill To/Journey: ~35px
- Services Table: Dynamic (based on items)
- Total Box: 22px
- QR Section: 90px (if present)
- Footer: 20px

## 🎨 Visual Hierarchy

### **Most Prominent (First to Notice):**
1. 🏆 **Logo** - Center top, large, first thing visible
2. 🏆 **Company Name** - Bold, 22px, centered
3. 🏆 **INVOICE** - 26px, bold, centered
4. 🏆 **Total Amount** - Blue box, 16px, right side

### **Secondary Elements:**
5. Invoice number & date box
6. Section headers (BILL TO, JOURNEY DETAILS)
7. Services table with blue header

### **Supporting Elements:**
8. Customer details
9. Table rows
10. QR code and payment instructions
11. Footer message

## 🖼️ Logo Display

### **Logo Placement:**
```
Position: Top center of invoice
Size: 65px width × 32px height
Location: Inside blue header bar
Y-Position: 15px from top
X-Position: Centered (pageWidth/2 - 32.5)
Background: Blue bar (RGB 41, 128, 185)
```

### **Logo Loading:**
- Source: `/logo.png` (public folder)
- Format: PNG with transparency
- Fallback: Continues without logo if not found
- Timeout: 2 seconds max wait

## 📊 Section Breakdown

### **1. Header Section (Lines 1-66)**
- Blue full-width bar
- Centered logo
- White text on blue
- Company info centered

### **2. Invoice Title (Lines 68-94)**
- Large "INVOICE" text
- Invoice # and date box
- Light gray background

### **3. Bill To & Journey (Lines 96-153)**
- Two-column layout
- Blue section headers
- Customer details left
- Journey details right

### **4. Services Table (Lines 155-222)**
- Professional grid layout
- Blue header row
- Alternating row colors
- Right-aligned amounts
- Bold descriptions

### **5. Total Amount (Lines 224-234)**
- Blue rounded box
- Right-aligned
- Large amount display
- White text

### **6. QR Code Section (Lines 236-281)**
- Left: QR with border
- Right: Instructions box
- Step-by-step guide
- Supported apps listed

### **7. Footer (Lines 283-296)**
- Blue separator line
- Thank you message
- Contact reminder
- Centered text

## ✅ Quality Checklist

When reviewing a generated PDF, check:

- [ ] Logo clearly visible in center top
- [ ] Company name stands out (white on blue)
- [ ] "INVOICE" title is prominent (26px)
- [ ] Invoice number easily readable
- [ ] Customer name is bold
- [ ] Phone/email have emoji icons
- [ ] Journey details show if available
- [ ] Table header is blue with white text
- [ ] Table rows alternate colors
- [ ] Amounts right-aligned properly
- [ ] Total amount box is prominent (blue)
- [ ] QR code displays (if available)
- [ ] Payment instructions clear
- [ ] Footer message visible
- [ ] No text overlaps anywhere
- [ ] Professional overall appearance

## 🎯 Design Goals Achieved

✅ **Logo Visibility:** Large, centered, impossible to miss  
✅ **Text Clarity:** All text 10px+ with high contrast  
✅ **Professional Look:** Blue theme, rounded corners, clean layout  
✅ **Clear Sections:** Blue headers, proper spacing, visual separation  
✅ **Modern Design:** Emoji icons, alternating colors, rounded boxes  
✅ **Easy Scanning:** Logical flow, clear hierarchy, good spacing  
✅ **Payment Clarity:** QR prominent with step-by-step instructions  
✅ **Brand Consistency:** Blue theme matches company colors  

## 🚀 Usage

**To generate invoice PDF:**
```typescript
// From Bills Management Tab
handleDownloadPDF(billId) → generateBillPDF(bill)
```

**Result:** Professional PDF downloads instantly with new design!

---

**The invoice is now professional, modern, and clearly displays the logo in the center with all text highly visible!**
