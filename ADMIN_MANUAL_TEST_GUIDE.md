# Admin Dashboard Manual Testing Guide
**Date:** June 12, 2026  
**Project:** Delamere Farm  
**Test Environment:** http://localhost:3000

---

## Test Credentials
- **Email:** admin@example.com
- **Password:** AdminPassword123!

---

## Phase 1: Authentication & Login

### Test 1.1: Admin Login
1. Navigate to http://localhost:3000/login
2. Enter email: `admin@example.com`
3. Enter password: `AdminPassword123!`
4. Click "Sign In"
5. **Expected Result:** ✅ Redirected to admin dashboard at http://localhost:3000/admin
6. **Status:** [ ] Pass / [ ] Fail

### Test 1.2: Verify Admin User Data
1. Check that the ProfileDropdown shows admin user details
2. **Expected Result:** ✅ Shows "Admin User" or name associated with account
3. **Status:** [ ] Pass / [ ] Fail

### Test 1.3: Logout Functionality
1. Click profile menu
2. Click "Logout" or similar option
3. **Expected Result:** ✅ Redirected to login page, session cleared
4. **Status:** [ ] Pass / [ ] Fail

---

## Phase 2: User Management (`/admin/users`)

### Test 2.1: View All Users
1. Login as admin
2. Navigate to `/admin/users`
3. **Expected Result:** ✅ Users table loads with columns:
   - Select checkbox
   - Name
   - Email
   - Role (USER, MODERATOR, ADMIN)
   - Status (Active/Inactive toggle)
   - Actions (Delete button)
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 2.2: Search Users
1. On `/admin/users` page
2. Type a user name or email in search box
3. **Expected Result:** ✅ Table filters in real-time, showing only matching users
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 2.3: Edit User Role
1. Find a test user in the table
2. Click role dropdown (shows USER/MODERATOR/ADMIN)
3. Select a different role (e.g., MODERATOR)
4. **Expected Result:** ✅ Toast shows "User updated", data persists on page refresh
5. **Status:** [ ] Pass / [ ] Fail
6. **Notes:**

### Test 2.4: Toggle User Status
1. Find a test user in the table
2. Click the Active/Inactive toggle switch
3. **Expected Result:** ✅ Toast shows "User updated", toggle switches position
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 2.5: Delete Single User
1. Click "Delete" button on a test user
2. Confirm deletion in modal
3. **Expected Result:** ✅ User removed from table, toast shows "User deleted"
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 2.6: Bulk Delete Users
1. Check multiple user checkboxes
2. Click "Delete" in bulk action bar
3. Confirm deletion
4. **Expected Result:** ✅ Selected users removed, toast shows "Users deleted"
5. **Status:** [ ] Pass / [ ] Fail
6. **Notes:**

### Test 2.7: Export Users
1. Select some users or leave all unchecked (exports all)
2. Click "Export" in bulk action bar
3. **Expected Result:** ✅ CSV file downloads with user data
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 2.8: Create New User
1. Click "Add New User" button
2. Navigate to `/admin/users/new` or modal opens
3. Fill form with:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "TestPass123!"
   - Role: "USER"
4. Submit
5. **Expected Result:** ✅ User created, appears in users list
6. **Status:** [ ] Pass / [ ] Fail
7. **Notes:**

---

## Phase 3: Product Management (`/admin/products`)

### Test 3.1: View All Products
1. Navigate to `/admin/products`
2. **Expected Result:** ✅ Products table/grid loads with columns:
   - Select checkbox
   - Name
   - Price
   - Stock
   - Category (if applicable)
   - Status (Active/Inactive)
   - Actions
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 3.2: Search Products
1. Enter product name in search box
2. **Expected Result:** ✅ Products table filters in real-time
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 3.3: Edit Product
1. Find a product and click Edit (pencil icon or similar)
2. Modal or form opens with product details
3. Change a field (e.g., price or description)
4. Click Save
5. **Expected Result:** ✅ Toast shows "Product updated", change persists
6. **Status:** [ ] Pass / [ ] Fail
7. **Notes:**

### Test 3.4: Toggle Product Status
1. Find a product
2. Toggle Active/Inactive status
3. **Expected Result:** ✅ Toast shows success, status changes
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 3.5: Delete Product
1. Click Delete button on a product
2. Confirm deletion
3. **Expected Result:** ✅ Product removed from list, toast shows success
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 3.6: Bulk Delete Products
1. Select multiple product checkboxes
2. Click Delete in bulk action bar
3. Confirm
4. **Expected Result:** ✅ Products removed, toast shows success
5. **Status:** [ ] Pass / [ ] Fail
6. **Notes:**

### Test 3.7: Create New Product
1. Click "Add New Product" button
2. Fill form:
   - Name: "Test Product"
   - Description: "A test product"
   - Price: 1500
   - Stock: 10
   - Category: "Dairy" (if available)
3. Upload product image (optional)
4. Click Create
5. **Expected Result:** ✅ Product created and visible in list
6. **Status:** [ ] Pass / [ ] Fail
7. **Notes:**

---

## Phase 4: Bookings (`/admin/bookings`)

### Test 4.1: View All Bookings
1. Navigate to `/admin/bookings`
2. **Expected Result:** ✅ Bookings table loads with:
   - Booking ID
   - Customer name
   - Date
   - Status (Pending, Confirmed, Cancelled)
   - Actions
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 4.2: Search Bookings
1. Search by customer name or ID
2. **Expected Result:** ✅ Results filter in real-time
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 4.3: Update Booking Status
1. Find a booking
2. Change status (Pending → Confirmed or similar)
3. **Expected Result:** ✅ Status updates, toast shows success
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 4.4: Delete Booking
1. Click Delete on a booking
2. Confirm
3. **Expected Result:** ✅ Booking removed, toast shows success
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

---

## Phase 5: Orders (`/admin/orders`)

### Test 5.1: View All Orders
1. Navigate to `/admin/orders`
2. **Expected Result:** ✅ Orders table loads with:
   - Order ID
   - Customer
   - Total Amount
   - Status (Pending, Processing, Shipped, Delivered, Cancelled)
   - Date
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 5.2: Filter Orders by Status
1. Find status filter dropdown
2. Select a status (e.g., "Pending")
3. **Expected Result:** ✅ Table shows only orders with that status
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 5.3: View Order Details
1. Click on an order ID or "View" button
2. **Expected Result:** ✅ Order details page shows:
   - Customer info
   - Items ordered
   - Total price
   - Payment status
   - Shipping address
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 5.4: Update Order Status
1. On order details page
2. Change order status
3. **Expected Result:** ✅ Status updates, notification sent (if configured)
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

---

## Phase 6: Messages (`/admin/messages`)

### Test 6.1: View Contact Messages
1. Navigate to `/admin/messages`
2. **Expected Result:** ✅ Messages table shows:
   - Sender name
   - Email
   - Message preview
   - Date received
   - Read/Unread status
   - Actions
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 6.2: Read Message
1. Click on a message
2. **Expected Result:** ✅ Message details show full text, sender info
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 6.3: Mark as Read
1. Click "Mark as Read" or similar
2. **Expected Result:** ✅ Message marked as read, UI updates
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 6.4: Delete Message
1. Click Delete on a message
2. **Expected Result:** ✅ Message removed, toast shows success
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 6.5: Reply to Message
1. Click "Reply" on a message
2. Type reply text
3. Click Send
4. **Expected Result:** ✅ Reply sent, email notification (if configured)
5. **Status:** [ ] Pass / [ ] Fail
6. **Notes:**

---

## Phase 7: Media Management (`/admin/media`)

### Test 7.1: View Media Gallery
1. Navigate to `/admin/media` (if exists)
2. **Expected Result:** ✅ Gallery shows:
   - Uploaded images and videos
   - Thumbnails
   - Delete buttons
   - Reorder capability
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 7.2: Upload Image
1. Click "Upload Media" or "+" button
2. Select an image file (JPG, PNG)
3. Add title and description (optional)
4. Click Upload
5. **Expected Result:** ✅ Image appears in gallery, toast shows success
6. **Status:** [ ] Pass / [ ] Fail
7. **Notes:**

### Test 7.3: Delete Media
1. Click Delete on an image/video
2. **Expected Result:** ✅ Media removed from gallery and database
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 7.4: Homepage Media Carousel
1. Navigate to homepage `/`
2. Scroll to "Explore Our Farm" section
3. **Expected Result:** ✅ Media carousel displays:
   - Images properly loaded (no broken image icons)
   - Auto-scrolling or manual navigation works
   - Hover effect scales images
   - All media from `/api/admin/media` visible
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

---

## Phase 8: Analytics (`/admin/analytics`)

### Test 8.1: View Analytics Dashboard
1. Navigate to `/admin/analytics`
2. **Expected Result:** ✅ Dashboard loads with:
   - Revenue chart (line or bar chart)
   - Order statistics
   - User growth chart
   - Recent orders summary
   - Top products
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 8.2: Date Range Filter
1. Select a date range (if available)
2. **Expected Result:** ✅ Charts update with data for selected period
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 8.3: Export Analytics
1. Click "Export" or "Download Report" button
2. **Expected Result:** ✅ CSV or PDF file downloads with analytics data
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

---

## Phase 9: Data Integrity & Duplicates

### Test 9.1: Check for Duplicate Users
1. In `/admin/users`, look for users with:
   - Same email address
   - Same phone number
   - Exact same name
2. **Expected Result:** ✅ No duplicate users found OR duplicates are marked/grouped
3. **Status:** [ ] Pass / [ ] Fail
4. **Duplicates Found (if any):**
   - [ ] User 1: _______________
   - [ ] User 2: _______________
5. **Notes:**

### Test 9.2: Check for Duplicate Products
1. In `/admin/products`, search for products with:
   - Same name
   - Same SKU (if applicable)
2. **Expected Result:** ✅ No duplicate products, or duplicates are consolidated
3. **Status:** [ ] Pass / [ ] Fail
4. **Duplicates Found (if any):**
   - [ ] Product 1: _______________
   - [ ] Product 2: _______________
5. **Notes:**

### Test 9.3: Database Consistency Check
1. View users, products, orders
2. Check that all foreign keys are valid:
   - Orders reference existing users ✅
   - Bookings reference existing users ✅
   - Products have valid categories ✅
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

---

## Phase 10: API Connectivity & Backend

### Test 10.1: API Endpoints Responsive
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions: fetch users, products, etc.
4. **Expected Result:** ✅ All API calls return 200 OK
   - GET /api/admin/users ✅
   - GET /api/admin/products ✅
   - GET /api/admin/bookings ✅
   - GET /api/admin/orders ✅
   - GET /api/admin/messages ✅
   - GET /api/admin/media ✅
   - GET /api/admin/analytics ✅
5. **Status:** [ ] Pass / [ ] Fail
6. **Failed Endpoints:**
   - [ ] _______________
   - [ ] _______________

### Test 10.2: Database Connectivity
1. Create a new user via admin panel
2. Refresh page
3. **Expected Result:** ✅ New user persists (confirms DB write)
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 10.3: Authentication Token
1. Login and create a user
2. Check browser localStorage
3. **Expected Result:** ✅ `auth_token` and `auth_user` present in localStorage
4. **Status:** [ ] Pass / [ ] Fail
5. **Notes:**

### Test 10.4: Error Handling
1. Trigger an error by:
   - Submitting empty form
   - Deleting while offline
   - Entering invalid data
2. **Expected Result:** ✅ User sees clear error toast, page doesn't crash
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

---

## Phase 11: Homepage & Frontend

### Test 11.1: Homepage Load
1. Navigate to `/`
2. **Expected Result:** ✅ Page loads with:
   - Hero section with title and CTAs
   - Weather widget (if API working)
   - Media carousel scrolling
   - Newsletter signup form
   - Footer with links
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 11.2: Image Loading
1. Check homepage images load without errors
2. **Expected Result:** ✅ All images display correctly
   - No 404 errors
   - No broken image icons
   - Images match expected names (homepage1.jpg, homepage2.jpg, etc.)
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

### Test 11.3: Links & Navigation
1. Click all navigation links
2. **Expected Result:** ✅ All links work:
   - /products ✅
   - /services ✅
   - /about ✅
   - /blog ✅
   - /gallery ✅
   - /faq ✅
   - /contact ✅
3. **Status:** [ ] Pass / [ ] Fail
4. **Broken Links:**
   - [ ] _______________

### Test 11.4: Responsive Design
1. Test on multiple devices/viewports:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1440px)
2. **Expected Result:** ✅ Layout adapts properly on all sizes
3. **Status:** [ ] Pass / [ ] Fail
4. **Notes:**

---

## Summary

### Completed Tests: _____ / _____
### Passed: _____ 
### Failed: _____
### Notes & Issues:

```
(Space for notes and findings)
```

---

## Defects Found

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | | High/Medium/Low | Open/Fixed |
| 2 | | High/Medium/Low | Open/Fixed |
| 3 | | High/Medium/Low | Open/Fixed |

---

## Sign-Off

**Tested By:** ________________  
**Date:** June 12, 2026  
**Status:** ☐ All Pass ☐ Pass with Minor Issues ☐ Fail  
**Approved By:** ________________

---

**Next Steps:**
- [ ] Fix all failing tests
- [ ] Resolve identified defects
- [ ] Re-test critical paths
- [ ] Deploy to production
