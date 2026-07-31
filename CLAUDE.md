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
3. Fetched data is stored in `chrome.storage.local`. There is no single `grades` key — see the storage keys table below.
4. The side panel and grade viewer read from storage and re-render on `chrome.storage.onChanged`.
5. `background.js` listens for messages to update the extension badge and manage the grade viewer window. The badge shows the count of assignments due within 3 days (red), and is cleared otherwise.

### Three Separate Domains

This extension spans three hosts, not just Moodle:

- **`agulms45.aim.aoyama.ac.jp`** (Moodle) — main content script (`content.js`); source of courses & assignments.
- **`aguinfo.jm.aoyama.ac.jp/HL/tuutisho.aspx`** (grades notification page) — `grade-page.js` blurs the native grade table (`.tuuti-container`), scrapes rows (`scrapeGrades.js`) and the cumulative GPA (`#cph_content_lbl_gpa`), and shows an overlay (`overlay.js`) to either reveal grades in place or open the standalone grade viewer window. Grades are **not** fetched via the Moodle API.
- **`syllabus.aoyama.ac.jp`** — syllabus search; fetched via the background `FETCH_SYLLABUS` proxy (see Scripts table).

### Storage Keys (`chrome.storage.local`)

| Key | Written by | Notes |
| --- | --- | --- |
| `assignments`, `lastUpdated` | `content/scripts/index.js` | assignment list + fetch timestamp |
| `courses` | `content/scripts/index.js`, `content/src/App.jsx` | enrolled courses |
| `hiddenAssignments` | `QuickAccessApp.jsx`, `Assignments.jsx`, `HomeTabsApp.jsx` | array of hidden assignment IDs |
| `customAssignments` | `AddAssignmentModal.jsx`, `QuickAccessApp.jsx`, `HomeTabsApp.jsx` | user-added assignments (`isCustom: true`); merged into the lists alongside fetched ones. Each has a `completed` flag — completing one (via the card's check button) filters it out |
| `syllabuses` | `fetchAllSyllabuses.js`, `SyllabusPickerModal.jsx` | syllabus search results |
| `selectedMajor` | `MajorPicker` / `Settings.jsx` | user's 学科 label; shown in dedicated 学科設定 section |
| `gradeViewerData` | `background.js` (on `OPEN_GRADE_VIEWER`) | scraped grade rows for the viewer window |
| `gradeViewerGpa` | `background.js` (on `OPEN_GRADE_VIEWER`) | cumulative GPA scraped from `#cph_content_lbl_gpa`, shown as 累積GPA on the viewer's summary screen |
| `defaultTab`, `autoClosePanel` | `Settings.jsx` | general preferences (一般設定 section) |
| `showSubmissionFeedback` | `Settings.jsx` | submission effect toggle; in リニューアル設定, gated by `extensionEnabled` |
| `extensionEnabled` | `Settings.jsx` | global on/off for all injections; in 拡張機能 section (default: true) |
| `lmsRedesignEnabled` | `Settings.jsx` | toggle LMSRedesignerApp on courses page; in リニューアル設定 (default: true) |
| `quickAccessEnabled` | `Settings.jsx` | toggle QuickAccessApp + HomeTabsApp on home page; in リニューアル設定 (default: true) |
| `gradeViewerEnabled` | `Settings.jsx` | toggle grade viewer overlay on grades page; in リニューアル設定 (default: true) |

### Key Directories

- `content/src/` — React components for the redesigned LMS view, quick-access widget, home tabs section, side panel, and grade viewer
- `content/scripts/extract/` — Moodle API calls (`fetchCourses.js`, `fetchAssignments.js`)
- `content/scripts/util/` — Parsing helpers (course title parser, day grouping, session key retrieval)
- `content/scripts/const/` — DOM selectors (`classNames.js`) and Japanese day name constants
- `content/scripts/submission/` — Detects assignment submissions and shows confetti + toast feedback (gated by the `showSubmissionFeedback` setting); entry point `bootstrapSubmissionFlow()` in `submitListener.js`
- `content/scripts/syllabus/` — Syllabus search logic (fetches from `syllabus.aoyama.ac.jp` via background proxy)

### Home Page Injection (`?redirect=0`)

Three React apps are mounted in sequence on the Moodle home page:

1. **`#quick-access-root`** (`QuickAccessApp`) — today's courses (horizontal scroll) + 直近の課題 (only overdue or due within 3 days; horizontal scroll). Has a "+" button to add a custom assignment. Injected just before `#site-news-forum`.
2. **`#home-tabs-root`** (`HomeTabsApp`) — tabbed section immediately after Quick Access with two tabs:
   - **講義** — courses grouped by day using `DaySection` (exported from `App.jsx`), same layout as `LMSRedesignerApp`.
   - **課題** — visible assignments grouped by due date (nearest/overdue first), rendered as a fixed-height card grid. Includes an "課題を追加" button, reload button, last-updated timestamp, and show/hide hidden-assignments toggle.

Both surfaces merge user-added **custom assignments** (`customAssignments` storage key) into their lists via `activeCustomAssignments.js`. Custom cards render like fetched ones but show a check button to mark complete (see `AddAssignmentModal.jsx`).

`HomeTabsApp` uses CSS class `home-tabs__tab--active` (not `active`) to avoid Bootstrap's `.active` button repaint, which makes tab text disappear against the background.

### Grade Viewer (`grade-viewer.html` / `content/src/grade-viewer/`)

The standalone popup window (opened via `OPEN_GRADE_VIEWER`) walks the user through three screens, orchestrated by `App.jsx`:

1. **Selector** (`SelectorScreen.jsx`) — search + year-chip filtering over scraped grade rows; user checks which subjects to include, confirmed via a floating action bar.
2. **Revealer** (`RevealerScreen.jsx`) — each selected subject is a `RevealCard` that 3D-flips (CSS `rotateY`) from a closed "TAP TO OPEN" face to the grade on click. `結果を見る` (see results) stays disabled until every card has been revealed.
3. **Summary** (`SummaryScreen.jsx`) — shows both GPAs (see below) with a count-up animation (`useCountUp.js`, ease-out from 0), the full subject/grade list, and an image-export button.

GPA math lives in `util/gpa.js`, following 青学's official grade legend and formula (`grade_evaluation.html`): AA/A/B/C → 4/3/2/1 points weighted by credits; XX (不合格) and X (欠席等評価不能) count as 0 points but still count in the denominator; 合格, ++/**（認定）, FF（未評価）, and W（履修取消）are excluded entirely. Handles fullwidth grade characters (`Ａ`, `ＸＸ`, etc.) via normalization. Two GPAs are shown: **累積GPA** (cumulative, scraped verbatim from `#cph_content_lbl_gpa`, stored under `gradeViewerGpa`) and **今期のGPA** (computed live over whatever subjects are currently selected).

Image export (`ExportCard.jsx`, using the `html-to-image` dependency) renders an offscreen, fixed-size **1080×1350px** card regardless of how many subjects are selected — row height/font-size shrink to fit, and beyond ~57 entries the list truncates with a "ほか N 件" row. The GPA shown on the exported image is always computed over the *full* selection, not just the visible/truncated rows.

### Content Script Injection Pattern

`content/src/main.jsx` uses a `MutationObserver` to wait for Moodle's DOM to stabilize before mounting React apps. The injected apps attach to dedicated container divs to avoid style conflicts with Moodle's CSS.

### Message Passing

The side panel triggers data refreshes by sending `chrome.runtime.sendMessage` to the background worker, which relays messages back to the active tab's content script. The content script then re-fetches from the Moodle API and updates storage.

| Type | Sender → Receiver | Purpose |
| --- | --- | --- |
| `REFRESH_ASSIGNMENTS` / `REFRESH_COURSES` | side panel → content (`content/scripts/index.js`) | trigger a re-fetch from the Moodle API |
| `FETCH_SYLLABUS` | content → `background.js` | proxy a cross-origin fetch to `syllabus.aoyama.ac.jp` (responds `{ html }`) |
| `OPEN_GRADE_VIEWER` | grade-page overlay → `background.js` | store `gradeViewerData` and open `grade-viewer.html` in a popup window |

### Scripts

| Script | Path | Description |
|--------|------|-------------|
| `fetchAllSyllabuses.js` | `content/scripts/syllabus/fetchAllSyllabuses.js` | Iterates enrolled courses from storage, builds search URLs for `syllabus.aoyama.ac.jp` using the user's selected major (read from `"selectedMajor"` in storage), proxies fetches through `background.js` (`FETCH_SYLLABUS` message), parses result HTML, retries without lecturer on 0 hits, deduplicates by `syllabusID`, and stores results under `"syllabuses"` in `chrome.storage.local`. |
| `MajorPicker.jsx` | `content/src/sidepanel/components/MajorPicker.jsx` | Bottom-sheet component for selecting the user's 学科 (major). Exports the `faculties` array and `GENERAL_MAJOR_CODE` constant (used by `fetchAllSyllabuses.js` to resolve major codes). Selection is persisted to `"selectedMajor"` in `chrome.storage.local`. |
| `Syllabus.jsx` | `content/src/sidepanel/tabs/Syllabus.jsx` | シラバス tab — shows all enrolled courses as `SyllabusCard`s. Has the fetch button. Cards are styled based on match count: gray = 0 hits, default = not yet fetched, green/clickable = 1 hit, yellow = 2+ hits (conflict). |
| `SyllabusCard.jsx` | `content/src/sidepanel/components/SyllabusCard.jsx` | Card variant for the シラバス tab. Accepts `syllabusList` (null = pending, `[]` = none, 1 item = found, 2+ = conflict). Only clickable when exactly 1 syllabus is found. |
| `SyllabusPickerModal.jsx` | `content/src/sidepanel/components/SyllabusPickerModal.jsx` | Bottom-sheet modal used by SyllabusCard. In `conflict` mode shows a radio-list of matched syllabuses; selecting one and confirming updates storage to keep only that entry. In `manual` mode accepts a URL (must start with `https://syllabus.aoyama.ac.jp/shousai.ashx?`) and a subject name, then saves the entry to storage. |
| `HomeTabsApp.jsx` | `content/src/HomeTabsApp.jsx` | Tabbed section injected after Quick Access on the home page. 講義 tab reuses `DaySection` from `App.jsx`. 課題 tab groups assignments by due date into a card grid with an "課題を追加" button, reload, last-updated, and hidden-assignment toggle. Uses `home-tabs__tab--active` (not `.active`) to avoid Bootstrap button repaint. |
| `AddAssignmentModal.jsx` | `content/src/sidepanel/components/AddAssignmentModal.jsx` | Bottom-sheet form (opened from the "+" button in Quick Access / Home Tabs 課題) to add a user-created assignment: name (required), 種別 (レポート/小テスト), course (nullable), due date (nullable), URL (nullable). Appends the entry to `"customAssignments"` in storage. |
| `activeCustomAssignments.js` | `content/src/sidepanel/util/activeCustomAssignments.js` | Maps stored `customAssignments` into the `AssignmentCard` shape — drops `completed` entries and computes `isOverdue` from the due date. Used by `QuickAccessApp.jsx` and `HomeTabsApp.jsx` to merge custom assignments into their lists. |

> **Convention:** When adding a new script, add a row to the Scripts table above with its path and a one-line description.

## Key Conventions

- UI labels are in Japanese (e.g., `ローディング中`, `講義一覧`, `課題`).
- Day names use Japanese kanji via `content/scripts/const/dayNames.js` (月火水木金土日).
- Moodle DOM selectors are centralized in `content/scripts/const/classNames.js` — update there when Moodle's markup changes.
- Each major UI surface has its own `.css` file co-located with its React component.
- `DaySection` in `App.jsx` is exported and reused by `HomeTabsApp.jsx` — keep its props stable (`dayNumber`, `courses`).
