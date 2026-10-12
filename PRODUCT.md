# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Chrome Manifest V3 extension. TypeScript, React 19, Tailwind CSS v4, Vite with @crxjs/vite-plugin (see CLAUDE.md). UI surfaces are injected into Moodle pages and shown in the Chrome side panel.

## Users

Students at Aoyama Gakuin University (AGU) who use the university's Moodle LMS (`agulms45.aim.aoyama.ac.jp`) day to day. The public audience is any AGU student, with distribution through the Chrome Web Store. They find the default Moodle UI cluttered and slow, and want today's classes, upcoming deadlines and syllabus links within a click.

## Product Purpose

An unofficial, student-made, free extension that makes Moodle easier to use. Success means a student opens Moodle or the side panel and immediately sees what class is today, what is due soon, and can reach a course or its syllabus without navigating several pages.

## Positioning

It works on the student's own logged-in Moodle session (no separate login, no server of its own) and combines Moodle courses and deadlines with the AGU syllabus site, which Moodle itself does not link together.

## Operating Context

Used while browsing Moodle on desktop Chrome, and from the side panel (about 350px wide) that stays open next to any page. Data comes from Moodle's internal AJAX API using the session key from the page, and from `syllabus.aoyama.ac.jp` through the background service worker. Everything is cached in `chrome.storage.local`.

## Capabilities and Constraints

v2.0.0 is a from-scratch rewrite of the v1 extension (old source at `C:\Users\renwa\Desktop\aogaku_noodle`) so the owner understands every part. Some v1 features broke after an LMS update, so Moodle selectors and API responses must be re-verified, not copied.

In scope for 2.0.0:

- Side panel: courses list (grouped by day, kanji day names), syllabus search, assignments (sorted by deadline).
- Quick access on the LMS home page: today's courses and upcoming assignments.

Out of scope for 2.0.0 (not selected by the owner; do not port): grade viewer, custom/hidden assignments and courses, submission confetti, and any other v1 feature not listed above. The timetable view on `/my/courses.php` was not confirmed in this round and stays undecided.

Constraints:

- Only the permissions a feature needs. No data leaves the browser except requests to AGU's own servers.
- Moodle's markup and API are not ours and change; keep selectors centralized.
- Injected UI must not leak styles into or inherit styles from Moodle.
- Keep the codebase small and reviewable by hand (fewer than 10 files per change).

## Brand Commitments

None declared as binding. For reference, v1 used the name 青学Noodle, a noodle-bowl icon (`public/icons/`), an AGU-green accent (#1b9d6f), and a Japanese-first UI. The owner answered "no preference", so these are inherited defaults, not commitments.

## Evidence on Hand

- Working v1 source with real selectors, API payloads and parsing logic.
- Icon assets: `public/icons/icon-32.png`, `icon-128.png`.
- No testimonials, user counts, store listing or screenshots exist; do not fabricate any.

## Product Principles

1. Glanceable first: today's classes and nearest deadlines before anything else.
2. Student-made and honest: unofficial, no tracking, no claims AGU has not made.
3. Resilient to Moodle changes: fail visibly with a clear Japanese message, never silently show stale or wrong data.
4. Small and understandable: every feature earns its place; prefer fewer, simpler parts.
5. A guest in Moodle's page: injected UI is isolated from the host styles.

## Accessibility & Inclusion

UI text is Japanese. No product-specific accessibility standard was set; follow sensible defaults (keyboard access, contrast, readable sizes in the narrow side panel).
