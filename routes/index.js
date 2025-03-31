// Express.js
const router = require('express').Router();

// routes
const userRoutes = require('./user');
const categoryRoutes = require('./category');
const productRoutes = require('./product');
const paymentRoutes = require('./payment');

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/purchase-items', paymentRoutes);

module.exports = router;