# Aogaku Noodle

Chrome Manifest V3 extension for Aoyama Gakuin University's Moodle LMS (`agulms45.aim.aoyama.ac.jp`). It redesigns the Moodle UI (timetable view first; later assignment tracking, grade viewer, side panel), injected into live Moodle pages via content scripts.

## Stack

- TypeScript, React 19, Tailwind CSS v4 (`@tailwindcss/vite`, no config file; `@import "tailwindcss"` in `src/index.css`)
- Vite + `@crxjs/vite-plugin`: bundles everything referenced from `manifest.json` (popup, side panel, content scripts, service worker). Do not use Webpack.

## Commands

- `npm run dev`: dev build with HMR into `dist/`
- `npm run build`: type-check, then production build into `dist/`
- `npm run lint`: ESLint (typescript-eslint + react-hooks); config in `eslint.config.js`
- **Run `npm run build` at the end of every assistant turn that changes files**, and report failures.
- Load in Chrome: `chrome://extensions` > Developer mode > Load unpacked > select `dist/`

## Layout

- `manifest.json`: source of truth for the extension; imported by `vite.config.ts`. Add new entry points (content scripts, side panel, background) here.
- `sidepanel.html`: side panel page; loads `src/sidepanel/main.tsx`
- `src/sidepanel/`: side panel UI (4 tabs: 講義, シラバス, 課題, 設定). `main.tsx` entry, `App.tsx` shell, `tabs/` one file per tab, `components/` one file per component, `hooks/useCourses.ts` saved courses + refresh, `api/fetchCourses.ts` fetch from the Moodle tab, `utils/parseCourse.ts` (fullname -> day/period/title/lecturer) and `utils/groupCourses.ts`, `types/`, `const/`, `data/`
- `src/background.ts`: service worker; toolbar icon click opens the side panel
- `src/index.css`: Tailwind entry and design tokens (`@theme static`, so unused tokens like day line-colours are still emitted)
- `public/icons/`: extension icons, referenced in the manifest as `icons/...`
- `PRODUCT.md`: product truth. `.impeccable/surfaces/`: side panel design brief. Direction was replaced by the owner's reference screenshot: grey tab track with white selected pill, green day headings with a rule, white bordered cards with a large period number over a bold title

## Data flow (courses)

The side panel fetches only when the user presses the refresh button, which is shown only while no courses are saved. `fetchCourses` finds the active tab; if it is not on `agulms45.aim.aoyama.ac.jp` it throws `NotOnMoodleError`. Otherwise it runs a function in the page's main world via `chrome.scripting.executeScript` (reads `M.cfg.sesskey`, calls `/lib/ajax/service.php`), parses the result and saves it to `chrome.storage.local` under `courses`. Course names follow `(曜日)(N)限_日本語名_English` or `(曜日)オンライン_...`; anything else is a special course grouped by its Moodle category. Lecturers come from `idnumber` (`3321_26101森田 武史`) and may be null.

## Data flow (assignments)

The 課題 tab has an always-visible 更新 button. `useAssignments.refresh` reads the saved `courses` (so courses must be saved first), calls `fetchAssignments` and saves the result to `chrome.storage.local` under `assignments`. `fetchAssignments` calls `core_calendar_get_action_events_by_timesort` (the user's actionable events oldest first, 50 per call; Moodle drops events with nothing left to do, such as submitted assignments). It keeps the events of the saved courses that are not `open` (start dates) or `gradingdue` (the teacher's grading deadline), of any module (`modulename` is not filtered; `moduleLabel` shows a Japanese label for `assign`/`questionnaire`/`resource` and the raw name otherwise), and sorts them by deadline. If fewer than 20 unhidden assignments were found it calls again (up to 20 calls, stopping at an empty batch because Moodle can return fewer than 50 events while more remain). The cursor needs both `timesortfrom` = the last event's `timesort` and `aftereventid` = the last event's `id`: Moodle ignores `aftereventid` alone and would return the first 50 events again. A failure after the first call keeps what was found, except leaving Moodle, which fails the refresh. The panel pages the visible list 20 at a time. Each card has a 非表示 button (a `<button>`, not a link); hidden event ids are saved in `chrome.storage.local` under `hiddenAssignments`, and the saved `assignments` list still includes hidden ones. After a refresh, a hidden id is forgotten only if its assignment is missing from the result and its saved due date is before `coveredUntil` (how far `fetchAssignments` read the events, exclusive because events sharing the last timestamp may be in the next batch); otherwise the fetch may simply have stopped before reaching it. A button on the left of the header row (`aria-expanded`) shows them in a 非表示 section above the others (all on one page, due-date order).

## Conventions

- One component per file, grouped in folders (`components/`, `tabs/`, `data/`) so the owner can read each piece. Readability beats a low file count; still avoid extra config files.
- Ask the owner before adding any dependency, and explain why it is needed.
- Moodle pages are not ours: injected UI must not leak styles into or inherit styles from the host page (consider Shadow DOM for injected React UI, and Tailwind's preflight will otherwise affect the page).
- Only request the permissions and host permissions a feature actually needs. Current: `sidePanel`, `storage`, `scripting`, host `https://agulms45.aim.aoyama.ac.jp/*`.
