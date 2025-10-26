# Footer Social Media - Quick Reference Guide

## 🔗 Social Media Links Overview

### Current Order (Left to Right)
```
1. LinkedIn
2. Instagram  
3. Facebook
4. Twitter/X
5. YouTube
6. Threads
7. Snapchat
```

---

## 📱 Platform Details

### 1. **LinkedIn** 
- **Icon**: LinkedIn (professional network icon)
- **URL**: https://www.linkedin.com/in/anand-pinisetty-656583359/
- **Color**: White → Orange (on hover)

### 2. **Instagram**
- **Icon**: Instagram (camera/photo icon)
- **URL**: https://www.instagram.com/anandtravels.agency/
- **Color**: White → Orange (on hover)

### 3. **Facebook**
- **Icon**: Facebook (f logo)
- **URL**: https://www.facebook.com/profile.php?id=61580145898379
- **Color**: White → Orange (on hover)

### 4. **Twitter/X**
- **Icon**: Twitter (bird icon)
- **URL**: https://x.com/anandtravelss
- **Color**: White → Orange (on hover)

### 5. **YouTube** ⭐ NEW
- **Icon**: YouTube (play button)
- **URL**: https://youtube.com/@anandtravelagency?si=mWr0Cbtll8MjVMhi
- **Color**: White → Orange (on hover)

### 6. **Threads** ⭐ NEW
- **Icon**: AtSign (@ symbol)
- **URL**: https://www.threads.com/@anandtravels.agency
- **Color**: White → Orange (on hover)

### 7. **Snapchat** ⭐ NEW
- **Icon**: Camera (camera icon)
- **URL**: https://www.snapchat.com/add/anandtravelagen?share_id=5zmnWL-HyQ8&locale=en-US
- **Color**: White → Orange (on hover)

---

## 🎨 Styling Specifications

### Colors
- **Base**: `text-white`
- **Hover**: `text-travel-orange` (#ED8936)
- **Background**: `bg-travel-blue-dark` (#1A365D)

### Layout
- **Display**: `flex flex-wrap`
- **Gap**: `gap-3` (12px spacing)
- **Icon Size**: `20px`

### Transitions
- **Effect**: `transition-colors`
- **Duration**: Default (150ms)

---

## ♿ Accessibility Features

All social media links include:
- ✅ `aria-label` - Descriptive label for screen readers
- ✅ `target="_blank"` - Opens in new tab
- ✅ `rel="noopener noreferrer"` - Security attribute

**Example:**
```tsx
<a 
  href="[URL]" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-white hover:text-travel-orange transition-colors"
  aria-label="[Platform Name]"
>
  <Icon size={20} />
</a>
```

---

## 📐 Responsive Behavior

### Desktop (1024px+)
- Icons display in single row
- Gap of 12px between icons
- All 7 icons visible

### Tablet (768px - 1023px)
- Icons wrap to 2 rows if needed
- Maintains gap spacing
- No overlap

### Mobile (< 768px)
- Icons wrap naturally
- Touch-friendly size (20px + padding)
- Vertical spacing maintained

---

## 🔍 Testing Checklist

### Functionality
- [ ] All links navigate to correct URLs
- [ ] All links open in new tab
- [ ] Hover effects work smoothly
- [ ] Icons are visible and clear

### Accessibility
- [ ] Screen reader announces platform names
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG standards

### Responsive
- [ ] Mobile view displays correctly
- [ ] Tablet view displays correctly
- [ ] Desktop view displays correctly
- [ ] Icons don't overlap on any screen size

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## 🛠️ Quick Edits

### To Change Link URL
Find the corresponding `<a>` tag and update the `href` attribute.

### To Change Icon
1. Import new icon from lucide-react
2. Replace the icon component in the `<a>` tag

### To Add New Platform
```tsx
<a 
  href="NEW_URL_HERE" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-white hover:text-travel-orange transition-colors"
  aria-label="PLATFORM_NAME"
>
  <NewIcon size={20} />
</a>
```

### To Change Order
Simply rearrange the `<a>` tags in the desired order.

---

## 📊 Analytics Tracking

To add analytics tracking, add `onClick` handler:

```tsx
<a 
  href="[URL]"
  onClick={() => trackEvent('Social Media Click', 'Platform Name')}
  target="_blank" 
  rel="noopener noreferrer"
  className="text-white hover:text-travel-orange transition-colors"
  aria-label="Platform Name"
>
  <Icon size={20} />
</a>
```

---

## 🎯 SEO Benefits

- ✅ Increases social presence
- ✅ Provides multiple contact points
- ✅ Improves brand visibility
- ✅ Enhances user engagement
- ✅ Supports cross-platform marketing

---

## 📝 Maintenance Notes

**Last Updated**: October 26, 2025  
**Updated By**: Development Team  
**Next Review**: When new social platforms are added  

**Component Location**: `src/components/Footer.tsx`  
**Lines**: Import (line 2), Social Media Section (lines 16-79)

---

## 🚨 Important Notes

1. **Security**: Always include `rel="noopener noreferrer"` for external links
2. **Accessibility**: Never remove aria-labels
3. **Consistency**: Maintain icon size at 20px
4. **Branding**: Keep hover color as travel-orange
5. **Layout**: Use `gap-3` for proper wrapping

---

## ✅ Verification Steps

After any changes:
1. Run `npm run build`
2. Check for TypeScript errors
3. Test all links
4. Verify responsive design
5. Test hover effects
6. Check accessibility with screen reader

---

**Quick Reference Complete** 📚
