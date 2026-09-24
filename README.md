# TeamFlow – Team Task Manager

TeamFlow is a full-stack web application for team task management. It includes a Kanban board, notifications, time tracking, file attachments, role-based access control, and a responsive dashboard.

**Live Demo:** For collaborators only.

## Tech Stack

| Tier | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Vite, TanStack Query (React Query v5), React Hook Form, Zod, Recharts, @hello-pangea/dnd |
| **Backend** | Node.js, Express 4, Prisma ORM, JWT, bcryptjs, Express Rate Limit, Multer, Node-cron, Zod |
| **Database** | PostgreSQL |
| **Deployment** | Railway |

## Features

- **Kanban Board:** Drag and drop tasks across columns (`@hello-pangea/dnd`).
- **Dashboard:** At-a-glance statistics, donut charts, bar charts, and upcoming deadlines.
- **Role-Based Access Control (RBAC):** `ADMIN` and `MEMBER` roles with middleware and frontend route guards.
- **Subtasks & Comments:** Nested checklists and threaded comments with `@mentions`.
- **Time Tracking:** Log hours against estimated hours per task.
- **File Attachments:** Upload attachments via `multer`.
- **Activity Log & Audit Trail:** Global and per-task history of state changes.
- **In-App Notifications:** Polling notifications for assignments, mentions, and overdue tasks.
- **Overdue Detection Cron Job:** Runs daily at midnight to flag overdue tasks.
- **Global Search:** Search across tasks, projects, and users.
- **Cross-Project “My Tasks” View:** Centralized view for assigned work.

## Local Development Setup

1. Clone the repository: `git clone <repo-url>`
2. Open a terminal in the repository and enter the backend directory: `cd teamflow/backend`
3. Install backend dependencies: `npm install`
4. Copy `backend/.env.example` to `backend/.env` and update the values.
5. Apply database migrations: `npx prisma migrate dev`
6. Seed local demo data: `node prisma/seed.js`
7. Start the backend development server: `npm run dev`
8. In a new terminal, enter the frontend directory: `cd teamflow/frontend`
9. Install frontend dependencies: `npm install`
10. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to the backend API base URL.
11. Start the frontend development server: `npm run dev`
12. Open `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `JWT_SECRET` | Secret used to sign JWTs. Use a strong value outside local development. |
| `JWT_EXPIRES_IN` | Token expiration, for example `7d`. |
| `FRONTEND_URL` | Allowed CORS origin for the frontend. |
| `NODE_ENV` | Runtime environment, such as `development` or `production`. |
| `MAX_FILE_SIZE_MB` | Maximum upload size in megabytes. |
| `UPLOAD_DIR` | Local directory for uploaded files. |
| `CLOUDINARY_URL` | Optional Cloudinary URI for cloud uploads. |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL. |

Do not commit `.env` files, JWT secrets, database credentials, or cloud-provider credentials.

## Database Seeding

The seed script creates local demo users, projects, memberships, labels, tasks, comments, and notifications.

Run it from the `backend` directory:

```bash
node prisma/seed.js
```

User, project, membership, and label records use `upsert`, but task, comment, and notification records are created as new demo rows each time. Run the seed against a disposable local database or reset the database first if you need a clean dataset.

## Railway Deployment Guide

1. Push the repository to GitHub.
2. In [Railway](https://railway.app/), create a project and deploy from the GitHub repository.
3. Add a PostgreSQL service and connect it to the backend service.
4. Configure backend variables:
   - `DATABASE_URL`: injected by the Railway PostgreSQL service.
   - `JWT_SECRET`: a strong random secret.
   - `FRONTEND_URL`: the deployed frontend URL.
5. Configure the frontend variable:
   - `VITE_API_URL`: `https://<backend-public-domain>.up.railway.app/api/v1`
6. Confirm that the backend CORS origin matches the deployed frontend URL.
7. Use the repository’s Railway configuration to build the frontend and run the backend startup process.

## REST API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login and receive a JWT. |
| POST | `/api/v1/auth/register` | Public | Register a new user. |
| GET | `/api/v1/auth/me` | Protected | Get the current logged-in user. |
| GET | `/api/v1/projects` | Protected | List accessible projects. |
| POST | `/api/v1/projects` | ADMIN | Create a project. |
| GET | `/api/v1/projects/:id/tasks` | Protected | List tasks for a project. |
| POST | `/api/v1/projects/:id/tasks` | Protected | Create a task in a project. |
| PATCH | `/api/v1/projects/:id/tasks/reorder` | Protected | Bulk-update task positions. |
| GET | `/api/v1/dashboard` | Protected | Return aggregated dashboard statistics. |
| GET | `/api/v1/notifications` | Protected | Return user notifications. |
| GET | `/api/v1/search` | Protected | Search across supported entities. |

## Role Permissions

| Action | ADMIN | MEMBER |
|---|---|---|
| Create/Delete Projects | ✅ | ❌ |
| Manage Project Members | ✅ | ❌ |
| View Assigned Projects | ✅ | ✅ |
| Create Tasks | ✅ | ✅ |
| Edit Task Status | ✅ | ✅ (if assigned) |
| Change Global Roles | ✅ | ❌ |
| Manage Users Table | ✅ | ❌ |

## Demo Access

Demo account details are intentionally not published in this README. Use the credentials configured by the repository owner or create a local account through the registration flow.

## Known Limitations / Future Improvements

- Implement email notifications using SendGrid or AWS SES.
- Add real-time WebSockets (Socket.io) instead of React Query polling for notifications.
- Implement a rich-text editor for task descriptions instead of the current Markdown toggle.
- Provide user-specific theme customization with a light/dark mode toggle.
