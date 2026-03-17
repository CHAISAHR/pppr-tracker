# Railway Backend Setup Guide

## 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"** (or start empty)
3. Add a **PostgreSQL** service: Click **"+ New"** → **"Database"** → **"PostgreSQL"**
4. Add a **Node.js** service for the API

## 2. Set Up the Database

1. Click on the PostgreSQL service in Railway
2. Go to the **"Data"** tab → **"Query"** tab
3. Copy and paste the contents of `railway/schema.sql` and execute it
4. This creates all tables: users, projects, meetings, workshops, workshop_attendance, indicators, sub_activities, indicator_values

## 3. Deploy the Backend API

### Option A: Deploy from this folder
1. Push the `railway/backend/` folder to a GitHub repo
2. Connect it to Railway as a new service
3. Set the environment variables (see below)

### Option B: Deploy manually
1. Create a new service in Railway
2. Upload the backend code
3. Railway auto-detects Node.js and runs `npm start`

## 4. Environment Variables

Set these in your Railway Node.js service → **Variables** tab:

```
DATABASE_URL=<auto-populated if you link the PostgreSQL service>
JWT_SECRET=your-secret-key-here
PORT=3000
```

To link the PostgreSQL service:
- Click on your Node.js service → **Variables** → **"Add Reference"** → Select your PostgreSQL service → `DATABASE_URL`

## 5. Connect Frontend

After deploying, get your Railway backend URL (e.g., `https://your-app.up.railway.app`).

Update `src/services/api.ts`:
```typescript
const BASE_URL = 'https://your-app.up.railway.app/api';
const MOCK_MODE = false;
```

## 6. Deploy Frontend

### Option A: Deploy frontend on Railway too
1. Add another service in Railway for the frontend
2. Set build command: `npm run build`
3. Set start command: `npx serve dist`
4. Add env variable: `VITE_API_URL=https://your-backend.up.railway.app/api`

### Option B: Use Lovable's built-in publishing
1. Click "Publish" in Lovable
2. Update the API URL in `src/services/api.ts` to point to your Railway backend
