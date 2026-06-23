# NexTask - AI Powered Task Manager
**Live Demo:** [https://nex-task-wlb1.vercel.app](https://nex-task-wlb1.vercel.app)

## About The Project

NexTask is an intelligent, productivity-focused task management system. It is designed to help students and professionals organize their daily tasks effortlessly. 

**Key Features & Use Cases:**
- **Smart Categorization:** Uses AI to automatically read your task titles (like "finish EE250 assignment") and instantly categorize them into the correct bucket (e.g., Coursework, Coding, Personal).
- **Productivity Tracking:** Features a built-in dashboard that calculates your completion rates and provides visual progress bars for each category.
- **Secure Cloud Sync:** Allows you to log in from anywhere using secure email authentication and keeps all your tasks perfectly synced across devices in real-time.

## Tech Stack

This project was built using modern web technologies to ensure a fast, secure, and responsive user experience:

- **Frontend Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** Pure CSS (with modern variables and glassmorphism UI)
- **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL backend)
- **Artificial Intelligence:** [Google Gemini API](https://deepmind.google/technologies/gemini/) (for smart task categorization)
- **Deployment:** [Vercel](https://vercel.com/)

---

## Getting Started Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You will need to add your own Supabase credentials in the codebase to test the database locally.
