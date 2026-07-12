try {
  // Require controllers
  require('../controllers/order.controller');
  require('../controllers/payment.controller');
  require('../controllers/shipment.controller');
  require('../controllers/inquiry.controller');
  require('../controllers/admin.controller');

  // Require routes
  require('../routes/order.routes');
  require('../routes/payment.routes');
  require('../routes/shipment.routes');
  require('../routes/inquiry.routes');
  require('../routes/admin.routes');

  console.log('OK: modules loaded successfully');
  process.exit(0);
} catch (err) {
  console.error('ERROR: failed to load modules');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
}
