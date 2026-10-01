import pg from 'pg';
import { env } from './env.js';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

if (env.DATABASE_URL && env.DATABASE_URL.startsWith('postgres')) {
  try {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false
    });
    console.log('[Database] PostgreSQL Pool initialized');
  } catch (err) {
    console.warn('[Database] Failed to initialize PostgreSQL pool, falling back to local store:', err.message);
  }
}

// Memory Store Initial Seed Data for Demo & Development (Pre-loaded with 12 months of usage for Org A)
const DEFAULT_ORG_ID = 'e7b1a234-5678-4901-a234-56789abcdef0';
const DEFAULT_USER_ID = 'u1b1a234-5678-4901-a234-56789abcdef0';

const memoryDb = {
  organizations: [
    {
      id: DEFAULT_ORG_ID,
      name: 'Apex Green Manufacturing',
      industry: 'Industrial & Electronics Manufacturing',
      created_at: new Date('2025-01-01').toISOString()
    }
  ],
  users: [
    {
      id: DEFAULT_USER_ID,
      email: 'demo@ecoledger.com',
      // Password hash for 'password123'
      password_hash: '$2a$10$wN9F4k6H.qJ0G6mZ7dZ8EO7mZ7dZ8EO7mZ7dZ8EO7mZ7dZ8EO7mZ',
      org_id: DEFAULT_ORG_ID,
      full_name: 'Alex Rivera',
      role: 'Sustainability Lead',
      created_at: new Date('2025-01-01').toISOString()
    }
  ],
  emission_factors: [
    { id: 1, category: 'electricity', region: 'India', factor_value: 0.82, unit: 'kWh' },
    { id: 2, category: 'water', region: 'India', factor_value: 0.34, unit: 'kL' },
    { id: 3, category: 'fuel', region: 'India', factor_value: 2.68, unit: 'L' },
    { id: 4, category: 'waste', region: 'India', factor_value: 1.90, unit: 'kg' }
  ],
  usage_logs: [],
  recommendations: [],
  goals: [
    {
      id: uuidv4(),
      org_id: DEFAULT_ORG_ID,
      target_category: 'electricity',
      reduction_percentage: 15,
      target_date: '2026-12-31',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      org_id: DEFAULT_ORG_ID,
      target_category: 'water',
      reduction_percentage: 20,
      target_date: '2026-10-31',
      created_at: new Date().toISOString()
    }
  ]
};

// Populate 12 months of realistic data for electricity, water, fuel, waste
const months = [
  '2025-10-01', '2025-11-01', '2025-12-01', '2026-01-01',
  '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01',
  '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01'
];

const seedCategoryData = {
  electricity: [12000, 12500, 14000, 13200, 12800, 13500, 14200, 15000, 15500, 16000, 15800, 14900], // kWh
  water:       [320,   310,   340,   330,   325,   350,   360,   370,   380,   390,   540,   410],   // kL (Spike in Aug! 540 vs avg ~350)
  fuel:        [1100,  1050,  1250,  1200,  1150,  1180,  1220,  1300,  1280,  1320,  1350,  1300],  // L
  waste:       [850,   820,   900,   880,   860,   890,   910,   950,   930,   960,   940,   920]    // kg
};

const factorMap = { electricity: 0.82, water: 0.34, fuel: 2.68, waste: 1.90 };
const unitMap = { electricity: 'kWh', water: 'kL', fuel: 'L', waste: 'kg' };
const costMap = { electricity: 8.5, water: 45, fuel: 95, waste: 12 };

months.forEach((dateStr, idx) => {
  Object.keys(seedCategoryData).forEach(cat => {
    const qty = seedCategoryData[cat][idx];
    const co2e = Number((qty * factorMap[cat]).toFixed(2));
    const cost = Math.round(qty * costMap[cat]);
    const note = (cat === 'water' && idx === 10) ? 'Cooling tower leakage & auxiliary pump overhaul' : 'Regular monthly utility bill';

    memoryDb.usage_logs.push({
      id: uuidv4(),
      org_id: DEFAULT_ORG_ID,
      category: cat,
      quantity: qty,
      unit: unitMap[cat],
      cost_inr: cost,
      calculated_co2e: co2e,
      usage_date: dateStr,
      notes: note,
      created_at: new Date(dateStr).toISOString()
    });
  });
});

// Seed default AI recommendations
memoryDb.recommendations = [
  {
    id: uuidv4(),
    org_id: DEFAULT_ORG_ID,
    title: 'Install Variable Frequency Drives (VFD) on Water Cooling Pumps',
    description: 'Optimize water circulation flow rate based on real-time temperature sensors to prevent pump over-cycling and eliminate idle power usage.',
    impact_co2: 4200,
    savings_inr: 185000,
    effort_level: 'Medium',
    status: 'in_progress',
    created_at: new Date('2026-09-05').toISOString()
  },
  {
    id: uuidv4(),
    org_id: DEFAULT_ORG_ID,
    title: 'Shift Heavy Machinery Operations to Off-Peak Tariff Hours',
    description: 'Reschedule high-voltage manufacturing shifts to night-time tariff windows to lower peak demand charges by up to 22%.',
    impact_co2: 6800,
    savings_inr: 320000,
    effort_level: 'Low',
    status: 'pending',
    created_at: new Date('2026-09-10').toISOString()
  },
  {
    id: uuidv4(),
    org_id: DEFAULT_ORG_ID,
    title: 'Implement Rooftop Solar PPA (100 kWp Capacity)',
    description: 'Transition 30% of daytime factory electricity demand to clean solar power under zero-CAPEX PPA agreement.',
    impact_co2: 12400,
    savings_inr: 540000,
    effort_level: 'High',
    status: 'pending',
    created_at: new Date('2026-09-15').toISOString()
  }
];

export const db = {
  isPgConnected: () => !!pool,
  query: async (text, params) => {
    if (pool) {
      return pool.query(text, params);
    }
    // Fallback simulation handled in controllers if pool is absent
    return { rows: [] };
  },
  memoryDb
};
