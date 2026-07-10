import difflib
from pathlib import Path

a = Path('prisma/schema.prisma').read_text(encoding='utf-8').splitlines(keepends=True)
b = Path('prisma/introspected.schema.prisma').read_text(encoding='utf-8').splitlines(keepends=True)

ud = difflib.unified_diff(a, b, fromfile='prisma/schema.prisma', tofile='prisma/introspected.schema.prisma', lineterm='')
output = ''.join(line + '\n' for line in ud)
if not output:
    print('No differences found')
else:
    print(output)
