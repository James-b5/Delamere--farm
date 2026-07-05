from pathlib import Path
from typing import List, Optional

SRC = Path(r"h:\pg_backups\20260630_2224\all_databases.sql")
DST = Path(r"h:\Projects\Delamere-farm\prisma\supabase_restore_data_insert.sql")

TABLES = [
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

DEST_COLUMNS = {
    "Product": [
        "id",
        "name",
        "description",
        "price",
        "stock",
        "deleted",
        "images",
        "videos",
        "specs",
        "createdAt",
        "updatedAt",
    ],
}


def parse_copy_header(line: str):
    # Example: COPY public."User" (id, name, email, "emailVerified", image, ... ) FROM stdin;
    assert line.startswith("COPY public.")
    parts = line.split(" ")
    table_part = parts[1]
    table = table_part.split(".")[1].strip('"')
    cols_part = line[line.index("(") + 1: line.rindex(")")]
    columns = [col.strip().strip('"') for col in cols_part.split(",")]
    return table, columns


def parse_copy_row(line: str) -> List[Optional[str]]:
    fields: List[Optional[str]] = []
    current = []
    i = 0
    while i < len(line):
        c = line[i]
        if c == "\t":
            fields.append("".join(current))
            current = []
            i += 1
            continue
        if c == "\\":
            i += 1
            if i >= len(line):
                current.append("\\")
                break
            nxt = line[i]
            if nxt == "\\":
                current.append("\\")
            elif nxt == "t":
                current.append("\t")
            elif nxt == "n":
                current.append("\n")
            elif nxt == "r":
                current.append("\r")
            elif nxt == "b":
                current.append("\b")
            elif nxt == "f":
                current.append("\f")
            elif nxt == "0":
                current.append("\0")
            elif nxt == "N":
                current.append("\\N")
            else:
                current.append(nxt)
            i += 1
            continue
        current.append(c)
        i += 1
    fields.append("".join(current))
    return [None if value == "\\N" else value for value in fields]


def sql_literal(value: Optional[str]) -> str:
    if value is None:
        return "NULL"
    # booleans and numeric values can still be safely inserted as strings
    escaped = value.replace("'", "''")
    return f"'{escaped}'"


def build_insert(table: str, columns: List[str], rows: List[List[Optional[str]]]) -> str:
    if not rows:
        return ""
    if table in DEST_COLUMNS:
        target_columns = DEST_COLUMNS[table]
        source_columns = columns
        remap_idx = [source_columns.index(col) for col in target_columns if col in source_columns]
        columns = target_columns
        rows = [[row[i] for i in remap_idx] for row in rows]
    cols = ", ".join(f'"{col}"' for col in columns)
    lines = [f"INSERT INTO public.\"{table}\" ({cols}) VALUES"]
    values = []
    for row in rows:
        values.append("(" + ", ".join(sql_literal(v) for v in row) + ")")
    if len(values) == 1:
        lines.append(values[0] + ";")
    else:
        lines.append(",\n".join(values) + ";")
    return "\n".join(lines)


if not SRC.exists():
    raise FileNotFoundError(f"Source backup file not found: {SRC}")

with SRC.open("r", encoding="utf-8", errors="replace") as f:
    rows = f.readlines()

blocks = {}
current_table = None
current_cols = None
collecting = False
buffer: List[str] = []
for line in rows:
    if collecting:
        if line.rstrip() == "\\.":
            blocks[current_table] = (current_cols, buffer[:])
            collecting = False
            current_table = None
            current_cols = None
            buffer = []
        else:
            buffer.append(line.rstrip("\n"))
    else:
        if line.startswith("COPY public."):
            table, cols = parse_copy_header(line)
            if table in TABLES:
                collecting = True
                current_table = table
                current_cols = cols
                buffer = []

with DST.open("w", encoding="utf-8") as out:
    out.write("-- Restoring selected data from backup into Supabase\n")
    out.write("SET statement_timeout = 0;\n")
    out.write("SET lock_timeout = 0;\n")
    out.write("SET idle_in_transaction_session_timeout = 0;\n")
    out.write("SET transaction_timeout = 0;\n")
    out.write("SET client_encoding = 'UTF8';\n")
    out.write("SET standard_conforming_strings = on;\n")
    out.write("SET search_path = public;\n")
    out.write("BEGIN;\n\n")
    for table in TABLES:
        if table not in blocks:
            out.write(f"-- No data section found for {table}\n\n")
            continue
        cols, data = blocks[table]
        parsed_rows = [parse_copy_row(line) for line in data if line != "\\."]
        if not parsed_rows:
            out.write(f"-- {table} has no rows to restore\n\n")
            continue
        out.write(f"-- Data for {table}\n")
        out.write(build_insert(table, cols, parsed_rows))
        out.write("\n\n")
    if "Media" in blocks and blocks["Media"][1]:
        max_media = max(int(row[0]) for row in (parse_copy_row(r) for r in blocks["Media"][1]) if row[0] is not None)
        out.write(f"SELECT pg_catalog.setval('public.\"Media_id_seq\"', {max_media}, true);\n")
    out.write("COMMIT;\n")

print(f"Generated insert restore SQL at {DST}")
