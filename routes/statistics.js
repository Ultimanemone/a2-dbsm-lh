const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query');

router.get('/stats/top-shipper', queryController.getTopShippers);
router.get('/stats/customer-ltv', queryController.getCustomerLTV);

module.exports = router;