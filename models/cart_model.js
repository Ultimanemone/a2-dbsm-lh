const { sql, poolPromise } = require('../config/dbConfig');

// take cart info based on Account ID
async function getCart(accountId) {
    const pool = await poolPromise;

    // Fetch cart
    const cartResult = await pool.request()
        .input("accountId", sql.Int, accountId)
        .query(`SELECT * FROM App.Cart WHERE AccountID = @accountId`);

    if (cartResult.recordset.length === 0) {
        throw new Error("Cart not found for this account");
    }

    const cart = cartResult.recordset[0];

    // Fetch items
    const itemsResult = await pool.request()
        .input("cartId", sql.Int, cart.CartID)
        .query(`
            SELECT ci.*, p.Name, p.Price, p.ImageURL, p.Stock, p.Status
            FROM App.CartItem ci
            JOIN Product.Product p ON ci.ProductID = p.ProductID
            WHERE ci.CartID = @cartId
        `);

    cart.Items = itemsResult.recordset;

    return cart;
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

// add a cart item into cart
async function addToCart(data) {
    const { accountId, productId, quantity } = data;
    const qty = quantity || 1;

    const pool = await poolPromise;

    // Get cart
    const cartResult = await pool.request()
        .input("accountId", sql.Int, accountId)
        .query("SELECT CartID FROM App.Cart WHERE AccountID = @accountId");

    const cartId = cartResult.recordset[0].CartID;

    // Get product price
    const productResult = await pool.request()
        .input("productId", sql.Int, productId)
        .query("SELECT Price FROM Product.Product WHERE ProductID = @productId");

    const price = productResult.recordset[0].Price;

    // Check if item already exists
    const existing = await pool.request()
        .input("cartId", sql.Int, cartId)
        .input("productId", sql.Int, productId)
        .query(`SELECT Quantity FROM App.CartItem WHERE CartID = @cartId AND ProductID = @productId`);

    if (existing.recordset.length > 0) {
        // Update quantity
        await pool.request()
            .input("cartId", sql.Int, cartId)
            .input("productId", sql.Int, productId)
            .input("qty", sql.Int, existing.recordset[0].Quantity + qty)
            .input("subtotal", sql.Decimal(12,2), (existing.recordset[0].Quantity + qty) * price)
            .query(`
                UPDATE App.CartItem
                SET Quantity = @qty,
                    SubTotal = @subtotal
                WHERE CartID = @cartId AND ProductID = @productId
            `);
    } else {
        // Insert new item
        await pool.request()
            .input("cartId", sql.Int, cartId)
            .input("productId", sql.Int, productId)
            .input("qty", sql.Int, qty)
            .input("subtotal", sql.Decimal(12,2), qty * price)
            .query(`
                INSERT INTO App.CartItem (CartID, ProductID, Quantity, SubTotal)
                VALUES (@cartId, @productId, @qty, @subtotal)
            `);
    }

    await updateCartTotals(cartId);
}


// update a cart item 
async function updateCartItem(data) {
    const { accountId, productId, quantity } = data;

    const pool = await poolPromise;

    // Get cart
    const cartResult = await pool.request()
        .input("accountId", sql.Int, accountId)
        .query("SELECT CartID FROM App.Cart WHERE AccountID = @accountId");

    const cartId = cartResult.recordset[0].CartID;

    // Get product price
    const productResult = await pool.request()
        .input("productId", sql.Int, productId)
        .query("SELECT Price FROM Product.Product WHERE ProductID = @productId");

    const price = productResult.recordset[0].Price;

    // Update row
    await pool.request()
        .input("cartId", sql.Int, cartId)
        .input("productId", sql.Int, productId)
        .input("qty", sql.Int, quantity)
        .input("subtotal", sql.Decimal(12,2), quantity * price)
        .query(`
            UPDATE App.CartItem
            SET Quantity = @qty,
                SubTotal = @subtotal
            WHERE CartID = @cartId AND ProductID = @productId
        `);

    // await updateCartTotals(cartId);
}

// delete a cart item
async function removeCartItem(accountId, productId) {
    const pool = await poolPromise;

    const cartResult = await pool.request()
        .input("accountId", sql.Int, accountId)
        .query("SELECT CartID FROM App.Cart WHERE AccountID = @accountId");

    const cartId = cartResult.recordset[0].CartID;

    await pool.request()
        .input("cartId", sql.Int, cartId)
        .input("productId", sql.Int, productId)
        .query("DELETE FROM App.CartItem WHERE CartID = @cartId AND ProductID = @productId");

    await updateCartTotals(cartId);
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

// Helper: recompute totals
async function updateCartTotals(cartId) {
    const pool = await poolPromise;

    await pool.request()
        .input("cartId", sql.Int, cartId)
        .query(`
            UPDATE App.Cart
            SET 
                TotalAmount = (SELECT SUM(Quantity) FROM App.CartItem WHERE CartID = @cartId),
                TotalPrice = (SELECT SUM(SubTotal) FROM App.CartItem WHERE CartID = @cartId),
                UpdatedAt = GETDATE()
            WHERE CartID = @cartId;
        `);
}


module.exports = {
    getCart,
    getCartItems,
    addCartItem,
    updateCartItem,
    removeCartItem,
    getAllCarts,
    getAllCartItems,

    addToCart
};