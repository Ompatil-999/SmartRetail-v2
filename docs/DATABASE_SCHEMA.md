# SmartRetail Database Schema

## Overview

The `schema.sql` file is **CRITICAL** — it defines the complete database structure for the SmartRetail SaaS application.

## Database: `smart_retail_db`

### Tables

#### 1. **stores** (Multi-tenant base)
- Store information (name, GST, tax rate, address, phone)
- All other tables reference this via `store_id` for multi-tenancy

#### 2. **owners** (Store owners/admins)
- Authentication credentials
- Linked to exactly one store (1:1 relationship)
- Unique email constraint

#### 3. **categories** (Product categorization)
- Organize products
- Unique constraint: `(name, store_id)` — no duplicate category names per store

#### 4. **products** (Inventory)
- Barcode tracking for POS
- Stock quantity with low-stock threshold
- Optional category association
- Unique constraint: `(barcode, store_id)`

#### 5. **customers** (Customer records)
- Contact information
- Optional email (unique per store)
- Purchase history via bills

#### 6. **bills** (Sales transactions)
- Complete billing with tax calculation
- Bill number is unique per store
- Status tracking (COMPLETED, etc.)
- Discount support (item-level & bill-level)

#### 7. **bill_items** (Line items in bills)
- Maps products to bills
- Stores snapshot of product name & unit price
- Discount per line item

#### 8. **offers** (Promotions)
- Time-based discounts
- Valid date range tracking
- Active/inactive status

## Key Design Features

### Multi-Tenancy
- Every table (except stores & owners) has a `store_id` foreign key
- Ensures data isolation between different retail stores

### Referential Integrity
- Foreign key constraints with `ON DELETE CASCADE` (soft delete where appropriate)
- `CONSTRAINT chk_stock_non_negative` — stock cannot be negative

### Indexing
- Indexes on foreign keys (`store_id`, `customer_id`, etc.) for query performance
- Indexes on searchable fields (`barcode`, `name`, `email`)
- Composite index on `(valid_till)` for offer queries

### Character Encoding
- UTF8MB4 for full Unicode support (emoji, international characters)

## To Set Up

```bash
mysql -u root -p < schema.sql
```

Or in your application:
```java
// Spring Boot will auto-execute schema.sql on startup (if configured)
// See: application.yml
```

## Important Notes

✅ **Keep this file version-controlled** — it's the source of truth for the database structure
✅ **Use migrations for changes** — Don't modify directly in production
✅ **Backup before running** — Always backup before executing DDL in production
