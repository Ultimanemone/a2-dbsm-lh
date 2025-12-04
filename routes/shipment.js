const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment');

// Shipper
router.get('/shipper', shipmentController.getShippers);
router.post('/shipper', shipmentController.createShipper);
router.put('/shipper', shipmentController.editShipper);
router.delete('/shipper/:id', shipmentController.removeShipper);

// Shipment
router.get('/shipment', shipmentController.getShipments);
router.post('/shipment', shipmentController.createShipment);
router.put('/shipment', shipmentController.updateShipmentStatus);
router.delete('/shipment', shipmentController.removeShipment);

module.exports = router;