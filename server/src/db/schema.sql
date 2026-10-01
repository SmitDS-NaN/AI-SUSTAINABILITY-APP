-- Production SQL for PostgreSQL / Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emission_factors (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL UNIQUE, -- e.g., 'electricity', 'water', 'fuel', 'waste'
  region TEXT DEFAULT 'India',
  factor_value NUMERIC NOT NULL, -- kg CO2e per unit
  unit TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_logs (
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

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact_co2 NUMERIC,
  savings_inr NUMERIC,
  effort_level TEXT, -- 'Low', 'Medium', 'High'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  target_category TEXT NOT NULL,
  reduction_percentage NUMERIC NOT NULL,
  target_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Emission Factors for India Baseline
INSERT INTO emission_factors (category, region, factor_value, unit)
VALUES 
  ('electricity', 'India', 0.82, 'kWh'),
  ('water', 'India', 0.34, 'kL'),
  ('fuel', 'India', 2.68, 'L'),
  ('waste', 'India', 1.90, 'kg')
ON CONFLICT (category) DO UPDATE SET factor_value = EXCLUDED.factor_value;

-- Enable Row Level Security
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policies
CREATE POLICY "Orgs isolate usage logs" ON usage_logs
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Orgs isolate recommendations" ON recommendations
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Orgs isolate goals" ON goals
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE users.id = auth.uid()));
