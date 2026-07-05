from pathlib import Path
import re

root = Path(r"h:\Projects\Delamere-farm")
src = Path(r"h:\pg_backups\20260630_2224\all_databases.sql")
dst = root / "prisma" / "supabase_restore_data.sql"

tables = [
    "Category",
    "Tag",
    "User",
    "Product",
    "BlogPost",
    "Media",
    "ContactMessage",
    "WeatherCache",
    "Review",
    "Wishlist",
    "CartItem",
    "Booking",
    "Address",
    "Order",
    "OrderItem",
    "DraftReview",
    "PostTag",
]

pattern = re.compile(r'^COPY public\."(?P<table>[^"]+)".*$')
blocks = {}
with src.open("r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

inside = False
current = None
block_lines = []
for line in lines:
    if not inside:
        m = pattern.match(line)
        if m:
            name = m.group("table")
            if name in tables:
                inside = True
                current = name
                block_lines = [line]
    else:
        block_lines.append(line)
        if line.strip() == "\\.":
            blocks[current] = block_lines[:]
            inside = False
            current = None
            block_lines = []

missing = [t for t in tables if t not in blocks]
if missing:
    print("Warning: missing data sections for:", missing)

with dst.open("w", encoding="utf-8") as f:
    f.write("-- Restoring selected data sections from backup into Supabase\n")
    f.write("SET statement_timeout = 0;\n")
    f.write("SET lock_timeout = 0;\n")
    f.write("SET idle_in_transaction_session_timeout = 0;\n")
    f.write("SET transaction_timeout = 0;\n")
    f.write("SET client_encoding = 'UTF8';\n")
    f.write("SET standard_conforming_strings = on;\n")
    f.write("SET search_path = public;\n")
    f.write("BEGIN;\n\n")
    for table in tables:
        if table in blocks:
            f.write(f"-- Data for {table}\n")
            f.writelines(blocks[table])
            f.write("\n")
    f.write("-- Ensure serial sequences are advanced where needed\n")
    f.write("SELECT pg_catalog.setval('public.\"Media_id_seq\"', 9, true);\n")
    f.write("COMMIT;\n")

print(f"Wrote {dst} with {len(blocks)} tables")
