const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query');

router.get('/stats/top-shipper', queryController.getTopShipper);
router.put('/stats/top-shipper', queryController.editTopShipper);
router.delete('/stats/top-shipper/:ShipperID', queryController.deleteTopShipper);
router.get('/stats/customer-ltv', queryController.getCustomerLTV);
router.get('/stats/orderdetails', queryController.getOrderDetails);

module.exports = router;