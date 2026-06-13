const STORAGE_KEY = "taskpulse-state-v1";

const today = new Date();
const toISODate = (date) => date.toISOString().slice(0, 10);
const addDays = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

const seedState = {
  activeView: "home",
  activeFilter: "all",
  selectedTaskId: "task-1",
  users: ["Maya Chen", "Alonso Ruiz", "Fernando Silva", "Jordan Lee"],
  projects: ["Operations", "Finance", "Client Success", "Compliance"],
  notificationPrefs: {
    high: "Push and email",
    normal: "Push only",
    low: "Daily digest",
    quietHours: "7:00 PM - 7:00 AM",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Local"
  },
  tasks: [
    {
      id: "task-1",
      title: "Submit weekly operations report",
      description: "Prepare the Friday summary and send it to the leadership group.",
      owner: "Maya Chen",
      project: "Operations",
      priority: "High",
      status: "In progress",
      dueDate: addDays(0),
      dueTime: "16:00",
      tags: ["weekly", "report"],
      reminder: "Push 24 hours before, push 1 hour before, email at due time",
      acknowledged: true,
      snoozes: 1,
      escalation: "None",
      evidence: "Final report link required.",
      createdAt: addDays(-3),
      events: [
        event("Generated", "Push reminder created"),
        event("Delivered", "Push delivered to web"),
        event("Acknowledged", "Maya acknowledged reminder")
      ]
    },
    {
      id: "task-2",
      title: "Follow up with Fernando on audit checklist",
      description: "Confirm missing checklist evidence before the audit window closes.",
      owner: "Alonso Ruiz",
      project: "Compliance",
      priority: "Emergency",
      status: "Overdue",
      dueDate: addDays(-1),
      dueTime: "11:30",
      tags: ["audit", "follow-up"],
      reminder: "Repeated until acknowledged",
      acknowledged: false,
      snoozes: 3,
      escalation: "Manager notified",
      evidence: "Checklist and approval note required.",
      createdAt: addDays(-5),
      events: [
        event("Generated", "Push and email reminders created"),
        event("Failed", "Push delivery failed on mobile"),
        event("Sent", "Fallback email sent"),
        event("Escalated", "Manager notified after ignored reminder")
      ]
    },
    {
      id: "task-3",
      title: "Schedule client audit kickoff",
      description: "Find a shared 45 minute block before Friday and reserve it.",
      owner: "Jordan Lee",
      project: "Client Success",
      priority: "Normal",
      status: "Waiting",
      dueDate: addDays(2),
      dueTime: "09:00",
      tags: ["calendar", "client"],
      reminder: "Push 1 hour before, email at due time",
      acknowledged: false,
      snoozes: 0,
      escalation: "Notify backup if late by 1 day",
      evidence: "Calendar invite required.",
      createdAt: addDays(-1),
      events: [event("Generated", "Reminder plan scheduled")]
    },
    {
      id: "task-4",
      title: "Attach inspection photos",
      description: "Upload proof of work for the site inspection before completion.",
      owner: "Fernando Silva",
      project: "Operations",
      priority: "High",
      status: "Blocked",
      dueDate: addDays(1),
      dueTime: "14:30",
      tags: ["proof", "field"],
      reminder: "Repeated until completed",
      acknowledged: true,
      snoozes: 2,
      escalation: "Backup assignee after 2 days",
      evidence: "Inspection notes and photos required.",
      createdAt: addDays(-2),
      events: [
        event("Delivered", "Email reminder delivered"),
        event("Opened", "Reminder opened"),
        event("Action taken", "Task marked blocked")
      ]
    }
  ]
};

let state = loadState();

const els = {
  viewTitle: document.querySelector("#viewTitle"),
  viewContext: document.querySelector("#viewContext"),
  taskListTitle: document.querySelector("#taskListTitle"),
  taskList: document.querySelector("#taskList"),
  taskTemplate: document.querySelector("#taskTemplate"),
  taskDialog: document.querySelector("#taskDialog"),
  taskForm: document.querySelector("#taskForm"),
  quickAddForm: document.querySelector("#quickAddForm"),
  quickInput: document.querySelector("#quickInput"),
  taskDetail: document.querySelector("#taskDetail"),
  emptyDetail: document.querySelector("#emptyDetail"),
  metricOpen: document.querySelector("#metricOpen"),
  metricToday: document.querySelector("#metricToday"),
  metricOverdue: document.querySelector("#metricOverdue"),
  metricAck: document.querySelector("#metricAck"),
  installButton: document.querySelector("#installButton")
};

let deferredInstallPrompt = null;

function event(status, message) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `event-${Date.now()}-${Math.random()}`,
    status,
    message,
    at: new Date().toISOString()
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedState);
  try {
    return { ...structuredClone(seedState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDate(dateString, timeString = "") {
  if (!dateString) return "No due date";
  const date = new Date(`${dateString}T${timeString || "12:00"}`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: timeString ? "numeric" : undefined,
    minute: timeString ? "2-digit" : undefined
  }).format(date);
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "Completed" || task.status === "Canceled") return false;
  const due = new Date(`${task.dueDate}T${task.dueTime || "23:59"}`);
  return due < new Date();
}

function isToday(task) {
  return task.dueDate === toISODate(today);
}

function sortBySmartRank(tasks) {
  const priorityWeight = { Emergency: 0, High: 1, Normal: 2, Low: 3 };
  return [...tasks].sort((a, b) => {
    const aOver = isOverdue(a) ? -10 : 0;
    const bOver = isOverdue(b) ? -10 : 0;
    const aScore = aOver + (priorityWeight[a.priority] ?? 2) + a.snoozes * 0.25;
    const bScore = bOver + (priorityWeight[b.priority] ?? 2) + b.snoozes * 0.25;
    if (aScore !== bScore) return aScore - bScore;
    return `${a.dueDate || "9999"}${a.dueTime || "99"}`.localeCompare(
      `${b.dueDate || "9999"}${b.dueTime || "99"}`
    );
  });
}

function tasksForView() {
  let tasks = state.tasks.filter((task) => task.status !== "Canceled");
  const view = state.activeView;

  if (view === "today" || view === "home") tasks = tasks.filter((task) => isToday(task) || isOverdue(task));
  if (view === "upcoming") tasks = tasks.filter((task) => task.dueDate && task.dueDate > toISODate(today));
  if (view === "overdue") tasks = tasks.filter(isOverdue);
  if (view === "calendar") tasks = tasks.filter((task) => task.dueDate);
  if (view === "projects") tasks = tasks.filter((task) => task.project);
  if (view === "notifications") tasks = tasks.filter((task) => task.events.length || !task.acknowledged);
  if (view === "reports") tasks = state.tasks;
  if (view === "settings") tasks = state.tasks.filter((task) => task.priority === "Emergency" || task.priority === "High");

  if (state.activeFilter === "high") tasks = tasks.filter((task) => ["High", "Emergency"].includes(task.priority));
  if (state.activeFilter === "blocked") tasks = tasks.filter((task) => task.status === "Blocked");
  if (state.activeFilter === "unacknowledged") tasks = tasks.filter((task) => !task.acknowledged);

  return sortBySmartRank(tasks);
}

function render() {
  renderNav();
  renderMetrics();
  renderTasks();
  renderDetail();
  saveState();
}

function renderNav() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.activeView);
  });
  document.querySelectorAll(".chip").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.activeFilter);
  });

  const titles = {
    home: ["Home", "Actionable work", "Smart Today"],
    today: ["Today", "Due now", "Today"],
    upcoming: ["Upcoming", "Scheduled work", "Upcoming"],
    overdue: ["Overdue", "Needs attention", "Overdue"],
    calendar: ["Calendar", "Time-blocked tasks", "Calendar"],
    projects: ["Projects", "Grouped by project", "Projects"],
    notifications: ["Notifications", "Delivery and response status", "Notification Log"],
    reports: ["Reports", "Performance indicators", "Reports"],
    settings: ["Settings", "Priority notification policies", "High Priority Rules"]
  };
  const [viewTitle, context, listTitle] = titles[state.activeView];
  els.viewTitle.textContent = viewTitle;
  els.viewContext.textContent = context;
  els.taskListTitle.textContent = listTitle;
}

function renderMetrics() {
  const activeTasks = state.tasks.filter((task) => !["Completed", "Canceled"].includes(task.status));
  const ackable = state.tasks.filter((task) => task.events.length);
  const acknowledged = ackable.filter((task) => task.acknowledged).length;
  els.metricOpen.textContent = activeTasks.length;
  els.metricToday.textContent = activeTasks.filter(isToday).length;
  els.metricOverdue.textContent = activeTasks.filter(isOverdue).length;
  els.metricAck.textContent = `${Math.round((acknowledged / Math.max(ackable.length, 1)) * 100)}%`;
}

function renderTasks() {
  const tasks = tasksForView();
  els.taskList.replaceChildren();

  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-list";
    empty.textContent = "No tasks match this view.";
    els.taskList.append(empty);
    return;
  }

  tasks.forEach((task) => {
    const node = els.taskTemplate.content.firstElementChild.cloneNode(true);
    node.classList.toggle("selected", task.id === state.selectedTaskId);
    node.querySelector(".task-title").textContent = task.title;
    node.querySelector(".task-meta").textContent = `${task.owner} - ${task.project} - ${formatDate(task.dueDate, task.dueTime)}`;

    const dot = node.querySelector(".status-dot");
    dot.classList.toggle("overdue", isOverdue(task));
    dot.classList.toggle("blocked", task.status === "Blocked");

    const badges = node.querySelector(".task-badges");
    badges.append(badge(task.priority, task.priority.toLowerCase()));
    badges.append(badge(task.status, task.status.toLowerCase().replace(/\s/g, "-")));
    if (isOverdue(task)) badges.append(badge("Overdue", "overdue"));
    if (task.acknowledged) badges.append(badge("Ack", "ack"));
    if (!task.acknowledged) badges.append(badge("Unack", "overdue"));

    node.querySelector(".task-main").addEventListener("click", () => {
      state.selectedTaskId = task.id;
      render();
    });

    node.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => updateTaskAction(task.id, button.dataset.action));
    });

    els.taskList.append(node);
  });
}

function badge(text, className) {
  const element = document.createElement("span");
  element.className = `badge ${className}`;
  element.textContent = text;
  return element;
}

function renderDetail() {
  const task = state.tasks.find((item) => item.id === state.selectedTaskId);
  els.emptyDetail.classList.toggle("hidden", Boolean(task));
  els.taskDetail.classList.toggle("hidden", !task);
  if (!task) return;

  els.taskDetail.innerHTML = `
    <div class="detail-header">
      <p class="eyebrow">${task.project}</p>
      <h2>${escapeHtml(task.title)}</h2>
      <p>${escapeHtml(task.description || "No description")}</p>
    </div>
    <div class="detail-grid">
      ${detailField("Owner", task.owner)}
      ${detailField("Status", isOverdue(task) ? "Overdue" : task.status)}
      ${detailField("Priority", task.priority)}
      ${detailField("Due", formatDate(task.dueDate, task.dueTime))}
      ${detailField("Reminder", task.reminder)}
      ${detailField("Escalation", task.escalation)}
      ${detailField("Snoozes", `${task.snoozes}`)}
      ${detailField("Acknowledged", task.acknowledged ? "Yes" : "No")}
    </div>
    <section>
      <p class="eyebrow">Completion Requirements</p>
      <p>${escapeHtml(task.evidence || "No evidence required.")}</p>
    </section>
    <section>
      <p class="eyebrow">Notification Events</p>
      <div class="event-list">
        ${task.events.map(renderEvent).join("")}
      </div>
    </section>
    <button class="secondary-button" id="editSelectedTask" type="button">Edit Task</button>
  `;

  document.querySelector("#editSelectedTask").addEventListener("click", () => openTaskDialog(task));
}

function detailField(label, value) {
  return `<div class="detail-field"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderEvent(item) {
  return `
    <div class="event-item">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.message)}</span>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateTaskAction(taskId, action) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (action === "ack") {
    task.acknowledged = true;
    task.events.unshift(event("Acknowledged", `${task.owner} acknowledged the reminder`));
  }
  if (action === "snooze") {
    task.snoozes += 1;
    task.dueDate = addDays(1);
    task.dueTime = task.dueTime || "09:00";
    task.events.unshift(event("Action taken", "Task snoozed until tomorrow"));
  }
  if (action === "complete") {
    task.status = "Completed";
    task.acknowledged = true;
    task.events.unshift(event("Action taken", "Task completed from the task list"));
  }

  state.selectedTaskId = taskId;
  render();
}

function parseNaturalLanguage(input) {
  const now = new Date();
  let dueDate = "";
  let dueTime = "";
  let priority = "Normal";
  let title = input.trim();
  const lower = title.toLowerCase();

  if (lower.includes("tomorrow")) {
    dueDate = addDays(1);
    title = title.replace(/tomorrow/gi, "").trim();
  } else if (lower.includes("today")) {
    dueDate = toISODate(now);
    title = title.replace(/today/gi, "").trim();
  } else if (lower.includes("next monday")) {
    dueDate = nextWeekday(1);
    title = title.replace(/next monday/gi, "").trim();
  } else if (lower.includes("friday")) {
    dueDate = nextWeekday(5);
  }

  const timeMatch = title.match(/\b(at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    let hour = Number(timeMatch[2]);
    const minute = timeMatch[3] || "00";
    const meridiem = timeMatch[4].toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    dueTime = `${String(hour).padStart(2, "0")}:${minute}`;
    title = title.replace(timeMatch[0], "").trim();
  }

  if (lower.includes("emergency")) priority = "Emergency";
  if (lower.includes("high priority")) priority = "High";
  if (lower.includes("low priority")) priority = "Low";
  title = title.replace(/high priority|low priority|emergency/gi, "").trim();

  const tags = [...title.matchAll(/#(\w+)/g)].map((match) => match[1]);
  title = title.replace(/#\w+/g, "").replace(/\s+/g, " ").trim();

  return { title: title || input.trim(), dueDate, dueTime, priority, tags };
}

function nextWeekday(day) {
  const date = new Date(today);
  const distance = (day + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + distance);
  return toISODate(date);
}

function createTaskFromQuickAdd(input) {
  const parsed = parseNaturalLanguage(input);
  const task = {
    id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
    title: parsed.title,
    description: "Captured from quick add.",
    owner: state.users[0],
    project: state.projects[0],
    priority: parsed.priority,
    status: "Not started",
    dueDate: parsed.dueDate,
    dueTime: parsed.dueTime,
    tags: parsed.tags,
    reminder: "Push 1 hour before, email at due time",
    acknowledged: false,
    snoozes: 0,
    escalation: parsed.priority === "Emergency" ? "Notify manager if unacknowledged after 30 minutes" : "None",
    evidence: "",
    createdAt: toISODate(today),
    events: [event("Generated", "Task and reminder plan created from natural-language input")]
  };
  state.tasks.unshift(task);
  state.selectedTaskId = task.id;
  state.activeView = "home";
}

function openTaskDialog(task = null) {
  fillSelect("taskOwner", state.users);
  fillSelect("taskProject", state.projects);
  document.querySelector("#dialogTitle").textContent = task ? "Edit Task" : "Create Task";
  els.taskForm.dataset.editingId = task?.id || "";
  els.taskForm.title.value = task?.title || "";
  els.taskForm.owner.value = task?.owner || state.users[0];
  els.taskForm.project.value = task?.project || state.projects[0];
  els.taskForm.priority.value = task?.priority || "Normal";
  els.taskForm.dueDate.value = task?.dueDate || "";
  els.taskForm.dueTime.value = task?.dueTime || "";
  els.taskForm.status.value = task?.status === "Overdue" ? "Not started" : task?.status || "Not started";
  els.taskForm.reminder.value = task?.reminder || "Push 1 hour before, email at due time";
  els.taskForm.description.value = task?.description || "";
  els.taskForm.evidence.value = task?.evidence || "";
  els.taskDialog.showModal();
}

function fillSelect(id, values) {
  const select = document.querySelector(`#${id}`);
  select.replaceChildren(...values.map((value) => new Option(value, value)));
}

function handleTaskFormSubmit(event) {
  event.preventDefault();
  const data = new FormData(els.taskForm);
  const editingId = els.taskForm.dataset.editingId;
  const existing = state.tasks.find((task) => task.id === editingId);
  const values = Object.fromEntries(data.entries());

  if (existing) {
    Object.assign(existing, values);
    existing.events.unshift(eventFactory("Action taken", "Task details updated"));
    state.selectedTaskId = existing.id;
  } else {
    const task = {
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      ...values,
      tags: [],
      acknowledged: false,
      snoozes: 0,
      escalation: values.priority === "Emergency" ? "Notify manager if unacknowledged after 30 minutes" : "None",
      createdAt: toISODate(today),
      events: [eventFactory("Generated", "Task created with reminder plan")]
    };
    state.tasks.unshift(task);
    state.selectedTaskId = task.id;
  }

  els.taskDialog.close();
  render();
}

function eventFactory(status, message) {
  return event(status, message);
}

function simulateReminder() {
  const openTasks = state.tasks.filter((task) => !["Completed", "Canceled"].includes(task.status));
  if (!openTasks.length) return;
  const task = openTasks[Math.floor(Math.random() * openTasks.length)];
  const statuses = ["Generated", "Sent", "Delivered", "Opened", "Acknowledged", "Failed"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  task.events.unshift(event(status, `${status} reminder event recorded for ${task.owner}`));
  if (status === "Acknowledged") task.acknowledged = true;
  if (status === "Failed") task.escalation = "Fallback email queued";
  state.selectedTaskId = task.id;
  state.activeView = "notifications";
  render();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    render();
  });
});

document.querySelectorAll(".chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeFilter = button.dataset.filter;
    render();
  });
});

document.querySelector("#quickAddButton").addEventListener("click", () => openTaskDialog());
document.querySelector("#closeDialogButton").addEventListener("click", () => els.taskDialog.close());
document.querySelector("#cancelDialogButton").addEventListener("click", () => els.taskDialog.close());
document.querySelector("#simulateReminderButton").addEventListener("click", simulateReminder);

if (els.installButton) {
  els.installButton.addEventListener("click", installApp);
}

els.quickAddForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createTaskFromQuickAdd(els.quickInput.value);
  els.quickInput.value = "";
  render();
});

els.taskForm.addEventListener("submit", handleTaskFormSubmit);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (els.installButton) {
    els.installButton.classList.remove("hidden");
    els.installButton.textContent = "Install App";
  }
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (els.installButton) {
    els.installButton.classList.add("hidden");
  }
});

function installApp() {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

  if (isStandalone) {
    els.installButton.textContent = "Installed";
    return;
  }

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => {
      deferredInstallPrompt = null;
    });
    return;
  }

  els.installButton.classList.remove("hidden");
  els.installButton.textContent = isIos ? "Share > Add to Home Screen" : "Use browser install menu";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      if (els.installButton) {
        els.installButton.classList.remove("hidden");
        els.installButton.textContent = "Open from browser menu";
      }
    });
  });
}

const params = new URLSearchParams(window.location.search);
if (params.get("view")) {
  state.activeView = params.get("view");
}
if (params.get("action") === "new-task") {
  window.addEventListener("load", () => openTaskDialog());
}

render();
