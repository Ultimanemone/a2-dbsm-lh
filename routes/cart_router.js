const express = require("express");
const router = express.Router();

const CartController = require("../controllers/cart_controller");

router.get("/cart_router/:accountID", CartController.getUserCart);   
router.post("/cart_router/addCartItem", CartController.addCartItem); 

module.exports = router;