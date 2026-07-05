# Product Upload Feature Testing Guide

## Quick Start
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/products/new`
3. Log in as admin (use your admin credentials)
4. Follow the test scenarios below

## Test Scenario 1: Basic Upload (Happy Path)

### Test Data
```
Name: Jersey Dairy Cow
Description: A high-producing dairy cow with excellent genetics and strong immune system
Price: 45000
Stock: 5

Images: 
  - Select 2-3 JPG or PNG files (any farm animal images)
  
Video URLs:
  - https://www.youtube.com/watch?v=sample-video-id (optional)
```

### Steps
1. Fill in all required fields
2. Click "Select Images" and choose 2-3 images
3. Verify images appear in preview grid
4. (Optional) Add 1-2 video URLs by entering URL and clicking "Add"
5. Click "Create Product" button
6. Watch for success notification

### Expected Results
- ✅ Loading state shows during upload
- ✅ Success message appears: "Product created successfully!"
- ✅ Product appears in admin products list
- ✅ Images are visible when viewing product
- ✅ Form resets after successful submission

---

## Test Scenario 2: Drag-and-Drop Upload

### Steps
1. Open the form on `/admin/products/new`
2. Prepare 2-3 image files on your desktop
3. Drag files directly into the dashed upload zone
4. Drop the files
5. Verify images appear in preview grid
6. Complete and submit form

### Expected Results
- ✅ Drag zone turns green while dragging
- ✅ Files are accepted and previewed
- ✅ No separate file selection dialog needed

---

## Test Scenario 3: Image Validation Errors

### Test 3a: Too Many Images
1. Try to select 6+ images
2. Click "Select Images" and choose 6 files

**Expected**: Error toast: "Maximum 5 images allowed"

### Test 3b: File Too Large
1. Try to upload an image file > 5MB
2. Click "Select Images" and choose oversized file

**Expected**: Error toast: "{filename}: File size must be less than 5MB"

### Test 3c: Wrong File Type
1. Try to upload a PDF, Word doc, or text file
2. Click "Select Images" and choose wrong file type

**Expected**: Error toast: "{filename}: Only JPG, PNG, and WebP images are allowed"

### Test 3d: Missing Images
1. Fill in form fields but don't add any images
2. Click "Create Product"

**Expected**: Error toast: "Please add at least one product image"

---

## Test Scenario 4: Video URL Validation

### Test 4a: Add Valid URLs
1. Enter: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Click "Add" button
3. Enter: `https://vimeo.com/12345678`
4. Click "Add" button
5. Try to add a 3rd URL
6. Try to add a 4th URL

**Expected**:
- ✅ First two URLs display in blue list below input
- ✅ 3rd URL can be added
- ✅ 4th URL shows error: "Maximum 3 video URLs allowed"

### Test 4b: Invalid URL
1. Enter: `not-a-valid-url`
2. Click "Add" button

**Expected**: Error toast: "Please enter a valid URL (e.g., https://youtube.com/...)"

### Test 4c: Remove Video
1. Add 2 video URLs
2. Click X button next to one URL
3. Verify it's removed from the list

**Expected**: URL is removed, count updates

---

## Test Scenario 5: Remove Images Before Submit

### Steps
1. Add 3 images
2. Hover over first image
3. Click X button to remove
4. Verify image is removed from grid
5. Verify count updates: "2 / 5 images selected"

**Expected**: ✅ Images can be removed with hover X button

---

## Test Scenario 6: Form Field Validation

### Test 6a: Missing Product Name
1. Leave "Product Name" empty
2. Fill other fields
3. Try to submit

**Expected**: Error message: "Product name is required (min 2 characters)"

### Test 6b: Short Description
1. Enter description: "Too short"
2. Try to submit

**Expected**: Error message: "Description is required (min 10 characters)"

### Test 6c: Invalid Price
1. Enter price: "0" or "-50"
2. Try to submit

**Expected**: Error message: "Price must be greater than 0"

### Test 6d: Negative Stock
1. Enter stock: "-5"
2. Try to submit

**Expected**: Error message: "Stock must be a non-negative integer"

---

## Test Scenario 7: Complete Product Upload

### High-Value Product
```
Name: Premium Brahman Cattle Set
Description: Premium breeding stock including 1 bull and 2 heifers with complete health records and pedigree certification
Price: 350000
Stock: 1

Images: 3 high-quality images of cattle
Videos: 1-2 YouTube links showing the cattle in action
```

### Steps
1. Fill all fields
2. Drag and drop 3 images or select via button
3. Add 1-2 video URLs
4. Click "Create Product"
5. Verify success
6. Go to `/admin/products` and find the product
7. Click edit and verify all fields and images are saved

---

## Verification Checklist

After successful upload, verify:

### Product List
- [ ] New product appears at top of list
- [ ] Product name is correct
- [ ] Price matches entered value
- [ ] Stock matches entered value

### Product Details (if applicable)
- [ ] All images display correctly
- [ ] Video URLs are preserved
- [ ] Description is complete
- [ ] Edit button works (if implemented)
- [ ] Delete button works

### Browser Console
- [ ] No errors in console
- [ ] No 404 errors for image files
- [ ] FormData is sent correctly

---

## Troubleshooting

### Images Not Appearing
1. Check browser console for errors
2. Verify API response includes images array
3. Check that images are encoded as base64 or URLs

### Form Not Submitting
1. Check for validation errors
2. Verify at least 1 image is selected
3. Check network tab in browser DevTools for API response

### Video URLs Not Saving
1. Verify URL format is valid
2. Check API response includes videos array
3. Ensure maximum 3 URLs not exceeded

### Large Images Slow Upload
1. Consider optimizing images to < 2MB
2. Or implement client-side image compression
3. For production, consider S3 upload with presigned URLs

---

## Success Criteria

✅ **Upload Feature is Working When**:
- [ ] Form accepts image files via click or drag-drop
- [ ] File validation prevents invalid files
- [ ] Image preview shows before upload
- [ ] Images can be removed before submission
- [ ] Video URLs are validated and stored
- [ ] Form submits successfully to API
- [ ] Product appears in product list
- [ ] All form fields are saved to database
- [ ] No console errors during upload
- [ ] Error messages are clear and helpful
- [ ] Loading state shows during submission
- [ ] Form resets after successful submission
