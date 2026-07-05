# Admin Interface Visual Guide & Screenshots

## Admin Dashboard Overview

The admin system consists of three main management areas, all accessible only to users with the ADMIN role.

### Access Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Logs In (any role)                                     │
│ role: 'USER' | 'ADMIN' | 'OTHER'                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
         role=='USER'  role=='ADMIN'  role=='OTHER'
                │          │          │
         ┌──────▼──┐ ┌──────▼──┐ ┌──────▼──┐
         │          │ │ CAN     │ │          │
         │ BLOCKED  │ │ ACCESS  │ │ BLOCKED  │
         │ FROM     │ │ ALL     │ │ FROM     │
         │ ADMIN    │ │ ADMIN   │ │ ADMIN    │
         │ PAGES    │ │ PAGES   │ │ PAGES    │
         └──────────┘ └─────────┘ └──────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    /admin/products  /admin/livestock  /admin/media
```

## 1. Products Management Page

**URL**: `/admin/products`

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Delamere Farm Admin                                    │
│  Products              [Search box] [Add New Product] ▼ │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ☑ Name          Price      Stock  Category  Status     │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  ☐ Grass Hay     $45.00     120    Feed      Active     │
│     (Edit) (Delete)                                      │
│                                                           │
│  ☐ Jersey Milk   $85.00      45    Dairy     Active     │
│     (Edit) (Delete)                                      │
│                                                           │
│  ☐ Poultry Feed  $32.50     200    Feed      Active     │
│     (Edit) (Delete)                                      │
│                                                           │
│  ☐ Goat Cheese   $120.00     15    Dairy     Active     │
│     (Edit) (Delete)                                      │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  Bulk Actions: [Delete Selected] [Export CSV]           │
└─────────────────────────────────────────────────────────┘
```

### Features

**Top Bar Components**:
- Title: "Products"
- Search box: Real-time filter by name or category
- Add button: Opens modal to create new product
- (Red indicator if not admin)

**Table Columns**:
1. Checkbox (select multiple)
2. Product Name (string)
3. Price (formatted as currency)
4. Stock (quantity available)
5. Category (e.g., "Dairy", "Feed", "Equipment")
6. Status (Active/Inactive)
7. **Row Actions**: Edit, Delete buttons

**Row Actions**:
```
Edit   → Opens CreateEditModal with product data
Delete → Soft deletes product, removes from view
```

**Bulk Actions Bar**:
- Appears when ≥1 row selected
- Delete Selected: Removes checked items
- Export CSV: Downloads inventory as CSV file

### Create/Edit Modal

```
┌──────────────────────────────────────┐
│ Add New Product                    ✕  │
├──────────────────────────────────────┤
│                                       │
│ Product Name *                        │
│ [_________________________________] │
│                                       │
│ Description                           │
│ [_________________________________] │
│ [_________________________________] │
│                                       │
│ Price (KES) *                         │
│ [_____________________] KES          │
│                                       │
│ Stock Quantity *                      │
│ [_____________________]              │
│                                       │
│ Category *                            │
│ [▼ Select Category ________________] │
│   - Dairy                             │
│   - Feed                              │
│   - Equipment                         │
│   - Vegetables                        │
│                                       │
│                    [Cancel] [Save]  │
└──────────────────────────────────────┘
```

**Field Types**:
- Text input: name, description
- Number input: price, stock
- Select dropdown: category
- Textarea: description (multiline)

**Validation**:
- Required fields marked with *
- Submit disabled until valid
- Toast error messages if invalid

## 2. Livestock Management Page (NEW)

**URL**: `/admin/livestock`

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Delamere Farm Admin                                        │
│  Livestock Management  [Search box] [Add Livestock] ▼       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ☑  Name            Category   Breed      Price   Stock     │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  ☐  Jersey Cow      Cattle     Jersey    ₺250K    3         │
│      (Edit) (Delete)                                         │
│                                                               │
│  ☐  Rhode Island    Poultry    Egg Breed ₺45K    120        │
│      (Edit) (Delete)                                         │
│                                                               │
│  ☐  Alpine Goat     Goats      Alpine    ₺180K   8          │
│      (Edit) (Delete)                                         │
│                                                               │
│  ☐  Merino Sheep    Sheep      Merino    ₺320K   5          │
│      (Edit) (Delete)                                         │
│                                                               │
│  ☐  Large Black     Pigs       Large     ₺420K   12         │
│      (Edit) (Delete)                                         │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Bulk Actions: [Delete Selected] [Export CSV]               │
└─────────────────────────────────────────────────────────────┘
```

### Livestock Categories

```
Livestock Types    │ Example Metadata
───────────────────┼──────────────────
Cattle             │ Breed: Jersey, Holstein
                   │ Age: 3 years
                   │ Weight: 500kg
───────────────────┼──────────────────
Goats              │ Breed: Alpine, Saanen
                   │ Age: 2 years
───────────────────┼──────────────────
Poultry            │ Breed: Rhode Island Red
                   │ Age: 6 months
                   │ Weight: 2.5kg
───────────────────┼──────────────────
Sheep              │ Breed: Merino
                   │ Age: 18 months
                   │ Wool: Yes/No
───────────────────┼──────────────────
Pigs               │ Breed: Large Black
                   │ Age: 1 year
                   │ Weight: 250kg
```

### Livestock Form (Create/Edit Modal)

```
┌──────────────────────────────────────────┐
│ Add Livestock                          ✕  │
├──────────────────────────────────────────┤
│                                           │
│ Livestock Name *                          │
│ [_________________________________]      │
│  Example: "Jersey Cow #5"                 │
│                                           │
│ Category *                                │
│ [▼ Select Category _______________]      │
│   - Cattle                                │
│   - Goats                                 │
│   - Poultry                               │
│   - Sheep                                 │
│   - Pigs                                  │
│                                           │
│ Breed                                     │
│ [_________________________________]      │
│  Example: "Jersey" or "Holstein"          │
│                                           │
│ Health Status                             │
│ [_________________________________]      │
│  Example: "Healthy", "Under Treatment"    │
│                                           │
│ Age/Weight                                │
│ [_________________________________]      │
│  Example: "3 years, 500kg"                │
│                                           │
│ Price (KES) *                             │
│ [________________________] KES            │
│                                           │
│ Available Stock *                         │
│ [_____________________]                   │
│                                           │
│ Description                               │
│ [_________________________________]      │
│ [_________________________________]      │
│ [_________________________________]      │
│                                           │
│                    [Cancel] [Save]      │
└──────────────────────────────────────────┘
```

### Search & Filter Example

```
Search box behavior:
[Search by name, category, breed...]

Query: "Jersey"
↓
Results:
- Jersey Cow (Cattle, Jersey breed)
- Jersey Cattle (Cattle, Jersey breed)

Query: "Goats"
↓
Results:
- Alpine Goat (Goats, Alpine breed)
- Saanen Goat (Goats, Saanen breed)

Query: "Healthy"
↓
Results:
- Any livestock with "Healthy" in health status field
```

## 3. Media Manager

**URL**: `/admin/media` (embedded in admin area)

### Upload Section

```
┌──────────────────────────────────────────────────────────┐
│ Media Upload Form                                        │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Media Type:        Title:              Description:     │
│  [▼ Image]  [_____________]  [_________________]        │
│  [▼ Video]                                               │
│                                                            │
│  File: [Browse...]  [Upload Button]                     │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Gallery Display

```
┌──────────────────────────────────────────────────────────────┐
│ Uploaded Media Gallery                                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │             │  │             │  │             │          │
│  │   Image 1   │  │   Image 2   │  │   Video 1   │          │
│  │  (Thumbnail)│  │  (Thumbnail)│  │  (Preview)  │          │
│  │             │  │             │  │             │          │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤          │
│  │Farm House   │  │Cattle Herd  │  │Farm Tour    │          │
│  │Beautiful..  │  │Grazing in..  │  │A walkthrough│          │
│  │             │  │             │  │             │          │
│  │[Edit][Delete]  │[Edit][Delete]  │[Edit][Delete]         │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │             │  │             │                           │
│  │   Image 3   │  │   Video 2   │                           │
│  │  (Thumbnail)│  │  (Preview)  │                           │
│  │             │  │             │                           │
│  ├─────────────┤  ├─────────────┤                           │
│  │Goat Pen     │  │Product Reel │                           │
│  │Cute goats..  │  │Showcase of..│                           │
│  │             │  │             │                           │
│  │[Edit][Delete]  │[Edit][Delete]                           │
│  └─────────────┘  └─────────────┘                           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Edit Media Modal

```
┌──────────────────────────────────┐
│ Edit Media                      ✕  │
├──────────────────────────────────┤
│                                   │
│ Title *                           │
│ [________________________]       │
│  Example: "Farm House"            │
│                                   │
│ Description                       │
│ [________________________]       │
│ [________________________]       │
│ [________________________]       │
│  Example: "Beautiful view of...   │
│                                   │
│ Display Order                     │
│ [_________]                      │
│  (Controls gallery position)      │
│                                   │
│              [Cancel] [Save]    │
└──────────────────────────────────┘
```

## 4. Role-Based UI States

### When User is ADMIN ✅

```
┌─────────────────────────────────┐
│ Products                        │
│ [+ Add New Product]             │  ← Button enabled
│                                 │
│ ☑ Jersey Milk    [Edit][Delete] │  ← Actions enabled
│ ☑ Goat Cheese    [Edit][Delete] │
│ ☑ Poultry Feed   [Edit][Delete] │
│                                 │
│ [Delete Selected] [Export CSV]  │  ← Bulk actions enabled
└─────────────────────────────────┘
```

### When User is NOT ADMIN (Non-Admin) ❌

```
┌─────────────────────────────────┐
│ You are not authorized to view  │
│ this page.                      │
│                                 │
│ (Automatically redirected to    │
│  /login with toast message:     │
│  "Unauthorized: Admin access    │
│   required")                    │
└─────────────────────────────────┘

OR if somehow they see partial page:

┌─────────────────────────────────┐
│ Products                        │
│ [+ Add New Product]             │  ← Button DISABLED
│   (opacity: 50%, no-click)      │
│                                 │
│ ☐ Jersey Milk    [Edit][Delete] │  ← Actions DISABLED
│ ☐ Goat Cheese    [Edit][Delete] │    (grey, no-click)
│ ☐ Poultry Feed   [Edit][Delete] │
│                                 │
│ (Media upload form similarly    │
│  disabled)                      │
└─────────────────────────────────┘
```

## Toast Notification Examples

### Success Messages 🟢
```
✓ Livestock added successfully
✓ Livestock updated successfully
✓ Livestock deleted
✓ Media updated successfully
✓ Products deleted
```

### Error Messages 🔴
```
✗ Unauthorized: Admin access required
✗ Only admins can upload media
✗ Only admins can edit media
✗ Only admins can delete media
✗ Failed to delete livestock
✗ Error loading livestock
✗ Delete failed
```

## Data Flow Diagram

### Create/Edit Flow

```
User clicks [Add Livestock]
    ↓
CreateEditModal opens
    ↓
User fills form fields
    ↓
User clicks [Save]
    ↓
Form validates required fields
    ↓
POST/PUT /api/admin/products
    ↓
API checks: isAdmin? JWT valid?
    ↓
    ├─ YES → Create/Update → Return 200
    │         ↓
    │    Table refreshes
    │         ↓
    │    Toast: "Success..."
    │
    └─ NO → Return 401/403
             ↓
            Toast: "Unauthorized..."
```

### Delete Flow

```
User clicks [Delete] on row
    ↓
Confirmation dialog appears
    ↓
User clicks [Confirm]
    ↓
DELETE /api/admin/products/[id]
    ↓
API checks: isAdmin? JWT valid?
    ↓
    ├─ YES → Soft delete (deleted=true) → Return 200
    │         ↓
    │    Item removed from UI
    │         ↓
    │    Toast: "Deleted"
    │
    └─ NO → Return 401/403
             ↓
            Toast: "Unauthorized..."
```

## Keyboard Navigation

```
Tab               Navigate through form fields
Shift+Tab         Navigate backwards
Enter             Submit form (when focused on Save button)
Escape            Close modal
Space             Toggle checkbox
Arrow Down/Up     Navigate in select dropdown
```

## Mobile Responsiveness

**Desktop**: 3-column media gallery
**Tablet**: 2-column media gallery
**Mobile**: 1-column media gallery, hamburger menu for admin nav

## Accessibility Features

- ✅ ARIA labels on form inputs
- ✅ Form validation with error messages
- ✅ Disabled buttons have opacity change for visibility
- ✅ Toast notifications announce changes
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Role indicators in UI

## Security Visual Indicators

```
Admin User Indicators:
┌─────────────────┐
│ John (Admin)    │ ← Role badge/indicator
│ john@farm.com   │
└─────────────────┘

Regular User Indicators:
┌─────────────────┐
│ Jane (User)     │ ← Cannot see admin nav
│ jane@farm.com   │
└─────────────────┘
```

## Summary

The admin interface provides:
1. **Consistent Design**: Same pattern across Products, Livestock, Media
2. **Clear Role Protection**: Disabled UI + redirects for non-admins
3. **Efficient Workflows**: Quick add/edit/delete with modals
4. **Visual Feedback**: Toast messages for all actions
5. **Bulk Operations**: Select multiple + perform batch actions
6. **Search & Filter**: Real-time filtering
7. **Data Export**: CSV downloads
8. **Responsive Layout**: Works on desktop, tablet, mobile
