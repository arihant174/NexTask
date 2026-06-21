# NexTask — AI-Powered Task Management Dashboard

> **Association for Computing Activities, IITK** · June 2026

A modern, full-stack task management application built to showcase enterprise-grade architecture. Recently migrated from a Vanilla JavaScript prototype to a production-ready **Next.js** application.

## 🚀 Features

- **Real-Time Database & Auth** — Completely powered by **Supabase** (PostgreSQL). Secure email/password authentication and persistent cloud storage.
- **AI Task Categorization** — Integrated with the **Google Gemini API** to automatically categorize tasks into "Coding", "Coursework", or "Personal" using AI analysis on task creation.
- **Multiple File Uploads** — Attach up to 5 files (Max 5MB each) per task seamlessly. The files are securely parsed, converted to Base64, and saved to the cloud database.
- **Background Alarms** — A silent background loop constantly tracks deadlines. It automatically fires browser alerts if a task deadline falls within a 6-hour or 2-hour critical window.
- **Glassmorphism UI** — A highly responsive, premium user interface utilizing CSS mesh gradients, blur filters, and fluid CSS grid layouts.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router), React |
| Backend & Auth | Supabase |
| Artificial Intelligence | Google GenAI SDK (Gemini 2.5 Flash) |
| Styling | Vanilla CSS (Globals) |
| Package Manager | npm |

## 📁 Project Structure

```text
XYZ/
├── nextask-nextjs/               # Next.js Application Root
│   ├── app/                      
│   │   ├── page.js               # Main React Application Logic & State
│   │   ├── layout.js             # HTML metadata & global font loading
│   │   └── globals.css           # UI Design System & Component Styling
│   ├── lib/
│   │   └── supabaseClient.js     # Supabase initialization config
│   ├── package.json              # Dependency map (React, Next, Supabase, GenAI)
└── NexTask_Project_Documentation.html  # Legacy prototype documentation
```

## 🔧 Running Locally

To run this project on your local machine, you must have **Node.js** installed.

1. Open your terminal and navigate to the project directory:
   ```bash
   cd nextask-nextjs
   ```

2. Install the necessary dependencies (Next.js, Supabase, Google GenAI):
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your web browser and navigate to: [http://localhost:3000](http://localhost:3000)

## 🔐 Configuration

This application connects to a live Supabase instance by default via `lib/supabaseClient.js`. 
To utilize the AI Categorization feature, you must input your own **Google Gemini API Key** directly through the UI via the "AI Settings" button in the header. The key is securely saved entirely client-side inside your browser's `localStorage`.

---

Built by **arihant174** · IITK · 2026
