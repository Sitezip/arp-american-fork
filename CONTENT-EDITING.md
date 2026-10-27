# Content editing guide

Plain static site: HTML + one CSS file + one small JS file. **No build step.** Cloudflare Pages
deploys every push to `main` to https://arp-american-fork.pages.dev/ (about 1 minute).

Rule of thumb: **edit data files, not code.** All JSON must stay valid. Run
`python3 -m json.tool data/<file>.json` before committing.

| What | Where | Notes |
|---|---|---|
| Meeting schedule (all meetings) | `data/meetings.json` | Generated from the spreadsheet; see below. |
| "Schedule last updated" date | `data/meetings.json` → `schedule_updated` (YYYY-MM-DD) | The script takes it from the date cell in the spreadsheet. |
| Notes on a meeting (e.g. "No meeting on holidays") | `data/meetings.json` → that meeting's `notes` | Shown under the meeting. Re-running the script clears notes, so re-add them. |
| Show/hide group leader names on the schedule | `data/site.json` → `show_group_leaders` (true/false) | Off by default. |
| Announcement banner (all pages) | `data/site.json` → `announcement` | Use `""` for no banner. Example: `"No meetings Thursday, Nov 26 (Thanksgiving)."` |
| Site name, menu, footer, Church links in the menu | `data/site.json` | `church_links` = Listen to a Meeting / Help for Spouses and Families / Help for Individuals. |
| Contact cards (Olsens, Kallases) | `data/contacts.json` | Blank `phone`/`email` shows "coming soon". Only publish details the person approved. |
| Resource links and video cards | `data/resources.json` | Official Church URLs only. Video images live in `assets/img/`. |
| Home page text | `index.html` | Between `EDITABLE PAGE CONTENT START/END` comments. |
| Overview of ARP | `overview.html` | From Elder Olsen's **Addiction Recovery Program Overview.docx** (emailed 2026-10-26). |
| What to Expect / Newcomer | `what-to-expect.html` | From Elder Olsen's **Newcomer to 12 Step.pdf** (emailed 2026-10-26), plus the meeting outline and official ARP tips. |
| About (purpose, number of missionaries) | `about.html` | "50 service missionaries" comes from Elder Olsen's Overview doc. |
| Contact page intro | `contact.html` | Cards themselves come from `data/contacts.json`. |
| Styles | `assets/css/site.css` | |
| Header/footer/schedule/contact/resource rendering | `assets/js/site.js` | Code; change only when needed. |

## Zoom codes are never published

Do **not** put Zoom join links, meeting IDs, passcodes, or call-in numbers on the site. That covers
the data files, the page text, and these docs. Zoom meetings show day, time, type, and notes, plus
"Zoom details are shared on request. Contact a coordinator." Coordinators send the codes as needed.
`scripts/xlsx_to_json.py` drops those spreadsheet columns, and it refuses to write output that
looks like it contains codes.

## Updating the schedule from the spreadsheet

1. Download the latest schedule spreadsheet (.xlsx) from Google Drive.
2. `pip install openpyxl` (once)
3. `python3 scripts/xlsx_to_json.py "Meeting Schedule - AF.xlsx"`
4. Review `git diff data/meetings.json`. Check the count and any changed times/addresses. Then commit and push.

The script reads only the **"Regular"** sheet (or the first sheet). It refuses a "With Facilitators"
sheet, because that sheet lists participant first names that must never be published. Values are
copied as written. Map links get the city from the meeting name if the address has no city, plus ", UT".

## Editing one meeting by hand

Each meeting in `data/meetings.json` looks like this:

```json
{
  "name": "American Fork - General Addiction",
  "focus": "General Addiction",
  "type": "General Addiction",          // section in the spreadsheet; used by the "Meeting type" filter
  "format": "in-person",                // "in-person" or "zoom"
  "audience": "Men & Women",            // used by the "Who it's for" filter
  "day": "Monday",                      // full weekday name
  "time": "Noon",                       // shown as written
  "time_sort": "12:00",                 // 24h, for sorting only
  "location": "240 S Center St, American Fork",
  "map_url": "https://www.google.com/maps/search/?api=1&query=...",
  "zoom_details": "on-request",       // Zoom meetings only; no codes, ever
  "group_leaders": "Swasey/Tucker",
  "notes": "",
  "id": "monday-12-00-american-fork-general-addiction-men-women"
}
```

To remove a meeting, delete its `{ ... }` block (mind the commas). Also update `count`.

## Not public

There is no admin page or login. Changes are made by editing these files (by hand or by the
email-driven bot) and pushing to `main`.
