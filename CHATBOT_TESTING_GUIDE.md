# 🧪 Chatbot Testing Guide - Step-by-Step

## Quick Start Testing

### 1️⃣ **Start the Development Server**

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x ready in xxx ms
➜ Local:   http://localhost:5173/
```

---

## 2️⃣ **Visual Verification**

### A. Homepage Chatbot Icon
1. Open browser to `http://localhost:5173/`
2. **Look for:** Floating blue chat icon in bottom-right corner
3. **Icon should have:**
   - ✅ Circular shape with gradient (blue colors)
   - ✅ Small orange badge with sparkle icon (AI indicator)
   - ✅ Pulsing animation ring
   - ✅ Hover tooltip: "Gemini AI Chat - Ask me anything!"

### B. Open Chatbot
1. Click the floating chat icon
2. **Expected behavior:**
   - ✅ Chat window slides in from right
   - ✅ Window size: ~320px wide × 500px tall
   - ✅ Header shows: "Anand Buddy" with "Gemini AI" badge
   - ✅ Status: "Online • Super-Powered AI"
   - ✅ Welcome message visible

### C. Welcome Message Should Say:
```
Hi! I'm Anand Buddy, your super-powered AI travel assistant! 🤖✨

Powered by Google Gemini AI, I can help you with:
• Train routes & schedules across 1000+ stations
• Flight, bus, hotel bookings
• Tour packages & visa services
• General questions about ANYTHING - travel, tech, science, math, or just chat!

I have access to comprehensive travel data and can answer all your questions.
```

---

## 3️⃣ **Functional Testing**

### Test 1: Basic Travel Query
**Input:** `Show me trains from Kakinada to Hyderabad`

**Expected Response:**
- ✅ AI-generated response (not rule-based)
- ✅ Mentions train stations or routes
- ✅ May include BOOK NOW button
- ✅ Response time: 2-4 seconds
- ✅ No errors in console

---

### Test 2: Tatkal Services (SEO Focus)
**Input:** `How can I book Tatkal train tickets in Andhra Pradesh?`

**Expected Response:**
- ✅ Explains Tatkal booking process
- ✅ Mentions Anand Travel Agency services
- ✅ References AP/Telangana region
- ✅ May include contact info: +91 88888 88888
- ✅ Action button likely appears

---

### Test 3: Visa Services (SEO Focus)
**Input:** `Tell me about visa services for USA`

**Expected Response:**
- ✅ Information about USA visa process
- ✅ Mentions Anand Travel Agency visa consultancy
- ✅ May list required documents
- ✅ Contact information provided
- ✅ VISA SERVICES button may appear

---

### Test 4: General Knowledge (Non-Travel)
**Input:** `What is the capital of France?`

**Expected Response:**
- ✅ Correct answer: "Paris"
- ✅ AI-powered response (detailed, conversational)
- ✅ Shows chatbot handles non-travel queries
- ✅ No errors or fallback to rule-based

---

### Test 5: Complex Query
**Input:** `Plan a 5-day trip to Goa with hotel and flight bookings`

**Expected Response:**
- ✅ Comprehensive itinerary suggestions
- ✅ Mentions hotels, flights, attractions
- ✅ Recommends booking services
- ✅ Longer response (should be detailed)
- ✅ May include VIEW PACKAGES button

---

### Test 6: Station Database Query
**Input:** `What is the station code for Visakhapatnam?`

**Expected Response:**
- ✅ Correct answer: "VSKP" or similar
- ✅ May include state: Andhra Pradesh
- ✅ Uses loaded station database
- ✅ Shows AI has access to 1000+ stations

---

### Test 7: Math/Science Question
**Input:** `What is 456 × 789?`

**Expected Response:**
- ✅ Correct calculation: 359,784
- ✅ Shows AI can handle mathematical queries
- ✅ No restrictions or errors

---

### Test 8: Casual Conversation
**Input:** `Hi, how are you?`

**Expected Response:**
- ✅ Friendly greeting response
- ✅ Offers to help with travel or questions
- ✅ Conversational and engaging tone
- ✅ May ask what user needs help with

---

## 4️⃣ **UI/UX Testing**

### A. Message Input
1. Type a message in the input field
2. **Verify:**
   - ✅ Text appears as you type
   - ✅ Placeholder: "Type your message..."
   - ✅ Input expands for long text
   - ✅ Enter key sends message
   - ✅ Send button (paper plane icon) works

### B. Message Display
1. Send a message
2. **Verify:**
   - ✅ User message appears on right (blue background)
   - ✅ Bot message appears on left (gray background)
   - ✅ Timestamps shown below each message
   - ✅ Messages auto-scroll to bottom
   - ✅ Long messages wrap properly

### C. Typing Indicator
1. Send a message
2. **While waiting for response:**
   - ✅ Three bouncing dots appear (gray)
   - ✅ Located on left side (bot position)
   - ✅ Disappears when response arrives

### D. Action Buttons
1. Look for messages with buttons like "📱 BOOK NOW"
2. **Verify:**
   - ✅ Button appears below message text
   - ✅ Blue background, white text
   - ✅ Hover changes color
   - ✅ Click navigates to correct page (e.g., /booking)

### E. Minimize/Maximize
1. Click minimize button (- icon) in header
2. **Verify:**
   - ✅ Chat collapses to header only
   - ✅ Messages hidden
   - ✅ Minimize icon changes to maximize icon (+)
3. Click maximize button
4. **Verify:**
   - ✅ Chat expands back to full size
   - ✅ Previous messages still visible

### F. Close Chat
1. Click X button in header
2. **Verify:**
   - ✅ Chat window closes
   - ✅ Floating chat icon reappears
   - ✅ Smooth slide-out animation

### G. Reopen Chat
1. Click floating icon again
2. **Verify:**
   - ✅ Chat reopens
   - ✅ Previous conversation history preserved
   - ✅ Can continue chatting

---

## 5️⃣ **Error Handling Testing**

### Test 1: Empty Message
1. Leave input field empty
2. Try to send (press Enter or click Send)
3. **Expected:**
   - ✅ Nothing happens (message not sent)
   - ✅ No error messages
   - ✅ Input remains empty

### Test 2: API Failure Simulation
**Option A: Disable Internet**
1. Disconnect internet/Wi-Fi
2. Send a message: `Hello`
3. **Expected:**
   - ✅ Typing indicator appears briefly
   - ✅ Fallback response used (rule-based)
   - ✅ Response mentions contacting at +91 8985816481
   - ✅ No crash or blank screen

**Option B: Invalid API Key**
1. Edit `.env`: Set `VITE_GEMINI_API_KEY=invalid_key`
2. Restart dev server: `npm run dev`
3. Send a message: `Test`
4. **Expected:**
   - ✅ Console shows API error (check DevTools)
   - ✅ Fallback response provided
   - ✅ Chatbot remains functional
5. **Restore:** Revert `.env` to correct API key

### Test 3: Very Long Input
1. Type a very long message (500+ characters)
2. Send it
3. **Expected:**
   - ✅ Message sends successfully
   - ✅ AI processes and responds
   - ✅ Response may be longer than usual
   - ✅ No truncation or errors

---

## 6️⃣ **Integration Testing**

### A. Admin Pages (Chatbot Should Be Hidden)
1. Navigate to: `http://localhost:5173/admin`
2. **Verify:**
   - ✅ No floating chat icon visible
   - ✅ No chatbot on page
   - ✅ ConditionalChatBot wrapper working

3. Navigate to: `http://localhost:5173/agent`
4. **Verify:**
   - ✅ No floating chat icon visible

### B. Public Pages (Chatbot Should Be Visible)
Test on these pages:
- ✅ `/` (Homepage)
- ✅ `/booking` (Booking page)
- ✅ `/packages` (Packages page)
- ✅ `/hotels` (Hotels page)
- ✅ `/contact` (Contact page)
- ✅ `/visa-services` (Visa page)
- ✅ `/tatkal-train-tickets-andhra-pradesh` (New SEO landing page)

**Verify for each:**
- ✅ Floating chat icon appears in bottom-right
- ✅ Chatbot opens when clicked
- ✅ Chat works normally
- ✅ No interference with page content
- ✅ No layout shifts when chatbot opens

### C. Responsive Design
**Desktop (1920×1080):**
- ✅ Chat icon: 56px × 56px
- ✅ Chat window: 320px × 500px
- ✅ Positioned bottom-right with padding

**Tablet (768×1024):**
- ✅ Chat icon slightly smaller
- ✅ Chat window full height on smaller screens
- ✅ Responsive to screen size

**Mobile (375×667):**
- ✅ Chat icon: 48px × 48px
- ✅ Chat window: Nearly full width (with small margins)
- ✅ Touch-friendly buttons
- ✅ Readable text size

---

## 7️⃣ **Performance Testing**

### A. Response Time
1. Send 5 different messages
2. **Measure time from send to response:**
   - ✅ Average: 2-4 seconds
   - ✅ Maximum: <10 seconds
   - ✅ Minimum: 1-2 seconds

### B. Memory Usage
1. Open browser DevTools → Performance/Memory tab
2. Open chatbot and send 10 messages
3. **Verify:**
   - ✅ No significant memory leaks
   - ✅ Memory usage stable (<50MB increase)

### C. Multiple Messages
1. Send 20 consecutive messages rapidly
2. **Verify:**
   - ✅ All messages appear in order
   - ✅ No duplicates or missing responses
   - ✅ Scroll area handles many messages
   - ✅ Performance remains smooth

---

## 8️⃣ **Console Testing (DevTools)**

### Open Browser Console
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
2. Go to "Console" tab

### Before Sending Message:
**Expected logs:**
```
[No errors]
```

### After Sending Message (Success):
**Expected logs:**
```
[No critical errors]
```

**Acceptable warnings:**
- React DevTools extensions
- Source map warnings (ignore)

### After Sending Message (API Error):
**Expected logs:**
```
API Error Details: {
  status: 400,
  statusText: "Bad Request",
  error: {...},
  model: "gemini-2.0-flash-exp",
  apiKey: "***oWwU"
}
Gemini API Error: Error: API Error: 400 - Bad Request
```
- ✅ Error is logged (good for debugging)
- ✅ Chatbot still provides fallback response
- ✅ No app crash

---

## 9️⃣ **Network Testing (DevTools)**

### Open Network Tab
1. Press `F12` → "Network" tab
2. Send a message in chatbot

### Verify API Call:
**URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=***`

**Request Method:** `POST`

**Status Code:** 
- ✅ `200 OK` (success)
- ⚠️ `400 Bad Request` (check API key or request format)
- ⚠️ `401 Unauthorized` (API key invalid)
- ⚠️ `429 Too Many Requests` (rate limit exceeded)

**Request Payload:** (Preview tab)
```json
{
  "contents": [{
    "parts": [{
      "text": "You are Anand Buddy, a super-intelligent AI travel assistant..."
    }]
  }],
  "generationConfig": {
    "temperature": 0.9,
    "topP": 0.95,
    "topK": 40,
    "maxOutputTokens": 8192
  },
  "safetySettings": [...]
}
```

**Response:** (Preview tab)
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "AI response here..."
      }]
    }
  }]
}
```

---

## 🔟 **Configuration Testing**

### Test Different Models

#### A. Switch to Gemini 2.0 Pro (More Advanced)
1. Edit `.env`:
```bash
VITE_GEMINI_MODEL=gemini-2.0-pro-exp
```
2. Restart dev server: `npm run dev`
3. Test complex query: `Explain quantum entanglement in simple terms`
4. **Expected:**
   - ✅ More detailed, sophisticated response
   - ✅ Longer response time (3-5 seconds)
   - ✅ Better reasoning quality

#### B. Switch to Gemini 1.5 Flash (Faster)
1. Edit `.env`:
```bash
VITE_GEMINI_MODEL=gemini-1.5-flash
```
2. Restart dev server
3. Test query: `What is the capital of India?`
4. **Expected:**
   - ✅ Faster response (1-2 seconds)
   - ✅ Still accurate
   - ✅ May be less detailed than 2.0

#### C. Restore Default
1. Edit `.env`:
```bash
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
```
2. Restart dev server

---

## 1️⃣1️⃣ **SEO Integration Testing**

### Test SEO-Focused Queries
These verify chatbot aligns with new SEO strategy:

**Query 1:** `Tatkal train tickets Andhra Pradesh`
- ✅ Mentions Anand Travel Agency
- ✅ References AP region
- ✅ Explains Tatkal booking
- ✅ Provides contact info

**Query 2:** `Emergency travel services Kakinada`
- ✅ Highlights emergency booking capabilities
- ✅ Mentions Kakinada location
- ✅ Offers 24/7 support info

**Query 3:** `Visa consultancy Telangana`
- ✅ Explains visa services
- ✅ References Telangana region
- ✅ Lists countries covered
- ✅ Mentions expert consultation

**Query 4:** `Best travel agency in Kakinada`
- ✅ Promotes Anand Travel Agency
- ✅ Lists services offered
- ✅ Mentions location and contact
- ✅ Highlights experience/expertise

---

## ✅ **Final Verification Checklist**

Before marking as production-ready:

### Functionality:
- [ ] Chatbot appears on homepage
- [ ] Chatbot opens when clicked
- [ ] Messages send and receive successfully
- [ ] AI responses are accurate and relevant
- [ ] Fallback system works when API fails
- [ ] Action buttons navigate correctly
- [ ] Minimize/maximize works
- [ ] Close button works
- [ ] Conversation history persists during session

### UI/UX:
- [ ] Animations are smooth
- [ ] Typing indicator shows during processing
- [ ] Messages auto-scroll to bottom
- [ ] Timestamps display correctly
- [ ] Text wraps properly in messages
- [ ] Responsive on desktop, tablet, mobile
- [ ] No layout shifts or overlaps
- [ ] Colors match brand (blue/orange)

### Integration:
- [ ] Hidden on admin pages (/admin, /agent)
- [ ] Visible on all public pages
- [ ] No console errors in production build
- [ ] Works with React Router navigation
- [ ] Doesn't interfere with other components

### Performance:
- [ ] Average response time < 5 seconds
- [ ] No memory leaks after 20 messages
- [ ] Handles rapid message sending
- [ ] Page load not affected by chatbot

### Configuration:
- [ ] Environment variables loaded correctly
- [ ] API key works and is secure
- [ ] Model switches successfully
- [ ] Fallback values work if .env missing

### SEO Alignment:
- [ ] Answers Tatkal ticket queries
- [ ] Provides visa consultancy info
- [ ] Mentions AP/TG regional services
- [ ] Promotes Anand Travel Agency correctly

---

## 🐛 Common Issues & Solutions

### Issue: Chatbot icon doesn't appear
**Solution:** Check if on admin page (expected), refresh browser, clear cache

### Issue: Messages send but no response
**Solution:** Check API key in .env, verify internet connection, check console for errors

### Issue: "Invalid response format" error
**Solution:** Verify model name in .env, check if model exists, try stable model (gemini-1.5-flash)

### Issue: Responses are too short
**Solution:** Increase `maxOutputTokens` in ChatBot.tsx (line ~115)

### Issue: Responses are too slow
**Solution:** Switch to faster model (gemini-1.5-flash) or reduce `maxOutputTokens`

---

## 📊 Success Metrics

After testing, verify these KPIs:

- ✅ **Uptime:** Chatbot works 100% of time (with fallback)
- ✅ **Response Rate:** >95% AI-powered responses (not fallback)
- ✅ **Accuracy:** Correct answers to travel queries
- ✅ **Speed:** <5 seconds average response time
- ✅ **User-Friendly:** Easy to use, no crashes

---

## 🎉 Testing Complete!

If all tests pass, the chatbot is **PRODUCTION READY** ✅

**Next Steps:**
1. Deploy to production server
2. Monitor API usage in Google Cloud Console
3. Collect user feedback
4. Track analytics (messages sent, topics asked)
5. Iterate and improve based on real usage

---

**Happy Testing! 🚀**
