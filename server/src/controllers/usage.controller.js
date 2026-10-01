import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { UsageLogSchema } from '../schemas/zod.schemas.js';
import { calculateCO2e, EMISSION_FACTORS } from '../services/emission.service.js';

export async function getUsageLogs(req, res, next) {
  try {
    const orgId = req.user.org_id;
    const { category, startDate, endDate } = req.query;

    let logs = db.memoryDb.usage_logs.filter(l => l.org_id === orgId);

    if (category) {
      logs = logs.filter(l => l.category.toLowerCase() === category.toLowerCase());
    }
    if (startDate) {
      logs = logs.filter(l => new Date(l.usage_date) >= new Date(startDate));
    }
    if (endDate) {
      logs = logs.filter(l => new Date(l.usage_date) <= new Date(endDate));
    }

    logs.sort((a, b) => new Date(b.usage_date) - new Date(a.usage_date));

    res.json({
      count: logs.length,
      logs
    });
  } catch (err) {
    next(err);
  }
}

export async function createUsageLog(req, res, next) {
  try {
    const orgId = req.user.org_id;
    const validated = UsageLogSchema.parse(req.body);
    const { category, quantity, cost_inr, usage_date, notes } = validated;

    const catKey = category.toLowerCase();
    const config = EMISSION_FACTORS[catKey];
    const unit = config ? config.defaultUnit : (req.body.unit || 'units');

    // Deterministic CO2 calculation
    const calculated_co2e = calculateCO2e(catKey, quantity);

    const newLog = {
      id: uuidv4(),
      org_id: orgId,
      category: catKey,
      quantity,
      unit,
      cost_inr: cost_inr ? Number(cost_inr) : null,
      calculated_co2e,
      usage_date,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    db.memoryDb.usage_logs.push(newLog);

    res.status(201).json({
      message: 'Usage log recorded and carbon footprint calculated',
      log: newLog
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkUploadCSV(req, res, next) {
  try {
    const orgId = req.user.org_id;
    const { items, csvContent } = req.body;

    let rowsToProcess = [];

    if (Array.isArray(items) && items.length > 0) {
      rowsToProcess = items;
    } else if (csvContent && typeof csvContent === 'string') {
      // Basic CSV line parser
      const lines = csvContent.trim().split('\n');
      if (lines.length <= 1) {
        return res.status(400).json({ error: 'CSV file is empty or missing headers' });
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((h, index) => {
          row[h] = cols[index];
        });
        rowsToProcess.push(row);
      }
    } else {
      return res.status(400).json({ error: 'No CSV content or data items provided' });
    }

    const insertedLogs = [];
    const errors = [];

    rowsToProcess.forEach((row, idx) => {
      try {
        const cat = (row.category || row.Category || 'electricity').toLowerCase();
        const qty = parseFloat(row.quantity || row.Quantity || row.qty || row.Qty || 0);
        const date = row.usage_date || row.date || row.Date || new Date().toISOString().split('T')[0];
        const cost = row.cost_inr || row.cost || row.Cost || null;
        const notes = row.notes || row.Notes || 'CSV Upload';

        if (isNaN(qty) || qty <= 0) {
          errors.push(`Row ${idx + 1}: Invalid quantity (${qty})`);
          return;
        }

        const config = EMISSION_FACTORS[cat] || EMISSION_FACTORS.electricity;
        const co2e = calculateCO2e(cat, qty);

        const log = {
          id: uuidv4(),
          org_id: orgId,
          category: cat,
          quantity: qty,
          unit: config.defaultUnit,
          cost_inr: cost ? Number(cost) : null,
          calculated_co2e: co2e,
          usage_date: date,
          notes,
          created_at: new Date().toISOString()
        };

        db.memoryDb.usage_logs.push(log);
        insertedLogs.push(log);
      } catch (err) {
        errors.push(`Row ${idx + 1}: ${err.message}`);
      }
    });

    res.status(201).json({
      message: `Successfully processed ${insertedLogs.length} records`,
      insertedCount: insertedLogs.length,
      errorCount: errors.length,
      errors,
      logs: insertedLogs
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUsageLog(req, res, next) {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    const index = db.memoryDb.usage_logs.findIndex(l => l.id === id && l.org_id === orgId);
    if (index === -1) {
      return res.status(404).json({ error: 'Usage log entry not found or unauthorized' });
    }

    db.memoryDb.usage_logs.splice(index, 1);
    res.json({ message: 'Usage log entry deleted successfully', id });
  } catch (err) {
    next(err);
  }
}
