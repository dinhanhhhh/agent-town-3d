# 🏰 Agent Town 3D

> **Interactive 3D isometric diorama simulating autonomous Multi-Agent DevOps orchestration.**

[![Three.js](https://img.shields.io/badge/Three.js-r125-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Agent Town 3D Preview](screenshot.png)

---

## 🌟 Overview

**Agent Town 3D** is a real-time, interactive 3D web application where **7 autonomous AI agents** collaborate to take software requirements from idea to production deployment.

Instead of boring logs or flat tables, the entire Software Development Life Cycle (SDLC) is brought to life in a stylized low-poly diorama:
- Shippers physically courier artifacts between stations along stone paths.
- Buildings dynamically react, illuminate, and display live speech bubbles as agents think, code, test, and deploy.
- Users can zoom, rotate, inspect each agent's workspace, and run end-to-end autonomous software delivery pipelines.

---

## 👥 The 7 AI Agents & Orchestrator

| # | Station & Agent | Icon | Role & Responsibility |
|---|---|:---:|---|
| **0** | **Claude Code (Orchestrator)** | 🏰 | Central Hub: Analyzes user prompts, breaks down milestones, and dispatches tasks to agents. |
| **1** | **PM · BA** | 🏢 | Generates PRD (Product Requirements Document), User Stories, and Sprint Backlog tickets. |
| **2** | **Dev** | 🛠️ | Reads specifications and implements clean, production-grade code. |
| **3** | **Review** | 🔍 | Inspects pull request diffs, checks architectural compliance, and approves/rejects PRs. |
| **4** | **QA · Test** | 🧪 | Generates automated unit tests and executes test suites (reporting pass/fail telemetry). |
| **5** | **Security** | 🛡️ | Conducts vulnerability audits (OWASP Top 10, secret leaks, dependency CVEs). |
| **6** | **DevOps** | 🚀 | Packages Dockerfiles, generates CI/CD pipelines (GitHub Actions), and triggers deployments. |
| **7** | **Monitoring** | 📡 | Telemetry watchdog tracking latency, TPS, error rates, and cluster health status. |

---

## 🕹️ Key Features

- **🎮 3D Isometric Diorama:** Rendered using Three.js with soft shadows, ACES filmic tone mapping, and ambient daylight.
- **🏃 Moving Courier Shippers:** Visual representations of data packets and PR artifacts being carried across the island.
- **💬 Real-Time Speech Bubbles:** Live status pins floating over active stations reflecting what each AI agent is doing.
- **🎛️ Interactive HUD Controls:**
  - Auto-spin toggle & custom camera zoom (+ / - / Reset isometric view).
  - Filter toggle for node tags and speech bubble overlays.
  - Telemetry dock displaying live cluster weather and agent heartbeat.
- **⚡ Zero-Build Setup:** Built with pure Vanilla HTML5, CSS3, and modern JavaScript. Open and run instantly without npm build steps.

---

## 📂 Project Structure

```bash
agent-town-3d/
├── index.html              # Main DOM & HUD overlay structure
├── screenshot.png          # High-resolution visual preview
├── css/
│   └── style.css           # Base layer & scrollbar custom styles
└── js/
    ├── tailwind-config.js  # Extended Tailwind theme, colors & typography
    ├── scene.js            # Three.js 3D diorama procedural engine & camera API
    ├── hud.js              # HUD micro-interactions & button listeners
    └── agents.js           # Multi-agent prompt definitions & pipeline engine
```

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/agent-town-3d.git
   cd agent-town-3d
   ```

2. **Run locally:**
   No build step required! You can open `index.html` directly in your browser, or serve it via any static server:
   ```bash
   # Using Python 3
   python -m http.server 3000

   # Or using Node.js npx
   npx serve .
   ```

3. Open your browser at `http://localhost:3000`.

---

## 🛠️ Tech Stack

- **3D Graphics:** [Three.js](https://threejs.org/)
- **UI Framework:** [Tailwind CSS CDN](https://tailwindcss.com/)
- **Icons & Typography:** [Google Fonts](https://fonts.google.com/) (Plus Jakarta Sans, JetBrains Mono, Material Symbols)
- **AI Brain:** [Google Gemini API](https://ai.google.dev/) / Agent Orchestrator

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
