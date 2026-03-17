# Railway Backend (MySQL)

## Setup

### 1. Add a MySQL service in Railway
- Go to your Railway project → **New** → **Database** → **MySQL**
- Copy the connection credentials

### 2. Run the schema
- Open **MySQL Workbench**
- Connect using the Railway MySQL credentials (host, port, user, password from Railway dashboard)
- Open `railway/schema.sql` and execute it
- This creates all tables: users, projects, meetings, workshops, workshop_attendance, indicators, sub_activities, indicator_values

### 3. Deploy the backend
- In Railway, add a **New Service** → connect your GitHub repo
- Set the **Root Directory** to `railway/backend`
- Add environment variables:
  - `MYSQL_URL` — from the MySQL service (Railway can auto-inject via `${{MySQL.MYSQL_URL}}`)
  - `JWT_SECRET` — a random secret string for signing tokens
  - `NODE_ENV` — `production`

### 4. Connect the frontend
- In `src/services/api.ts`, set `MOCK_MODE = false` and update `BASE_URL` to your Railway backend URL (e.g., `https://your-backend.up.railway.app`)

## MySQL Workbench Connection
Use the following from Railway's MySQL service variables:
- **Host**: `MYSQLHOST`
- **Port**: `MYSQLPORT`
- **Username**: `MYSQLUSER`
- **Password**: `MYSQLPASSWORD`
- **Database**: `MYSQLDATABASE`

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Login |
| POST | /api/auth/register | No | Register |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/users | Admin | List users |
| PUT | /api/users/:id | Admin | Update user |
| DELETE | /api/users/:id | Admin | Delete user |
| GET | /api/projects | Yes | List projects |
| POST | /api/projects | Yes | Create project |
| PUT | /api/projects/:id | Yes | Update project |
| DELETE | /api/projects/:id | Yes | Delete project |
| GET | /api/meetings | Yes | List meetings |
| POST | /api/meetings | Yes | Create meeting |
| PUT | /api/meetings/:id | Yes | Update meeting |
| DELETE | /api/meetings/:id | Yes | Delete meeting |
| GET | /api/workshops | Yes | List workshops |
| POST | /api/workshops | Yes | Create workshop |
| DELETE | /api/workshops/:id | Yes | Delete workshop |
| POST | /api/workshops/attendance | No | Submit attendance |
| GET | /api/workshops/attendance | Yes | All attendance |
| GET | /api/workshops/:id/attendance | Yes | Workshop attendance |
| GET | /api/indicators | Yes | List indicators |
| POST | /api/indicators | Yes | Create indicator |
| POST | /api/indicators/bulk | Yes | Bulk import |
| PUT | /api/indicators/:id | Yes | Update indicator |
| DELETE | /api/indicators/:id | Yes | Delete indicator |
| GET | /api/sub-activities | Yes | List sub-activities |
| POST | /api/sub-activities | Yes | Create sub-activity |
| DELETE | /api/sub-activities/:id | Yes | Delete sub-activity |
