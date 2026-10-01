/**
 * Formats currency values into INR (₹)
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * Formats carbon footprint kg values into kg or metric tons
 */
export function formatCO2(kgVal) {
  const val = Number(kgVal) || 0;
  if (val >= 1000) {
    return `${(val / 1000).toFixed(2)} t CO₂e`;
  }
  return `${val.toLocaleString()} kg CO₂e`;
}

/**
 * Formats category unit
 */
export function formatUnit(category, quantity) {
  const cat = (category || '').toLowerCase();
  const qty = Number(quantity) || 0;
  switch (cat) {
    case 'electricity': return `${qty.toLocaleString()} kWh`;
    case 'water': return `${qty.toLocaleString()} kL`;
    case 'fuel': return `${qty.toLocaleString()} L`;
    case 'waste': return `${qty.toLocaleString()} kg`;
    default: return `${qty.toLocaleString()} units`;
  }
}

/**
 * Generates sample CSV string for user download template
 */
export function generateSampleCSV() {
  return `category,quantity,unit,usage_date,cost_inr,notes
electricity,14500,kWh,2026-09-01,123250,"Regular factory bill"
water,380,kL,2026-09-01,17100,"Water meter reading"
fuel,1200,L,2026-09-01,114000,"Backup generator diesel"
waste,920,kg,2026-09-01,11040,"General waste tipping fee"`;
}
