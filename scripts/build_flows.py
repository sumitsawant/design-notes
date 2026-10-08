"""Validate walkthrough content and produce the browser bundle."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
EDGES = {'request', 'store', 'charge', 'result', 'lookup'}


def build():
    flows = json.loads((ROOT / 'flows.json').read_text())
    if not flows:
        raise ValueError('At least one flow is required')
    for key, flow in flows.items():
        if not key.isascii() or not key.replace('-', '').isalnum():
            raise ValueError(f'Invalid flow key: {key}')
        if len(flow['title']) != 2 or len(flow['nodes']) != 4 or len(flow['steps']) < 4:
            raise ValueError(f'{key}: expected two title lines, four nodes, and at least four steps')
        if not all(isinstance(line, str) and line.strip() for line in flow['title']):
            raise ValueError(f'{key}: title lines cannot be empty')
        if not isinstance(flow.get('intro'), str) or not flow['intro'].strip():
            raise ValueError(f'{key}: intro cannot be empty')
        for node in flow['nodes']:
            if len(node) != 2 or not all(isinstance(part, str) and part.strip() for part in node):
                raise ValueError(f'{key}: node needs a name and a description')
        for number, step in enumerate(flow['steps'], 1):
            for field in ('tag', 'title', 'body', 'label', 'note'):
                if not isinstance(step.get(field), str) or not step[field].strip():
                    raise ValueError(f'{key} step {number}: missing {field}')
            if not step['nodes'] or any(type(i) is not int or i not in range(4) for i in step['nodes']):
                raise ValueError(f'{key} step {number}: invalid nodes')
            if not step['edges'] or any(edge not in EDGES for edge in step['edges']):
                raise ValueError(f'{key} step {number}: invalid edges')
    (ROOT / 'flows.js').write_text("'use strict';\nconst flows = " + json.dumps(flows, ensure_ascii=False, indent=2) + ';\n')
    print(f'Built {len(flows)} scroll walkthroughs')


if __name__ == '__main__':
    build()
