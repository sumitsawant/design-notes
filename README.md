# Design Notes

Original visual system design lessons at https://learn.e2e.work/.

The public preview contains three decision cards: caching, message queues, and rate limiting. Each includes architecture flow, tradeoffs, failure scenarios, an interview drill, and primary references. There is no checkout or paid product yet.

## Preview

Run `python3 -m http.server 4173` and open http://localhost:4173.

## Deployment

GitHub Actions validates JavaScript syntax, packages only public site assets, and deploys main to GitHub Pages. In Settings → Pages, select GitHub Actions and set the custom domain to `learn.e2e.work`. Enable HTTPS when the certificate is available. The Namecheap CNAME points to `sumitsawant.github.io`.

No personal account credentials or runtime secrets are required. Only the three published samples belong in this public repository; keep any future paid downloads elsewhere.

## Content and corrections

Written and maintained by Sumit Sawant. Sources are linked in each lesson. Scenarios are learning examples, not benchmarks. Feedback: sumitsawant75@gmail.com.

All rights reserved. The site is publicly readable; no redistribution license is granted.
