# NexTask — Local-First Productivity Dashboard

> **Association for Computing Activities, IITK** · June 2026

A highly responsive, zero-dependency, local-first task management single-page application (SPA) built with modern Vanilla JavaScript.

## 🚀 Features

- **Custom JWT Auth Engine** — Secure sign-in / sign-up flow utilizing a custom client-side HS256 JWT signature generation and verification system.
- **Local-First Architecture** — Creates, reads, updates, and deletes tasks instantly using an optimized Web Storage API (LocalStorage) wrapper, meaning zero latency and offline support.
- **Pub/Sub State Observer** — A custom event-driven publish-subscribe pattern to trigger live DOM updates dynamically without full page reloads.
- **Dynamic Filtering** — Instant client-side filtering by status, priority, category, and full-text search directly through in-memory arrays.
- **Canvas Analytics Dashboard** — Custom-built charting engine utilizing the HTML5 `<canvas>` API to render responsive donut and bar charts (Completion rates, Priority breakdown) with zero external dependencies.
- **CI/CD Pipeline** — GitHub Actions integration for automated linting, testing, and edge network deployments on every push to `main`.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Auth | Custom HS256 JWT Simulator |
| Database | Browser Storage API (LocalStorage JSON Schema) |
| State Loop | Vanilla JS Pub/Sub Observer Pattern |
| Data Viz | HTML5 Canvas API |
| CI/CD | GitHub Actions |

## 📁 Project Structure

```
XYZ/
├── index.html                    # App shell — auth, sidebar, all views, modals
├── style.css                     # Design system — tokens, components, animations
├── app.js                        # Logic — auth, CRUD, filters, charts, state engine
└── NexTask_Project_Documentation.html  # Full technical documentation (print to PDF)
```

## 🔧 Running Locally

Just open `index.html` in your browser — **zero build steps and zero dependencies needed**.

```bash
# Or serve with any static file server
npx serve .
```

## 📄 Documentation

Open `NexTask_Project_Documentation.html` in a browser and press `Ctrl+P → Save as PDF` for the full 10-section technical documentation outlining the architectural choices behind this vanilla JS single-page application.

## 🔐 Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@nextask.app` |
| Password | `demo1234` |

---

Built by **arihant174** · IITK · 2026
