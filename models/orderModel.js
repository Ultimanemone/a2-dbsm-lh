const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Order
// ============================================================

// 1.1 Insert
async function createOrderINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('accID', sql.Int, data.accID)
            .input('creationDate', sql.DateTime, new Date())
            .input('orderDate', sql.DateTime, new Date())
            .input('noOfShipments', sql.Int, data.noOfShipments)
            .input('shippingAddr', sql.NVarChar(500), data.shippingAddr)
            .input('note', sql.NVarChar(1000), data.note)
            .input('totalPrice', sql.Decimal(12, 2), data.totalPrice)
            .execute('insertOrders');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.2 Update
async function editOrderINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderId', sql.Int, data.orderId)
            .input('creationDate', sql.DateTime, data.creationDate || new Date())
            .input('orderDate', sql.DateTime, data.orderDate || new Date())
            .input('noOfShipments', sql.Int, data.noOfShipments)
            .input('shippingAddr', sql.NVarChar(500), data.shippingAddr)
            .input('note', sql.NVarChar(1000), data.note)
            .input('totalPrice', sql.Decimal(12, 2), data.totalPrice)
            .input('status', sql.NVarChar(30), data.status)
            .execute('updateOrders');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.3 Delete
async function removeOrderINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderId', sql.Int, id)
            .execute('deleteOrders');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 2. OrderHistory
// ============================================================

// 2.1 Insert
async function createOrderHistoryINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderId', sql.Int, data.orderId)
            .input('completionDate', sql.DateTime, data.completionDate || new Date())
            .input('orderStatus', sql.NVarChar(30), data.orderStatus)
            .execute('insertOrderHistory');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.2 Update
async function editOrderHistoryINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderHistoryId', sql.Int, data.orderHistoryId)
            .input('orderId', sql.Int, data.orderId)
            .input('completionDate', sql.DateTime, data.completionDate)
            .input('orderStatus', sql.NVarChar(30), data.orderStatus)
            .execute('updateOrderHistory');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.3 Delete
async function removeOrderHistoryINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderHistoryId', sql.Int, id)
            .execute('deleteOrderHistory');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 3. Order Item
// ============================================================

async function createOrderItemINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderId', sql.Int, data.orderId)
            .input('prodId', sql.Int, data.prodId)
            .input('quantity', sql.Int, data.quantity)
            .input('subTotal', sql.Decimal(12, 2), data.subTotal)
            .execute('insertOrderItem');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 4. Cart
// ============================================================

async function updateCartINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('cartID', sql.Int, data.cartID)
            .input('totalPrice', sql.Decimal(12, 2), data.totalPrice)
            .input('totalAmount', sql.Int, data.totalAmount)
            .execute('updateCart');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createOrderINDB, editOrderINDB, removeOrderINDB,
    createOrderHistoryINDB, editOrderHistoryINDB, removeOrderHistoryINDB,
    createOrderItemINDB,
    updateCartINDB
};