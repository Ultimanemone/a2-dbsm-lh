const express = require('express');
const router = express.Router();

const accountController = require('../controllers/account'); 

// All accounts
router.get('/accounts', accountController.getAccounts);

// Customer
router.get('/customer', accountController.getCustomers);
router.post('/customer', accountController.createCustomer);
router.put('/customer', accountController.editCustomer);
router.delete('/customer/:id', accountController.removeCustomer);

// Seller
router.get('/seller', accountController.getSellers);
router.post('/seller', accountController.createSeller);
router.put('/seller', accountController.editSeller);
router.delete('/seller/:id', accountController.removeSeller);

// Admin
router.get('/admin', accountController.getAdmins);
router.post('/admin', accountController.createAdmin);
router.put('/admin', accountController.editAdmin);
router.delete('/admin/:id', accountController.removeAdmin);

// Affiliate
router.get('/affiliate', accountController.getAffiliates);
router.post('/affiliate', accountController.createAffiliate);
router.put('/affiliate', accountController.editAffiliate);
router.delete('/affiliate/:id', accountController.removeAffiliate);

module.exports = router;