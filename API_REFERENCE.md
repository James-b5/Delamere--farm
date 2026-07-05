# API Reference - Enhanced Product Upload

## POST /api/admin/products - Create Product

### Request Format
**Content-Type**: `multipart/form-data`

### Request Body
```
name: "Jersey Dairy Cow"
description: "A high-producing dairy cow with excellent genetics"
price: 45000
stock: 2
category: "Cattle"
breed: "Jersey" (optional)
healthStatus: "Vaccinated, Certified" (optional)
ageOrWeight: "3 years old, 450kg" (optional)

images: [File, File, ...] (1-10 files, JPG/PNG/WebP, max 15MB each)
videos: [File, File, ...] (0-5 files, MP4/WebM/OGG/MOV, max 15MB each)
documents: [File, File, ...] (0-5 files, PDF/DOC/DOCX/TXT, max 15MB each)
videos: ["https://youtube.com/watch?v=...", ...] (0-3 URLs)
```

### Success Response (201 Created)
```json
{
  "id": "cuid123",
  "name": "Jersey Dairy Cow",
  "description": "A high-producing dairy cow...",
  "price": 45000,
  "stock": 2,
  "category": "Cattle",
  "breed": "Jersey",
  "healthStatus": "Vaccinated, Certified",
  "ageOrWeight": "3 years old, 450kg",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZ...",
    "data:image/png;base64,iVBORw0KGgo..."
  ],
  "videos": [
    "data:video/mp4;base64,AAAAIGZ0eXBpc...",
    "https://youtube.com/watch?v=example"
  ],
  "documents": [
    "data:application/pdf;base64,JVBERi0x...",
    "data:application/msword;base64,d0HD..."
  ],
  "deleted": false,
  "createdAt": "2026-06-09T12:34:56.000Z",
  "updatedAt": "2026-06-09T12:34:56.000Z"
}
```

### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "error": "Missing or invalid required fields: name, description, price, stock, category"
}
```

**400 Bad Request** - File validation error
```json
{
  "error": "File example.gif: Only JPG, PNG, and WebP images are allowed"
}
```

**401 Unauthorized** - Not admin/moderator
```json
{
  "error": "Unauthorized"
}
```

**500 Server Error**
```json
{
  "error": "Failed to create product"
}
```

---

## GET /api/admin/products - List Products

### Request Format
**Method**: GET  
**Headers**: Authorization required

### Success Response (200 OK)
```json
[
  {
    "id": "cuid123",
    "name": "Jersey Dairy Cow",
    "description": "A high-producing dairy cow...",
    "price": 45000,
    "stock": 2,
    "category": "Cattle",
    "breed": "Jersey",
    "healthStatus": "Vaccinated, Certified",
    "ageOrWeight": "3 years old, 450kg",
    "images": ["data:image/jpeg;base64,...", ...],
    "videos": ["data:video/mp4;base64,...", "https://youtube.com/..."],
    "documents": ["data:application/pdf;base64,..."],
    "deleted": false,
    "createdAt": "2026-06-09T12:34:56.000Z",
    "updatedAt": "2026-06-09T12:34:56.000Z"
  },
  ...
]
```

---

## GET /api/admin/products/[id] - Get Single Product

### Request Format
**Method**: GET  
**URL Parameter**: `id` - Product ID

### Success Response (200 OK)
```json
{
  "id": "cuid123",
  "name": "Jersey Dairy Cow",
  "description": "A high-producing dairy cow...",
  "price": 45000,
  "stock": 2,
  "category": "Cattle",
  "breed": "Jersey",
  "healthStatus": "Vaccinated, Certified",
  "ageOrWeight": "3 years old, 450kg",
  "images": ["data:image/jpeg;base64,..."],
  "videos": ["data:video/mp4;base64,..."],
  "documents": ["data:application/pdf;base64,..."],
  "deleted": false,
  "createdAt": "2026-06-09T12:34:56.000Z",
  "updatedAt": "2026-06-09T12:34:56.000Z"
}
```

### Error Response

**404 Not Found**
```json
{
  "error": "Product not found"
}
```

---

## PUT /api/admin/products/[id] - Update Product

### Request Format
**Content-Type**: `multipart/form-data` (for file uploads) or `application/json`

### Request Body (FormData)
```
name: "Updated Name" (optional)
description: "Updated description" (optional)
price: 50000 (optional)
stock: 5 (optional)
category: "Poultry" (optional)
breed: "Updated breed" (optional)
healthStatus: "Updated status" (optional)
ageOrWeight: "Updated info" (optional)

images: [File, File, ...] (replaces existing)
videos: [File, File, ...] (replaces existing)
documents: [File, File, ...] (replaces existing)
videos: ["https://youtube.com/...", ...] (URLs, replaces existing)
```

### OR Request Body (JSON)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 50000,
  "stock": 5,
  "category": "Poultry",
  "breed": "Updated breed",
  "healthStatus": "Updated status",
  "ageOrWeight": "Updated info",
  "images": [],
  "videos": [],
  "documents": []
}
```

### Success Response (200 OK)
Same as GET single product response with updated fields

### Error Responses

**400 Bad Request** - Validation error
```json
{
  "error": "Price must be greater than 0"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "error": "Product not found"
}
```

---

## DELETE /api/admin/products/[id] - Delete Product

### Request Format
**Method**: DELETE  
**URL Parameter**: `id` - Product ID

### Note
Performs soft delete (sets `deleted: true`, does not remove from database)

### Success Response (200 OK)
```json
{
  "id": "cuid123",
  "name": "Jersey Dairy Cow",
  "deleted": true,
  "deletedAt": "2026-06-09T12:35:00.000Z",
  ...
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "error": "Product not found"
}
```

---

## Field Specifications

### Basic Fields
- **name**: String, min 2 characters, required
- **description**: String, min 10 characters, required
- **price**: Number, positive, required
- **stock**: Integer, non-negative, required

### Farm-Specific Fields
- **category**: String, one of: Cattle, Poultry, Goats, Sheep, Pigs, Equipment, Feed, Services, Other, optional
- **breed**: String, examples: Jersey, Angus, Boer Goat, optional
- **healthStatus**: String, examples: Vaccinated, Health Certified, optional
- **ageOrWeight**: String, examples: 3 years old, 450kg, optional

### Media Fields
- **images**: JSON array of base64 encoded images (max 10)
- **videos**: JSON array of base64 encoded video files (max 5) + video URLs (max 3)
- **documents**: JSON array of base64 encoded documents (max 5)

### System Fields
- **id**: CUID (automatically generated)
- **deleted**: Boolean (soft delete flag)
- **createdAt**: ISO DateTime
- **updatedAt**: ISO DateTime

---

## File Type Restrictions

### Images
- ✅ JPEG (image/jpeg)
- ✅ PNG (image/png)
- ✅ WebP (image/webp)
- ❌ GIF, BMP, TIFF, SVG

### Videos (Files)
- ✅ MP4 (video/mp4)
- ✅ WebM (video/webm)
- ✅ OGG (video/ogg)
- ✅ MOV (video/quicktime)
- ❌ Other formats

### Videos (URLs)
- ✅ Any valid HTTPS URL
- ✅ YouTube, Vimeo, custom hosting

### Documents
- ✅ PDF (application/pdf)
- ✅ Word DOC (application/msword)
- ✅ Word DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- ✅ Text TXT (text/plain)
- ❌ Excel, PowerPoint, other formats

---

## Size Limits

| Type | Max per File | Max per Product |
|------|------------|-----------------|
| Image | 15 MB | 10 files |
| Video File | 15 MB | 5 files |
| Video URL | N/A | 3 URLs |
| Document | 15 MB | 5 files |

---

## Authentication

All endpoints require:
- Valid session (NextAuth)
- User role: ADMIN or MODERATOR
- Valid JWT token in cookies

---

## Example: Complete Product Creation

```javascript
const formData = new FormData();

// Basic info
formData.append('name', 'Premium Jersey Cow');
formData.append('description', 'High-producing dairy cow with excellent genetics');
formData.append('price', '45000');
formData.append('stock', '2');

// Farm-specific info
formData.append('category', 'Cattle');
formData.append('breed', 'Jersey');
formData.append('healthStatus', 'Vaccinated, Health Certified');
formData.append('ageOrWeight', '3 years old, 450kg');

// Files
formData.append('images', imageFile1);
formData.append('images', imageFile2);
formData.append('videos', videoFile1);
formData.append('videos', 'https://youtube.com/watch?v=example');
formData.append('documents', pdfFile1);

// Submit
const response = await fetch('/api/admin/products', {
  method: 'POST',
  body: formData
});

const product = await response.json();
console.log('Product created:', product.id);
```

---

## Status Codes Summary

| Code | Meaning | When |
|------|---------|------|
| 201 | Created | Product successfully created |
| 200 | OK | GET/PUT/DELETE successful |
| 400 | Bad Request | Invalid data or validation error |
| 401 | Unauthorized | Not authenticated or insufficient permissions |
| 404 | Not Found | Product doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Deprecation Notes

The old JSON-based POST endpoint is now deprecated:
- Old: `POST /api/admin/products` with `Content-Type: application/json`
- New: `POST /api/admin/products` with `Content-Type: multipart/form-data`

Both work, but FormData is recommended for file uploads.
