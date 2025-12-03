const express = require('express');
const router = express.Router();

const orderController = require('../controllers/getData');

router.get('/user/:accountId', orderController.getUserOrders);
router.get('/:orderId/items', orderController.getOrderItems);
router.get('/:orderId/shipment', orderController.getOrderShipment);
router.get('/shipper/:id', orderController.getShipper);

module.exports = router;