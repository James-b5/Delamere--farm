-- Insert additional farm products
INSERT INTO "Product" (id, name, description, price, stock, images, specs) VALUES
('prod_009', 'Whole Wheat Flour - 2kg', 'Freshly milled whole wheat flour from our grain', 250, 40, '["/images/product-placeholder.svg"]', '{"weight": "2kg", "type": "Whole Wheat", "milling": "Fresh"}'),
('prod_010', 'Strawberries - 1kg', 'Fresh sweet strawberries in season', 400, 25, '["/images/product-placeholder.svg"]', '{"weight": "1kg", "season": "Summer", "organic": true}'),
('prod_011', 'Tomatoes - 2kg Box', 'Fresh ripe tomatoes for cooking', 200, 50, '["/images/product-placeholder.svg"]', '{"weight": "2kg", "type": "Heirloom", "ripeness": "Ripe"}'),
('prod_012', 'Potatoes - 5kg Sack', 'Locally grown potatoes perfect for any meal', 300, 60, '["/images/product-placeholder.svg"]', '{"weight": "5kg", "type": "Mixed Varieties", "storage": "Cool"}'),
('prod_013', 'Corn - Half Dozen Cobs', 'Fresh sweet corn harvested daily', 280, 35, '["/images/product-placeholder.svg"]', '{"quantity": 6, "type": "Sweet Corn", "harvest": "Daily"}'),
('prod_014', 'Cabbage - 2kg Head', 'Crisp green cabbage perfect for salads', 150, 45, '["/images/product-placeholder.svg"]', '{"weight": "2kg", "type": "Green", "freshness": "Day Old"}'),
('prod_015', 'Watermelon - Whole', 'Large sweet watermelon perfect for hot days', 600, 15, '["/images/product-placeholder.svg"]', '{"weight": "5-6kg", "type": "Red Flesh", "sweetness": "High"}'),
('prod_016', 'Goat Cheese - 300g', 'Creamy goat cheese with tangy flavor', 450, 20, '["/images/product-placeholder.svg"]', '{"weight": "300g", "type": "Soft", "aging": "Fresh"}'),
('prod_017', 'Herbs Bundle - Fresh', 'Mixed fresh herbs: basil, parsley, cilantro', 120, 50, '["/images/product-placeholder.svg"]', '{"types": "Basil, Parsley, Cilantro", "freshness": "Day Old", "organic": true}'),
('prod_018', 'Pepper Mix - 500g', 'Red, yellow and orange bell peppers', 280, 40, '["/images/product-placeholder.svg"]', '{"weight": "500g", "colors": "Red, Yellow, Orange", "ripeness": "Medium"}'
);

-- Verify all products
SELECT COUNT(*) as total_products FROM "Product";
SELECT id, name, price, stock FROM "Product" ORDER BY id;
