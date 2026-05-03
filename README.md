# TeamFlow – Team Task Manager

TeamFlow is a complete, production-ready full-stack web application designed for team task management. It features a rich Kanban board, real-time-ish notifications, time tracking, file attachments, role-based access control, and a responsive modern dashboard.

**Live Demo:** http://localhost:5173/

## Tech Stack
| Tier | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Vite, TanStack Query (React Query v5), React Hook Form, Zod, Recharts, @hello-pangea/dnd |
| **Backend** | Node.js, Express 4, Prisma ORM, JWT, Bcryptjs, Express Rate Limit, Multer, Node-cron, Zod |
| **Database** | PostgreSQL |
| **Deployment** | Railway |

## Features
- **Kanban Board:** Drag and drop tasks across columns (`@hello-pangea/dnd`).
- **Dashboard:** At-a-glance statistics, donut charts, bar charts, upcoming deadlines.
- **Role-Based Access Control (RBAC):** `ADMIN` and `MEMBER` roles with strict middleware and frontend route guards.
- **Subtasks & Comments:** Nested checklists, threaded comments with `@mentions`.
- **Time Tracking:** Log hours against estimated hours per task.
- **File Attachments:** Upload attachments via `multer`.
- **Activity Log & Audit Trail:** Global and per-task history of all state changes.
- **In-App Notifications:** Real-time polling notifications for assignments, mentions, and overdue tasks.
- **Overdue Detection Cron Job:** Runs daily at midnight to flag overdue tasks.
- **Global Search:** Search across tasks, projects, and users.
- **Cross-Project "My Tasks" View:** Centralized view for the assigned user.

## Local Development Setup
1. Clone the repository: `git clone <repo-url>`
2. Navigate to the backend directory: `cd teamflow/backend`
3. Install backend dependencies: `npm install`
4. Set up environment variables: copy `backend/.env.example` to `backend/.env` and update values.
5. Apply database migrations and seed: `npx prisma migrate dev && node prisma/seed.js`
6. Start backend development server: `npm run dev`
7. In a new terminal, navigate to the frontend directory: `cd teamflow/frontend`
8. Install frontend dependencies: `npm install`
9. Set up environment variables: copy `frontend/.env.example` to `frontend/.env` and update values.
10. Start frontend development server: `npm run dev`
11. Open your browser to `http://localhost:5173`

## Environment Variables
### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiration (e.g., 7d) |
| `FRONTEND_URL` | Allowed CORS origin (e.g., http://localhost:5173) |
| `NODE_ENV` | Environment (development/production) |
| `MAX_FILE_SIZE_MB` | File upload limit in MB |
| `UPLOAD_DIR` | Directory to save local uploads |
| `CLOUDINARY_URL` | (Optional) Cloudinary URI for cloud uploads |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g., http://localhost:5000/api/v1) |

## Database Seeding
The application provides a seed script to populate the database with initial demo data.
Run `node prisma/seed.js` from the `backend` directory. The seed is idempotent and will upset records safely.

## Railway Deployment Guide
1. Push your code to a GitHub repository.
2. Go to [Railway](https://railway.app/) → **New Project** → **Deploy from GitHub repo** → Select your repository.
3. Click on the project, add a **PostgreSQL** plugin.
4. Go to the **backend** service → Variables:
   - `DATABASE_URL` (Auto-injected by Railway PG plugin)
   - `JWT_SECRET` = `your_secure_random_string`
   - `FRONTEND_URL` = `(Wait to set this until frontend generates a public URL)`
5. Go to the **frontend** service → Variables:
   - `VITE_API_URL` = `https://<backend-public-domain>.up.railway.app/api/v1`
6. Go back to the backend service and update `FRONTEND_URL` with the frontend's public URL.
7. Railway will use the `railway.toml` at the root to orchestrate building the React app and running Prisma migrations before starting the Node server.

## REST API Reference
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login and receive JWT |
| POST | `/api/v1/auth/register` | Public | Register new user |
| GET | `/api/v1/auth/me` | Protected | Get current logged-in user |
| GET | `/api/v1/projects` | Protected | List accessible projects |
| POST | `/api/v1/projects` | ADMIN | Create a new project |
| GET | `/api/v1/projects/:id/tasks` | Member | List tasks for a project |
| POST | `/api/v1/projects/:id/tasks` | Member | Create a task in project |
| PATCH| `/api/v1/projects/:id/tasks/reorder` | Member | Bulk update task positions |
| GET | `/api/v1/dashboard` | Protected | Aggregated dashboard stats |
| GET | `/api/v1/notifications`| Protected | Get user notifications |
| GET | `/api/v1/search` | Protected | Global search across entities |

## Role Permissions
| Action | ADMIN | MEMBER |
|---|---|---|
| Create/Delete Projects | ✅ | ❌ |
| Manage Project Members | ✅ | ❌ |
| View Assigned Projects | ✅ | ✅ |
| Create Tasks | ✅ | ✅ |
| Edit Task Status | ✅ | ✅ (If Assigned) |
| Change Global Roles | ✅ | ❌ |
| Manage Users Table | ✅ | ❌ |

## Demo Credentials
- **Admin User**: `admin@teamflow.com` 
- **Password**: `Admin@1234`

- **Member User**: `member@teamflow.com`
- **Password**: `Member@1234`

- **Member User 1**: `rohit@teamflow.com`
- **Password**: `Rohit@1234`

## Known Limitations / Future Improvements
- Implement email notifications using SendGrid or AWS SES.
- Add real-time WebSockets (Socket.io) instead of React Query polling for notifications.
- Implement an advanced rich-text editor for task descriptions instead of Markdown toggle.
- Provide user-specific theme customization (Light/Dark mode toggle).
