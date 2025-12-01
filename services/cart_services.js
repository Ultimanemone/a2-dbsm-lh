const Cart = require("../models/cart_model")

async function getCartWithItems(accountId) {
    
    console.log("AccountID:", accountId);
    const cart = await Cart.getCart(accountId);
    
    if (!cart) return null;
    const items = await Cart.getCartItems(cart.CartID);

    return {
        cart: cart,
        items: items
    };
}

module.exports = {
    getCartWithItems
};