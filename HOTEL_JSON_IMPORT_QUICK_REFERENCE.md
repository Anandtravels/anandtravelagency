# Hotel JSON Import - Quick Reference Guide

## 🚀 Quick Start

### 1. Access the Feature
- Go to **Admin Dashboard** → **Hotel Management**
- Click **"Import JSON"** button (next to "Add Hotel")

### 2. Prepare Your Data
Minimum JSON format:
```json
[
  {
    "State": "Maharashtra",
    "City": "Mumbai",
    "Hotel Name": "Hilton Mumbai International Airport"
  }
]
```

### 3. Import
- Paste JSON in the textarea
- Click **"Import Hotels"**
- Wait for success notification

---

## 📋 JSON Format Quick Reference

### Minimal Example (Single Hotel)
```json
{
  "State": "Maharashtra",
  "City": "Mumbai",
  "Hotel Name": "Hotel Name Here"
}
```

### Multiple Hotels
```json
[
  {"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "Hotel 1"},
  {"State": "Karnataka", "City": "Bangalore", "Hotel Name": "Hotel 2"},
  {"State": "Delhi", "City": "New Delhi", "Hotel Name": "Hotel 3"}
]
```

### Full Example (All Fields)
```json
{
  "State": "Maharashtra",
  "City": "Mumbai",
  "Hotel Name": "Luxury Hotel Mumbai",
  "description": "5-star luxury hotel with ocean views",
  "address": "123 Marine Drive, Mumbai, Maharashtra",
  "pincode": "400001",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "amenities": [
    "Free Wi-Fi",
    "Swimming Pool",
    "Spa",
    "Restaurant",
    "Gym",
    "Room Service"
  ],
  "checkInTime": "14:00",
  "checkOutTime": "11:00",
  "policies": [
    "No smoking",
    "Valid ID required at check-in",
    "Pets not allowed"
  ],
  "featured": true,
  "status": "active"
}
```

---

## ✅ Field Reference

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| State | string | ✅ Yes | - | State name |
| City | string | ✅ Yes | - | City name |
| Hotel Name | string | ✅ Yes | - | Hotel name |
| description | string | ❌ No | Auto-generated | Hotel description |
| address | string | ❌ No | City + State | Full address |
| pincode | string | ❌ No | Empty | PIN/ZIP code |
| images | array | ❌ No | [] | Image URLs |
| amenities | array | ❌ No | Default set | Hotel amenities |
| checkInTime | string | ❌ No | "14:00" | Check-in time (HH:MM) |
| checkOutTime | string | ❌ No | "11:00" | Check-out time (HH:MM) |
| policies | array | ❌ No | Default set | Hotel policies |
| featured | boolean | ❌ No | false | Featured status |
| status | string | ❌ No | "active" | 'active' or 'inactive' |

---

## 🎯 Common Patterns

### Pattern 1: City Hotel List
```json
[
  {"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "Hotel Taj Mahal Palace"},
  {"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "The Oberoi Mumbai"},
  {"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "JW Marriott Mumbai"},
  {"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "Trident Nariman Point"}
]
```

### Pattern 2: Multi-City Expansion
```json
[
  {"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "Brand Hotel Mumbai"},
  {"State": "Karnataka", "City": "Bangalore", "Hotel Name": "Brand Hotel Bangalore"},
  {"State": "Tamil Nadu", "City": "Chennai", "Hotel Name": "Brand Hotel Chennai"},
  {"State": "Delhi", "City": "New Delhi", "Hotel Name": "Brand Hotel Delhi"}
]
```

### Pattern 3: With Custom Amenities
```json
[
  {
    "State": "Goa",
    "City": "Panaji",
    "Hotel Name": "Beach Resort Goa",
    "amenities": ["Beach Access", "Pool", "Spa", "Free Wi-Fi", "Bar"]
  },
  {
    "State": "Kerala",
    "City": "Kochi",
    "Hotel Name": "Backwater Resort Kerala",
    "amenities": ["Boat Tours", "Ayurvedic Spa", "Pool", "Free Wi-Fi"]
  }
]
```

---

## 🔧 Flexible Field Names

The system accepts multiple variations:

| Standard | Alternatives Accepted |
|----------|----------------------|
| State | state |
| City | city |
| Hotel Name | hotelName, name |
| pincode | pinCode |

**Example**: All these work:
```json
{"State": "Delhi", "City": "New Delhi", "Hotel Name": "Hotel ABC"}
{"state": "Delhi", "city": "New Delhi", "name": "Hotel ABC"}
{"State": "Delhi", "City": "New Delhi", "hotelName": "Hotel ABC"}
```

---

## ⚡ Quick Tips

### ✅ DO
- ✅ Validate JSON before importing (use online JSON validator)
- ✅ Start with small test (1-2 hotels) before bulk import
- ✅ Use meaningful hotel names
- ✅ Include pincode when available
- ✅ Check the example in the modal

### ❌ DON'T
- ❌ Don't forget to wrap multiple hotels in [ ]
- ❌ Don't add trailing commas in JSON
- ❌ Don't use special characters in field names
- ❌ Don't leave required fields empty
- ❌ Don't close modal while importing

---

## 🚨 Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid JSON" | Syntax error in JSON | Validate JSON format, check commas/brackets |
| "Empty Input" | No data entered | Enter JSON data before importing |
| "No Data" | Empty array [] | Add at least one hotel object |
| "Missing required fields" | State/City/Name missing | Check all hotels have required fields |
| "Row X: Missing..." | Specific row error | Fix the hotel at that position |

---

## 📝 Sample Data Sets

### Set 1: Major Indian Cities
```json
[
  {"State": "Maharashtra", "City": "Mumbai", "Hotel Name": "Hotel Mumbai Central"},
  {"State": "Karnataka", "City": "Bangalore", "Hotel Name": "Hotel Bangalore Plaza"},
  {"State": "Tamil Nadu", "City": "Chennai", "Hotel Name": "Hotel Chennai Grand"},
  {"State": "Delhi", "City": "New Delhi", "Hotel Name": "Hotel Delhi Pride"},
  {"State": "West Bengal", "City": "Kolkata", "Hotel Name": "Hotel Kolkata Royal"}
]
```

### Set 2: Tourist Destinations
```json
[
  {"State": "Goa", "City": "Panaji", "Hotel Name": "Goa Beach Resort", "featured": true},
  {"State": "Rajasthan", "City": "Jaipur", "Hotel Name": "Heritage Palace Hotel", "featured": true},
  {"State": "Kerala", "City": "Kochi", "Hotel Name": "Backwater Paradise", "featured": true},
  {"State": "Uttarakhand", "City": "Nainital", "Hotel Name": "Mountain View Resort", "featured": true}
]
```

### Set 3: Business Hotels
```json
[
  {
    "State": "Haryana",
    "City": "Gurgaon",
    "Hotel Name": "Business Hub Hotel",
    "amenities": ["Free Wi-Fi", "Business Center", "Conference Rooms", "Airport Shuttle"]
  },
  {
    "State": "Maharashtra",
    "City": "Pune",
    "Hotel Name": "Corporate Stay Pune",
    "amenities": ["Free Wi-Fi", "Business Center", "Meeting Rooms", "Gym"]
  }
]
```

---

## 🎨 Default Values Reference

When optional fields are not provided:

```javascript
description: "Welcome to [Hotel Name], a premier hotel in [City], [State]."
address: "[City], [State]"
amenities: ["Free Wi-Fi", "Air Conditioning", "Room Service"]
checkInTime: "14:00"
checkOutTime: "11:00"
policies: ["No smoking", "Valid ID required at check-in"]
featured: false
status: "active"
images: []
pincode: ""
```

---

## 📊 Import Limits

- **Max Hotels per Import**: No hard limit (uses batching)
- **Batch Size**: 500 hotels per batch (Firestore limit)
- **Recommended**: Test with 5-10 hotels first
- **Large Imports**: 100+ hotels may take 30-60 seconds

---

## 🔍 After Import

1. **Verify in List**: Hotels appear immediately in the grid
2. **Check Status**: New hotels default to 'active'
3. **Add Room Types**: Click on hotel → Go to Room Types tab
4. **Upload Images**: Edit hotel to add proper image URLs
5. **Review Details**: Edit any auto-generated descriptions

---

## 💡 Pro Tips

### Tip 1: Copy from Excel
1. Export your hotel data from Excel
2. Use online tool to convert to JSON
3. Paste and import

### Tip 2: Prepare Image URLs First
- Upload images to hosting service first
- Get URLs ready before import
- Include in JSON for complete setup

### Tip 3: Use Featured Flag
- Set `"featured": true` for highlight hotels
- These appear prominently on website

### Tip 4: Batch by Region
- Import city by city for easier tracking
- Use status filters to verify each batch

### Tip 5: Test First
```json
[{"State": "Test", "City": "Test", "Hotel Name": "Test Hotel"}]
```
- Import test hotel first
- Verify it appears correctly
- Delete test hotel
- Proceed with real data

---

## 📱 Mobile Usage

The import feature works on mobile devices:
- Landscape mode recommended
- Copy JSON from notes/email
- Paste into textarea
- Import as normal

---

## 🔐 Permissions

**Who Can Import:**
- ✅ Admin users only
- ✅ Must be logged into Admin Dashboard
- ❌ Hotel agents cannot import
- ❌ Regular users cannot access

---

## 📞 Need Help?

**Validation Error?**
→ Check console (F12) for detailed error messages

**Import Taking Long?**
→ Normal for 50+ hotels, wait for notification

**Hotels Not Appearing?**
→ Refresh page, check status filter

**Wrong Data Imported?**
→ Use bulk selection to update or delete

---

## 🎯 Checklist Before Import

- [ ] JSON is valid (tested in validator)
- [ ] All hotels have State, City, and Hotel Name
- [ ] Array wrapped in [ ] for multiple hotels
- [ ] No trailing commas
- [ ] Image URLs are valid (if provided)
- [ ] Status values are 'active' or 'inactive'
- [ ] Times are in HH:MM format
- [ ] Ready to wait for import completion

---

**Last Updated**: November 2, 2025
**Feature Version**: 1.0.0
**Status**: ✅ Production Ready

---

**Quick Access Path**: 
`Admin Dashboard` → `Hotel Management` → `Import JSON Button`
