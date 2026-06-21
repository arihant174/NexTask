# NexTask — Cloud-Native Productivity Dashboard

> **Association for Computing Activities, IITK** · June 2026

A highly responsive, cloud-native task management web application built with modern full-stack technologies.

## 🚀 Features

- **JWT Authentication** — Secure sign-in / sign-up via Supabase Auth with GitHub & Google OAuth
- **Real-Time CRUD** — Create, read, update, delete tasks synced live via Supabase Realtime (PostgreSQL WebSocket subscriptions)
- **Dynamic Filtering** — Instant client-side filtering by status, priority, category, and full-text search — zero extra DB queries
- **PostgreSQL Schema** — Relational schema with RLS policies, enum types, triggers, and composite indexes via Supabase
- **Analytics Dashboard** — Custom Canvas charts (donut + bar), completion rates, priority breakdown
- **CI/CD Pipeline** — GitHub Actions → Vercel: automated lint, test, build, and zero-downtime deploy on every push to `main`

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Auth | Supabase Auth (JWT / HS256) |
| Database | PostgreSQL via Supabase (PostgREST) |
| Realtime | Supabase Realtime (WebSocket) |
| Hosting | Vercel Edge Network |
| CI/CD | GitHub Actions |

## 📁 Project Structure

```
XYZ/
├── index.html                    # App shell — auth, sidebar, all views, modals
├── style.css                     # Design system — tokens, components, animations
├── app.js                        # Logic — auth, CRUD, filters, charts, state
└── NexTask_Project_Documentation.html  # Full technical documentation (print to PDF)
```

## 🔧 Running Locally

Just open `index.html` in your browser — no build step needed.

```bash
# Or serve with any static file server
npx serve .
```

## 📄 Documentation

Open `NexTask_Project_Documentation.html` in a browser and press `Ctrl+P → Save as PDF` for the full 10-section technical documentation.

## 🔐 Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@nextask.app` |
| Password | `demo1234` |

---

Built by **arihant174** · IITK · 2026
