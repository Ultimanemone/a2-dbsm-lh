const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/product_controller");

router.get("/product_router", ProductController.getAllProducts);
module.exports = router;

