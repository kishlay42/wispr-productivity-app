# 🐾 neko- wispr ai-productivity app

> **Turn raw thoughts into finished work.** A voice-first, AI-augmented daily planner and productivity dashboard powered by [Wispr Flow](https://wisprflow.ai/) and Google Gemini.

---

## ✨ Features

- **🎨 Studio Ghibli-Inspired Onboarding**
  - Atmospheric watercolor sky and animated drifting clouds with analog grain textures.
  - Interactive OS auto-detection tailored for your hardware (<kbd>Fn</kbd> on macOS, <kbd>Ctrl</kbd> + <kbd>Win</kbd> on Windows).
  - Ambient lo-fi productivity audio and personalized name personalization.

- **🗣️ Natural Voice & Stream-of-Consciousness Intake**
  - Rambling thoughts, quick voice notes, or structured lists get automatically parsed into actionable items.
  - Built-in natural language date & time understanding powered by `chrono-node` and `Google Gemini Flash Lite`.

- **⚡ Four Unified Productivity Buckets**
  - **📅 Today & Schedule**: Time-slotted calendar view, upcoming deadlines, overdue warnings, and live time clock.
  - **📁 Projects**: Multi-stage roadmaps, sub-tasks, and project trackers.
  - **🧠 Brain Dump**: Unfiltered canvas for raw ideation and future spark notes.
  - **📰 Executive Briefing**: One-click AI morning brief summarizing your day's schedule, high-priority deliverables, and warnings.

- **⌨️ Platform-Aware Shortcuts**
  - Quick Capture: <kbd>Ctrl</kbd> + <kbd>K</kbd> (Windows/Linux) or <kbd>⌘</kbd> + <kbd>K</kbd> (macOS).
  - Voice Dictation trigger matching Wispr Flow system shortcuts.
  - Deep Snapshot Undo: <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>⌘</kbd> + <kbd>Z</kbd> or instant interactive toast undo.

- **🐾 Screen Companions**
  - Charming pixel companions (Tux penguin, cat, etc.) keeping you company during deep work sessions.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion + GSAP
- **Date & NLP Parsing**: Chrono-Node + Date-fns
- **AI Intelligence**: Google Gemini API (`@google/genai` / REST)
- **Icons**: Lucide React
- **Smooth Scroll**: Lenis

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- npm or yarn or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kishlay42/wispr-productivity-app.git
   cd wispr-productivity-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (refer to `.env.example`):
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GEMINI_MODEL=gemini-flash-lite-latest
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

5. **Run test suite**:
   ```bash
   npm test
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy to Vercel

1. Import this repository (`kishlay42/wispr-productivity-app`) in the [Vercel Dashboard](https://vercel.com/new).
2. Under **Environment Variables**, configure:
   - `VITE_GEMINI_API_KEY` = your Gemini API key
   - `VITE_GEMINI_MODEL` = `gemini-flash-lite-latest`
3. Click **Deploy**. SPA rewrites and caching headers are pre-configured in `vercel.json`.

---

## 🧭 Project Architecture

```
wispr-productivity-app/
├── src/
│   ├── components/       # UI Panels, modals, onboarding, calendar, companions
│   │   ├── calendar/     # Interactive schedule & time blocking views
│   │   ├── BriefWidget.jsx # AI executive audio/text morning briefer
│   │   ├── CaptureCard.jsx # Voice & natural language yap input engine
│   │   ├── OnboardingModal.jsx # Ghibli cloudscape & OS key detection
│   │   ├── TodayPanel.jsx  # Today's focus & schedule
│   │   ├── ProjectsPanel.jsx # Multi-step project manager
│   │   ├── DumpPanel.jsx   # Frictionless brain-dump board
│   │   └── Toast.jsx       # Floating notifications & snapshot undo
│   ├── lib/              # Parser, AI integration, speech engine, companions
│   ├── store/            # usePlanner state store with deep immutable history
│   └── App.jsx           # Main orchestrator & responsive layout
├── tests/                # Automated test suites for parsing & undo
└── index.html            # Entry HTML & typography
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
