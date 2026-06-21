# NexTask — AI-Powered Task Management Dashboard

> **Association for Computing Activities, IITK** · June 2026

## 🌟 What is NexTask?

NexTask is a modern, full-stack productivity dashboard designed to help users organize their daily lives with the power of Artificial Intelligence. 

Instead of manually sorting through endless lists of chores, assignments, and coding tasks, NexTask allows users to simply type what they need to do. The application automatically analyzes the text using Google's Gemini AI and instantly categorizes it into the correct bucket (Coding, Coursework, Personal, etc.). It features a beautiful, glassmorphic user interface and is backed by a secure, real-time cloud database.

## ⚙️ How it Works

1. **Authentication:** Users create an account or log in securely. Authentication is handled entirely by **Supabase Auth**, which issues secure session tokens.
2. **Task Creation & AI Analysis:** When a user types a new task (e.g., "Finish the React frontend"), the text is sent securely to the **Google Gemini AI API**. The AI evaluates the context of the sentence and returns a specific category tag (e.g., "coding").
3. **Data Storage & Attachments:** The task, along with its AI-generated category, deadline, and up to 5 attached files, is saved in a **Supabase PostgreSQL database**. Files are converted and stored as Base64 encoded strings for instant retrieval.
4. **Live React Interface:** The frontend is built entirely in **Next.js**. As soon as the database confirms the task is saved, React's state management instantly updates the browser screen without ever needing to refresh the page.
5. **Background Monitoring:** A silent JavaScript loop constantly monitors task deadlines in the background. If a deadline falls within 6 hours, it triggers an automatic browser alert to remind the user.

---

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
