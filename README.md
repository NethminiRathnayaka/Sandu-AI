# 🌸 SANDU Hub: AI Study & Wellness Companion

<p align="center">
  <img src="public/sandu-icon.svg" width="128" height="128" alt="SANDU Avatar" />
</p>

<p align="center">
  <strong>Your all-in-one, offline-first study and wellness companion powered by SANDU, an animated anime AI guide.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.1-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PWA-Ready-10b981?style=flat-square&logo=pwa" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Tests-22%20Passed-brightgreen?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License" />
</p>

---

## 📖 Overview

**SANDU Hub** brings active recall learning, mindfulness, fitness tracking, and multi-language acquisition into a single unified web app (PWA). Across every screen, you are accompanied by **SANDU** — an original anime character who interacts through layered SVG animations, voice speech synthesis, on-device intent classification, and proactive encouragement.

Everything is **offline-first** powered by browser **IndexedDB (Dexie.js)** with zero server dependencies required.

---

## ✨ Features

### 🎴 1. Flashcard Quiz & Spaced Repetition (SM-2)
- **3D Card Flip**: Realistic flip animations revealing questions and answers with a single tap or spacebar.
- **SuperMemo 2 (SM-2) Algorithm**: Intelligently schedules cards based on your recall quality (Ease Factor, repetition intervals).
- **Study & Quiz Modes**: Browse mode with shuffle, plus self-grading quiz mode ("Got it" / "Not yet").
- **Deck & Tag Management**: Add, edit, and delete custom decks with instant undo toasts.
- Seeded with sample decks across Science, Geography, Tech, and Wellness.

### 💬 2. Random Quote Generator & Mindfulness
- **Guaranteed No-Repeat**: Automatically displays a different quote on launch and button click.
- **Curated Dataset**: 65+ quotes categorized by Motivation, Study, Fitness, and Mindfulness.
- **Audio Read-Aloud**: Text-to-speech narration of quote and author.
- **Interactive Companion Reflections**: SANDU provides personalized advice and context for each quote.
- Favorites filtering, one-click clipboard copying, and web sharing.

### 🏃 3. Fitness & Activity Tracker
- **Daily Metrics**: Log steps, workout duration, activity types (running, walking, cycling, gym, yoga, swimming), water intake, and sleep.
- **MET Calorie Auto-Estimation**: Automatically computes calories using standard MET formulas if left blank.
- **Visual Analytics**: Interactive Recharts weekly activity bar chart and goal progress rings.
- **On-Device ML Forecast**: 7-day linear regression trend forecasting based on your 14-day history.
- **Data Export & Import**: Export activity logs to JSON or CSV anytime.

### 🌏 4. Multilingual Language Learning Hub
- **Languages**: English, Sinhala (සිංහල), and Tamil (தமிழ்) with romanized transliterations.
- **Curriculum**: Over 55 seed items across Vocabulary, Phrases, Sentences, Grammar, Numbers, and Daily Conversation.
- **Native Pronunciation Audio**: Web Speech API regional speech synthesis (`en-US`, `si-LK`, `ta-IN`).
- **Interactive Practice**: Multiple choice questions, fill-in-the-blank, and matching pairs mini-game with XP levels and confetti celebrations.

### 🤖 5. SANDU AI Companion & Chat Drawer
- **Original Anime SVG Character**: Layered SVG with customizable uniform accent colors.
- **Dynamic State Machine**: Animates through `idle` (natural breathing & eye blinking), `happy`, `thinking`, `talking` (mouth synced to speech), `celebrating`, `encouraging`, `sleepy` (night mode), and `surprised`.
- **On-Device Intent Classification**: Understands English, Sinhala, and Tamil commands (e.g. *"quiz me"*, *"log 30 min running"*, *"switch to dark mode"*, *"give me a quote"*).
- **In-App Action Execution**: SANDU can directly log workouts, add flashcards, change themes, or navigate screens via natural chat.
- **Voice Support**: Text-to-speech output + microphone speech-to-text input.

### 🎨 6. Deep Personalization & Accessibility
- **Theming**: Light mode, Dark mode, and System auto-detect.
- **Palette Customizer**: 8 accent color presets + custom hex color picker.
- **Background Effects**: Floating sakura petals, particle dust, or soft gradients.
- **Typography & Accessibility**: Font style selector (Sans, Rounded, Serif, Monospace), font sizing, Dyslexia-friendly font toggle, high-contrast mode, and reduced-motion safety.
- **Interactive Tour**: Step-by-step onboarding walkthrough guided by SANDU.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) + Canvas Confetti |
| **State** | [Zustand](https://github.com/pmndrs/zustand) (with LocalStorage persistence) |
| **Database** | [Dexie.js](https://dexie.org/) (IndexedDB wrapper, offline-first) |
| **Charts** | [Recharts](https://recharts.org/) |
| **i18n** | [i18next](https://www.i18next.com/) (100% parity: English, Sinhala, Tamil) |
| **Voice** | Browser Web Speech API (`SpeechSynthesis` & `SpeechRecognition`) |
| **PWA** | `vite-plugin-pwa` (service worker caching & offline support) |
| **Testing** | [Vitest](https://vitest.dev/) (22 unit tests) |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/sandu-hub.git
cd sandu-hub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
# Or on Windows PowerShell:
npm.cmd run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Run tests
```bash
npm run test
```

### 5. Build for production & PWA
```bash
npm run build
npm run preview
```

---

## ⚙️ Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```env
# Optional: Pluggable LLM API key (e.g., Google Gemini / OpenAI)
# Leave blank to use SANDU's 100% offline rule-based & intent classifier brain.
VITE_LLM_API_KEY=

# Optional: Enable Firebase Cloud Sync ("true" or "false")
VITE_FIREBASE_ENABLED=false
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `→` (Right Arrow) | Next flashcard |
| `←` (Left Arrow) | Previous flashcard |
| `Space` or `Enter` | 3D Flip Card (Show Question / Answer) |
| `Esc` | Close modals and chat drawer |

---

## 🧪 Unit Tests Overview

The test suite validates core algorithms with 22 passing tests:
- `sm2.test.ts`: SM-2 interval calculations, ease factor decay/growth, repetition reset.
- `calories.test.ts`: MET formula accuracy across running, walking, cycling, and weight limits.
- `quotes.test.ts`: Consecutive no-repeat guarantee and mood-based recommendation.
- `intentClassifier.test.ts`: Multilingual intent routing (flashcard, quote, fitness, language, settings, help, small-talk).
- `i18nParity.test.ts`: Validates identical key hierarchies across `en.json`, `si.json`, and `ta.json`.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information. Built with ❤️ for productive learning and mindful living.
