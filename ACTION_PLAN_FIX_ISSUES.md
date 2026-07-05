# ACTION PLAN - FIX IDENTIFIED ISSUES
**Date:** June 12, 2026  
**Priority:** CRITICAL  
**Target:** Fix all issues before production deployment

---

## 🚨 CRITICAL ISSUES TO FIX

### Issue #1: Products Page Timeout ❌
**Severity:** CRITICAL  
**Status:** Blocking feature

**Diagnosis:**
- Navigation to `/admin/products` times out
- Likely cause: API endpoint `/api/admin/products` not responding or slow

**Investigation Steps:**
1. [ ] Check if API endpoint exists and is responding
2. [ ] Verify database connection is active
3. [ ] Check for errors in server logs
4. [ ] Test endpoint with curl: `curl http://localhost:3000/api/admin/products`
5. [ ] Verify Prisma schema has Product model
6. [ ] Check for N+1 query problems

**Fix Options:**
```
Option A: Debug API Response
- Check /app/api/admin/products/route.ts exists
- Verify GET endpoint implementation
- Test endpoint directly with API client
- Check database queries for bottlenecks

Option B: Add Error Handling
- Add try-catch blocks in API route
- Return proper error messages
- Add logging to identify bottleneck

Option C: Optimize Query
- Add pagination to products endpoint
- Limit default response size
- Add caching if appropriate
```

**Validation:**
- [ ] `/admin/products` page loads within 3 seconds
- [ ] Product table displays with data
- [ ] No console errors
- [ ] API returns 200 OK status

---

### Issue #2: Orders Page Timeout ❌
**Severity:** CRITICAL  
**Status:** Blocking feature

**Diagnosis:**
- Navigation to `/admin/orders` times out
- Same pattern as products page timeout

**Investigation Steps:**
1. [ ] Verify `/app/api/admin/orders/route.ts` exists
2. [ ] Check GET endpoint implementation
3. [ ] Test with curl: `curl http://localhost:3000/api/admin/orders`
4. [ ] Check database for orders data
5. [ ] Verify no infinite loops or blocking calls

**Fix Options:**
```
Option A: Implement Orders API
- Create /app/api/admin/orders/route.ts if missing
- Implement GET endpoint
- Add pagination
- Test endpoint

Option B: Optimize Existing API
- Review current implementation
- Add proper error handling
- Add request/response logging
- Fix slow queries
```

**Validation:**
- [ ] `/admin/orders` page loads within 3 seconds
- [ ] Order table displays with data
- [ ] No timeout errors
- [ ] API returns 200 OK status

---

### Issue #3: Messages Page Layout Error ⚠️
**Severity:** HIGH  
**Status:** Blocking admin feature

**Diagnosis:**
- Page loads but shows public site layout instead of admin layout
- User shown as logged out (Sign In link visible)
- Session appears lost

**Investigation Steps:**
1. [ ] Check if `/app/admin/messages/page.tsx` exists
2. [ ] Verify page has `'use client'` directive
3. [ ] Check for auth guard/middleware
4. [ ] Verify `useAuth()` hook is used
5. [ ] Check if page renders correctly

**Root Cause Possibilities:**
```
1. Missing 'use client' directive (like products page had)
   → Solution: Add 'use client' at top of file

2. Missing auth guard
   → Solution: Add useAuth() check, redirect if not admin

3. Wrong import/component structure
   → Solution: Review page structure vs other admin pages

4. Middleware redirecting
   → Solution: Check next.config.ts or middleware.ts
```

**Fix Steps:**
1. [ ] Open `/app/admin/messages/page.tsx`
2. [ ] Add `'use client';` at the very top if missing
3. [ ] Verify component imports
4. [ ] Check useAuth() implementation
5. [ ] Add console logs to debug
6. [ ] Test page loads correctly

**Validation:**
- [ ] `/admin/messages` page loads with admin layout
- [ ] User menu shows "Desmo"
- [ ] Messages table displays
- [ ] No public footer visible
- [ ] No "Sign In" link visible

---

## ⚠️ MEDIUM PRIORITY ISSUES

### Issue #4: Session Management Inconsistency ⚠️
**Severity:** MEDIUM  
**Status:** Intermittent issue

**Symptom:**
- User session lost on some pages after login
- Works on User Management and Bookings
- Fails on Messages and times out on Products/Orders

**Root Cause:**
Likely cascading effect of Issues #1, #2, #3 - once those are fixed, session management should stabilize

**Solution:**
- Fix Issues #1, #2, #3 first
- Then test session persistence across all pages
- If still failing, check:
  - localStorage token persistence
  - API token validation in middleware
  - Cookie settings

---

### Issue #5: Image Warnings ⚠️
**Severity:** LOW  
**Status:** Not blocking, but should fix

**Diagnosis:**
- Next.js Image component missing "sizes" prop
- Images with spaces in filenames: "farm gallery1.jpg", etc.

**Filenames to Fix:**
```
❌ /images/farm gallery1.jpg    → ✅ /images/farm-gallery1.jpg
❌ /images/farmgallery3.jpg     → ✅ /images/farmgallery3.jpg (no space)
❌ /images/farmgall1.jpg        → ✅ /images/farmgall1.jpg (no space)
❌ /images/farm gallery2.jpg    → ✅ /images/farm-gallery2.jpg
```

**Fix Steps:**
1. [ ] Rename image files (remove spaces)
2. [ ] Update image references in components
3. [ ] Add `sizes` prop to Image components
4. [ ] Test images load without warnings

---

### Issue #6: API 400 Bad Request ⚠️
**Severity:** MEDIUM  
**Status:** Unknown cause

**Diagnosis:**
- Console shows error: "Failed to load resource: 400 Bad Request"
- Occurs when scrolling homepage
- Specific endpoint not identified

**Investigation:**
1. [ ] Open DevTools Network tab
2. [ ] Scroll homepage
3. [ ] Identify which API call returns 400
4. [ ] Check request parameters
5. [ ] Review API endpoint validation

**Likely Cause:**
- Weather API call with invalid location parameter
- Media carousel API call with malformed request
- Analytics API call during page load

**Fix:**
Once identified, add proper error handling and validation

---

## ✅ VERIFICATION CHECKLIST

### Before Deployment:
- [ ] Products page loads without timeout
- [ ] Orders page loads without timeout
- [ ] Messages page shows admin layout
- [ ] User remains logged in across all pages
- [ ] All images load without warnings
- [ ] No API 400 errors in console
- [ ] All CRUD operations work:
  - [ ] Create user
  - [ ] Edit user role
  - [ ] Delete user
  - [ ] Bulk delete
  - [ ] Export CSV
  - [ ] Create product
  - [ ] Edit product
  - [ ] Delete product
- [ ] Bookings management works:
  - [ ] View bookings
  - [ ] Filter by status
  - [ ] Update status
  - [ ] Delete booking

### Final Test:
- [ ] Complete test suite from ADMIN_MANUAL_TEST_GUIDE.md
- [ ] No critical console errors
- [ ] All 60+ test cases pass

---

## 🔧 IMPLEMENTATION GUIDE

### Step 1: Fix Products Page (30 minutes)
```bash
# 1. Navigate to project
cd h:\Projects\Delamere-farm

# 2. Check if route exists
ls app/api/admin/products/

# 3. If missing, check the implementation
cat app/api/admin/products/route.ts

# 4. Run test query
curl http://localhost:3000/api/admin/products

# 5. Check logs for errors
# Review browser DevTools Console and Network tabs

# 6. Fix issues found
# - Add error handling
# - Optimize queries
# - Add pagination

# 7. Test in browser
# Navigate to http://localhost:3000/admin/products
```

### Step 2: Fix Orders Page (30 minutes)
```
Same process as Step 1, but for:
- app/api/admin/orders/route.ts
- /admin/orders page
```

### Step 3: Fix Messages Page (20 minutes)
```bash
# 1. Open messages page
cat app/admin/messages/page.tsx

# 2. Verify 'use client' directive exists at top
# If missing, add: 'use client';

# 3. Verify useAuth() hook is used
# If missing, add: const { user } = useAuth();

# 4. Verify page has admin layout check
# If missing, add: const { user } = useAuth(); if (!user?.isAdmin) redirect('/login');

# 5. Test in browser
# Navigate to http://localhost:3000/admin/messages
```

### Step 4: Fix Image Issues (20 minutes)
```bash
# 1. Rename image files
# Remove spaces from filenames

# 2. Update references in code
# Search for image filenames and update

# 3. Add sizes prop to Image components
# Example: <Image src="..." sizes="(max-width: 768px) 100vw, ..." />

# 4. Test images load
# No warnings in console
```

### Step 5: Test Everything (60 minutes)
```bash
# 1. Clear cache and restart browser
# 2. Login again
# 3. Test all admin pages
# 4. Run full test suite from ADMIN_MANUAL_TEST_GUIDE.md
# 5. Document any remaining issues
```

---

## 📊 ESTIMATED TIMELINE

| Task | Estimate | Status |
|------|----------|--------|
| Fix Products API | 30 min | ⏳ TODO |
| Fix Orders API | 30 min | ⏳ TODO |
| Fix Messages Page | 20 min | ⏳ TODO |
| Fix Image Issues | 20 min | ⏳ TODO |
| Testing & Validation | 60 min | ⏳ TODO |
| **Total** | **~3 hours** | ⏳ TODO |

---

## 🎯 SUCCESS CRITERIA

### After Fixes Are Applied:
1. ✅ All admin pages load within 3 seconds
2. ✅ User session persists across all pages
3. ✅ No timeout errors
4. ✅ No 400 Bad Request errors
5. ✅ Admin layout displays consistently
6. ✅ All images load without warnings
7. ✅ CRUD operations work for all features
8. ✅ Full test suite passes (60+ tests)

### Deployment Ready When:
- [ ] All 6 issues resolved
- [ ] All verification checks pass
- [ ] Full test suite passes
- [ ] No critical console errors
- [ ] Performance acceptable (< 3s page load)

---

## 📝 NOTES

**Key Insights:**
1. Products/Orders timeout is likely same root cause (API issue)
2. Messages page needs same fix as Products page ('use client' directive)
3. Image warnings are low priority but good to fix
4. API 400 error needs investigation once page loading works

**Next Session:**
1. Apply fixes in order (Products → Orders → Messages → Images)
2. Test after each fix
3. Run full test suite
4. Document any new issues found
5. Deploy when all tests pass

---

**Report Created:** June 12, 2026  
**Target Completion:** June 12, 2026 (same day)  
**Estimated Effort:** 3 hours total

