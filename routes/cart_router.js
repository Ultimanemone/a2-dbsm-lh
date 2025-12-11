const express = require("express");
const router = express.Router();

const CartController = require("../controllers/cart_controller");

router.get("/cart/items", CartController.getAllCartItems);
router.delete("/cart/items", CartController.deleteCartItem);
router.get("/cart/:accountID", CartController.getUserCart);
router.get("/cart", CartController.getAllCarts);
router.post("/cart/items", CartController.addCartItem);


router.get('/userCart/:accountId', CartController.getCart);
router.post('/userCart/add', CartController.addToCart);
router.put('/userCart/update', CartController.updateCartItem);
router.delete('/userCart/remove/:accountId/:productId', CartController.removeCartItem);

module.exports = router;