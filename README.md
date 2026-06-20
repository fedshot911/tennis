# fedshot911 tennis

This folder is the separated Cloudflare Pages source for `tennis.fedshot911.com`.

## Included

- `/` tennis service home
- `/racket-finder/` racket finder
- `/privacy/` privacy page for the tennis service
- `/contact/` contact page for the tennis service
- `/functions/api/racket-results/` Pages Functions copied from the current racket finder

## Cloudflare notes

- Create a separate Cloudflare Pages project for this folder.
- Connect the custom domain `tennis.fedshot911.com` from the Pages project Custom domains tab.
- If result saving/sharing must work in production, bind the same D1 database binding name: `RACKET_RESULTS_DB`.
