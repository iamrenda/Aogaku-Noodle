# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A Chrome Manifest v3 extension for Aoyama Gakuin University's Moodle LMS (`agulms45.aim.aoyama.ac.jp`). It redesigns the Moodle UI with a timetable view, assignment tracking, grade viewer, and a side panel — all injected into the live Moodle pages via content scripts.

## Commands

```bash
npm run build      # Production build via custom esbuild (build.js)
npm run dev        # Vite dev server (limited use — extension runs from dist/)
npm run lint       # ESLint
```

To test the extension: load the `dist/` folder as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked).

**`npm run build` runs automatically after every assistant turn** via a Stop hook in `.claude/settings.local.json`.

## Architecture

### Build System

`build.js` uses esbuild directly (not Vite) to produce multiple IIFE/ESM bundles into `dist/`. Each bundle is a separate Chrome extension entry point:

| Bundle            | Purpose                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| `content.js`      | Main content script — injects React apps into Moodle pages                    |
| `sidepanel.js`    | Side panel UI (Assignments / Courses / Settings tabs)                         |
| `background.js`   | Service worker — badge updates, grade viewer window lifecycle                 |
| `injected.js`     | World-isolated script that reads `window.M.cfg.sesskey` from Moodle's page JS |
| `grade-page.js`   | Content script for the grades page                                            |
| `grade-viewer.js` | Standalone grade viewer window UI                                             |

### Data Flow

1. `injected.js` polls `window.M.cfg.sesskey` with exponential backoff and posts it to the content script via `window.postMessage`.
2. Content scripts call Moodle's internal REST API using the session key to fetch courses and assignments.
3. All fetched data is stored in `chrome.storage.local` (keyed by `assignments`, `courses`, `grades`).
4. The side panel and grade viewer read from storage and re-render on `chrome.storage.onChanged`.
5. `background.js` listens for messages to update the extension badge count and manage the grade viewer window.

### Key Directories

- `content/src/` — React components for the redesigned LMS view, quick-access widget, side panel, and grade viewer
- `content/scripts/extract/` — Moodle API calls (`fetchCourses.js`, `fetchAssignments.js`)
- `content/scripts/util/` — Parsing helpers (course title parser, day grouping, session key retrieval)
- `content/scripts/const/` — DOM selectors (`classNames.js`) and Japanese day name constants
- `content/scripts/submission/` — Assignment submission flow listener
- `content/scripts/syllabus/` — Syllabus search logic (fetches from `syllabus.aoyama.ac.jp` via background proxy)

### Content Script Injection Pattern

`content/src/main.jsx` uses a `MutationObserver` to wait for Moodle's DOM to stabilize before mounting React apps. The injected apps attach to shadow DOM roots or dedicated container divs to avoid style conflicts with Moodle's CSS.

### Message Passing

The side panel triggers data refreshes by sending `chrome.runtime.sendMessage` to the background worker, which relays messages back to the active tab's content script. The content script then re-fetches from the Moodle API and updates storage.

### Scripts

| Script | Path | Description |
|--------|------|-------------|
| `fetchAllSyllabuses.js` | `content/scripts/syllabus/fetchAllSyllabuses.js` | Iterates enrolled courses from storage, builds search URLs for `syllabus.aoyama.ac.jp` using the user's selected major (read from `"selectedMajor"` in storage), proxies fetches through `background.js` (`FETCH_SYLLABUS` message), parses result HTML, retries without lecturer on 0 hits, deduplicates by `syllabusID`, and stores results under `"syllabuses"` in `chrome.storage.local`. |
| `MajorPicker.jsx` | `content/src/sidepanel/components/MajorPicker.jsx` | Bottom-sheet component for selecting the user's 学科 (major). Exports the `faculties` array and `GENERAL_MAJOR_CODE` constant (used by `fetchAllSyllabuses.js` to resolve major codes). Selection is persisted to `"selectedMajor"` in `chrome.storage.local`. |

> **Convention:** When adding a new script, add a row to the Scripts table above with its path and a one-line description.

## Key Conventions

- UI labels are in Japanese (e.g., `ローディング中`, `講義一覧`, `課題`).
- Day names use Japanese kanji via `content/scripts/const/dayNames.js` (月火水木金土日).
- Moodle DOM selectors are centralized in `content/scripts/const/classNames.js` — update there when Moodle's markup changes.
- Each major UI surface has its own `.css` file co-located with its React component.
