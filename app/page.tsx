 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownUp, CalendarDays, Check, CheckCircle2, ChevronDown,
  Circle, Clock3, Filter, LayoutDashboard, ListTodo, MoreHorizontal,
  Pencil, Plus, Search, Target, Trash2, TrendingUp, X, Zap
} from "lucide-react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string; title: string; description: string; startDate: string; dueDate: string;
  priority: Priority; status: Status; progress: number; notes: string;
  createdAt: string; updatedAt: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (value: string) => value ? new Date(value + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "No date";
const seed: Task[] = [
  { id:"demo-1", title:"Plan the next product sprint", description:"Define the goals, scope, and deliverables for the upcoming sprint.", startDate:today(), dueDate:today(), priority:"High", status:"In progress", progress:65, notes:"Scope is drafted. Finalize owners and estimates.", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:"demo-2", title:"Review project documentation", description:"Bring project notes and key decisions up to date.", startDate:today(), dueDate:"", priority:"Medium", status:"Not started", progress:0, notes:"", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:"demo-3", title:"Share weekly progress update", description:"Summarize completed work, blockers, and next steps.", startDate:today(), dueDate:"", priority:"Low", status:"Completed", progress:100, notes:"Update shared with the team.", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }
];

const emptyForm = { title:"", description:"", startDate:today(), dueDate:"", priority:"Medium" as Priority, status:"Not started" as Status, progress:0, notes:"" };

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All tasks");
  const [view, setView] = useState<"list"|"timeline">("list");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string|null>(null);
  const [form, setForm] = useState(emptyForm);
  const [menu, setMenu] = useState<string|null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("taskflow-tasks-v1");
      setTasks(stored ? JSON.parse(stored) : seed);
    } catch { setTasks(seed); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("taskflow-tasks-v1", JSON.stringify(tasks)); }, [tasks, ready]);

  const completed = tasks.filter(t => t.status === "Completed").length;
  const inProgress = tasks.filter(t => t.status === "In progress").length;
  const overdue = tasks.filter(t => t.status !== "Completed" && t.dueDate && t.dueDate < today()).length;
  const avg = tasks.length ? Math.round(tasks.reduce((n,t)=>n+t.progress,0)/tasks.length) : 0;
  const filtered = useMemo(() => tasks.filter(t => {
    const q = query.toLowerCase();
    const matches = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const statusMatch = filter === "All tasks" || (filter === "Overdue" ? t.status !== "Completed" && !!t.dueDate && t.dueDate < today() : t.status === filter);
    return matches && statusMatch;
  }).sort((a,b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, query, filter]);

  function openNew() { setEditing(null); setForm(emptyForm); setModal(true); }
  function openEdit(task: Task) { setEditing(task.id); setForm({title:task.title,description:task.description,startDate:task.startDate,dueDate:task.dueDate,priority:task.priority,status:task.status,progress:task.progress,notes:task.notes}); setModal(true); setMenu(null); }
  function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const status = form.progress === 100 ? "Completed" : form.progress > 0 && form.status === "Not started" ? "In progress" : form.status;
    if (editing) setTasks(prev => prev.map(t => t.id === editing ? {...t,...form,status,updatedAt:now} : t));
    else setTasks(prev => [{...form,status,id:crypto.randomUUID(),createdAt:now,updatedAt:now},...prev]);
    setModal(false);
  }
  function removeTask(id: string) { if (confirm("Delete this task? This cannot be undone.")) setTasks(prev=>prev.filter(t=>t.id!==id)); setMenu(null); }
  function updateProgress(task: Task, progress: number) {
    const status: Status = progress === 100 ? "Completed" : progress > 0 ? "In progress" : "Not started";
    setTasks(prev=>prev.map(t=>t.id===task.id?{...t,progress,status,updatedAt:new Date().toISOString()}:t));
  }

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Zap size={19} fill="currentColor"/></div><span>taskflow</span></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav-item active"><LayoutDashboard size={18}/> Overview</button>
      <button className="nav-item" onClick={()=>{setFilter("All tasks");setView("list")}}><ListTodo size={18}/> All tasks <span className="nav-count">{tasks.length}</span></button>
      <button className="nav-item" onClick={()=>setFilter("In progress")}><Activity size={18}/> In progress</button>
      <button className="nav-item" onClick={()=>setFilter("Completed")}><CheckCircle2 size={18}/> Completed</button>
      <div className="side-label side-label-spaced">VIEWS</div>
      <button className={`nav-item ${view==="timeline"?"active":""}`} onClick={()=>setView("timeline")}><CalendarDays size={18}/> Timeline</button>
      <div className="sidebar-bottom"><div className="tip-icon"><Target size={17}/></div><strong>Make progress visible.</strong><p>Small steps add up. Keep your next action clear.</p><div className="tip-line"><span style={{width:`${avg}%`}}/></div><small>{avg}% average progress</small></div>
      <div className="profile"><div className="avatar">Y</div><div><strong>My workspace</strong><small>Personal plan</small></div><MoreHorizontal size={18} className="muted"/></div>
    </aside>

    <section className="main">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>{view==="timeline"?"Timeline":"Overview"}</b></div><div className="top-actions"><span className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"})}</span><button className="primary-btn small" onClick={openNew}><Plus size={16}/> New task</button></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow">YOUR PERSONAL WORKSPACE</div><h1>{view==="timeline"?"Your timeline":"Good work starts with a plan."}</h1><p>{view==="timeline"?"See what’s coming up and keep your deadlines in view.":"Organize your priorities, stay on schedule, and keep moving forward."}</p></div><div className="date-pill"><span className="date-dot"/>{new Date().toLocaleDateString("en",{month:"long",year:"numeric"})}</div></div>

        <div className="stats">
          <div className="stat-card"><div className="stat-top"><span>Total tasks</span><div className="stat-icon violet"><ListTodo size={17}/></div></div><div className="stat-number">{tasks.length}</div><div className="stat-foot">Across your workspace</div></div>
          <div className="stat-card"><div className="stat-top"><span>In progress</span><div className="stat-icon blue"><Activity size={17}/></div></div><div className="stat-number">{inProgress}</div><div className="stat-foot">Currently being worked on</div></div>
          <div className="stat-card"><div className="stat-top"><span>Completed</span><div className="stat-icon green"><CheckCircle2 size={17}/></div></div><div className="stat-number">{completed}</div><div className="stat-foot">{tasks.length?Math.round(completed/tasks.length*100):0}% of all tasks</div></div>
          <div className="stat-card"><div className="stat-top"><span>Overdue</span><div className="stat-icon orange"><Clock3 size={17}/></div></div><div className="stat-number">{overdue}</div><div className="stat-foot">Need your attention</div></div>
        </div>

        <div className="progress-panel"><div className="progress-copy"><div className="progress-icon"><TrendingUp size={18}/></div><div><strong>Overall progress</strong><p>You’re building momentum. Keep it going.</p></div></div><div className="overall-progress"><div className="progress-value">{avg}%</div><div className="big-track"><span style={{width:`${avg}%`}}/></div></div></div>

        <div className="section-head"><div><h2>{view==="timeline"?"Upcoming timeline":"Your tasks"}</h2><p>{view==="timeline"?"A date-based view of your work":"Everything you need to keep moving"}</p></div><div className="view-switch"><button className={view==="list"?"selected":""} onClick={()=>setView("list")}><ListTodo size={15}/> List</button><button className={view==="timeline"?"selected":""} onClick={()=>setView("timeline")}><CalendarDays size={15}/> Timeline</button></div></div>

        <div className="toolbar"><div className="searchbox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks..."/></div><div className="filter-wrap"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All tasks</option><option>Not started</option><option>In progress</option><option>Completed</option><option>Overdue</option></select><ChevronDown size={14}/></div></div>

        {filtered.length===0 ? <div className="empty"><div className="empty-icon"><ListTodo size={24}/></div><h3>No tasks found</h3><p>Try a different search or add a task to get started.</p><button className="primary-btn" onClick={openNew}><Plus size={16}/> Create a task</button></div> :
          view==="list" ? <div className="task-list">{filtered.map(task=><article className="task-row" key={task.id}>
            <button className={`task-check ${task.status==="Completed"?"checked":""}`} aria-label="Mark task complete" onClick={()=>updateProgress(task,task.status==="Completed"?0:100)}>{task.status==="Completed"&&<Check size={14}/>}</button>
            <div className="task-main"><div className="task-title-line"><h3 className={task.status==="Completed"?"done":""}>{task.title}</h3><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description||"No description added."}</p><div className="task-meta"><span><CalendarDays size={13}/>{task.dueDate?`Due ${dateLabel(task.dueDate)}`:"No due date"}</span><span className={`status ${task.status.toLowerCase().replace(" ","-")}`}><i/>{task.status}</span></div></div>
            <div className="task-progress"><div className="progress-label"><span>Progress</span><b>{task.progress}%</b></div><div className="mini-track"><span style={{width:`${task.progress}%`}}/></div></div>
            <div className="task-actions"><button className="icon-btn" onClick={()=>openEdit(task)} aria-label="Edit task"><Pencil size={15}/></button><div className="menu-holder"><button className="icon-btn" onClick={()=>setMenu(menu===task.id?null:task.id)} aria-label="More actions"><MoreHorizontal size={17}/></button>{menu===task.id&&<div className="menu"><button onClick={()=>openEdit(task)}><Pencil size={14}/> Edit task</button><button className="danger" onClick={()=>removeTask(task.id)}><Trash2 size={14}/> Delete task</button></div>}</div></div>
          </article>)}</div> :
          <div className="timeline-list">{filtered.map(task=><article className="timeline-row" key={task.id}><div className="timeline-date"><b>{task.dueDate?new Date(task.dueDate+"T00:00:00").getDate():"—"}</b><span>{task.dueDate?new Date(task.dueDate+"T00:00:00").toLocaleDateString("en",{month:"short"}):"No date"}</span></div><div className="timeline-marker"><i/></div><div className="timeline-card"><div className="task-title-line"><h3>{task.title}</h3><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description||"No description added."}</p><div className="timeline-bottom"><span className={`status ${task.status.toLowerCase().replace(" ","-")}`}><i/>{task.status}</span><div className="timeline-progress"><span>{task.progress}%</span><div className="mini-track"><span style={{width:`${task.progress}%`}}/></div></div><button className="icon-btn" onClick={()=>openEdit(task)}><Pencil size={14}/></button></div></div></article>)}</div>
        }
        <div className="bottom-note"><span><Zap size={14}/> A little progress every day adds up.</span><span>TaskFlow · Your work, in focus</span></div>
      </div>
    </section>

    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={saveTask}>
      <div className="modal-head"><div><div className="eyebrow">{editing?"UPDATE TASK":"NEW TASK"}</div><h2>{editing?"Edit task":"Create a task"}</h2></div><button type="button" className="icon-btn" onClick={()=>setModal(false)}><X size={19}/></button></div>
      <label>Task name <em>*</em><input autoFocus required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Prepare project proposal"/></label>
      <label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What needs to get done?" rows={3}/></label>
      <div className="form-grid"><label>Start date<input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label><label>Due date<input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label></div>
      <div className="form-grid"><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as Priority})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as Status,progress:e.target.value==="Completed"?100:e.target.value==="Not started"?0:Math.max(1,form.progress)})}><option>Not started</option><option>In progress</option><option>Completed</option></select></label></div>
      <label className="range-label">Progress <strong>{form.progress}%</strong><input type="range" min="0" max="100" step="5" value={form.progress} onChange={e=>setForm({...form,progress:Number(e.target.value),status:Number(e.target.value)===100?"Completed":Number(e.target.value)>0?"In progress":"Not started"})}/></label>
      <label>Progress update / notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Add a note about the latest progress..." rows={2}/></label>
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="primary-btn"><Check size={16}/>{editing?"Save changes":"Create task"}</button></div>
    </form></div>}
  </main>;
}
