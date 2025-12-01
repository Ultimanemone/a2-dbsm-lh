const express = require('express');
const router = express.Router();

const accountController = require('../controllers/account'); 

// Customer
router.post('/customer', accountController.createCustomer);
router.put('/customer', accountController.editCustomer);
router.delete('/customer/:id', accountController.removeCustomer);

// Seller
router.post('/seller', accountController.createSeller);
router.put('/seller', accountController.editSeller);
router.delete('/seller/:id', accountController.removeSeller);

// Admin
router.post('/admin', accountController.createAdmin);
router.put('/admin', accountController.editAdmin);
router.delete('/admin/:id', accountController.removeAdmin);

// Affiliate
router.post('/affiliate', accountController.createAffiliate);
router.put('/affiliate', accountController.editAffiliate);
router.delete('/affiliate/:id', accountController.removeAffiliate);

module.exports = router;