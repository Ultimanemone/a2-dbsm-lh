const { sql, poolPromise } = require('../config/dbConfig');

// take cart info based on Account ID
async function getCart(accountID){
    const pool = await poolPromise;
    const query = `
        select CartID, TotalPrice, TotalAmount
        from Cart 
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
        from CartItem ci join [Product] p on ci.ProductID = p.ProductID
        where ci.CartID = @cartID`
    const request = pool.request();
    request.input("cartID", sql.Int, CartID);

    const result = await request.query(query);
    return result.recordset;
}

// add a cart item into cart
async function addCartItem(cartID, productID, quantity, subtotal){
    try{
        const pool = await poolPromise;
        const result = await pool.request()
        .input("cartID", sql.Int, cartID)
        .input("productID", sql.Int, productID)
        .input("quantity", sql.Int, quantity)
        .input("subtotal", sql.Decimal(12,2), subtotal)
        .execute("insertCartItem")
        return {success: true, rowsAffected: result.rowsAffected}; 
    } catch (err) {
        console.error(err);
        return {success: false, error: err.message};
    }
}

module.exports = {
    getCart,
    getCartItems,
    addCartItem
};