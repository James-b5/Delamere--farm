# Enhanced Product Upload Feature - Complete Testing Guide

## ✨ New Features Added

### 1. **Back Button & Cancel Button**
- Back button in top-left navigates back to previous page
- Cancel button clears unsaved changes with confirmation dialog
- Both buttons work from `/admin/products/new` page

### 2. **Expanded File Upload Support**
- **Images**: Up to 10 (was 5), up to 15MB each (was 5MB)
- **Video Files**: MP4, WebM, OGG, MOV - up to 5 videos, 15MB each
- **Documents**: PDF, Word (DOC/DOCX), TXT - up to 5 documents, 15MB each
- **Video URLs**: YouTube, Vimeo, etc - up to 3 URLs

### 3. **Enhanced Product Information**
- **Category**: Cattle, Poultry, Goats, Sheep, Pigs, Equipment, Feed, Services, Other
- **Breed/Type**: Jersey, Angus, Boer Goat, etc. (optional)
- **Health Status**: Vaccinated, Health certified, Pregnant, etc. (optional)
- **Age/Weight**: 3 years old, 450kg, etc. (optional)

### 4. **Tabbed Media Interface**
- Separate tabs for Images, Videos, and Documents
- Color-coded: Green (images), Blue (videos), Purple (documents)
- Drag-and-drop support for each media type

### 5. **Better UI/UX**
- Gradient background (green-50 to green-100)
- Enhanced form layout with numbered sections
- Larger card-based design
- Better visual hierarchy with icons and colors
- Loading states and disabled states

---

## 📋 Test Scenarios

### Scenario 1: Basic Product Upload with Category

**Test Data**:
```
Name: Jersey Dairy Cow
Category: Cattle
Breed: Jersey
Health Status: Vaccinated, Health Certified
Age/Weight: 3 years old, 450kg
Price: 45000
Stock: 2
Description: Premium dairy cow with excellent milk production 
(500+ liters/year). Lineage verified. Ready for immediate use.
Images: 3 farm images (JPEG, PNG, or WebP)
```

**Steps**:
1. Go to `/admin/products/new`
2. Fill all basic information fields
3. Select category: "Cattle"
4. Enter Breed: "Jersey"
5. Enter Health Status: "Vaccinated, Health Certified"
6. Enter Age/Weight: "3 years old, 450kg"
7. Drag 3 images or click to select
8. Click "Create Product"

**Expected Results**:
- ✅ Form accepts all fields
- ✅ Images preview correctly
- ✅ Product created with all information
- ✅ Category visible in product list

---

### Scenario 2: Upload with Video File

**Test Data**:
```
Name: Dairy Farm Tour
Category: Services
Price: 0 (promotional)
Stock: unlimited
Description: Professional farm tour video showing our facilities
Video File: Sample MP4 video (under 15MB)
```

**Steps**:
1. Create new product
2. Fill basic info
3. Click on "Videos" tab
4. Upload a video file (MP4 format, under 15MB)
5. Or add YouTube URL: https://youtube.com/watch?v=example

**Expected Results**:
- ✅ Video file accepts MP4, WebM, OGG, MOV
- ✅ Displays file name and size
- ✅ Can add both video files and URLs
- ✅ Can add up to 5 video files + 3 URLs

---

### Scenario 3: Upload with Documents

**Test Data**:
```
Name: Breeding Bull - Certified Pedigree
Category: Cattle
Breed: Angus
Price: 150000
Stock: 1
Description: Champion breeding bull with health certificates
and complete pedigree records included.

Documents:
1. Health_Certificate.pdf
2. Pedigree_Record.pdf
3. Vaccination_Records.pdf
```

**Steps**:
1. Create new product
2. Fill basic info
3. Click on "Documents" tab
4. Drag/drop or select PDF files
5. Can select up to 5 documents

**Expected Results**:
- ✅ Accepts PDF, DOC, DOCX, TXT files
- ✅ Shows file names and sizes
- ✅ Can remove individual documents
- ✅ Documents stored with product

---

### Scenario 4: File Size & Type Validation

#### Test 4a: Large Image (>15MB)
1. Try to upload image file > 15MB
2. Should show error: "{filename}: File size must be less than 15MB"

#### Test 4b: Invalid Image Type
1. Try to upload image as GIF, BMP, TIFF
2. Should show error: "Only JPG, PNG, and WebP images are allowed"

#### Test 4c: Invalid Video Type
1. Try to upload text file as video
2. Should show error: "Only MP4, WebM, OGG, and MOV videos are allowed"

#### Test 4d: Invalid Document Type
1. Try to upload Excel file (.xlsx)
2. Should show error: "Only PDF, Word (DOC/DOCX), and TXT documents are allowed"

#### Test 4e: Too Many Files
1. Try to upload 11 images (limit 10)
2. Should show error: "Maximum 10 images allowed. You have 10 already."

---

### Scenario 5: Navigation & Unsaved Changes

#### Test 5a: Cancel with No Changes
1. Open product upload form
2. Click "Cancel" button
3. Should go back without confirmation

#### Test 5b: Cancel with Changes
1. Open product upload form
2. Add images and fill some fields
3. Click "Cancel" button
4. Should show: "Are you sure? You have unsaved changes."
5. Click OK to cancel or Cancel to stay

#### Test 5c: Back Button with No Changes
1. Open product upload form
2. Click back arrow button
3. Should go back without confirmation

#### Test 5d: Back Button with Changes
1. Open product upload form
2. Add images
3. Click back arrow button
4. Should show confirmation dialog

---

### Scenario 6: Complex Multi-Media Product

**Test Data**:
```
Name: Premium Sheep Breeding Package
Category: Sheep
Breed: Merino
Health Status: Vaccinated, Quarantine Cleared
Age/Weight: 2 years old, 80kg
Price: 85000
Stock: 3

Media:
- 5 images (sheep photos)
- 2 video files (farm footage)
- 1 YouTube URL
- 3 documents (health records, pedigree, breeding info)
```

**Steps**:
1. Go to `/admin/products/new`
2. Fill all basic information with category = "Sheep"
3. Go to Images tab → Add 5 images
4. Go to Videos tab → Add 2 video files + 1 YouTube URL
5. Go to Documents tab → Add 3 documents
6. Click "Create Product"

**Expected Results**:
- ✅ All tabs work correctly
- ✅ All file limits respected
- ✅ All files stored with product
- ✅ Product appears in admin list
- ✅ Can view all media when editing

---

### Scenario 7: Category Filtering (Future)

**Steps**:
1. Create several products in different categories
2. View product list
3. (Future) Filter by category if implemented

**Expected Results**:
- ✅ Products display correct categories
- ✅ Can see Cattle, Poultry, Equipment, etc.

---

### Scenario 8: Edit Existing Product

**Steps**:
1. Create a product with basic info only
2. Go back to edit it
3. Add category, breed, health status
4. Add images, videos, documents
5. Click "Update Product"

**Expected Results**:
- ✅ All new fields editable
- ✅ Can add media to existing product
- ✅ Previous data preserved

---

## ✅ Comprehensive Checklist

### Basic Information
- [ ] Product name accepts min 2 characters
- [ ] Description accepts min 10 characters
- [ ] Category dropdown works with 9 options
- [ ] Breed/Type field is optional
- [ ] Health Status field is optional
- [ ] Age/Weight field is optional
- [ ] Price validation (positive numbers)
- [ ] Stock validation (non-negative integers)

### Images Tab
- [ ] Drag-and-drop works with visual feedback (green border)
- [ ] Click to select images opens file picker
- [ ] Accepts JPG, PNG, WebP only
- [ ] Rejects other image formats (GIF, BMP, TIFF)
- [ ] Accepts up to 15MB per image
- [ ] Rejects files over 15MB
- [ ] Allows up to 10 images
- [ ] Shows preview grid with hover delete button
- [ ] Shows file sizes for each image
- [ ] Counter shows "X / 10 images selected"

### Videos Tab
- [ ] Video File Upload:
  - [ ] Accepts MP4, WebM, OGG, MOV
  - [ ] Rejects non-video formats
  - [ ] Up to 15MB per file
  - [ ] Up to 5 video files
  - [ ] Shows file names and sizes
  - [ ] Can remove individual videos
  - [ ] Drag-drop works (blue border)
- [ ] Video URL Addition:
  - [ ] Input field accepts URLs
  - [ ] Validates URL format
  - [ ] Up to 3 video URLs
  - [ ] Shows added URLs with clickable links
  - [ ] Can remove individual URLs
  - [ ] Shows counter for URLs

### Documents Tab
- [ ] Drag-and-drop works (purple border)
- [ ] Click to select opens file picker
- [ ] Accepts PDF, DOC, DOCX, TXT
- [ ] Rejects other formats
- [ ] Up to 15MB per document
- [ ] Up to 5 documents
- [ ] Shows file names and sizes
- [ ] Can remove individual documents
- [ ] Shows counter "X / 5 documents"
- [ ] Help text shows document use cases

### Navigation & Buttons
- [ ] Back arrow button in header
- [ ] Cancel button in footer
- [ ] Back/Cancel warn about unsaved changes
- [ ] Back/Cancel don't warn if no changes
- [ ] "Create Product" button shows loading state
- [ ] Button disabled while submitting
- [ ] Success toast appears after creation
- [ ] Error toasts appear for validation failures

### Form Validation
- [ ] Required fields show error messages
- [ ] File validation shows specific errors
- [ ] At least 1 image required
- [ ] Form disables during submission
- [ ] Form resets after successful submission

### API Integration
- [ ] FormData sent correctly to `/api/admin/products`
- [ ] All fields stored in database
- [ ] Images stored as base64
- [ ] Videos stored (files + URLs)
- [ ] Documents stored
- [ ] Category and breed stored
- [ ] Health status and age/weight stored
- [ ] Product retrievable with all fields

---

## 🐛 Troubleshooting

### Form Not Submitting
- Check browser console for errors
- Verify at least 1 image is selected
- Verify all required fields are filled
- Check network tab for API response

### Files Not Accepting
- Verify file format is supported
- Check file size is under 15MB
- Check file count is under limit
- Try refreshing page

### Images Not Previewing
- Check browser console for errors
- Verify images are JPG/PNG/WebP
- Try a different image file
- Clear browser cache

### Videos Not Working
- Verify format: MP4, WebM, OGG, MOV
- Check file size under 15MB
- For URLs, ensure valid format (https://...)
- Test YouTube URL format

### Documents Not Saving
- Verify format: PDF, DOC, DOCX, TXT
- Check file size under 15MB
- Try a smaller document file
- Verify document is not corrupted

---

## 🎯 Success Criteria

✅ **Form is Complete When**:
- All new fields (category, breed, health status, age/weight) work
- All media types accepted (10 images, 5 videos, 3 URLs, 5 documents)
- File sizes support 15MB
- Back and Cancel buttons work with unsaved changes warning
- Validation shows specific error messages
- Form submits successfully to API
- Products appear in admin list with all new fields
- No console errors during upload

---

## 📸 Quick Reference

**File Limits**:
```
Images:    10 files × 15MB max (JPG, PNG, WebP)
Videos:    5 files × 15MB max (MP4, WebM, OGG, MOV)
URLs:      3 video URLs (YouTube, Vimeo, etc.)
Documents: 5 files × 15MB max (PDF, DOC, DOCX, TXT)
```

**Categories**:
```
Cattle, Poultry, Goats, Sheep, Pigs, Equipment, Feed, Services, Other
```

**Navigation**:
```
Back Button    → Click to go back (warns if unsaved changes)
Cancel Button  → Click to discard changes (warns if unsaved)
Create Product → Submit form to create product
```
