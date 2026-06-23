"use client";

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { GoogleGenAI } from '@google/genai';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Home() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [geminiKey, setGeminiKey] = useState('');
  
  // Auth State
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Modals & UI State
  const [showStats, setShowStats] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [tempGeminiKey, setTempGeminiKey] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});

  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Initialization
  useEffect(() => {
    const savedKey = localStorage.getItem('mtm_gemini_key') || '';
    setGeminiKey(savedKey);
    setTempGeminiKey(savedKey);

    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabaseClient.auth.getSession();
      setSession(currentSession);
      if (currentSession) loadTasks();
    };
    checkSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) loadTasks();
      else setTasks([]);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Background Alarms
  useEffect(() => {
    if (!session || tasks.length === 0) return;
    const interval = setInterval(async () => {
      const now = new Date();
      let needsRender = false;
      
      const newTasks = [...tasks];
      for (const task of newTasks) {
        if (!task.deadline || task.completed) continue;
        const deadlineDate = new Date(task.deadline);
        const diffMs = deadlineDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        let needsUpdate = false;
        if (diffHours <= 6 && diffHours > 2 && !task.alert6h) {
          alert(`Reminder: Task "${task.title}" is due in less than 6 hours!`);
          task.alert6h = true;
          needsUpdate = true;
          needsRender = true;
        } else if (diffHours <= 2 && diffHours > 0 && !task.alert2h) {
          alert(`URGENT: Task "${task.title}" is due in less than 2 hours!`);
          task.alert2h = true;
          needsUpdate = true;
          needsRender = true;
        }

        if (needsUpdate) {
          await supabaseClient.from('tasks').update({ alert6h: task.alert6h, alert2h: task.alert2h }).eq('id', task.id);
        }
      }
      if (needsRender) setTasks(newTasks);
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks, session]);

  const loadTasks = async () => {
    const { data, error } = await supabaseClient
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTasks(data);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!email || !password) return;

    if (isLoginMode) {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthSuccess("Success! You can now log in.");
        setIsLoginMode(true);
      }
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setEmail('');
    setPassword('');
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    let category = 'other';
    
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const prompt = `Categorize this task into EXACTLY ONE of these categories: "coding" (programming, software), "coursework" (university, lectures, assignments, studying, classes), "personal" (gym, chores, life), "other". Task: "${newTaskTitle}". Respond with ONLY the category word in lowercase.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const result = response.text.trim().toLowerCase();
        if (['coding', 'coursework', 'personal', 'other'].includes(result)) {
          category = result;
        }
      } catch (err) {
        console.error("Gemini failed:", err);
      }
    } else {
      if (newTaskTitle.toLowerCase().includes('code') || newTaskTitle.toLowerCase().includes('react')) category = 'coding';
      else if (newTaskTitle.toLowerCase().includes('study') || newTaskTitle.toLowerCase().includes('hw')) category = 'coursework';
      else if (newTaskTitle.toLowerCase().includes('gym') || newTaskTitle.toLowerCase().includes('buy')) category = 'personal';
    }

    const newTask = {
      user_id: session.user.id,
      title: newTaskTitle,
      deadline: newTaskDeadline || null,
      completed: false,
      summary: '',
      files: [],
      category,
      alert6h: false,
      alert2h: false
    };

    const { data, error } = await supabaseClient.from('tasks').insert([newTask]).select();
    if (!error && data) setTasks([data[0], ...tasks]);

    setNewTaskTitle('');
    setNewTaskDeadline('');
    setIsSubmitting(false);
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const completedAt = newStatus ? new Date().toISOString() : null;
    
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: newStatus, completed_at: completedAt } : t));
    await supabaseClient.from('tasks').update({ completed: newStatus, completed_at: completedAt }).eq('id', id);
  };

  const saveSummary = async (id, summary) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, summary } : t));
    await supabaseClient.from('tasks').update({ summary }).eq('id', id);
  };

  const deleteTask = async (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id));
      await supabaseClient.from('tasks').delete().eq('id', id);
    }
  };

  const handleFileUpload = async (id, e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const existingFiles = task.files || [];
    if (existingFiles.length + selectedFiles.length > 5) {
      alert("Maximum of 5 files allowed per task.");
      e.target.value = '';
      return;
    }

    const validFiles = selectedFiles.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        alert(`File ${f.name} is too large (${Math.round(f.size/1024/1024)}MB). Maximum allowed is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const promises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = evt => resolve({ name: file.name, data: evt.target.result });
        reader.readAsDataURL(file);
      });
    });

    const base64Files = await Promise.all(promises);
    const newFiles = [...existingFiles, ...base64Files];
    
    setTasks(tasks.map(t => t.id === id ? { ...t, files: newFiles } : t));
    await supabaseClient.from('tasks').update({ files: newFiles }).eq('id', id);
  };

  const removeFile = async (taskId, fileIndex) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.files) {
      const newFiles = [...task.files];
      newFiles.splice(fileIndex, 1);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, files: newFiles } : t));
      await supabaseClient.from('tasks').update({ files: newFiles }).eq('id', taskId);
    }
  };

  // Rendering helpers
  const username = session?.user?.email?.split('@')[0] || '';

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'completed' ? task.completed : !task.completed);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!session) {
    return (
      <>
        <div className="bg-mesh"></div>
        <div className="screen" id="login-screen">
          <div className="glass-card login-card">
            <div className="logo-area">
              <svg className="app-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <h2>NexTask</h2>
              <p>{isLoginMode ? 'Please enter your email to continue' : 'Register with email to sync tasks securely'}</p>
            </div>
            
            {authError && <div className="auth-error">{authError}</div>}
            {authSuccess && <div className="auth-success">{authSuccess}</div>}

            <form onSubmit={handleAuth}>
              <div className="input-group">
                <label>Email</label>
                <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full">
                {isLoginMode ? 'Log In' : 'Sign Up'}
              </button>
            </form>
            
            <div className="auth-toggle">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="btn-link" onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); setAuthSuccess(''); }}>
                {isLoginMode ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-mesh"></div>
      <div className="screen" style={{ alignItems: 'flex-start' }}>
        <div className="app-container">
          <header className="glass-card main-header">
            <div className="header-content">
              <div className="user-info">
                <div className="avatar">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div className="greeting">Hello,</div>
                  <div id="user-display">{username}</div>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn-outline" onClick={() => setShowAi(true)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                  AI Settings
                </button>
                <button className="btn-primary" onClick={() => setShowStats(true)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="18" y="3" width="4" height="18"></rect><rect x="10" y="8" width="4" height="13"></rect><rect x="2" y="13" width="4" height="8"></rect></svg>
                  View Stats
                </button>
                <button className="btn-outline" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Log Out
                </button>
              </div>
            </div>
          </header>

          <div className="content-grid">
            <div className="left-col">
              <div className="glass-card">
                <div className="card-header">
                  <h3>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Create Task
                  </h3>
                </div>
                <form onSubmit={addTask}>
                  <div className="input-group">
                    <label>Task Title</label>
                    <input type="text" required placeholder="What needs to be done?" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Deadline</label>
                    <input type="datetime-local" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                    {isSubmitting ? <div className="spinner"></div> : "Add Task"}
                  </button>
                </form>
              </div>
            </div>

            <div className="glass-card task-section">
              <div className="card-header">
                <h3>Your Tasks</h3>
                <div className="badge">{tasks.filter(t => !t.completed).length} Active</div>
              </div>

              <div className="filter-bar">
                <div className="search-input">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="category-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <select className="category-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="coding">Coding</option>
                  <option value="coursework">Coursework</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="task-list-wrapper">
                <ul className="task-list">
                  {filteredTasks.map(task => {
                    const isOverdue = task.deadline && !task.completed && new Date(task.deadline) < new Date();
                    const isExpanded = !!expandedTasks[task.id];
                    
                    return (
                      <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'is-overdue' : ''} ${isExpanded ? 'expanded' : ''}`}>
                        <div className="task-header" onClick={() => setExpandedTasks({...expandedTasks, [task.id]: !isExpanded})}>
                          <label className="custom-checkbox" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={task.completed} onChange={() => toggleTaskStatus(task.id, task.completed)} />
                            <span className="checkmark"></span>
                          </label>
                          <div className="task-info">
                            <div className="task-title-row">
                              <span className="task-title">{task.title}</span>
                              <span className={`cat-badge ${task.category}`}>{task.category}</span>
                            </div>
                            {task.deadline && (
                              <div className="task-deadline">
                                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                {new Date(task.deadline).toLocaleString([], {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                              </div>
                            )}
                          </div>
                          <button className="btn-icon" style={{color: 'var(--danger)'}} onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} title="Delete Task">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', marginLeft: '10px'}}><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>

                        {isExpanded && (
                          <div className="task-details" style={{display: 'block'}} onClick={e => e.stopPropagation()}>
                            <div className="input-group">
                              <label>Task Summary / Notes</label>
                              <textarea placeholder="Record what was done..." defaultValue={task.summary} onBlur={e => saveSummary(task.id, e.target.value)}></textarea>
                            </div>
                            
                            <div className="attachments-list" style={{marginBottom: '10px'}}>
                              {task.file_data && (
                                <div className="attachment-preview">
                                  <span className="truncate-text">📎 <a href={task.file_data} download={task.file_name}>{task.file_name}</a></span>
                                  <span className="btn-icon" style={{color:'var(--danger)', flexShrink:0}}>Legacy</span>
                                </div>
                              )}
                              
                              {(task.files || []).map((f, idx) => (
                                <div key={idx} className="attachment-preview">
                                  <span className="truncate-text">📎 <a href={f.data} download={f.name}>{f.name}</a></span>
                                  <button className="btn-icon" style={{color:'var(--danger)', flexShrink:0}} onClick={() => removeFile(task.id, idx)}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>
                                </div>
                              ))}
                            </div>

                            {((task.files ? task.files.length : 0) + (task.file_data ? 1 : 0) < 5) ? (
                              <div className="file-upload-wrapper btn-outline">
                                <span style={{fontSize:'0.85rem'}}>📎 Attach Files (Max 5MB each)</span>
                                <input type="file" multiple onChange={(e) => handleFileUpload(task.id, e)} />
                              </div>
                            ) : (
                              <div style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Maximum of 5 files attached.</div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {filteredTasks.length === 0 && (
                    <div style={{textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0'}}>
                      No tasks found. Create one to get started!
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAi && (
        <div className="modal-overlay" onClick={() => setShowAi(false)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <h3>AI Categorization Setup</h3>
              <button className="btn-icon" onClick={() => setShowAi(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="ai-setup-body">
              <p style={{marginBottom: '15px', fontSize: '0.95rem', color: 'var(--text-muted)'}}>
                Enter your free <strong>Google Gemini API Key</strong> to enable auto-categorization. The app will securely save this key locally.
              </p>
              <div className="input-group">
                <label>Gemini API Key</label>
                <input type="password" placeholder="AIzaSy..." value={tempGeminiKey} onChange={e => setTempGeminiKey(e.target.value)} />
              </div>
              <button className="btn-primary w-full" onClick={() => {
                localStorage.setItem('mtm_gemini_key', tempGeminiKey);
                setGeminiKey(tempGeminiKey);
                setShowAi(false);
              }}>Save Key</button>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div className="modal-overlay" onClick={() => setShowStats(false)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <h3>Productivity Stats</h3>
              <button className="btn-icon" onClick={() => setShowStats(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{textAlign: 'center', color: 'var(--text-muted)'}}>
              Stats dashboard successfully migrated! <br/> (Circular logic integration in progress)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
