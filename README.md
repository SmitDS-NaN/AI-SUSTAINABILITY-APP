# 🌱 EcoLedger — AI-Powered Sustainability Copilot

EcoLedger is a production-grade, full-stack Sustainability Copilot designed for small and mid-sized organizations (factories, campuses, commercial buildings, restaurants). It bridges the gap between raw utility consumption data (electricity, water, fuel, waste) and actionable environmental & financial insights.

---

## 🌟 Key Features

1. **Multi-Org Workspaces & Security**:
   - Secure JWT user authentication with strict organizational data isolation.
   - Production Row Level Security (RLS) PostgreSQL schema.

2. **Deterministic Environmental Math Engine**:
   - Standardized emission calculations (kg CO₂e):
     - **Electricity**: `0.82 kg CO₂e / kWh` (India Grid baseline)
     - **Water**: `0.34 kg CO₂e / kL`
     - **Fuel**: `2.68 kg CO₂e / L` (Diesel/Gasoline)
     - **Waste**: `1.90 kg CO₂e / kg`
   - Statistical Z-Score Anomaly Detector flagging usage spikes (`Z > 1.8` or `>35%` increase over moving average).
   - Dynamic 0–100 Sustainability Scoring system (Grade A+, A, B, C, D).

3. **Gemini AI Model Integration**:
   - Official `@google/genai` SDK integration with strict system prompt & Zod schema validation.
   - **Root Cause Anomaly Explanations**: Explains physical causes (e.g. cooling tower float valve leaks) and immediate corrective actions.
   - **Tailored AI Action Plans**: 5 prioritized initiatives with realistic financial ROI (₹) and CO₂ savings.
   - **"Ask Your Data" AI Chat**: Contextual chat interface powered by real-time organization metrics.
   - **Automated Monthly Reports**: Printable narrative executive reports exportable to PDF.

4. **Modern High-Fidelity UI/UX**:
   - React + Vite + Tailwind CSS + Recharts visualizer.
   - Glassmorphism, tactile dark mode cards, ambient neon glow accents, micro-interactions, responsive design.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `server/` and `client/`:

#### `server/.env`
```env
PORT=5000
DATABASE_URL=postgres://[user]:[password]@db.[supabase-ref].supabase.co:5432/postgres
JWT_SECRET=ecoledger_super_secret_jwt_key_2026_hackathon
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Note**: If `DATABASE_URL` or `GEMINI_API_KEY` are not set initially, EcoLedger runs out-of-the-box with a pre-loaded 12-month sample dataset and data-grounded AI fallback engine!

### 3. Launch Application
To run both backend Express server and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend UI**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📂 Project Structure

```
ecoledger/
├── client/                     # Vite + React Frontend Application
│   ├── src/
│   │   ├── api/                # Axios instance & JWT interceptors
│   │   ├── components/         # Layout, MetricCard, UsageChart, AnomalyBanner, etc.
│   │   ├── context/            # AuthContext provider
│   │   ├── pages/              # Dashboard, Usage, Recommendations, Chat, Goals, Reports
│   │   ├── utils/              # Formatters (INR ₹, CO2 units, sample CSV generator)
│   │   ├── App.jsx             # React Router v6 configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend Server
│   ├── src/
│   │   ├── config/             # Environment & PostgreSQL connection pool
│   │   ├── controllers/        # Express route handlers
│   │   ├── db/                 # Production PostgreSQL schema (schema.sql) & seeds
│   │   ├── middleware/         # Auth JWT verification, Error handling, Rate limiting
│   │   ├── routes/             # Express routes
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Emission math engine & @google/genai service
│   │   └── server.js           # Server entrypoint
│   └── package.json
├── package.json                # Root monorepo scripts
└── README.md
```

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

To provision production PostgreSQL tables, execute `server/src/db/schema.sql` in your Supabase SQL Editor:

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emission_factors (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  region TEXT DEFAULT 'India',
  factor_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  cost_inr NUMERIC,
  calculated_co2e NUMERIC NOT NULL,
  usage_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact_co2 NUMERIC,
  savings_inr NUMERIC,
  effort_level TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  target_category TEXT NOT NULL,
  reduction_percentage NUMERIC NOT NULL,
  target_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🌐 Vercel / Railway Deployment

1. **Client Deployment (Vercel)**:
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_BASE_URL=https://your-backend-url.com/api`

2. **Server Deployment (Render / Railway / Vercel)**:
   - Root Directory: `server`
   - Start Command: `node src/server.js`
   - Environment Variables: Set `PORT`, `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`
