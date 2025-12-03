const express = require("express");
const router = express.Router();

const CartController = require("../controllers/cart_controller");

router.get("/cart/items", CartController.getAllCartItems);
router.get("/cart/:accountID", CartController.getUserCart);
router.get("/cart", CartController.getAllCarts);
router.post("/cart/addCartItem", CartController.addCartItem); 

module.exports = router;