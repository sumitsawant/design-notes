"""Keep the 100-system roadmap honest about what is published."""
from pathlib import Path
import csv
import json

ROOT = Path(__file__).resolve().parents[1]
with (ROOT / 'editorial/catalog.csv').open(newline='') as file:
    rows = list(csv.DictReader(file))
flows = json.loads((ROOT / 'flows.json').read_text())
lessons = json.loads((ROOT / 'lessons.json').read_text())
if len(rows) != 100 or len({row['id'] for row in rows}) != 100 or len({row['system'] for row in rows}) != 100:
    raise ValueError('Catalog must contain 100 unique systems')
if [row['id'] for row in rows] != [f'{n:03}' for n in range(1, 101)]:
    raise ValueError('Catalog IDs must run from 001 to 100')
published = set()
for row in rows:
    if row['status'] not in {'planned', 'published'}:
        raise ValueError(f"Invalid status for {row['id']}")
    if row['status'] == 'published':
        key = row['flow_key']
        if key not in flows or key not in lessons or key in published:
            raise ValueError(f"Published system {row['id']} needs a unique flow and lesson")
        published.add(key)
    elif row['flow_key']:
        raise ValueError(f"Planned system {row['id']} has a public flow key")
if published != set(flows):
    raise ValueError('Every public flow needs a published catalog entry')
print(f'{len(rows)} systems planned; {len(published)} published')
