# Production plan for 100 systems

The catalog lists 100 distinct systems. Four have a published lesson and scroll walkthrough. The other 96 are an editorial backlog, not products for sale.

## One system package

A finished package contains a six-step scroll walkthrough, a written guide, system/sequence/recovery diagrams, a failure case, design choices, a practice prompt and answer, and primary technical references. Use `flows.json` for the walkthrough and `lessons.json` for the guide. Run `python3 scripts/build_flows.py` and `python3 scripts/build_diagrams.py` after editing. The build rejects missing or invalid walkthrough fields.

## Review gate

1. Pick a concrete user request and a measurable requirement. Say what the design assumes.
2. Trace the request through components, including the source of truth and external effects.
3. Introduce one plausible failure. Show persisted state before and after retry or recovery.
4. Check claims against primary documentation. Record URLs in the lesson. Do not invent guarantees.
5. Check the diagrams, text alternative, mobile scroll view, and reduced-motion behavior.
6. Have a developer review the architecture and language before marking the entry published.

The catalog status changes from `planned` to `published` only after all checks pass. A draft is not a paid entitlement.

## Release and validation

Ship systems in small themed volumes. The first release candidate can focus on reliability, then data, commerce, and AI. Keep a free sample that shows the full experience. Test interest with visits to walkthroughs, completed reads, requests for new topics, and actual checkout conversion before funding ads or promising all 100. Do not put future paid files in the public Pages repository. A checkout or membership requires a separate delivery and access design; no checkout exists yet.
