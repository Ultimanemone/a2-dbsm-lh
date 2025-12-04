const { sql, poolPromise } = require('../config/dbConfig');

// take cart info based on Account ID
async function getCart(accountID){
    const pool = await poolPromise;
    const query = `
        select CartID, TotalPrice, TotalAmount
        from App.Cart 
        where AccountID = @accID`
    const request = pool.request();
    request.input("accID", sql.Int, accountID);
    const result = await request.query(query);
    console.log(result);
    return result.recordset[0];
}

// take all cart items based on CartID
async function getCartItems(CartID){
    const pool = await poolPromise;
    const query = `
        select ci.ProductID, [Name], Price, ImageURL, Brand, Quantity, SubTotal
        from App.CartItem ci join [Product] p on ci.ProductID = p.ProductID
        where ci.CartID = @cartID`
    const request = pool.request();
    request.input("cartID", sql.Int, CartID);

    const result = await request.query(query);
    return result.recordset;
}

// add a cart item into cart
async function addCartItem(CartID, ProductID, Quantity){
    try{
        const pool = await poolPromise;
        const result = await pool.request()
        .input("CartID", sql.Int, CartID)
        .input("ProductID", sql.Int, ProductID)
        .input("Quantity", sql.Int, Quantity)
        .execute("InsertCartItem")
        return {success: true, rowsAffected: result.rowsAffected}; 
    } catch (err) {
        console.error(err);
        return {success: false, error: err.message};
    }
}

// update a cart item 
async function updateCartItem(CartID, ProductID, Quantity){
    try{
        const pool = await poolPromise;
        const result = await pool.request()
        .input("CartID", sql.Int, CartID)
        .input("ProductID", sql.Int, ProductID)
        .input("Quantity", sql.Int, Quantity)
        .execute("updateCartItem")
        return {success: true, rowsAffected: result.rowsAffected}; 
    } catch (err) {
        console.error(err);
        return {success: false, error: err.message};
    }
}

// delete a cart item
async function deleteCartItem(cartID, productID){
    try{
        const pool = await poolPromise;
        const result = await pool.request()
        .input("cartID", sql.Int, cartID)
        .input("productID", sql.Int, productID)
        .execute("deleteCartItem")
        return {success: true, rowsAffected: result.rowsAffected}; 
    } catch (err) {
        console.error(err);
        return {success: false, error: err.message};
    }
}

async function getAllCarts() {
    try {
        const pool = await poolPromise;

        const cartsResult = await pool.request()
            .query(`
                SELECT
                    cart.CartID,
                    cart.AccountID,
                    cart.TotalPrice,
                    cart.TotalAmount,
                    cart.UpdatedAt,
                    cart.ShippingAddress,
                
                    (
                        SELECT STRING_AGG(x.ProductID, ', ')
                        FROM (
                            SELECT DISTINCT ProductID
                            FROM App.CartItem
                            WHERE CartID = cart.CartID
                        ) x
                    ) AS CartItem

                FROM App.Cart cart
            `);
        const carts = cartsResult.recordset;
        return carts;
    } catch (err) {
        throw err;
    }
}

async function getAllCartItems() {
    try {
        const pool = await poolPromise;

        const cartsResult = await pool.request()
            .query(`SELECT * FROM App.CartItem`);
        const carts = cartsResult.recordset;
        return carts;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getCart,
    getCartItems,
    addCartItem,
    updateCartItem,
    deleteCartItem,
    getAllCarts,
    getAllCartItems
};