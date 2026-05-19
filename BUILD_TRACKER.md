# AI MODEL RANKS — Build Tracker
**Date:** 2026-05-19 | **Last:** 04:14 UTC
**Status:** Active — 2 commits pushed today

---

## ✅ DONE TODAY
- [x] **Pricing sync across ALL pages** — $29→$9, $79→$49, $149→$99
  - index.html: spotlight, showcase, labels, empty cards, CSS comments
  - compare.html: "Advertise Here" promo
  - blog.html: sidebar ad button + nav links
  - tools.html: already done in prior commit
  - admin.html: default ad tiers, revenue calc (dynamic per-plan now)
  - ads.js: SLOT_PRICES synced
- [x] **Navigation fix** — blog.html .html extensions → clean URLs
- [x] **Admin revenue calc** — now sums actual plan prices ($9/$49/$99) instead of flat $79
- [x] **Jobs Board built** — full feature:
  - JobsDB in app.js (localStorage, auto-expire 30d)
  - tools.html: job cards CSS, submit form, renderJobs(), submitJob()
  - admin.html: Jobs tab with stats, approve/unapprove, delete

---

## ⚠️ NEEDS ZAK DECISION
- [ ] **Dodo Payment Links** — All checkout URLs still point to OLD products ($29/$79/$149). 
  Display prices are now $9/$49/$99. Need new Dodo products or keep charging old amounts.
  Affects: app.js OCTOPUS_CONFIG.DODO, tools.html buy buttons, admin settings
- [ ] **Jobs Dodo link** — Currently using starter Dodo link as placeholder ($20 job posting)

---

## 🏗️ STILL TO BUILD (Prioritized)
1. **Scraper** — Real 8-provider model scraping (212 models). Backend task.
2. **Analytics** — Page view tracking already exists (octopus_pv in localStorage). 
   Could add Cloudflare Workers Analytics or Supabase integration for real data.
3. **Jobs payment flow** — Post-payment activation (like ad slots have)
4. **legal.html** — Add app.js for consistent nav/footer (or keep standalone)

---

## 🧪 TEST CHECKLIST
- [ ] Home page (/) — loads, sidebar ads render, no errors
- [ ] Compare (/compare) — loads, sidebar blog + ads render
- [ ] Tools (/tools) — loads, submit tool form, job post form, payment links
- [ ] Blog (/blog) — loads, modal opens, articles render, sidebar ads
- [ ] Admin (/admin) — login works, all tabs load (Tools, Pending, Ads, Refs, Jobs, Analytics, Settings)
- [ ] Mobile nav works across all pages
- [ ] Jobs: submit job → shows on admin page → approve → shows on tools page

---

## 📦 Commits Today
```
fe4800b feat: Jobs Board — submit, render, admin panel
dc464f4 fix: admin revenue calc uses dynamic plan prices ($9/$49/$99)
e1cdb7d fix: sync pricing across all pages + nav consistency
```

---

*— Aurelia*
