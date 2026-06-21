/* ═══════════════════════════════════════════════════════════════════════
   NexTask — Cloud-Native Productivity Dashboard
   app.js — Full client-side logic (Auth, CRUD, Filtering, Charts)
   Association for Computing Activities, IITK  |  Jun '26
   ═══════════════════════════════════════════════════════════════════════ */

/* ─── SIMULATED SUPABASE / JWT STORE ────────────────────────────────────── */
const Store = (() => {
  const KEY_TASKS  = 'nextask_tasks';
  const KEY_USER   = 'nextask_user';
  const KEY_JWT    = 'nextask_jwt';
  const KEY_NOTIFS = 'nextask_notifs';

  // Simulate JWT signing (Base64URL encoding)
  const b64 = str => btoa(unescape(encodeURIComponent(str))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const issueJWT = (payload) => {
    const header  = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body    = b64(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 }));
    const sig     = b64(`${header}.${body}.supabase-secret-iitk`);
    return `${header}.${body}.${sig}`;
  };
  const parseJWT = (token) => {
    try {
      const [, body] = token.split('.');
      return JSON.parse(decodeURIComponent(escape(atob(body.replace(/-/g, '+').replace(/_/g, '/')))));
    } catch { return null; }
  };

  return {
    // ── USER ──────────────────────────────────────────────────────────────
    saveUser(user) {
      const token = issueJWT({ sub: user.id, email: user.email, role: 'authenticated' });
      localStorage.setItem(KEY_USER, JSON.stringify(user));
      localStorage.setItem(KEY_JWT, token);
      return token;
    },
    getUser() {
      const u = localStorage.getItem(KEY_USER);
      return u ? JSON.parse(u) : null;
    },
    getJWT() { return localStorage.getItem(KEY_JWT); },
    isAuthenticated() {
      const token = localStorage.getItem(KEY_JWT);
      if (!token) return false;
      const payload = parseJWT(token);
      return payload && payload.exp > Date.now();
    },
    logout() {
      localStorage.removeItem(KEY_USER);
      localStorage.removeItem(KEY_JWT);
    },

    // ── TASKS ──────────────────────────────────────────────────────────────
    getTasks() {
      const raw = localStorage.getItem(KEY_TASKS);
      return raw ? JSON.parse(raw) : [];
    },
    saveTasks(tasks) { localStorage.setItem(KEY_TASKS, JSON.stringify(tasks)); },
    createTask(data) {
      const tasks = this.getTasks();
      const task  = { ...data, id: `task_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, createdAt: new Date().toISOString() };
      tasks.unshift(task);
      this.saveTasks(tasks);
      return task;
    },
    updateTask(id, data) {
      const tasks = this.getTasks().map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t);
      this.saveTasks(tasks);
      return tasks.find(t => t.id === id);
    },
    deleteTask(id) {
      const tasks = this.getTasks().filter(t => t.id !== id);
      this.saveTasks(tasks);
    },

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────
    getNotifs() {
      const raw = localStorage.getItem(KEY_NOTIFS);
      return raw ? JSON.parse(raw) : [];
    },
    addNotif(title, body) {
      const notifs = this.getNotifs();
      notifs.unshift({ id: Date.now(), title, body, ts: new Date().toISOString() });
      localStorage.setItem(KEY_NOTIFS, JSON.stringify(notifs.slice(0, 20)));
    },
    clearNotifs() { localStorage.removeItem(KEY_NOTIFS); },
  };
})();

/* ─── SEED DATA ─────────────────────────────────────────────────────────── */
function seedDemoData() {
  if (Store.getTasks().length) return;
  const now = new Date();
  const d = (offset) => { const dt = new Date(now); dt.setDate(dt.getDate() + offset); return dt.toISOString().split('T')[0]; };

  const tasks = [
    { title: 'Set up Supabase PostgreSQL schema', desc: 'Define relational tables for tasks, users, and projects with RLS policies.', status: 'done',        priority: 'high',   category: 'Engineering', due: d(-3)  },
    { title: 'Implement JWT authentication flow', desc: 'Integrate Supabase Auth with JWT access tokens and refresh token rotation.', status: 'done',        priority: 'high',   category: 'Engineering', due: d(-2)  },
    { title: 'Build real-time CRUD via Supabase',  desc: 'Subscribe to postgres_changes for live task updates across clients.', status: 'in-progress', priority: 'high',   category: 'Engineering', due: d(1)   },
    { title: 'Design task management UI/UX',       desc: 'Wireframe and prototype the dashboard in Figma with dark mode design tokens.', status: 'done',        priority: 'medium', category: 'Design',       due: d(-1)  },
    { title: 'Configure GitHub Actions CI/CD',     desc: 'Set up linting, testing, and deployment workflows to Vercel on every push.', status: 'in-progress', priority: 'high',   category: 'DevOps',       due: d(0)   },
    { title: 'Write integration tests for API',    desc: 'Cover all CRUD endpoints with Jest and Supertest.', status: 'todo',        priority: 'medium', category: 'Engineering', due: d(3)   },
    { title: 'Add client-side state filtering',    desc: 'Dynamic filtering by status, priority, and category without additional DB queries.', status: 'done',        priority: 'medium', category: 'Engineering', due: d(-4)  },
    { title: 'Optimize PostgreSQL query indexes',  desc: 'Analyze EXPLAIN ANALYZE output and add composite indexes.', status: 'todo',        priority: 'high',   category: 'Engineering', due: d(5)   },
    { title: 'Accessibility audit (WCAG 2.1 AA)',  desc: 'Run axe-core and fix contrast ratios and ARIA labels.', status: 'todo',        priority: 'medium', category: 'Design',       due: d(7)   },
    { title: 'Deploy staging environment on Vercel', desc: 'Configure environment variables and preview deployments for PR branches.', status: 'in-progress', priority: 'medium', category: 'DevOps',       due: d(0)   },
    { title: 'Document API endpoints with OpenAPI', desc: 'Generate Swagger docs from Supabase edge function annotations.', status: 'todo',        priority: 'low',    category: 'Engineering', due: d(10)  },
    { title: 'Security penetration testing',       desc: 'Review RLS rules and test for IDOR vulnerabilities.', status: 'todo',        priority: 'high',   category: 'Engineering', due: d(6)   },
    { title: 'Analytics dashboard wireframe',      desc: 'Prototype productivity charts and KPI metrics for the analytics view.', status: 'done',        priority: 'low',    category: 'Design',       due: d(-5)  },
    { title: 'Setup monitoring with Sentry',       desc: 'Integrate Sentry for error tracking and performance monitoring.', status: 'todo',        priority: 'low',    category: 'DevOps',       due: d(8)   },
    { title: 'User onboarding tour',               desc: 'Build a guided tour component for new users using Shepherd.js.', status: 'todo',        priority: 'low',    category: 'Design',       due: d(12)  },
  ];
  tasks.forEach(t => Store.createTask(t));

  Store.addNotif('CI/CD Pipeline Active', 'GitHub Actions → Vercel deployment succeeded for main branch.');
  Store.addNotif('Realtime Connected', 'Supabase Realtime subscription established for tasks table.');
  Store.addNotif('JWT Issued', 'Supabase JWT token issued successfully. Session expires in 24h.');
}

/* ─── APP STATE ──────────────────────────────────────────────────────────── */
let state = {
  currentView: 'dashboard',
  filter: 'all',
  sort: 'created',
  search: '',
  deleteTargetId: null,
  editingTaskId: null,
};

/* ─── DOM HELPERS ────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

/* ─── INIT ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  greetingDynamic();
  setTodayDate();

  if (Store.isAuthenticated()) {
    const user = Store.getUser();
    seedDemoData();
    bootApp(user);
  } else {
    show($('auth-screen'));
    // set default due date for today
    const inp = $('task-due-input');
    if (inp) inp.value = new Date().toISOString().split('T')[0];
  }

  // Password strength meter
  const spw = $('signup-pass');
  if (spw) spw.addEventListener('input', () => updatePasswordStrength(spw.value));

  // Keyboard shortcut: Cmd/Ctrl+K focuses search
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      $('global-search')?.focus();
    }
    if (e.key === 'Escape') { closeTaskModal(); closeConfirmDialog(); }
  });

  // Click outside notif panel
  document.addEventListener('click', e => {
    if (!$('notif-panel').contains(e.target) && !$('notif-btn').contains(e.target)) {
      hide($('notif-panel'));
    }
  });
});

function greetingDynamic() {
  const h = new Date().getHours();
  const el = $('greeting-title');
  if (!el) return;
  if (h < 12)      el.textContent = 'Good morning ☀️';
  else if (h < 17) el.textContent = 'Good afternoon 👋';
  else             el.textContent = 'Good evening 🌙';
}

function setTodayDate() {
  const el = $('today-date-sub');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/* ─── AUTH LOGIC ─────────────────────────────────────────────────────────── */
function switchTab(tab) {
  const isLogin = tab === 'login';
  $('tab-login').classList.toggle('active', isLogin);
  $('tab-signup').classList.toggle('active', !isLogin);
  $('tab-slider').classList.toggle('right', !isLogin);
  $('login-form').classList.toggle('hidden', !isLogin);
  $('signup-form').classList.toggle('hidden', isLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = $('login-btn');
  setLoading(btn, true);
  await delay(900); // Simulate Supabase JWT fetch

  const email = $('login-email').value.trim();
  const name  = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const user  = { id: `usr_${Date.now()}`, email, name, avatar: name[0].toUpperCase(), role: 'Pro', org: 'IITK' };
  Store.saveUser(user);
  seedDemoData();

  setLoading(btn, false);
  toast('Signed in successfully via Supabase JWT 🎉', 'success');
  await delay(400);

  $('auth-screen').style.animation = 'none';
  $('auth-screen').style.opacity   = '0';
  $('auth-screen').style.transform = 'scale(1.02)';
  $('auth-screen').style.transition = 'all 0.4s ease';
  await delay(400);
  hide($('auth-screen'));
  bootApp(user);
}

async function handleSignup(e) {
  e.preventDefault();
  const btn = $('signup-btn');
  setLoading(btn, true);
  await delay(1100);

  const fname = $('signup-fname').value.trim();
  const lname = $('signup-lname').value.trim();
  const email = $('signup-email').value.trim();
  const name  = `${fname} ${lname}`;
  const user  = { id: `usr_${Date.now()}`, email, name, avatar: fname[0].toUpperCase(), role: 'Pro', org: 'IITK' };
  Store.saveUser(user);
  seedDemoData();

  setLoading(btn, false);
  toast('Account created! Welcome to NexTask 🚀', 'success');
  await delay(400);
  hide($('auth-screen'));
  bootApp(user);
}

function handleSocialLogin(provider) {
  toast(`Connecting to ${provider} OAuth…`, 'info');
  setTimeout(() => {
    const user = { id: `usr_${Date.now()}`, email: `user@${provider.toLowerCase()}.com`, name: `${provider} User`, avatar: provider[0], role: 'Pro', org: 'IITK' };
    Store.saveUser(user);
    seedDemoData();
    hide($('auth-screen'));
    bootApp(user);
  }, 1200);
}

function handleLogout() {
  Store.logout();
  location.reload();
}

function togglePass(inputId, btn) {
  const inp = $(inputId);
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  btn.style.color = isPass ? 'var(--accent)' : '';
}

function updatePasswordStrength(pw) {
  const el = $('pw-strength');
  if (!el) return;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const pct   = [0, 25, 50, 75, 100][score];
  const color = ['', 'var(--danger)', 'var(--warning)', 'var(--warning)', 'var(--success)'][score];
  el.style.setProperty('--strength', pct + '%');
  el.style.setProperty('--strength-color', color);
}

/* ─── BOOT APP ───────────────────────────────────────────────────────────── */
function bootApp(user) {
  show($('app'));
  populateUserUI(user);
  populateSidebar();
  renderAll();
  updateNavBadges();
  updateNotifDot();
  toast(`JWT verified · Realtime subscribed 🟢`, 'info');
}

function populateUserUI(user) {
  const av = user.avatar || user.name[0].toUpperCase();
  $('user-avatar-sidebar').textContent = av;
  $('user-avatar-top').textContent     = av;
  $('user-name-sidebar').textContent   = user.name;
}

/* ─── SIDEBAR PROJECTS ───────────────────────────────────────────────────── */
const CATEGORY_COLORS = {
  Engineering: '#00C6FF',
  Design:      '#FF6B9D',
  Research:    '#A78BFA',
  DevOps:      '#00D68F',
  Marketing:   '#FFB020',
  Other:       '#60748A',
};

function populateSidebar() {
  const tasks = Store.getTasks();
  const cats  = [...new Set(tasks.map(t => t.category))];
  const el    = $('sidebar-projects');
  el.innerHTML = cats.map(c => `
    <div class="project-item" onclick="filterByCategory('${c}')">
      <span class="project-dot" style="background:${CATEGORY_COLORS[c]||'#60748A'}"></span>
      ${c}
      <span style="margin-left:auto;font-size:11px;color:var(--text-muted)">${tasks.filter(t=>t.category===c).length}</span>
    </div>`).join('');
}

function filterByCategory(cat) {
  setView('tasks', $('nav-tasks'));
  // Apply a pseudo-filter: search by category
  state.search = cat;
  $('global-search').value = cat;
  renderTasksView();
}

/* ─── VIEW SWITCHING ─────────────────────────────────────────────────────── */
function setView(view, btn) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = $(`view-${view}`);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
  if (view === 'tasks')     renderTasksView();
  if (view === 'today')     renderTodayView();
  if (view === 'analytics') renderAnalytics();
  if (view === 'dashboard') renderAll();
  // Close sidebar on mobile
  if (window.innerWidth < 768) {
    $('sidebar').classList.add('collapsed');
  }
}

function toggleSidebar() {
  $('sidebar').classList.toggle('collapsed');
}

/* ─── RENDER ALL ─────────────────────────────────────────────────────────── */
function renderAll() {
  renderStats();
  renderRecentTasks();
  renderCategoryProgress();
  renderDonut();
}

/* ─── STATS ─────────────────────────────────────────────────────────────── */
function renderStats() {
  const tasks = Store.getTasks();
  const total    = tasks.length;
  const done     = tasks.filter(t => t.status === 'done').length;
  const inProg   = tasks.filter(t => t.status === 'in-progress').length;
  const high     = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const today    = new Date().toISOString().split('T')[0];
  const todayDue = tasks.filter(t => t.due === today && t.status !== 'done').length;

  const statsData = [
    { icon: svgCheckCircle, label: 'Tasks Completed', value: done,    delta: `${total ? Math.round(done/total*100) : 0}% completion rate`, up: true,  color: '#00C6FF', glow: 'rgba(0,198,255,0.12)', bg: 'rgba(0,198,255,0.1)' },
    { icon: svgProgress,    label: 'In Progress',     value: inProg,  delta: 'Active tasks',              up: true,  color: '#A78BFA', glow: 'rgba(167,139,250,0.12)', bg: 'rgba(167,139,250,0.1)' },
    { icon: svgFire,        label: 'High Priority',   value: high,    delta: 'Need attention',            up: false, color: '#FF4757', glow: 'rgba(255,71,87,0.12)',   bg: 'rgba(255,71,87,0.1)' },
    { icon: svgCalendar,    label: 'Due Today',        value: todayDue, delta: 'Remaining today',         up: true,  color: '#FFB020', glow: 'rgba(255,176,32,0.12)', bg: 'rgba(255,176,32,0.1)' },
  ];

  $('stats-grid').innerHTML = statsData.map((s, i) => `
    <div class="stat-card" style="--card-glow:${s.glow};animation-delay:${i*0.07}s">
      <div class="stat-icon" style="--icon-bg:${s.bg}; color:${s.color}">
        ${s.icon}
      </div>
      <div class="stat-value" style="color:${s.color}">${s.value}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-delta ${s.up ? 'up' : 'down'}">${s.delta}</div>
    </div>`).join('');
}

/* ─── SVG ICONS ──────────────────────────────────────────────────────────── */
const svgCheckCircle = `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 10.5l2.5 2.5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const svgProgress    = `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" stroke-dasharray="40 10" stroke-linecap="round"/></svg>`;
const svgFire        = `<svg viewBox="0 0 20 20" fill="none"><path d="M10 2C10 2 14 6 14 10a4 4 0 0 1-4 4 4 4 0 0 1-4-4c0-2 1.5-3.5 2-5 .5 1 1 2.5 2 3V8c0-2 0-4 0-6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const svgCalendar    = `<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const svgEdit        = `<svg viewBox="0 0 20 20" fill="none"><path d="M13 4l3 3-9 9H4v-3l9-9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const svgTrash       = `<svg viewBox="0 0 20 20" fill="none"><path d="M5 7h10l-1 9H6L5 7ZM8 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M3 7h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ─── STATUS / PRIORITY BADGES ────────────────────────────────────────────── */
function statusBadge(status) {
  const map = { todo: ['To Do','badge-todo'], 'in-progress': ['In Progress','badge-inprog'], done: ['Done','badge-done'] };
  const [label, cls] = map[status] || ['–','badge-todo'];
  return `<span class="task-badge ${cls}">${label}</span>`;
}
function priorityBadge(priority) {
  const map = { high: ['High','badge-high'], medium: ['Medium','badge-medium'], low: ['Low','badge-low'] };
  const [label, cls] = map[priority] || ['–','badge-low'];
  return `<span class="task-badge ${cls}">${label}</span>`;
}

/* ─── TASK ROW HTML ──────────────────────────────────────────────────────── */
function taskRow(task, idx) {
  const isDone    = task.status === 'done';
  const today     = new Date().toISOString().split('T')[0];
  const isOverdue = task.due && task.due < today && !isDone;
  const dueText   = task.due ? formatDue(task.due) : '';

  return `
  <div class="task-item ${isDone ? 'done-item' : ''}" id="task-row-${task.id}" style="animation-delay:${idx*0.04}s">
    <div class="task-check ${isDone ? 'checked' : ''}" onclick="toggleTask('${task.id}')" title="${isDone ? 'Mark incomplete' : 'Mark complete'}"></div>
    <div class="task-body">
      <div class="task-name ${isDone ? 'done-text' : ''}">${escHtml(task.title)}</div>
      <div class="task-meta">
        ${statusBadge(task.status)}
        ${priorityBadge(task.priority)}
        <span class="task-cat">${escHtml(task.category)}</span>
        ${dueText ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️ ' : ''}${dueText}</span>` : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn edit" onclick="openTaskModal('${task.id}')" title="Edit"><span>${svgEdit}</span></button>
      <button class="task-action-btn delete" onclick="confirmDelete('${task.id}')" title="Delete"><span>${svgTrash}</span></button>
    </div>
  </div>`;
}

/* ─── RECENT TASKS ───────────────────────────────────────────────────────── */
function renderRecentTasks() {
  const recent = Store.getTasks().slice(0, 6);
  const el = $('recent-tasks-list');
  if (!el) return;
  el.innerHTML = recent.map((t, i) => taskRow(t, i)).join('');
}

/* ─── CATEGORY PROGRESS ──────────────────────────────────────────────────── */
function renderCategoryProgress() {
  const tasks = Store.getTasks();
  const cats  = ['Engineering', 'Design', 'DevOps', 'Research'];
  const el    = $('category-progress');
  if (!el) return;
  el.innerHTML = cats.map(cat => {
    const all  = tasks.filter(t => t.category === cat);
    const done = all.filter(t => t.status === 'done').length;
    const pct  = all.length ? Math.round(done / all.length * 100) : 0;
    const color = CATEGORY_COLORS[cat] || '#60748A';
    return `
    <div class="cat-row">
      <div class="cat-row-label"><span>${cat}</span><span>${done}/${all.length} · ${pct}%</span></div>
      <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
  }).join('');
}

/* ─── DONUT CHART ────────────────────────────────────────────────────────── */
function renderDonut() {
  const canvas = $('donut-chart');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const tasks  = Store.getTasks();
  const total  = tasks.length;
  const done   = tasks.filter(t => t.status === 'done').length;
  const inProg = tasks.filter(t => t.status === 'in-progress').length;
  const todo   = total - done - inProg;

  const segments = [
    { val: done,   color: '#00D68F' },
    { val: inProg, color: '#00AAFF' },
    { val: todo,   color: 'rgba(255,255,255,0.08)' },
  ].filter(s => s.val > 0);

  const W = 180, cx = W/2, cy = W/2, R = 72, r = 50;
  ctx.clearRect(0, 0, W, W);

  let startAngle = -Math.PI / 2;
  segments.forEach(seg => {
    const slice = (seg.val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, R, startAngle, startAngle + slice);
    ctx.arc(cx, cy, r, startAngle + slice, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += slice;
  });

  // Center text
  const pct = total ? Math.round(done / total * 100) : 0;
  $('donut-center-text').innerHTML = `<div class="dc-val">${pct}%</div><div class="dc-label">Complete</div>`;
}

/* ─── TASKS VIEW ─────────────────────────────────────────────────────────── */
function getFilteredTasks() {
  let tasks = Store.getTasks();

  // Search
  if (state.search) {
    const q = state.search.toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.desc || '').toLowerCase().includes(q)
    );
  }

  // Filter
  if (state.filter !== 'all') {
    if (['todo','in-progress','done'].includes(state.filter)) {
      tasks = tasks.filter(t => t.status === state.filter);
    } else if (['high','medium','low'].includes(state.filter)) {
      tasks = tasks.filter(t => t.priority === state.filter);
    }
  }

  // Sort
  if (state.sort === 'due') {
    tasks = tasks.sort((a, b) => {
      if (!a.due) return 1; if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });
  } else if (state.sort === 'priority') {
    const p = { high: 0, medium: 1, low: 2 };
    tasks = tasks.sort((a, b) => (p[a.priority] || 1) - (p[b.priority] || 1));
  } else if (state.sort === 'alpha') {
    tasks = tasks.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    tasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return tasks;
}

function renderTasksView() {
  const tasks = getFilteredTasks();
  const el    = $('tasks-list');
  const empty = $('tasks-empty');
  if (!el) return;

  if (tasks.length === 0) {
    el.innerHTML = '';
    show(empty);
  } else {
    hide(empty);
    el.innerHTML = tasks.map((t, i) => taskRow(t, i)).join('');
  }
}

function applyFilter(filter, btn) {
  state.filter = filter;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderTasksView();
}

function applySort(val) {
  state.sort = val;
  renderTasksView();
}

function handleSearch(val) {
  state.search = val;
  if (state.currentView === 'tasks') renderTasksView();
  if (state.currentView === 'today') renderTodayView();
}

/* ─── TODAY VIEW ─────────────────────────────────────────────────────────── */
function renderTodayView() {
  const today = new Date().toISOString().split('T')[0];
  let tasks   = Store.getTasks().filter(t => t.due === today);
  if (state.search) {
    const q = state.search.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q));
  }
  const el    = $('today-list');
  const empty = $('today-empty');
  if (!el) return;

  if (tasks.length === 0) { el.innerHTML = ''; show(empty); }
  else { hide(empty); el.innerHTML = tasks.map((t, i) => taskRow(t, i)).join(''); }
}

/* ─── ANALYTICS ──────────────────────────────────────────────────────────── */
function renderAnalytics() {
  const tasks  = Store.getTasks();
  const total  = tasks.length;
  const done   = tasks.filter(t => t.status === 'done').length;
  const pct    = total ? Math.round(done / total * 100) : 0;

  $('completion-rate-stat').textContent = pct + '%';
  setTimeout(() => {
    const bar = $('completion-bar');
    if (bar) bar.style.width = pct + '%';
  }, 100);

  // Priority breakdown
  const high   = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low    = tasks.filter(t => t.priority === 'low').length;
  const maxPri = Math.max(high, medium, low, 1);
  $('priority-breakdown').innerHTML = [
    { label: '🔴 High',   val: high,   pct: Math.round(high/maxPri*100),   color: 'var(--danger)' },
    { label: '🟡 Medium', val: medium, pct: Math.round(medium/maxPri*100), color: 'var(--warning)' },
    { label: '🟢 Low',    val: low,    pct: Math.round(low/maxPri*100),    color: 'var(--success)' },
  ].map(p => `
    <div class="pri-row">
      <span class="pri-label">${p.label}</span>
      <div class="pri-bar-track"><div class="pri-bar-fill" style="width:0%;background:${p.color}" data-target="${p.pct}"></div></div>
      <span class="pri-count">${p.val}</span>
    </div>`).join('');

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.pri-bar-fill').forEach(b => {
      b.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
      b.style.width = b.dataset.target + '%';
    });
  }, 150);

  renderBarChart();
}

function renderBarChart() {
  const canvas = $('bar-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const tasks = Store.getTasks();
  const W = canvas.offsetWidth || 400, H = 180;
  canvas.width = W; canvas.height = H;

  // Group by category
  const cats = ['Engineering', 'Design', 'DevOps', 'Research', 'Marketing', 'Other'];
  const values = cats.map(c => tasks.filter(t => t.category === c).length);
  const colors = cats.map(c => CATEGORY_COLORS[c] || '#60748A');
  const max = Math.max(...values, 1);

  const barW = Math.floor((W - 60) / cats.length) - 8;
  const startX = 30;

  ctx.clearRect(0, 0, W, H);
  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = H - 30 - (i / 4) * (H - 50);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(W - 10, y); ctx.stroke();
    ctx.fillStyle = 'rgba(238,242,255,0.3)'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(max * i / 4), startX - 4, y + 4);
  }

  values.forEach((v, i) => {
    const x    = startX + i * (barW + 8);
    const bH   = v ? Math.max(8, (v / max) * (H - 50)) : 4;
    const y    = H - 30 - bH;
    // Bar gradient
    const grad = ctx.createLinearGradient(x, y, x, H - 30);
    grad.addColorStop(0, colors[i]);
    grad.addColorStop(1, colors[i] + '40');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, bH, 4);
    ctx.fill();
    // Label
    ctx.fillStyle = 'rgba(238,242,255,0.4)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
    ctx.fillText(cats[i].slice(0, 4), x + barW / 2, H - 12);
    if (v) {
      ctx.fillStyle = 'rgba(238,242,255,0.8)'; ctx.font = 'bold 10px Inter';
      ctx.fillText(v, x + barW / 2, y - 4);
    }
  });
}

/* ─── NAV BADGES ─────────────────────────────────────────────────────────── */
function updateNavBadges() {
  const tasks  = Store.getTasks();
  const today  = new Date().toISOString().split('T')[0];
  const active = tasks.filter(t => t.status !== 'done').length;
  const todayN = tasks.filter(t => t.due === today && t.status !== 'done').length;

  $('nav-badge-dashboard').textContent = active;
  $('nav-badge-tasks').textContent     = tasks.length;
  $('nav-badge-today').textContent     = todayN || '';
}

/* ─── TOGGLE TASK COMPLETE ───────────────────────────────────────────────── */
function toggleTask(id) {
  const task = Store.getTasks().find(t => t.id === id);
  if (!task) return;
  const newStatus = task.status === 'done' ? 'todo' : 'done';
  Store.updateTask(id, { status: newStatus });
  if (newStatus === 'done') {
    toast(`✅ "${task.title.slice(0,30)}…" marked complete`, 'success');
    Store.addNotif('Task Completed', `"${task.title}" was marked as done.`);
  }
  updateNavBadges();
  updateNotifDot();
  refreshCurrentView();
}

function refreshCurrentView() {
  if (state.currentView === 'dashboard') renderAll();
  if (state.currentView === 'tasks')     renderTasksView();
  if (state.currentView === 'today')     renderTodayView();
  if (state.currentView === 'analytics') renderAnalytics();
  populateSidebar();
}

/* ─── TASK MODAL ─────────────────────────────────────────────────────────── */
function openTaskModal(taskId = null, forToday = false) {
  const modal  = $('task-modal');
  const title  = $('modal-title');
  const submit = $('task-submit-btn');
  const form   = $('task-form');
  form.reset();

  if (taskId) {
    const t = Store.getTasks().find(t => t.id === taskId);
    if (!t) return;
    state.editingTaskId = taskId;
    title.textContent  = 'Edit Task';
    submit.textContent = 'Save Changes';
    $('task-title-input').value    = t.title;
    $('task-desc-input').value     = t.desc || '';
    $('task-status-input').value   = t.status;
    $('task-priority-input').value = t.priority;
    $('task-category-input').value = t.category;
    $('task-due-input').value      = t.due || '';
    $('task-edit-id').value        = taskId;
  } else {
    state.editingTaskId = null;
    title.textContent   = 'New Task';
    submit.textContent  = 'Create Task';
    $('task-edit-id').value = '';
    $('task-priority-input').value  = 'medium';
    $('task-category-input').value  = 'Engineering';
    $('task-due-input').value = forToday ? new Date().toISOString().split('T')[0] : '';
  }

  show(modal);
  setTimeout(() => $('task-title-input').focus(), 50);
}

function closeTaskModal() {
  hide($('task-modal'));
  state.editingTaskId = null;
}

function closeModalOnBackdrop(e) {
  if (e.target === $('task-modal')) closeTaskModal();
}

function handleTaskSubmit(e) {
  e.preventDefault();
  const data = {
    title:    $('task-title-input').value.trim(),
    desc:     $('task-desc-input').value.trim(),
    status:   $('task-status-input').value,
    priority: $('task-priority-input').value,
    category: $('task-category-input').value,
    due:      $('task-due-input').value,
  };

  if (!data.title) { toast('Task title is required', 'error'); return; }

  const editId = $('task-edit-id').value;
  if (editId) {
    Store.updateTask(editId, data);
    toast('Task updated successfully ✓', 'success');
    Store.addNotif('Task Updated', `"${data.title}" was updated.`);
  } else {
    Store.createTask(data);
    toast('Task created and synced to PostgreSQL ✓', 'success');
    Store.addNotif('New Task Created', `"${data.title}" added to your board.`);
  }

  closeTaskModal();
  updateNavBadges();
  updateNotifDot();
  refreshCurrentView();
  populateSidebar();
}

/* ─── DELETE CONFIRM ─────────────────────────────────────────────────────── */
function confirmDelete(id) {
  state.deleteTargetId = id;
  show($('confirm-dialog'));
  $('confirm-delete-btn').onclick = () => {
    const task = Store.getTasks().find(t => t.id === id);
    Store.deleteTask(id);
    toast(`Task deleted`, 'info');
    closeConfirmDialog();
    updateNavBadges();
    refreshCurrentView();
    populateSidebar();
  };
}

function closeConfirmDialog() {
  hide($('confirm-dialog'));
  state.deleteTargetId = null;
}

function closeConfirmOnBackdrop(e) {
  if (e.target === $('confirm-dialog')) closeConfirmDialog();
}

/* ─── NOTIFICATIONS ──────────────────────────────────────────────────────── */
function toggleNotifPanel() {
  const panel = $('notif-panel');
  if (panel.classList.contains('hidden')) {
    renderNotifPanel();
    show(panel);
  } else {
    hide(panel);
  }
}

function renderNotifPanel() {
  const notifs = Store.getNotifs();
  $('notif-list').innerHTML = notifs.length
    ? notifs.map(n => `
        <div class="notif-item">
          <div class="notif-title">${escHtml(n.title)}</div>
          <div>${escHtml(n.body)}</div>
        </div>`).join('')
    : '<div class="notif-item" style="text-align:center;padding:24px">No notifications</div>';
}

function clearNotifs() {
  Store.clearNotifs();
  renderNotifPanel();
  updateNotifDot();
}

function updateNotifDot() {
  const dot = $('notif-dot');
  if (!dot) return;
  dot.classList.toggle('show', Store.getNotifs().length > 0);
}

/* ─── UTILITIES ──────────────────────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const container = $('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-dot"></span>${escHtml(msg)}`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove());
  }, 3500);
}

function formatDue(iso) {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff  = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < -1) return `${Math.abs(diff)}d overdue`;
  if (diff <= 7) return `In ${diff}d`;
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setLoading(btn, loading) {
  const text    = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled  = loading;
  if (loading) { hide(text); show(spinner); }
  else          { show(text); hide(spinner); }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─── REALTIME SIMULATION ────────────────────────────────────────────────── */
// Simulate Supabase Realtime by auto-refreshing stats every 30s
setInterval(() => {
  if (Store.isAuthenticated() && state.currentView === 'dashboard') {
    renderStats();
  }
}, 30000);
