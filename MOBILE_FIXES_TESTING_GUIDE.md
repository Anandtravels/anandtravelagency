# Quick Testing Guide - Mobile Chatbot & WhatsApp Button

## 🎯 Quick Tests

### ✅ Test 1: Mobile Chatbot Input Field
**Time: 2 minutes**

```
1. Open site on mobile (or resize browser to mobile width)
2. Click chatbot icon (bottom-right corner)
3. ✅ Input field visible at bottom?
4. ✅ Can type in input field?
5. ✅ Send button visible?
6. Type "test" and send
7. ✅ Message appears in chat?

PASS if all ✅ checked
```

---

### ✅ Test 2: WhatsApp Contact Button
**Time: 1 minute**

```
1. Open homepage
2. Hero section (top of page)
3. Find green "Contact Now" button
4. ✅ Button is GREEN (not orange)?
5. ✅ Has WhatsApp icon?
6. ✅ Says "Contact Now"?
7. ✅ Badge says "WhatsApp"?
8. Click button
9. ✅ Opens WhatsApp in new tab?
10. ✅ Pre-filled message appears?

PASS if all ✅ checked
```

---

## 🚀 Quick Start Testing

### Device Testing Priority:

**HIGH PRIORITY:**
1. iPhone/Mobile (375px - 428px width)
2. Desktop Chrome (1920px width)

**MEDIUM PRIORITY:**
3. iPad/Tablet (768px width)
4. Desktop Safari
5. Android mobile

---

## 📋 Success Criteria

### Chatbot Fix Success:
- ✅ Input field ALWAYS visible on mobile
- ✅ Can send messages on ALL devices
- ✅ No scrolling needed to access input

### WhatsApp Button Success:
- ✅ Button is GREEN (not orange)
- ✅ Opens WhatsApp Web/App
- ✅ Pre-filled message: "Hi, I would like to inquire about your travel services."
- ✅ Phone number: +91 8985816481

---

## 🐛 Known Good States

### Mobile Chatbot:
```
Layout should be:
┌─────────────────┐
│  Header (blue)  │
├─────────────────┤
│   Messages      │
│   (scrollable)  │
│                 │
├─────────────────┤
│ [Input] [Send]  │ ← ALWAYS VISIBLE
└─────────────────┘
```

### WhatsApp Button:
```
[🟢 WhatsApp Icon] Contact Now [WhatsApp]
     ↑                ↑            ↑
   Icon          Button Text     Badge
```

---

## ⚠️ If Tests Fail

### Chatbot Input Not Visible:
1. Check browser console for errors
2. Verify flex classes applied: `flex flex-col`
3. Check viewport height calculations
4. Try hard refresh (Ctrl+Shift+R)

### WhatsApp Button Issues:
1. Check if button is green (not orange)
2. Verify URL starts with `https://wa.me/`
3. Check if opens in new tab
4. Verify phone number format (no spaces/hyphens)

---

## 📞 Test Numbers

**WhatsApp Number:** +91 8985816481  
**Pre-filled Message:** "Hi, I would like to inquire about your travel services."

---

## ✅ Final Checklist

Before marking as complete:

**Chatbot:**
- [ ] Works on iPhone/mobile
- [ ] Works on iPad/tablet
- [ ] Works on desktop
- [ ] Input always visible
- [ ] Can send messages
- [ ] No UI breaks

**WhatsApp Button:**
- [ ] Button is green
- [ ] Has WhatsApp icon
- [ ] Says "Contact Now"
- [ ] Opens WhatsApp
- [ ] Pre-filled message works
- [ ] Opens in new tab
- [ ] Correct phone number

**No Breaking Changes:**
- [ ] Other buttons still work
- [ ] Desktop chatbot works
- [ ] Site navigation works
- [ ] Mobile responsive intact

---

*Quick Reference Version*  
*Last Updated: October 3, 2025*
