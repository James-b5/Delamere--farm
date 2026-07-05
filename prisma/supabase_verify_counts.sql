SELECT 'Address' AS table_name, CASE WHEN to_regclass('public."Address"') IS NOT NULL THEN (SELECT count(*) FROM "Address") ELSE NULL END AS row_count;
SELECT 'BlogPost' AS table_name, CASE WHEN to_regclass('public."BlogPost"') IS NOT NULL THEN (SELECT count(*) FROM "BlogPost") ELSE NULL END AS row_count;
SELECT 'Booking' AS table_name, CASE WHEN to_regclass('public."Booking"') IS NOT NULL THEN (SELECT count(*) FROM "Booking") ELSE NULL END AS row_count;
SELECT 'CartItem' AS table_name, CASE WHEN to_regclass('public."CartItem"') IS NOT NULL THEN (SELECT count(*) FROM "CartItem") ELSE NULL END AS row_count;
SELECT 'Category' AS table_name, CASE WHEN to_regclass('public."Category"') IS NOT NULL THEN (SELECT count(*) FROM "Category") ELSE NULL END AS row_count;
SELECT 'ContactMessage' AS table_name, CASE WHEN to_regclass('public."ContactMessage"') IS NOT NULL THEN (SELECT count(*) FROM "ContactMessage") ELSE NULL END AS row_count;
SELECT 'DraftReview' AS table_name, CASE WHEN to_regclass('public."DraftReview"') IS NOT NULL THEN (SELECT count(*) FROM "DraftReview") ELSE NULL END AS row_count;
SELECT 'Media' AS table_name, CASE WHEN to_regclass('public."Media"') IS NOT NULL THEN (SELECT count(*) FROM "Media") ELSE NULL END AS row_count;
SELECT 'Order' AS table_name, CASE WHEN to_regclass('public."Order"') IS NOT NULL THEN (SELECT count(*) FROM "Order") ELSE NULL END AS row_count;
SELECT 'OrderItem' AS table_name, CASE WHEN to_regclass('public."OrderItem"') IS NOT NULL THEN (SELECT count(*) FROM "OrderItem") ELSE NULL END AS row_count;
SELECT 'PostTag' AS table_name, CASE WHEN to_regclass('public."PostTag"') IS NOT NULL THEN (SELECT count(*) FROM "PostTag") ELSE NULL END AS row_count;
SELECT 'Product' AS table_name, CASE WHEN to_regclass('public."Product"') IS NOT NULL THEN (SELECT count(*) FROM "Product") ELSE NULL END AS row_count;
SELECT 'Review' AS table_name, CASE WHEN to_regclass('public."Review"') IS NOT NULL THEN (SELECT count(*) FROM "Review") ELSE NULL END AS row_count;
SELECT 'Tag' AS table_name, CASE WHEN to_regclass('public."Tag"') IS NOT NULL THEN (SELECT count(*) FROM "Tag") ELSE NULL END AS row_count;
SELECT 'User' AS table_name, CASE WHEN to_regclass('public."User"') IS NOT NULL THEN (SELECT count(*) FROM "User") ELSE NULL END AS row_count;
SELECT 'WeatherCache' AS table_name, CASE WHEN to_regclass('public."WeatherCache"') IS NOT NULL THEN (SELECT count(*) FROM "WeatherCache") ELSE NULL END AS row_count;
SELECT 'Wishlist' AS table_name, CASE WHEN to_regclass('public."Wishlist"') IS NOT NULL THEN (SELECT count(*) FROM "Wishlist") ELSE NULL END AS row_count;

SELECT id, email, name, role, isActive FROM "User" ORDER BY "createdAt" DESC LIMIT 10;
