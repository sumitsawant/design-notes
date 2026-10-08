# Design Notes

Original visual system design lessons at https://learn.e2e.work/.

The public preview contains four design guides: caching, message queues, rate limiting, and safe payment retries. Each includes architecture flow, tradeoffs, failure scenarios, an interview drill, and primary references. There is no checkout or paid product yet.

## Preview

Run `python3 -m http.server 4173` and open http://localhost:4173.

## Deployment

GitHub Actions validates JavaScript syntax, packages only public site assets, and deploys main to GitHub Pages. In Settings → Pages, select GitHub Actions and set the custom domain to `learn.e2e.work`. Enable HTTPS when the certificate is available. The Namecheap CNAME points to `sumitsawant.github.io`.

No personal account credentials or runtime secrets are required. Only the four published samples belong in this public repository; keep any future paid downloads elsewhere.

## Content and corrections

Written and maintained by Sumit Sawant. Sources are linked in each lesson. Scenarios are learning examples, not benchmarks. Feedback: sumitsawant75@gmail.com.

All rights reserved. The site is publicly readable; no redistribution license is granted.

## Logo

Editable Figma identity: https://www.figma.com/design/qA814U1O7Nbi774aNdc134

`logo.svg` is exported from the Figma decision-path monogram.

## Edit the lessons

Edit `lessons.json`, then run `python3 scripts/build_diagrams.py`. This creates `lessons.js` and 12 SVG diagrams. Commit the source and generated files together. The deployment checks that generated files match their source.

Each lesson contains a problem, requirements, a system diagram, a request sequence, a failure recovery sequence, design choices, and a practice answer. Diagrams have text alternatives. Printing includes sequence transcripts and the answer. Writing uses short sentences and consistent terms; full ASD-STE100 dictionary compliance has not been audited.

## Reading view

The home page introduces the guide. Lesson links open a separate reading view with a lesson index, section links, a PDF control, and next-lesson navigation. Read status is stored in browser localStorage. No account or server is required. If browser storage is unavailable, progress lasts for the current session.

## Cover effect

The cover uses a small WebGL shader for a decorative system field. It uses no external library or credential. CSS supplies the static cover when WebGL is unavailable. The shader draws one frame when reduced motion is enabled. It pauses while the cover is off-screen or the tab is hidden.
