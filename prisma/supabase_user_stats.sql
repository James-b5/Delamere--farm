SELECT count(*) AS user_count FROM "User";

SELECT id, email, name, role, "isActive" FROM "User" ORDER BY "createdAt" DESC LIMIT 10;
