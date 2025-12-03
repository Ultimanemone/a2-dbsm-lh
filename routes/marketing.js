const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketing');

// Wishlist
router.get('/wishlist', marketingController.getWishList);
router.post('/wishlist', marketingController.createWishList);
router.put('/wishlist', marketingController.editWishList);
router.delete('/wishlist/:id', marketingController.removeWishList);
router.post('/wishlist/product', marketingController.addProductToWishlist);
router.delete('/wishlist/product', marketingController.removeProductFromWishlist);

// Coupon
router.post('/coupon', marketingController.createCoupon);
router.put('/coupon', marketingController.editCoupon);
router.delete('/coupon/:id', marketingController.removeCoupon);

// Coupon Relationships
router.post('/coupon/product', marketingController.addProductCoupon);
router.delete('/coupon/product', marketingController.removeProductCoupon);

router.post('/order/coupon', marketingController.addOrderCoupon);
router.delete('/order/coupon', marketingController.removeOrderCoupon);

router.post('/order-item/coupon', marketingController.addOrderItemCoupon);
router.delete('/order-item/coupon', marketingController.removeOrderItemCoupon);

// Advertisement
router.get('/advertisement', marketingController.getAdvertisement);
router.post('/advertisement', marketingController.createAdvertisement);
router.put('/advertisement', marketingController.updateAdvertisement); 
router.delete('/advertisement/:id', marketingController.removeAdvertisement);

router.post('/advertisement/product', marketingController.createProductAdvertisement);
router.delete('/advertisement/product', marketingController.removeProductAdvertisement);

module.exports = router;