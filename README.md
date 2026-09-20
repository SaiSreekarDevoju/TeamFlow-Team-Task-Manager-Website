# TeamFlow – Team Task Manager

TeamFlow is a full-stack web application for team task management. It features a Kanban board, notifications, time tracking, file attachments, role-based access control, and a responsive dashboard.

**Live Demo:** Available to collaborators only.

## Tech Stack

| Tier | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Vite, TanStack Query (React Query v5), React Hook Form, Zod, Recharts, @hello-pangea/dnd |
| **Backend** | Node.js, Express 4, Prisma ORM, JWT, Bcryptjs, Express Rate Limit, Multer, Node-cron, Zod |
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
- **In-App Notifications:** Polling-based notifications for assignments, mentions, and overdue tasks.
- **Overdue Detection Cron Job:** Runs daily at midnight to flag overdue tasks.
- **Global Search:** Search across tasks, projects, and users.
- **Cross-Project "My Tasks" View:** Centralized view for the assigned user.

## Local Development Setup

1. Clone the repository: `git clone <repo-url>`
2. Navigate to the backend directory: `cd teamflow/backend`
3. Install backend dependencies: `npm install`
4. Set up environment variables: copy `backend/.env.example` to `backend/.env` and update the values.
5. Apply database migrations and seed data: `npx prisma migrate dev && node prisma/seed.js`
6. Start the backend development server: `npm run dev`
7. In a new terminal, navigate to the frontend directory: `cd teamflow/frontend`
8. Install frontend dependencies: `npm install`
9. Set up environment variables: copy `frontend/.env.example` to `frontend/.env` and update the values.
10. Start the frontend development server: `npm run dev`
11. Open `http://localhost:5173` in your browser.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token expiration, for example `7d` |
| `FRONTEND_URL` | Allowed CORS origin |
| `NODE_ENV` | Environment, such as `development` or `production` |
| `MAX_FILE_SIZE_MB` | File upload limit in MB |
| `UPLOAD_DIR` | Directory used for local uploads |
| `CLOUDINARY_URL` | Optional Cloudinary URI for cloud uploads |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

> Do not commit `.env` files or real credentials. Use strong, unique secrets for each environment.

## Database Seeding

The application provides a seed script to populate the database with initial demo data. Run `node prisma/seed.js` from the `backend` directory. The seed is idempotent and updates existing records safely.

## Railway Deployment Guide

1. Push the code to a GitHub repository.
2. In [Railway](https://railway.app/), choose **New Project** → **Deploy from GitHub repo** → select the repository.
3. Add a **PostgreSQL** plugin to the project.
4. In the **backend** service, configure:
   - `DATABASE_URL` (automatically injected by the Railway PostgreSQL plugin)
   - `JWT_SECRET` (set a strong, generated secret)
   - `FRONTEND_URL` (set this to the deployed frontend URL)
5. In the **frontend** service, configure:
   - `VITE_API_URL` = `https://<backend-public-domain>.up.railway.app/api/v1`
6. Confirm the backend `FRONTEND_URL` matches the frontend's public URL.
7. Railway uses the root `railway.toml` to build the React app and run Prisma migrations before starting the Node server.

## REST API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login and receive a JWT |
| POST | `/api/v1/auth/register` | Public | Register a new user |
| GET | `/api/v1/auth/me` | Protected | Get the current logged-in user |
| GET | `/api/v1/projects` | Protected | List accessible projects |
| POST | `/api/v1/projects` | ADMIN | Create a new project |
| GET | `/api/v1/projects/:id/tasks` | MEMBER | List tasks for a project |
| POST | `/api/v1/projects/:id/tasks` | MEMBER | Create a task in a project |
| PATCH | `/api/v1/projects/:id/tasks/reorder` | MEMBER | Bulk update task positions |
| GET | `/api/v1/dashboard` | Protected | Return aggregated dashboard stats |
| GET | `/api/v1/notifications` | Protected | Get user notifications |
| GET | `/api/v1/search` | Protected | Search across entities |

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

## Demo Data

The seed script creates demo users for local development. The credentials are defined in the backend seed/configuration files and should be changed before sharing a deployment. Do not publish real or reusable passwords in this README.

## Known Limitations / Future Improvements

- Implement email notifications using SendGrid or AWS SES.
- Add real-time WebSockets (Socket.io) instead of React Query polling for notifications.
- Implement an advanced rich-text editor for task descriptions instead of a Markdown toggle.
- Provide user-specific theme customization with a light/dark mode toggle.
