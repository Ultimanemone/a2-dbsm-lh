const Product = require("../models/product_model");

async function getAllProducts(req, res) {
    const products = await Product.getAllProducts();
    res.json(products);
}

module.exports = {getAllProducts};