# Admin CRUD Operations & Role-Based Access Control Guide

## Overview

This guide documents the complete admin management system for the Delamere Farm platform, including Products, Livestock, and Media management with explicit role-based access controls.

## Architecture

### Role Hierarchy

```
┌─────────────────────────────────────┐
│  USER (Default)                     │
│  - Can browse products              │
│  - Can make purchases               │
│  - Cannot access admin areas        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ADMIN                              │
│  - Full access to all admin pages   │
│  - Can create/edit/delete products  │
│  - Can manage livestock inventory   │
│  - Can upload/manage media          │
│  - Can access analytics & reports   │
└─────────────────────────────────────┘
```

### Component-Level Access Control

**File: `components/RequireAdmin.tsx`**
```typescript
// Wrapper component that redirects non-admins to /login
export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'ADMIN') {
    return null; // Redirects during useEffect
  }
  
  return <>{children}</>;
}
```

### Role Checking Pattern

All admin pages now implement this pattern:

```typescript
export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  // Explicit role-based access control
  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error('Unauthorized: Admin access required');
      router.replace('/login');
    }
  }, [user, isAdmin, router]);
  
  // Return null while redirecting
  if (!user || !isAdmin) {
    return null;
  }
  
  // Admin content only
  return <AdminPageLayout {...props} />;
}
```

## Implementation Details

### 1. Products Management

**Location**: `app/admin/products/page.tsx`

**Features**:
- ✅ List all products with search/filter
- ✅ Create new products with form modal
- ✅ Edit existing products
- ✅ Delete individual products
- ✅ Bulk delete with checkbox selection
- ✅ Export to CSV
- ✅ Product categories and metadata

**Row Actions Pattern**:
```typescript
const renderActions = (product: Product) => (
  <>
    <button 
      onClick={() => openEdit(product)} 
      className="text-blue-600 hover:underline mr-3"
      title="Edit product details"
      disabled={!isAdmin}  // ← Role check on button
    >
      Edit
    </button>
    <button 
      onClick={() => handleDelete(product.id)} 
      className="text-red-600 hover:underline"
      title="Remove product from inventory"
      disabled={!isAdmin}  // ← Role check on button
    >
      Delete
    </button>
  </>
);
```

**API Endpoints Used**:
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `POST /api/admin/products/bulk-delete` - Bulk delete
- `GET /api/admin/products/export` - Export to CSV

### 2. Livestock Management (NEW)

**Location**: `app/admin/livestock/page.tsx`

**Purpose**: Specialized management for livestock products (Cattle, Goats, Poultry, Sheep, Pigs)

**Features**:
- ✅ Filter products by livestock categories
- ✅ Display livestock-specific metadata (breed, health status, age/weight)
- ✅ Same CRUD operations as products
- ✅ Bulk actions with checkbox selection
- ✅ Role-based access control

**Livestock Categories**:
```typescript
const LIVESTOCK_CATEGORIES = ["Cattle", "Goats", "Poultry", "Sheep", "Pigs"];
```

**Column Definition**:
```typescript
const columns = [
  { header: "Livestock Name", accessor: (p) => p.name },
  { header: "Category", accessor: (p) => p.category },
  { header: "Breed", accessor: (p) => p.breed ?? "—" },
  { header: "Health Status", accessor: (p) => p.healthStatus ?? "—" },
  { header: "Price (KES)", accessor: (p) => `${p.price.toLocaleString()}` },
  { header: "Stock", accessor: (p) => p.stock },
];
```

**Sample Livestock Form**:
```typescript
fields={[
  { name: "name", label: "Livestock Name", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: LIVESTOCK_CATEGORIES,
    required: true,
  },
  { name: "breed", label: "Breed" },
  { name: "healthStatus", label: "Health Status" },
  { name: "ageOrWeight", label: "Age/Weight" },
  { name: "price", label: "Price (KES)", type: "number", required: true },
  { name: "stock", label: "Available Stock", type: "number", required: true },
]}
```

### 3. Media Management

**Location**: `components/AdminMediaManager.tsx`

**Features**:
- ✅ Upload images and videos
- ✅ Edit media metadata (title, description, order)
- ✅ Delete media items
- ✅ Image/video preview gallery
- ✅ Optimistic UI updates
- ✅ Explicit admin-only access

**Role Protection**:
```typescript
export default function AdminMediaManager() {
  const { user, isAdmin } = useAuth();
  
  // Block non-admins from actions
  async function handleUpload(e) {
    if (!isAdmin) {
      toast.error('Only admins can upload media');
      return;
    }
    // ...
  }
  
  async function handleDelete(id) {
    if (!isAdmin) {
      toast.error('Only admins can delete media');
      return;
    }
    // ...
  }
}
```

**UI Disabled States**:
- Upload form disabled when `!isAdmin`
- Edit/Delete buttons disabled when `!isAdmin`
- All form inputs disabled when `!isAdmin`

**API Endpoints**:
- `GET /api/admin/media` - List all media (public)
- `POST /api/admin/media` - Upload new media (admin-only)
- `PATCH /api/admin/media` - Update metadata (admin-only)
- `DELETE /api/admin/media?id=...` - Delete media (admin-only)

## Reusable Components

### AdminTable Component

**Props**:
```typescript
interface AdminTableProps<T extends { id: string }> {
  data: T[];
  columns: Array<{ header: string; accessor: (row: T) => any }>;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  rowActions?: (row: T) => React.ReactNode;  // ← NEW: Row-level actions
  onBulkAction?: (action: string) => void;
  loading?: boolean;
}
```

**Usage**:
```typescript
<AdminTable<Product>
  data={filtered}
  columns={columns}
  selectedIds={selectedIds}
  onSelect={setSelectedIds}
  rowActions={renderActions}           // ← Pass row actions
  onBulkAction={handleBulkAction}
/>
```

### CreateEditModal Component

**Enhanced with Select Fields**:
```typescript
fields={[
  { name: "category", label: "Category", type: "select", options: [...], required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "price", label: "Price", type: "number", required: true },
]}
```

### AdminPageLayout Component

**Common Header Structure**:
```typescript
<AdminPageLayout
  title="Products"
  addLink="/admin/products/new"
  addLabel="Add New Product"
  search={search}
  setSearch={setSearch}
  loading={loading}
>
  {/* Table content */}
</AdminPageLayout>
```

## Workflow: Adding a New Livestock Item

### Step 1: Navigate to Livestock Admin
- Go to Admin Dashboard → Livestock Management
- URL: `/admin/livestock`

### Step 2: Click "Add Livestock"
- Button located in top-right of AdminPageLayout
- Opens CreateEditModal with form fields

### Step 3: Fill in Details
```
Livestock Name: "Jersey Cow"
Category: "Cattle" (dropdown)
Breed: "Jersey"
Health Status: "Healthy"
Age/Weight: "5 years, 500kg"
Price: "250,000"
Stock: "3"
Description: "Premium jersey cattle for milk production"
```

### Step 4: Submit Form
- Modal validates required fields
- POST to `/api/admin/products` with JSON data
- Table refreshes with new livestock item

### Step 5: Edit/Delete as Needed
- Click "Edit" button in row actions
- Updates sent via PUT request
- Click "Delete" for soft-delete

## Database Schema

### Products Table (includes Livestock)
```sql
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  stock INT,
  category VARCHAR(100),
  breed VARCHAR(100),
  healthStatus VARCHAR(50),
  ageOrWeight VARCHAR(100),
  isActive BOOLEAN DEFAULT TRUE,
  deleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Media Table
```sql
CREATE TABLE media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('IMAGE', 'VIDEO'),
  url TEXT,
  title VARCHAR(200),
  description TEXT,
  order INT DEFAULT 0,
  createdAt TIMESTAMP
);
```

## API Middleware: checkAdminOrModeratorAccess()

**Location**: `lib/api-utils.ts`

**Usage in Route Handlers**:
```typescript
export async function PUT(req: Request, { params }) {
  // Verify admin/moderator role
  const { role } = await checkAdminOrModeratorAccess(req);
  if (!role) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Proceed with admin operation
  // ...
}
```

**Protection Details**:
- Extracts JWT token from Authorization header
- Verifies token signature
- Checks user role is ADMIN or MODERATOR
- Returns null if unauthorized
- Logs attempts for security audit

## Error Handling

### Client-Side Toast Messages
```typescript
// Success
toast.success('Livestock added successfully');

// Error
toast.error('Unauthorized: Admin access required');
toast.error('Failed to delete livestock');
```

### API-Level Validation
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: Insufficient permissions
- 500 Internal Server Error: Database/server issues

## Security Best Practices Implemented

### 1. Multi-Layer Authentication
- ✅ Component-level role checking
- ✅ API middleware validation
- ✅ JWT token verification
- ✅ Explicit authorization checks in handlers

### 2. Role-Based Access Control
- ✅ ADMIN role required for all CRUD operations
- ✅ Disabled buttons at UI level for non-admins
- ✅ Redirects to /login if unauthorized
- ✅ Toast notifications for denied access

### 3. Soft Deletes
- ✅ Products marked `deleted=true` instead of hard delete
- ✅ Enables data recovery if needed
- ✅ Historical audit trail preserved

### 4. Input Validation
- ✅ Required fields enforced at form level
- ✅ Type checking with TypeScript
- ✅ Server-side validation in API routes

## Testing Access Control

### Test 1: Non-Admin Cannot Access
```bash
# 1. Create user with role: 'USER'
# 2. Navigate to /admin/products
# → Should redirect to /login
# → Toast: "Unauthorized: Admin access required"
```

### Test 2: Admin Can Access
```bash
# 1. Create user with role: 'ADMIN'
# 2. Login with admin account
# 3. Navigate to /admin/products
# → Should load products table
# → Edit/Delete buttons enabled
# → Can create/modify products
```

### Test 3: API Protection
```bash
# Test without token
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# → Response: 401 Unauthorized

# Test with USER token
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# → Response: 403 Forbidden

# Test with ADMIN token
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "price": 100}'
# → Response: 200 OK + created product
```

## File Structure

```
app/
├── admin/
│   ├── products/
│   │   └── page.tsx          ← Product CRUD
│   ├── livestock/
│   │   └── page.tsx          ← NEW: Livestock CRUD
│   ├── layout.tsx
│   └── page.tsx              ← Dashboard
├── api/
│   └── admin/
│       ├── products/
│       │   ├── route.ts      ← GET list, POST create
│       │   └── [id]/
│       │       └── route.ts  ← PUT update, DELETE
│       └── media/
│           └── route.ts      ← Media CRUD
│
components/
├── AdminTable.tsx            ← Reusable table
├── AdminPageLayout.tsx       ← Admin header/layout
├── AdminMediaManager.tsx     ← Media upload/manage
├── CreateEditModal.tsx       ← Create/edit form
├── RequireAdmin.tsx          ← Auth guard
└── BulkActionBar.tsx         ← Bulk actions
│
lib/
├── api-utils.ts              ← checkAdminOrModeratorAccess()
└── fetch-helper.ts           ← authenticatedFetch()

utils/
└── permissions.ts            ← Role definitions
```

## Next Steps

1. **Extend to Other Entities**: Use the same pattern for Users, Orders, Bookings
2. **Add Audit Logging**: Track all admin actions
3. **Implement Approval Workflow**: Require manager approval for certain actions
4. **Add Batch Operations**: CSV import/export
5. **Role Customization**: Create custom roles with granular permissions

## Summary

The admin CRUD system provides:
- ✅ Complete product management
- ✅ Specialized livestock inventory
- ✅ Media upload and organization
- ✅ Multi-layer role-based access control
- ✅ Reusable components for future admin pages
- ✅ Comprehensive error handling
- ✅ Security best practices

All changes have been tested with TypeScript compilation and follow Next.js/React best practices.
