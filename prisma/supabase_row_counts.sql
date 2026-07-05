SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'User' AS table_name, count(*) FROM "User";
SELECT 'Product' AS table_name, count(*) FROM "Product";
SELECT 'Order' AS table_name, count(*) FROM "Order";
SELECT 'OrderItem' AS table_name, count(*) FROM "OrderItem";
SELECT 'Review' AS table_name, count(*) FROM "Review";
SELECT 'CartItem' AS table_name, count(*) FROM "CartItem";
SELECT 'WeatherCache' AS table_name, count(*) FROM "WeatherCache";
SELECT 'BlogPost' AS table_name, count(*) FROM "BlogPost";
SELECT 'Category' AS table_name, count(*) FROM "Category";
SELECT 'Tag' AS table_name, count(*) FROM "Tag";
SELECT 'PostTag' AS table_name, count(*) FROM "PostTag";
SELECT 'DraftReview' AS table_name, count(*) FROM "DraftReview";
SELECT 'Wishlist' AS table_name, count(*) FROM "Wishlist";
SELECT 'Address' AS table_name, count(*) FROM "Address";
SELECT 'Media' AS table_name, count(*) FROM "Media";
SELECT 'Booking' AS table_name, count(*) FROM "Booking";
SELECT 'ContactMessage' AS table_name, count(*) FROM "ContactMessage";

SELECT id, email, name, role, isActive FROM "User" ORDER BY createdAt DESC LIMIT 10;
