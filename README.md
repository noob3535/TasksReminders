# Task Tracker and Reminders

A dependency-free responsive web app built from the Word specification in `Task Management Application.docx`.

## What is included

- Quick task capture with simple natural-language parsing.
- Add, edit, and delete tasks.
- Calendar view for selecting a date and reviewing tasks due on that date.
- Search, status filter, and sort controls for faster task review.
- Smart planning recommendation banner.
- Undo support after deleting a task.
- Browser reminder permission and due-task notification checks while the app is open or installed.
- JSON backup export and import for moving or restoring task data.
- Local profile and device status for mobile readiness.
- Settings panel for profile, reminder defaults, and light/dark/system theme mode.
- Maroon, brown, and light-yellow visual theme.
- Refresh App control for clearing old PWA caches after GitHub Pages updates.
- Mobile-installable Progressive Web App metadata.
- Offline app shell caching through a service worker.
- Task views for Home, Today, Upcoming, Overdue, Calendar, Projects, Notifications, Reports, and Settings.
- Task detail panel with owner, priority, due date, reminder plan, snooze count, acknowledgment status, escalation status, completion requirements, and notification history.
- Push/email reminder simulation and notification event logging.
- One-click acknowledge, snooze, and complete actions.
- Basic accountability metrics: open tasks, due today, overdue tasks, and acknowledgment rate.
- Local persistence through `localStorage`.

## Mobile reality check

GitHub Pages can host this app as a PWA, but it cannot run a database, user accounts, or true background push notifications by itself. The app now supports local browser notifications and backup import/export. A future cloud version should add a hosted backend, user login, database sync, and Web Push subscription storage.

## Run

Open `index.html` directly in a browser, or serve the folder locally:

```powershell
node server.js
```

Then visit `http://localhost:4173`.

## Install on mobile

Run the app from the local server, then install it from your mobile browser:

- Android Chrome: open the app URL, tap `Install App` or use the browser menu and choose `Install app`.
- iPhone Safari: open the app URL, tap Share, then choose `Add to Home Screen`.

For install prompts and offline caching, use `http://localhost:4173` while testing on this computer. For installation on a real phone, deploy the folder to an HTTPS host, then open that HTTPS URL on the phone. Browsers generally do not allow service-worker installation from an insecure LAN URL.

GitHub Pages URL:

```text
https://noob3535.github.io/TasksReminders/
```

## Notes

This is an MVP front-end prototype. Production back-end services from the spec, such as authentication, relational persistence, background jobs, email providers, push providers, retry workers, calendar sync, webhooks, and audit logging, are represented in the UI and data model but would need server implementation for deployment.
