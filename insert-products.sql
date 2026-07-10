-- Insert test products into Product table
INSERT INTO "Product" (id, name, description, price, stock, images, specs) VALUES
('prod_001', 'Fresh Milk - 1L', 'Premium fresh milk from our farm dairy', 150, 50, '["/images/product-placeholder.svg"]', '{"origin": "Local Farm", "type": "Whole Milk", "pasteurized": true}'),
('prod_002', 'Organic Eggs - Dozen', 'Free-range organic eggs from happy hens', 200, 100, '["/images/product-placeholder.svg"]', '{"quantity": 12, "type": "Organic", "size": "Large"}'),
('prod_003', 'Farm Fresh Vegetables - Bundle', 'Seasonal mixed vegetables freshly harvested', 350, 30, '["/images/product-placeholder.svg"]', '{"contents": "Tomato, Carrot, Lettuce, Spinach", "weight": "5kg"}'),
('prod_004', 'Honey - 500ml Jar', 'Pure raw honey from our beehives', 400, 25, '["/images/product-placeholder.svg"]', '{"purity": "100% Raw", "source": "Local Bees", "weight": "500ml"}'),
('prod_005', 'Cheese - 500g Block', 'Artisanal farm cheese made fresh', 500, 15, '["/images/product-placeholder.svg"]', '{"type": "Cheddar", "weight": "500g", "maturity": "6 months"}'),
('prod_006', 'Yogurt - Strawberry 500ml', 'Creamy natural yogurt with fresh strawberries', 180, 40, '["/images/product-placeholder.svg"]', '{"flavor": "Strawberry", "quantity": 500, "unit": "ml"}'),
('prod_007', 'Butter - 250g Pack', 'Fresh churned butter made daily', 300, 35, '["/images/product-placeholder.svg"]', '{"weight": "250g", "salt": "Salted", "freshness": "Daily"}'),
('prod_008', 'Chicken - 1kg Pack', 'Free-range chicken meat from our farm', 450, 20, '["/images/product-placeholder.svg"]', '{"weight": "1kg", "type": "Whole or Pieces", "freshness": "Frozen"}'
);

-- Verify inserts
SELECT id, name, price, stock FROM "Product" ORDER BY id;
