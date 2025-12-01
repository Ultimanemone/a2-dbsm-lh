const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const shipmentController = require('../controllers/shipment');

// --- SHIPPING ---
// Shipper
router.post('/shipper', shipmentController.createShipper);
router.put('/shipper', shipmentController.editShipper);
router.delete('/shipper/:id', shipmentController.removeShipper);

// Shipment
router.post('/shipment', shipmentController.createShipment);
router.put('/shipment', shipmentController.updateShipmentStatus);
router.delete('/shipment', shipmentController.removeShipment);

// --- PAYMENT ---
// Cash
router.post('/payment/cash', paymentController.createCash);
router.put('/payment/cash', paymentController.editCash);
router.delete('/payment/cash/:id', paymentController.removeCash);

// Bank Account
router.post('/payment/bank', paymentController.createBankAccount);
router.put('/payment/bank', paymentController.editBankAccount);
router.delete('/payment/bank/:id', paymentController.removeBankAccount);

module.exports = router;