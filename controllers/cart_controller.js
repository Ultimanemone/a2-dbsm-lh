const CartService = require("../services/cart_services")
const CartModel = require("../models/cart_model")
const { sql, poolPromise } = require('../config/dbConfig');

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
        CartID, ProductID, Quantity, Price
    } = req.body;

    subtotal = Quantity*Price;

    const result = await CartModel.addCartItem(CartID, ProductID, Quantity);
    
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

async function deleteCartItem(req, res){
    const {
        CartID, ProductID
    } = req.query;

    const result = await CartModel.deleteCartItem(CartID, ProductID);
    
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
        message: "Cart item deleted successfully"
    });
}



async function getCart(req, res) {
    const { accountId } = req.params;

    try {
        const cart = await CartModel.getCart(accountId);
        res.json(cart);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function addToCart(req, res) {
    try {
        await CartModel.addToCart(req.body);
        res.json({ message: "Added to cart" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Update quantity
async function updateCartItem(req, res) {
    try {
        await CartModel.updateCartItem(req.body);
        res.json({ message: "Updated cart item" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Remove item
async function removeCartItem(req, res) {
    const { accountId, productId } = req.params;

    try {
        await CartModel.removeCartItem(accountId, productId);
        res.json({ message: "Removed from cart" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// lấy tổng của Cart khi Checkout
async function checkoutCart(req, res) {
    try {
        const cartID = parseInt(req.params.cartID);
        const pool = await pool.poolPromise;
        const result = await pool.request()
            .input('CartID', sql.Int, cartID)
            .query('select * from App.getCheckoutTotal(@CartID)');
        return res.json(result.recordset[0]);
    } catch (err){
        res.status(500).json({ 
            success: false,
            error: err.message
         });
    }
}
//tạo ORder từ Cart
async function makeOrder(req, res){
    try {
        const {customerID, cartID} = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CustomerID', sql.Int, CustomerID)
            .input('CartID', sql.Int, CartID)
            .execute("Sale.createOrder");
        return res.json(result.recordset[0]);
    } catch (err){
        return res.status(500).json(
            {
                success: false,
                error: err.message
            }
        );
    }
}
module.exports = {
    getUserCart,
    getAllCarts,
    getAllCartItems, addCartItem, deleteCartItem,
    getCart, addToCart, updateCartItem, removeCartItem
    checkoutCart,
    makeOrder
};