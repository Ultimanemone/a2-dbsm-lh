const accountController = require('./account');
const marketingController = require('./marketing');
const orderController = require('./order');
const paymentController = require('./payment');
const productController = require('./product');
const queryController = require('./query');
const shipmentController = require('./shipment');
const loginController = require('./login');

module.exports = {
    ...accountController,
    ...marketingController,
    ...orderController,
    ...paymentController,
    ...productController,
    ...queryController,
    ...shipmentController,
    ...loginController
};