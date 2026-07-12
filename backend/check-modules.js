// Quick sanity check - require all new modules
const modules = [
  './controllers/order.controller',
  './controllers/payment.controller',
  './controllers/shipment.controller',
  './controllers/inquiry.controller',
  './controllers/admin.controller',
  './routes/order.routes',
  './routes/payment.routes',
  './routes/shipment.routes',
  './routes/inquiry.routes',
  './routes/admin.routes'
];

console.log('Checking modules...\n');
let errors = 0;

modules.forEach(mod => {
  try {
    require(mod);
    console.log('✓ ' + mod);
  } catch (err) {
    console.error('✗ ' + mod);
    console.error('  Error:', err.message);
    errors++;
  }
});

console.log('\n' + (errors === 0 ? 'All modules loaded successfully!' : `Found ${errors} error(s)`));
process.exit(errors > 0 ? 1 : 0);
