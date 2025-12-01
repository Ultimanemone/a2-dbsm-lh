const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');

// Order
router.post('/order', orderController.createOrder);
router.put('/order', orderController.editOrder);
router.delete('/order/:id', orderController.removeOrder);

// Order History
router.post('/order-history', orderController.createOrderHistory);
router.put('/order-history', orderController.editOrderHistory);
router.delete('/order-history/:id', orderController.removeOrderHistory);

// Order Item
router.post('/order-item', orderController.createOrderItem);

// Cart
router.put('/cart', orderController.UpdateCart);

module.exports = router;