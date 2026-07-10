-- prisma/cleanup-before-migrate.sql
-- Run this against the target database before applying pending Prisma migrations.
-- It checks for duplicate rows that would break unique indexes, and identifies orphaned foreign-key references.

-- 1) Find duplicate CartItem rows for the unique index on (userId, productId)
SELECT "userId", "productId", COUNT(*) AS count
FROM "CartItem"
GROUP BY "userId", "productId"
HAVING COUNT(*) > 1;

-- 2) Find duplicate Wishlist rows for the unique index on (userId, productId)
SELECT "userId", "productId", COUNT(*) AS count
FROM "Wishlist"
GROUP BY "userId", "productId"
HAVING COUNT(*) > 1;

-- 3) You can dedupe duplicate CartItem rows by keeping the oldest row per pair and deleting the rest.
-- Review the rows before deleting. Uncomment the DELETE block only once you're confident.
--
-- WITH duplicates AS (
--   SELECT id,
--          ROW_NUMBER() OVER (PARTITION BY "userId", "productId" ORDER BY "createdAt" ASC, id ASC) AS rn
--   FROM "CartItem"
-- )
-- DELETE FROM "CartItem"
-- WHERE id IN (
--   SELECT id FROM duplicates WHERE rn > 1
-- );

-- 4) Dedupe duplicate Wishlist rows similarly.
--
-- WITH duplicates AS (
--   SELECT id,
--          ROW_NUMBER() OVER (PARTITION BY "userId", "productId" ORDER BY "createdAt" ASC, id ASC) AS rn
--   FROM "Wishlist"
-- )
-- DELETE FROM "Wishlist"
-- WHERE id IN (
--   SELECT id FROM duplicates WHERE rn > 1
-- );

-- 5) Identify orphaned foreign-key references before adding/validating constraints.
-- These should be fixed manually or nulled if the relationship is optional.

-- Order.userId -> User.id
SELECT o.id, o."userId"
FROM "Order" o
LEFT JOIN "User" u ON o."userId" = u.id
WHERE o."userId" IS NOT NULL AND u.id IS NULL
LIMIT 50;

-- OrderItem.orderId -> Order.id
SELECT oi.id, oi."orderId"
FROM "OrderItem" oi
LEFT JOIN "Order" o ON oi."orderId" = o.id
WHERE o.id IS NULL
LIMIT 50;

-- OrderItem.productId -> Product.id
SELECT oi.id, oi."productId"
FROM "OrderItem" oi
LEFT JOIN "Product" p ON oi."productId" = p.id
WHERE p.id IS NULL
LIMIT 50;

-- Review.productId -> Product.id
SELECT r.id, r."productId"
FROM "Review" r
LEFT JOIN "Product" p ON r."productId" = p.id
WHERE p.id IS NULL
LIMIT 50;

-- Review.userId -> User.id
SELECT r.id, r."userId"
FROM "Review" r
LEFT JOIN "User" u ON r."userId" = u.id
WHERE u.id IS NULL
LIMIT 50;

-- CartItem.userId -> User.id
SELECT c.id, c."userId"
FROM "CartItem" c
LEFT JOIN "User" u ON c."userId" = u.id
WHERE u.id IS NULL
LIMIT 50;

-- CartItem.productId -> Product.id
SELECT c.id, c."productId"
FROM "CartItem" c
LEFT JOIN "Product" p ON c."productId" = p.id
WHERE p.id IS NULL
LIMIT 50;

-- Booking.userId -> User.id
SELECT b.id, b."userId"
FROM "Booking" b
LEFT JOIN "User" u ON b."userId" = u.id
WHERE b."userId" IS NOT NULL AND u.id IS NULL
LIMIT 50;

-- Wishlist.userId -> User.id
SELECT w.id, w."userId"
FROM "Wishlist" w
LEFT JOIN "User" u ON w."userId" = u.id
WHERE u.id IS NULL
LIMIT 50;

-- Wishlist.productId -> Product.id
SELECT w.id, w."productId"
FROM "Wishlist" w
LEFT JOIN "Product" p ON w."productId" = p.id
WHERE p.id IS NULL
LIMIT 50;

-- Address.userId -> User.id
SELECT a.id, a."userId"
FROM "Address" a
LEFT JOIN "User" u ON a."userId" = u.id
WHERE u.id IS NULL
LIMIT 50;

-- 6) Identify duplicate BlogPost slugs before creating the unique slug index.
SELECT "slug", COUNT(*) AS count
FROM "BlogPost"
GROUP BY "slug"
HAVING COUNT(*) > 1;

-- 7) If you need to clean up orphaned rows via deletion, use the following patterns with caution.
-- Uncomment only after verifying the results above.
--
-- DELETE FROM "OrderItem"
-- WHERE "orderId" IN (
--   SELECT oi."orderId"
--   FROM "OrderItem" oi
--   LEFT JOIN "Order" o ON oi."orderId" = o.id
--   WHERE o.id IS NULL
-- );

-- DELETE FROM "OrderItem"
-- WHERE "productId" IN (
--   SELECT oi."productId"
--   FROM "OrderItem" oi
--   LEFT JOIN "Product" p ON oi."productId" = p.id
--   WHERE p.id IS NULL
-- );

-- DELETE FROM "Review"
-- WHERE "productId" IN (
--   SELECT r."productId"
--   FROM "Review" r
--   LEFT JOIN "Product" p ON r."productId" = p.id
--   WHERE p.id IS NULL
-- );

-- DELETE FROM "Review"
-- WHERE "userId" IN (
--   SELECT r."userId"
--   FROM "Review" r
--   LEFT JOIN "User" u ON r."userId" = u.id
--   WHERE u.id IS NULL
-- );

-- DELETE FROM "CartItem"
-- WHERE "userId" IN (
--   SELECT c."userId"
--   FROM "CartItem" c
--   LEFT JOIN "User" u ON c."userId" = u.id
--   WHERE u.id IS NULL
-- );

-- DELETE FROM "CartItem"
-- WHERE "productId" IN (
--   SELECT c."productId"
--   FROM "CartItem" c
--   LEFT JOIN "Product" p ON c."productId" = p.id
--   WHERE p.id IS NULL
-- );

-- DELETE FROM "Wishlist"
-- WHERE "userId" IN (
--   SELECT w."userId"
--   FROM "Wishlist" w
--   LEFT JOIN "User" u ON w."userId" = u.id
--   WHERE u.id IS NULL
-- );

-- DELETE FROM "Wishlist"
-- WHERE "productId" IN (
--   SELECT w."productId"
--   FROM "Wishlist" w
--   LEFT JOIN "Product" p ON w."productId" = p.id
--   WHERE p.id IS NULL
-- );

-- DELETE FROM "Address"
-- WHERE "userId" IN (
--   SELECT a."userId"
--   FROM "Address" a
--   LEFT JOIN "User" u ON a."userId" = u.id
--   WHERE u.id IS NULL
-- );

-- 8) Use a transaction when running any cleanup statements.
-- BEGIN;
-- -- cleanup SQL here
-- COMMIT;
-- Or rollback if the results are not as expected:
-- ROLLBACK;
