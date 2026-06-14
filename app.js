const STORAGE_KEY = "taskpulse-state-v1";

const today = new Date();
const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const addDays = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

const seedState = {
  activeView: "home",
  activeFilter: "all",
  selectedTaskId: "task-1",
  selectedCalendarDate: toISODate(today),
  calendarMonth: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)),
  searchQuery: "",
  statusFilter: "all",
  sortMode: "smart",
  lastDeletedTask: null,
  profile: {
    name: "Local Profile",
    email: "",
    deviceId: `device-${Math.random().toString(36).slice(2, 10)}`,
    lastBackupAt: "",
    lastImportedAt: "",
    lastSavedAt: ""
  },
  reminderRuntime: {
    enabled: false,
    lastCheckedAt: "",
    deliveredReminderIds: []
  },
  preferences: {
    themeMode: "system",
    colorScheme: "maroon"
  },
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
  installButton: document.querySelector("#installButton"),
  calendarPanel: document.querySelector("#calendarPanel"),
  calendarGrid: document.querySelector("#calendarGrid"),
  calendarMonthLabel: document.querySelector("#calendarMonthLabel"),
  previousMonthButton: document.querySelector("#previousMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  deleteTaskButton: document.querySelector("#deleteTaskButton"),
  taskSearch: document.querySelector("#taskSearch"),
  statusFilter: document.querySelector("#statusFilter"),
  sortMode: document.querySelector("#sortMode"),
  jumpDate: document.querySelector("#jumpDate"),
  addForDateButton: document.querySelector("#addForDateButton"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  focusRecommendation: document.querySelector("#focusRecommendation"),
  planTodayButton: document.querySelector("#planTodayButton"),
  toast: document.querySelector("#toast"),
  toastMessage: document.querySelector("#toastMessage"),
  toastUndoButton: document.querySelector("#toastUndoButton"),
  profileName: document.querySelector("#profileName"),
  profileMeta: document.querySelector("#profileMeta"),
  notificationStatus: document.querySelector("#notificationStatus"),
  nextReminder: document.querySelector("#nextReminder"),
  backupStatus: document.querySelector("#backupStatus"),
  syncStatus: document.querySelector("#syncStatus"),
  enableNotificationsButton: document.querySelector("#enableNotificationsButton"),
  exportDataButton: document.querySelector("#exportDataButton"),
  importDataButton: document.querySelector("#importDataButton"),
  importDataInput: document.querySelector("#importDataInput"),
  settingsPanel: document.querySelector("#settingsPanel"),
  profileSettingsForm: document.querySelector("#profileSettingsForm"),
  profileNameInput: document.querySelector("#profileNameInput"),
  profileEmailInput: document.querySelector("#profileEmailInput"),
  reminderSettingsForm: document.querySelector("#reminderSettingsForm"),
  prefHigh: document.querySelector("#prefHigh"),
  prefNormal: document.querySelector("#prefNormal"),
  prefLow: document.querySelector("#prefLow"),
  prefQuietHours: document.querySelector("#prefQuietHours")
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
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(seedState),
      ...parsed,
      profile: { ...structuredClone(seedState.profile), ...(parsed.profile || {}) },
      reminderRuntime: {
        ...structuredClone(seedState.reminderRuntime),
        ...(parsed.reminderRuntime || {})
      },
      preferences: { ...structuredClone(seedState.preferences), ...(parsed.preferences || {}) },
      notificationPrefs: {
        ...structuredClone(seedState.notificationPrefs),
        ...(parsed.notificationPrefs || {})
      }
    };
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  state.profile.lastSavedAt = new Date().toISOString();
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
  if (view === "calendar") tasks = tasks.filter((task) => task.dueDate === state.selectedCalendarDate);
  if (view === "projects") tasks = tasks.filter((task) => task.project);
  if (view === "notifications") tasks = tasks.filter((task) => task.events.length || !task.acknowledged);
  if (view === "reports") tasks = state.tasks;
  if (view === "settings") tasks = state.tasks.filter((task) => task.priority === "Emergency" || task.priority === "High");

  if (state.activeFilter === "high") tasks = tasks.filter((task) => ["High", "Emergency"].includes(task.priority));
  if (state.activeFilter === "blocked") tasks = tasks.filter((task) => task.status === "Blocked");
  if (state.activeFilter === "unacknowledged") tasks = tasks.filter((task) => !task.acknowledged);
  if (state.statusFilter && state.statusFilter !== "all") {
    tasks = tasks.filter((task) => {
      if (state.statusFilter === "Overdue") return isOverdue(task);
      return task.status === state.statusFilter;
    });
  }
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    tasks = tasks.filter((task) =>
      [task.title, task.description, task.owner, task.project, task.priority, task.status, ...(task.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  return sortTasks(tasks);
}

function render() {
  applyTheme();
  renderNav();
  renderControls();
  renderMetrics();
  renderFocusRecommendation();
  renderMobileReadiness();
  renderSettings();
  renderCalendar();
  renderTasks();
  renderDetail();
  saveState();
}

function sortTasks(tasks) {
  if (state.sortMode === "due") {
    return [...tasks].sort((a, b) =>
      `${a.dueDate || "9999-99-99"}${a.dueTime || "99:99"}`.localeCompare(
        `${b.dueDate || "9999-99-99"}${b.dueTime || "99:99"}`
      )
    );
  }
  if (state.sortMode === "priority") {
    const priorityWeight = { Emergency: 0, High: 1, Normal: 2, Low: 3 };
    return [...tasks].sort((a, b) => (priorityWeight[a.priority] ?? 4) - (priorityWeight[b.priority] ?? 4));
  }
  if (state.sortMode === "owner") {
    return [...tasks].sort((a, b) => a.owner.localeCompare(b.owner));
  }
  return sortBySmartRank(tasks);
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
    calendar: ["Calendar", "Tasks due on selected date", `Due ${formatDate(state.selectedCalendarDate)}`],
    projects: ["Projects", "Grouped by project", "Projects"],
    notifications: ["Notifications", "Delivery and response status", "Notification Log"],
    reports: ["Reports", "Performance indicators", "Reports"],
    settings: ["Settings", "Priority notification policies", "High Priority Rules"]
  };
  const [viewTitle, context, listTitle] = titles[state.activeView];
  els.viewTitle.textContent = viewTitle;
  els.viewContext.textContent = context;
  els.taskListTitle.textContent = listTitle;
  els.calendarPanel.classList.toggle("hidden", state.activeView !== "calendar");
  if (els.settingsPanel) {
    els.settingsPanel.classList.toggle("hidden", state.activeView !== "settings");
  }
}

function renderControls() {
  els.taskSearch.value = state.searchQuery || "";
  els.statusFilter.value = state.statusFilter || "all";
  els.sortMode.value = state.sortMode || "smart";
  els.jumpDate.value = state.selectedCalendarDate || toISODate(today);
  if (els.selectedDateLabel) {
    els.selectedDateLabel.textContent = `Selected: ${formatDate(state.selectedCalendarDate)}`;
  }
}

function renderFocusRecommendation() {
  const openTasks = state.tasks.filter((task) => !["Completed", "Canceled"].includes(task.status));
  const overdue = openTasks.filter(isOverdue);
  const unacknowledged = openTasks.filter((task) => !task.acknowledged);
  const blocked = openTasks.filter((task) => task.status === "Blocked");
  const dueToday = openTasks.filter(isToday);

  if (overdue.length) {
    els.focusRecommendation.textContent = `${overdue.length} overdue task${overdue.length === 1 ? "" : "s"} need attention before new work.`;
    return;
  }
  if (blocked.length) {
    els.focusRecommendation.textContent = `${blocked.length} blocked task${blocked.length === 1 ? "" : "s"} may hold up the schedule.`;
    return;
  }
  if (unacknowledged.length) {
    els.focusRecommendation.textContent = `${unacknowledged.length} reminder${unacknowledged.length === 1 ? "" : "s"} still need acknowledgment.`;
    return;
  }
  els.focusRecommendation.textContent = dueToday.length
    ? `${dueToday.length} task${dueToday.length === 1 ? "" : "s"} due today.`
    : "No urgent work is due today. Plan the next important task.";
}

function renderMobileReadiness() {
  if (!els.profileName) return;

  const notificationPermission = getNotificationPermission();
  const nextTask = getNextReminderTask();
  const lastBackup = state.profile.lastBackupAt ? formatDateTime(state.profile.lastBackupAt) : "Not exported";
  const lastSaved = state.profile.lastSavedAt ? formatDateTime(state.profile.lastSavedAt) : "Local changes saved";

  els.profileName.textContent = state.profile.name || "Local Profile";
  els.profileMeta.textContent = state.profile.email || `Device ${state.profile.deviceId}`;
  els.notificationStatus.textContent = notificationPermission === "granted" ? "Enabled" : "Not enabled";
  els.nextReminder.textContent = nextTask
    ? `${nextTask.title} - ${formatDate(nextTask.dueDate, nextTask.dueTime)}`
    : "No upcoming reminders";
  els.backupStatus.textContent = lastBackup;
  els.syncStatus.textContent = state.profile.lastImportedAt
    ? `Imported ${formatDateTime(state.profile.lastImportedAt)}`
    : `Saved ${lastSaved}`;

  if (els.enableNotificationsButton) {
    els.enableNotificationsButton.textContent =
      notificationPermission === "granted" ? "Reminders Enabled" : "Enable Reminders";
  }
}

function renderSettings() {
  if (!els.settingsPanel) return;

  els.profileNameInput.value = state.profile.name || "";
  els.profileEmailInput.value = state.profile.email || "";
  els.prefHigh.value = state.notificationPrefs.high || "Push and email";
  els.prefNormal.value = state.notificationPrefs.normal || "Push only";
  els.prefLow.value = state.notificationPrefs.low || "Daily digest";
  els.prefQuietHours.value = state.notificationPrefs.quietHours || "";

  document.querySelectorAll("[name='themeMode']").forEach((input) => {
    input.checked = input.value === (state.preferences.themeMode || "system");
  });
}

function applyTheme() {
  const mode = state.preferences.themeMode || "system";
  const resolvedMode = mode === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : mode;

  document.body.dataset.theme = resolvedMode;
  document.body.dataset.themePreference = mode;
  document.body.dataset.scheme = state.preferences.colorScheme || "maroon";
}

function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function renderCalendar() {
  if (!els.calendarGrid || state.activeView !== "calendar") return;

  const monthDate = parseDateOnly(state.calendarMonth || state.selectedCalendarDate || toISODate(today));
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  const selected = state.selectedCalendarDate || toISODate(today);

  els.calendarMonthLabel.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric"
  }).format(firstDay);
  els.calendarGrid.replaceChildren();

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const dateKey = toISODate(date);
    const dueTasks = state.tasks.filter((task) => task.dueDate === dateKey && task.status !== "Canceled");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.classList.toggle("outside-month", date.getMonth() !== month);
    button.classList.toggle("selected", dateKey === selected);
    button.classList.toggle("has-tasks", dueTasks.length > 0);
    button.setAttribute("aria-label", `${formatDate(dateKey)}: ${dueTasks.length} tasks`);
    button.innerHTML = `
      <span>${date.getDate()}</span>
      <strong>${dueTasks.length ? dueTasks.length : ""}</strong>
    `;
    button.addEventListener("click", () => {
      state.selectedCalendarDate = dateKey;
      state.calendarMonth = toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
      state.selectedTaskId = dueTasks[0]?.id || "";
      render();
    });
    els.calendarGrid.append(button);
  }
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
    empty.innerHTML = `
      <strong>No tasks match this view.</strong>
      <span>Adjust filters or create a task for this date.</span>
    `;
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
    <div class="detail-actions">
      <button class="secondary-button" id="ackSelectedTask" data-detail-action="ack" type="button">Acknowledge</button>
      <button class="secondary-button" id="snoozeSelectedTask" data-detail-action="snooze" type="button">Snooze</button>
      <button class="primary-button" id="completeSelectedTask" data-detail-action="complete" type="button">Complete</button>
      <button class="secondary-button" id="editSelectedTask" data-detail-action="edit" type="button">Edit Task</button>
      <button class="danger-button" id="deleteSelectedTask" data-detail-action="delete" type="button">Delete Task</button>
    </div>
  `;

  els.taskDetail.querySelector("#deleteSelectedTask").addEventListener("click", (event) => {
    event.stopPropagation();
    deleteTask(task.id);
  });
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
  if (action === "delete") {
    deleteTask(taskId);
    return;
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
  els.taskForm.dueDate.value = task?.dueDate || (state.activeView === "calendar" ? state.selectedCalendarDate : "");
  els.taskForm.dueTime.value = task?.dueTime || "";
  els.taskForm.status.value = task?.status === "Overdue" ? "Not started" : task?.status || "Not started";
  els.taskForm.reminder.value = task?.reminder || "Push 1 hour before, email at due time";
  els.taskForm.description.value = task?.description || "";
  els.taskForm.evidence.value = task?.evidence || "";
  els.deleteTaskButton.classList.toggle("hidden", !task);
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

function deleteTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const index = state.tasks.findIndex((item) => item.id === taskId);
  state.lastDeletedTask = { task, index };
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  if (state.selectedTaskId === taskId) {
    const replacement = tasksForView()[0] || state.tasks[0];
    state.selectedTaskId = replacement?.id || "";
  }
  if (els.taskDialog.open) {
    els.taskDialog.close();
  }
  render();
  showToast(`Deleted "${task.title}"`);
}

function showToast(message) {
  els.toastMessage.textContent = message;
  els.toast.classList.remove("hidden");
}

function hideToast() {
  els.toast.classList.add("hidden");
}

function undoDelete() {
  if (!state.lastDeletedTask) return;
  const { task, index } = state.lastDeletedTask;
  state.tasks.splice(Math.max(index, 0), 0, task);
  state.selectedTaskId = task.id;
  state.lastDeletedTask = null;
  hideToast();
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

function getNextReminderTask() {
  const now = new Date();
  return state.tasks
    .filter((task) => !["Completed", "Canceled"].includes(task.status) && task.dueDate)
    .map((task) => ({ task, due: new Date(`${task.dueDate}T${task.dueTime || "09:00"}`) }))
    .filter((item) => item.due >= now)
    .sort((a, b) => a.due - b.due)[0]?.task;
}

function getReminderId(task) {
  return `${task.id}:${task.dueDate}:${task.dueTime || "09:00"}`;
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    showToast("This browser does not support task notifications.");
    return;
  }

  const permission = Notification.permission === "default"
    ? await Notification.requestPermission()
    : Notification.permission;

  state.reminderRuntime.enabled = permission === "granted";
  state.reminderRuntime.lastCheckedAt = new Date().toISOString();
  showToast(permission === "granted" ? "Task reminders enabled." : "Notifications were not enabled.");
  render();
  checkDueReminders();
}

async function sendTaskNotification(task) {
  const options = {
    body: `${task.owner} - ${formatDate(task.dueDate, task.dueTime)}`,
    icon: "./icons/icon.svg",
    badge: "./icons/icon.svg",
    tag: getReminderId(task),
    data: { taskId: task.id }
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (registration?.showNotification) {
      await registration.showNotification(`Task due: ${task.title}`, options);
      return;
    }
  }

  new Notification(`Task due: ${task.title}`, options);
}

function checkDueReminders() {
  if (!state.reminderRuntime.enabled || getNotificationPermission() !== "granted") return;

  const now = new Date();
  const delivered = new Set(state.reminderRuntime.deliveredReminderIds || []);
  const dueTasks = state.tasks.filter((task) => {
    if (!task.dueDate || ["Completed", "Canceled"].includes(task.status)) return false;
    const due = new Date(`${task.dueDate}T${task.dueTime || "09:00"}`);
    return due <= now && !delivered.has(getReminderId(task));
  });

  dueTasks.forEach((task) => {
    const reminderId = getReminderId(task);
    delivered.add(reminderId);
    task.events.unshift(event("Delivered", "Local app notification delivered"));
    sendTaskNotification(task).catch(() => {
      task.events.unshift(event("Failed", "Local notification could not be delivered"));
    });
  });

  state.reminderRuntime.deliveredReminderIds = [...delivered].slice(-200);
  state.reminderRuntime.lastCheckedAt = new Date().toISOString();
  if (dueTasks.length) render();
}

function exportBackup() {
  const exportedAt = new Date().toISOString();
  const payload = {
    app: "TasksReminders",
    version: 2,
    exportedAt,
    state: {
      ...state,
      lastDeletedTask: null,
      profile: {
        ...state.profile,
        lastBackupAt: exportedAt
      }
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `TasksReminders-backup-${toISODate(new Date())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);

  state.profile.lastBackupAt = exportedAt;
  showToast("Backup exported.");
  render();
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const imported = parsed.state || parsed;
      if (!Array.isArray(imported.tasks)) throw new Error("Missing tasks");
      state = {
        ...structuredClone(seedState),
        ...imported,
        profile: {
          ...structuredClone(seedState.profile),
          ...(imported.profile || {}),
          lastImportedAt: new Date().toISOString()
        },
        reminderRuntime: {
          ...structuredClone(seedState.reminderRuntime),
          ...(imported.reminderRuntime || {})
        },
        preferences: {
          ...structuredClone(seedState.preferences),
          ...(imported.preferences || {})
        },
        notificationPrefs: {
          ...structuredClone(seedState.notificationPrefs),
          ...(imported.notificationPrefs || {})
        }
      };
      state.selectedTaskId = state.tasks[0]?.id || "";
      showToast("Backup imported.");
      render();
    } catch {
      showToast("Backup file could not be imported.");
    }
  });
  reader.readAsText(file);
}

function saveProfileSettings(event) {
  event.preventDefault();
  state.profile.name = els.profileNameInput.value.trim() || "Local Profile";
  state.profile.email = els.profileEmailInput.value.trim();
  showToast("Profile settings saved.");
  render();
}

function saveReminderSettings(event) {
  event.preventDefault();
  state.notificationPrefs.high = els.prefHigh.value;
  state.notificationPrefs.normal = els.prefNormal.value;
  state.notificationPrefs.low = els.prefLow.value;
  state.notificationPrefs.quietHours = els.prefQuietHours.value.trim();
  state.notificationPrefs.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  showToast("Reminder rules saved.");
  render();
}

function updateThemeMode(mode) {
  state.preferences.themeMode = mode;
  showToast(`Theme set to ${mode}.`);
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

els.taskDetail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-action]");
  if (!button) return;
  const task = state.tasks.find((item) => item.id === state.selectedTaskId);
  if (!task) return;

  if (button.dataset.detailAction === "edit") {
    openTaskDialog(task);
    return;
  }
  if (button.dataset.detailAction === "delete") {
    deleteTask(task.id);
    return;
  }
  updateTaskAction(task.id, button.dataset.detailAction);
});

document.querySelector("#quickAddButton").addEventListener("click", () => openTaskDialog());
document.querySelector("#closeDialogButton").addEventListener("click", () => els.taskDialog.close());
document.querySelector("#cancelDialogButton").addEventListener("click", () => els.taskDialog.close());
document.querySelector("#simulateReminderButton").addEventListener("click", simulateReminder);
document.querySelector("#previousMonthButton").addEventListener("click", () => changeCalendarMonth(-1));
document.querySelector("#nextMonthButton").addEventListener("click", () => changeCalendarMonth(1));
document.querySelector("#deleteTaskButton").addEventListener("click", () => {
  const editingId = els.taskForm.dataset.editingId;
  if (editingId) deleteTask(editingId);
});
document.querySelector("#addForDateButton").addEventListener("click", () => openTaskDialog());
document.querySelector("#planTodayButton").addEventListener("click", () => {
  state.activeView = "today";
  render();
});
document.querySelector("#toastUndoButton").addEventListener("click", undoDelete);
els.taskSearch.addEventListener("input", () => {
  state.searchQuery = els.taskSearch.value.trim();
  render();
});
els.statusFilter.addEventListener("change", () => {
  state.statusFilter = els.statusFilter.value;
  render();
});
els.sortMode.addEventListener("change", () => {
  state.sortMode = els.sortMode.value;
  render();
});
els.jumpDate.addEventListener("change", () => {
  if (!els.jumpDate.value) return;
  state.selectedCalendarDate = els.jumpDate.value;
  const date = parseDateOnly(els.jumpDate.value);
  state.calendarMonth = toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
  state.activeView = "calendar";
  const dueTasks = state.tasks.filter((task) => task.dueDate === state.selectedCalendarDate);
  state.selectedTaskId = dueTasks[0]?.id || "";
  render();
});

if (els.installButton) {
  els.installButton.addEventListener("click", installApp);
}
if (els.enableNotificationsButton) {
  els.enableNotificationsButton.addEventListener("click", enableNotifications);
}
if (els.exportDataButton) {
  els.exportDataButton.addEventListener("click", exportBackup);
}
if (els.importDataButton && els.importDataInput) {
  els.importDataButton.addEventListener("click", () => els.importDataInput.click());
  els.importDataInput.addEventListener("change", () => {
    importBackup(els.importDataInput.files?.[0]);
    els.importDataInput.value = "";
  });
}
if (els.profileSettingsForm) {
  els.profileSettingsForm.addEventListener("submit", saveProfileSettings);
}
if (els.reminderSettingsForm) {
  els.reminderSettingsForm.addEventListener("submit", saveReminderSettings);
}
document.querySelectorAll("[name='themeMode']").forEach((input) => {
  input.addEventListener("change", () => updateThemeMode(input.value));
});
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if ((state.preferences.themeMode || "system") === "system") render();
});

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

function changeCalendarMonth(offset) {
  const current = parseDateOnly(state.calendarMonth || state.selectedCalendarDate || toISODate(today));
  current.setMonth(current.getMonth() + offset);
  state.calendarMonth = toISODate(new Date(current.getFullYear(), current.getMonth(), 1));
  render();
}

function parseDateOnly(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day || 1);
}

render();
checkDueReminders();
setInterval(checkDueReminders, 60000);
