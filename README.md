<div align="center">
  <br>
  <img src="static/banner.svg" alt="FitLog Banner" width="100%">
  <br><br>
  <a href="https://fit-log-go.vercel.app" target="_blank">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech</a> •
  <a href="#getting-started">Setup</a>
</div>

Track workouts, crush intervals, watch streaks grow — all from your browser.  
No accounts. No subscriptions. No servers harvesting your data. Just you and the iron.

FitLog is a free, open-source progressive web app built for lifters, runners, and anyone who believes fitness tracking shouldn't require a monthly fee or a privacy policy longer than your workout.

---

## Philosophy

Most fitness apps want your email, your credit card, and your training data on their servers. FitLog wants none of it.

- **Zero backend** — your data lives in your browser's IndexedDB, never leaves your device
- **Zero cost** — no premium tiers, no "upgrade to unlock," no ads
- **Zero friction** — open the app, start lifting, close it when you're done
- **Installable PWA** — add to home screen for a native app feel without the App Store

---

## Features

### 200+ Exercises with Full Detail
Browse a curated library of 199 exercises sourced from ExerciseDB — each with images, video demos, step-by-step instructions, pro tips, and variations. Fuzzy search finds what you need in milliseconds.

### HIIT Timer Modes
Built-in interval timer with six protocols: **Tabata**, **EMOM**, **AMRAP**, **30/30**, **45/15**, and **Custom**. Each mode has a dedicated detail page explaining the science, instructions, pro tips, and variations — so you understand *why* you're suffering, not just *how long*.

### Effort-Based Activity Heatmap
Not all workouts are created equal. The heatmap doesn't just count days — it scores each session using a multi-factor composite:

```
score = setPoints + volumePoints + bodyweightPoints + durationPoints
        + exerciseVariety + bodyPartCoverage + timeSpent
```

- **Volume** is sqrt-compressed (`sqrt(weight x reps) x 2`) so a 500kg deadlift session doesn't dwarf everything else
- **Exercise type multipliers** — Olympic lifts get 1.2x, cardio duration gets 1.5x, plyometrics get 1.5x per rep
- **Variety bonus** — hitting more muscle groups and using more exercises earns extra points
- Result: a 20-minute bodyweight circuit can score comparably to a heavy squat day. Effort is effort.

### Dynamic Streak Logic
Streaks count consecutive days with at least one completed set. The algorithm is forgiving — it checks both today and yesterday, so your streak survives if you log at 11 PM and don't train until the next evening. Skipping a day resets it. No gaming the system.

### Workout Session Logger
Full-featured session tracker with live timer, per-exercise set logging (weight/reps/duration), configurable rest timer with audio/haptic alerts, and confetti on completion. Auto-saves to IndexedDB so closing the app mid-workout doesn't lose progress.

### Dashboard
At-a-glance stats: current streak, weekly workout count, weekly volume, activity heatmap, and recent workout history. Time-of-day greeting with rotating motivational quotes.

### History & Repeat
Full workout log with date grouping. Tap any past workout to view details or repeat it with the same exercises pre-loaded.

### Offline-First PWA
Service worker precaches the app shell. Exercise images and videos are cached on first view. Works offline, installs to home screen, updates silently in the background.

### Settings
Dark/light theme, kg/lbs unit toggle, configurable rest timer defaults, sound and vibration preferences, full data export/import as JSON.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit (Svelte 5 runes) + TypeScript |
| UI | shadcn-svelte + Tailwind CSS v4 + bits-ui |
| Icons | @lucide/svelte |
| Storage | IndexedDB via `idb`, localStorage for preferences |
| Search | Fuse.js (fuzzy, weighted multi-field) |
| Animations | View Transitions API, CSS keyframes, canvas-confetti |
| Deploy | @sveltejs/adapter-vercel |
| Native | Capacitor (iOS/Android) with native haptics |

---

## Getting Started

```sh
# Clone
git clone https://github.com/your-username/fitlog.git
cd fitlog

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Exercise Data

All 199 exercises are bundled in `static/data/exercises.json` with local image and video assets:

```
static/exercises/images/{exerciseId}.jpg   # ~5.9 MB total
static/exercises/videos/{exerciseId}.mp4   # ~38.2 MB total
```

Zero CDN dependency. Everything runs from your origin.

---

## Project Structure

```
src/
  lib/
    components/     # Reusable UI (exercise cards, muscle tags, filters, HIIT setup)
    data/           # Templates, HIIT presets, HIIT exercise detail data
    db/             # IndexedDB schema + workout CRUD + effort scoring
    stores/         # Svelte 5 rune stores (exercises, workout, preferences, HIIT)
    types/          # TypeScript interfaces (Exercise, WorkoutLog, etc.)
    utils/          # Stats, gradients, formatting helpers
  routes/
    +page.svelte            # Dashboard (heatmap, stats, recent workouts)
    exercises/              # Exercise library + detail pages
    exercises/hiit/[id]/    # HIIT workout detail pages
    workout/                # Workout start (templates, exercise picker)
    workout/active/         # Live workout session
    workout/hiit/           # HIIT interval timer
    history/                # Workout history log
    settings/               # App preferences
    onboarding/             # First-launch welcome flow
static/
  data/exercises.json       # Exercise database
  exercises/images/         # Exercise images
  exercises/videos/         # Exercise video demos
```

---

## Screenshots

> *Coming soon — screenshots of the dashboard, workout session, exercise library, HIIT timer, and heatmap in both dark and light modes.*

---

## Contributing

Contributions are welcome. If you lift and you code, this is your project.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes — follow the existing patterns:
   - Svelte 5 runes (not legacy stores)
   - Real tabs for indentation
   - OKLCH colors, dark-mode-first design
   - No emojis in UI — use Lucide icons
4. Test locally (`npm run build` must pass)
5. Open a PR with a clear description

### Good First Issues

- Add more exercise variations/tips to existing exercise data
- Improve heatmap color scale for different effort ranges
- Add workout templates for specific sports (climbing, swimming, martial arts)
- Accessibility improvements (screen reader labels, focus management)

---

## License

MIT License. Use it, fork it, modify it, ship it. No attribution required, but a star is always appreciated.

---

<p align="center">
  <strong>Stop paying for fitness apps. Start lifting.</strong>
</p>

Peace :)