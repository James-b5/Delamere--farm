import subprocess
from pathlib import Path
import difflib

repo_root = Path(__file__).resolve().parent.parent
schema_path = repo_root / 'prisma' / 'schema.prisma'
introspected_path = repo_root / 'prisma' / 'introspected.schema.prisma'

print('Using schema:', schema_path)
print('Using introspected schema:', introspected_path)

if not schema_path.exists():
    raise FileNotFoundError(f'Missing schema file: {schema_path}')

if introspected_path.exists():
    print('Using existing introspected schema:', introspected_path)
    introspected_content = introspected_path.read_text(encoding='utf-16')
else:
    print('Generating live introspected schema...')
    result = subprocess.run(
        f'npx prisma db pull --print --schema "{schema_path}"',
        cwd=repo_root,
        capture_output=True,
        text=True,
        shell=True,
    )

    if result.returncode != 0:
        print('Failed to generate introspected schema:')
        print(result.stdout)
        print(result.stderr)
        raise SystemExit(1)

    introspected_content = result.stdout
    introspected_path.write_text(introspected_content, encoding='utf-16')
    print('Wrote introspected schema to', introspected_path)

# Compare schemas
schema_lines = schema_path.read_text(encoding='utf-8').splitlines(keepends=True)
introspected_lines = introspected_content.splitlines(keepends=True)

diff = list(difflib.unified_diff(
    schema_lines,
    introspected_lines,
    fromfile='prisma/schema.prisma',
    tofile='prisma/introspected.schema.prisma',
    lineterm='',
))

if not diff:
    print('No differences detected between schema and introspected schema.')
else:
    print('\n'.join(diff))
    print(f'\nTotal diff lines: {len(diff)}')
