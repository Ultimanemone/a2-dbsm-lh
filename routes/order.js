const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');

// Order
router.get('/order', orderController.getOrders);
router.post('/order', orderController.createOrder);
router.put('/order', orderController.editOrder);
router.delete('/order/:id', orderController.removeOrder);

// Order History
router.get('/order/history', orderController.getOrderHistory);
router.post('/order/history', orderController.createOrderHistory);
router.put('/order/history', orderController.editOrderHistory);
router.delete('/order/history/:id', orderController.removeOrderHistory);

// Order Item
router.get('/order/item', orderController.getOrderItems);
router.post('/order/item', orderController.createOrderItem);
router.put('/order/item', orderController.editOrderItem);
router.delete('/order/item/:id', orderController.removeOrderItem);

// Cart
router.put('/cart', orderController.UpdateCart);

module.exports = router;