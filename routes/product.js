const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

// Category
router.get('/category', productController.getCategory);
router.post('/category', productController.createCategory); 
router.put('/category', productController.updateCategory);
router.delete('/category/:id', productController.removeCategory);

// Product
router.get('/product', productController.getProducts);
router.post('/product', productController.createProduct);
router.put('/product', productController.editProduct);
router.delete('/product/:id', productController.removeProduct);

// Review
router.get('/review', productController.getReviews);
router.post('/review', productController.createReview);
router.put('/review', productController.editReview);
router.delete('/review', productController.removeReview);
module.exports = router;