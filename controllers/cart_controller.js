const CartService = require("../services/cart_services")
const CartModel = require("../models/cart_model")

async function getUserCart(req, res) {
    const accountId = parseInt(req.params.accountID);

    console.log(accountId);

    if (isNaN(accountId)) {
        return res.status(400).json({ message: "Invalid accountID" });
    }

    const data = await CartService.getCartWithItems(accountId);

    return res.status(200).json(data);
}

// GET all carts
async function getAllCarts(req, res) {
    try {
        const data = await CartModel.getAllCarts();
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all carts",
            error: err.message
        });
    }
}

async function getAllCartItems(req, res) {
    try {
        const data = await CartModel.getAllCartItems();
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all cart items",
            error: err.message
        });
    }
}

async function addCartItem(req, res){
    const {
        cartID, productID, quantity, price
    } = req.body;

    subtotal = quantity*price;

    const result = await CartModel.addCartItem(cartID, productID, quantity, subtotal);
    
    if (!result.success){
        return res.status(500).json(
            {
                success: false,
                message: result.error
            }
        );
    }

    return res.status(201).json({
        success: true,
        message: "Cart item added successfully"
    });
}

module.exports = {
    getUserCart,
    addCartItem,
    getAllCarts,
    getAllCartItems
};