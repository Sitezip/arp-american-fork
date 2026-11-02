# ARP Recovery in American Fork

Website for the American Fork Mission Addiction Recovery Program (ARP) meetings. It supports
*Healing through the Savior: The Addiction Recovery Program* of The Church of Jesus Christ of
Latter-day Saints. It is a local page, not an official Church site.

- Live: https://healinginaf.com/ (Cloudflare Pages project `arp-american-fork`; auto-deploys from `main`).
  `www.healinginaf.com` 301-redirects to the apex; https://arp-american-fork.pages.dev/ also still serves the site.
- Static HTML/CSS/JS, no build step, no tracking.
- Content lives in `data/*.json` and the marked sections of each page. See **CONTENT-EDITING.md**.
- Schedule source: Elder Randy Olsen's live Google Sheet **"Meeting Schedule - AF ARP 10-5-26.xlsx"**
  (Drive file id `1Pi_yt9pXG-EfyyaJhMvBVvvCg03-QfiO`, owner randyolsen777@gmail.com), "Regular" tab only.
  The earlier temporary copy (shared by jwarner7) is retired and no longer used.
- Schedule refresh: `python3 scripts/xlsx_to_json.py "Meeting Schedule - AF ARP 10-5-26.xlsx" --updated <Drive modifiedTime>`

Pages: Home, Meeting Schedule, Overview of ARP, What to Expect, Resources (Listen to a Meeting,
Help for Individuals, Help for Spouses and Families), Contact, About.

Video thumbnail images © Intellectual Reserve, Inc., from the Church's Gospel Media Library.
They are used under its terms for Church-related, noncommercial use, and each one links back to its source.
