SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT count(*) AS public_table_count FROM information_schema.tables WHERE table_schema = 'public';

SELECT id, email, name, role, "isActive" FROM "User" ORDER BY "createdAt" DESC LIMIT 10;
