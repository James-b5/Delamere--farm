# 🚀 Upload Features - Quick Start Guide

## Start the Dev Server

```bash
cd h:\Projects\Delamere-farm
npm run dev
```

Server will start on `http://localhost:3000` or `http://localhost:3001` (if port 3000 is in use).

---

## 🧪 Quick Test Scenarios

### **Scenario 1: Upload a Simple Product (5 minutes)**

1. **Go to**: http://localhost:3000/admin/products/new
   - If not logged in, you'll be redirected to login page
   - Use admin credentials to log in

2. **Fill Basic Information**:
   ```
   Product Name: Jersey Dairy Cow
   Category: Cattle
   Breed: Jersey
   Health Status/Age/Weight: 3 years old, 450kg, Vaccinated
   Price: 45000
   Stock: 2
   Description: Premium dairy cow with excellent milk production. 
                Lineage verified. Ready for immediate use.
   ```

3. **Upload Image**:
   - Click on "Images" tab (if not already on it)
   - Click "Select Images" button
   - Choose any image from your computer (JPG, PNG, or WebP)
   - You should see a thumbnail preview

4. **Submit**:
   - Click green "Create Product" button
   - Wait for success toast notification
   - You should be redirected or form should reset

5. **Verify**:
   - Go to http://localhost:3000/products
   - You should see your new "Jersey Dairy Cow" product with the image
   - Go to http://localhost:3000/admin/products
   - Your new product should appear in the management list

---

### **Scenario 2: Full Media Upload (10 minutes)**

1. **Fill Basic Information** (same as above)

2. **Upload Images**:
   - Add 2-3 images through the Images tab
   - Watch the preview grid populate
   - Try removing one image by hovering and clicking the X button

3. **Upload Video File**:
   - Click on "Videos" tab
   - Click "Select Videos" button
   - Choose an MP4 video file (if you have one)
   - You should see the file name and size in the list

4. **Add Video URL**:
   - In the "Add Video URLs" section below
   - Paste a YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Click "Add URL" button
   - URL should appear in the list

5. **Upload Document**:
   - Click on "Documents" tab
   - Click "Select Documents" button
   - Choose a PDF file (e.g., health certificate)
   - You should see the file name and size in the list

6. **Submit**:
   - Click green "Create Product" button
   - Wait for success notification

7. **Verify**:
   - Go to http://localhost:3000/products
   - Click on your new product to view details
   - All images, videos, and documents should be visible

---

### **Scenario 3: Validation Testing (5 minutes)**

#### Test 1: Oversized File
1. Try to upload a file larger than 15MB
2. Should see error message: "File size must be less than 15MB"

#### Test 2: Wrong File Type
1. Try to upload an image with `.txt` extension to Images tab
2. Should see error message: "Only JPG, PNG, and WebP images are allowed"

#### Test 3: Too Many Files
1. Try to upload 15 images
2. Should see error message: "Maximum 10 images allowed"

#### Test 4: Missing Required Field
1. Fill in all fields except "Product Name"
2. Click "Create Product"
3. Should see error message: "Product name is required"

#### Test 5: No Image
1. Fill in all required fields except don't upload any image
2. Click "Create Product"
3. Should see error message: "Please add at least one product image"

#### Test 6: Invalid Price
1. Enter "0" or "-100" for price
2. Click "Create Product"
3. Should see error message: "Price must be greater than 0"

---

### **Scenario 4: Navigation Testing (3 minutes)**

1. **Admin Navigation**:
   - Go to http://localhost:3000/admin
   - Click on "Product Management"
   - Click "Add New Product" button
   - Should navigate to upload form

2. **Back Button**:
   - From upload form, click the back arrow button (top-left)
   - Should navigate back to previous page

3. **Cancel Button**:
   - Fill some fields
   - Click "Cancel" button
   - Should see confirmation: "Are you sure? You have unsaved changes."
   - Click OK to go back

4. **Direct URL Access**:
   - Non-admin user tries to access `/admin/products/new`
   - Should redirect to login or show access denied

---

## 📂 File Locations for Testing

### Test Images
You can use freely available test images from:
- `https://picsum.photos/seed/farm/800/600` - Farm image
- `https://picsum.photos/seed/cow/800/600` - Cattle image
- `https://picsum.photos/seed/vegetable/800/600` - Vegetable image

### Test Videos
- Keep a small MP4 video file ready for testing

### Test Documents
- Create a simple PDF or use any existing PDF file

---

## 🐛 Troubleshooting

### Form Not Loading
- Ensure you're logged in as an admin
- Check browser console for errors (F12 → Console tab)
- Verify server is running on correct port

### Files Not Uploading
- Check browser console for errors
- Ensure file sizes are under 15MB
- Verify file types are supported
- Check network tab to see API response

### Product Not Appearing
- Refresh the products page
- Check if product stock > 0
- Check if product is deleted (soft-delete flag)
- Verify in admin products list first

### Database Issues
- If you get database errors, try seeding again:
  ```bash
  npx tsx prisma/seed.ts
  ```

---

## 📊 Expected Results

### Successful Upload
✅ Form submission completes  
✅ Success toast notification appears  
✅ Product appears in admin list  
✅ Product appears in public products page  
✅ All media (images, videos, documents) are accessible  

### After Database Seeding
✅ 5 initial products visible in products page  
✅ Products have proper images and data  
✅ Can upload new products on top of seeded data  

---

## 💡 Tips

- **Unsaved Changes**: The form warns you before losing changes
- **Drag & Drop**: You can drag files directly onto the upload zones
- **Preview**: Images show thumbnails; videos/docs show file names
- **Multiple Formats**: Each media type supports multiple file formats
- **Category Selection**: Choose the most appropriate category for product type

---

## 🎯 Success Indicators

Your upload feature is working correctly when:

✅ You can navigate to the upload form  
✅ Form validates inputs correctly  
✅ You can upload multiple images  
✅ You can add video files and URLs  
✅ You can upload documents  
✅ Products appear on the public products page  
✅ Admin can manage all products  
✅ Proper error messages appear for invalid inputs  
✅ Navigation works (back, cancel buttons)  
✅ Authentication is enforced (non-admin can't upload)  

**Everything working? Great! The upload feature is production-ready! 🎉**
