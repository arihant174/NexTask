# NexTask - Technical Interview Prep Guide

This document is your cheat sheet for explaining the architecture, codebase, and technical decisions behind NexTask during an interview.

---

## 1. The Core Architecture & Files
If asked to walk through the project, explain these 4 core files in this exact order:

### `package.json` (The Grocery List)
* **What it is:** The configuration file that lists the project's dependencies.
* **Talking Points:** Explain that this tells the environment (like Vercel) exactly which packages to install to run the app (e.g., `next`, `react`, `@supabase/supabase-js`, `@google/genai`). It also holds the `scripts` like `npm run dev` for local testing.

### `lib/supabaseClient.js` (The Handshake)
* **What it is:** The bridge between the Next.js frontend and the PostgreSQL database.
* **Talking Points:** This initializes the Supabase client. Every time the app logs a user in or fetches tasks, it imports this client to securely communicate with the database.

### `app/globals.css` (The Design System)
* **What it is:** The central styling engine.
* **Talking Points:** Mention your custom **CSS Variables** (`:root { --primary: #3b82f6 }`) for a scalable color palette. Highlight that you used **Flexbox/Grid** and modern CSS (`backdrop-filter`) to build a responsive, glassmorphism UI from scratch without relying on heavy frameworks like Bootstrap.

### `app/page.js` (The Main Brain)
* **What it is:** The absolute heart of the application containing 95% of the logic.
* **Talking Points:** Break it down into 3 parts:
  1. **State Management:** Uses `useState` to remember short-term data (like search queries and loaded tasks).
  2. **Functions:** Specific asynchronous functions (`handleAuth`, `addTask`, `categorizeTask`) to handle database and AI API calls.
  3. **JSX / UI:** The bottom half uses Ternary Operators to dynamically render the Dashboard or Login screen based on the user's session.

---

## 2. Core JavaScript/React Concepts Used
You can read and explain 95% of this codebase if you understand these 6 concepts:

### React Hooks (`useState` and `useEffect`)
Used for memory and automatic side-effects.
```javascript
const [isInitializing, setIsInitializing] = useState(true);

useEffect(() => {
  const checkSession = async () => {
    // ... checks Supabase for login ...
    setIsInitializing(false);
  };
  checkSession();
}, []);
```

### Asynchronous JavaScript (`async` / `await`)
Used to pause the code while waiting for network requests to finish (like talking to Supabase or Gemini).
```javascript
const handleUpdatePassword = async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient.auth.updateUser({ password });
};
```

### Array Methods (`.map` and `.filter`)
Used heavily for the Productivity Stats Dashboard and task filtering.
```javascript
// Filter: Find only completed tasks
const completedTasks = tasks.filter(task => task.completed === true).length;

// Map: Loop through categories to build stat objects
const categoryStats = categories.map(cat => {
  const catTasks = tasks.filter(t => t.category === cat);
  return { name: cat, total: catTasks.length };
});
```

### Optional Chaining (`?.`)
Safely checks deep inside an object without crashing the app if something is missing.
```javascript
const savedFullName = session?.user?.user_metadata?.full_name;
```

### Destructuring Assignment (`{ }`)
A shortcut to extract exactly what we need from a large object return.
```javascript
const { data, error } = await supabaseClient.from('tasks').select('*');
```

### Ternary Operators (`?` and `:`)
A one-line `if/else` statement used directly inside the HTML/JSX.
```javascript
<button type="submit">
  {isLoginMode ? 'Log In' : 'Sign Up'}
</button>
```

---

## 3. Tech Stack Breakdown & Data Flow
If an interviewer asks you about your tech stack and how the architecture connects, here is exactly how you should break it down.

### The Technologies
1. **Next.js & React (The Front-of-House)**
   * **What it is:** React builds the buttons, input fields, and layout. Next.js is the framework that powers React and makes it lightning fast.
   * **Its purpose:** It manages what the user sees and interacts with, remembering what the user types (using `useState`) and instantly updating the screen without reloading the page.
2. **Pure CSS (The Interior Designer)**
   * **What it is:** The styling language of the web.
   * **Its purpose:** Used to build a custom, modern "frosted glass" (glassmorphism) aesthetic from scratch, avoiding heavy pre-made templates like Bootstrap.
3. **Supabase (The Kitchen & The Vault)**
   * **What it is:** A Backend-as-a-Service (BaaS) providing a PostgreSQL database and an Authentication system.
   * **Its purpose:** Acts as **The Vault** by safely checking user emails/passwords. Acts as **The Kitchen** by permanently storing every task in a cloud database.
4. **Google Gemini API (The Smart Consultant)**
   * **What it is:** A cloud-based Artificial Intelligence model.
   * **Its purpose:** Analyzes task strings to automatically categorize them (e.g., "coding", "coursework"), saving users the effort of manual sorting.
5. **Vercel (The Host)**
   * **What it is:** A cloud hosting platform optimized for Next.js.
   * **Its purpose:** Takes the codebase and hosts it on a public web address (`nex-task-wlb1.vercel.app`) with continuous deployment.

### How it all connects (The Data Flow)
To impress an interviewer, explain the exact flow of data when a user adds a task:

> *"When a user types 'Finish math homework' and clicks Add Task...*
> 1. *My **React** frontend captures that text.*
> 2. *It immediately sends a request over the internet to the **Google Gemini API**, asking it to read the text. Gemini responds with the category word: 'Coursework'.*
> 3. *My app takes the text and the new category, and securely sends it to my **Supabase** database.*
> 4. *Supabase saves it into PostgreSQL and sends back a success message.*
> 5. *Finally, **React** sees the success message and instantly updates the UI to show the new task on the screen—all in less than a second!"*
