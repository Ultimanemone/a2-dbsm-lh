const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Order
// ============================================================

// 1.1 Insert
async function createOrderINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('accID', sql.Int, data.AccountID)
            .input('creationDate', sql.DateTime, new Date())
            .input('orderDate', sql.DateTime, new Date())
            .input('noOfShipments', sql.Int, data.NoOfShipments)
            .input('shippingAddr', sql.NVarChar(500), data.ShippingAddress)
            .input('note', sql.NVarChar(1000), data.Note)
            .input('totalPrice', sql.Decimal(12, 2), data.TotalPrice)
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
            .input('orderId', sql.Int, data.OrderID)
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

// 1.4 Get
async function getOrderINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Sale.[Order]');
        return result.recordset;
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
            .input('orderId', sql.Int, data.OrderID)
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
            .input('orderId', sql.Int, data.OrderID)
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

// 2.4 Get
async function getOrderHistoryINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM UserData.OrderHistory');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 3. Order Item
// ============================================================

// 2.1 Create
async function createOrderItemINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderId', sql.Int, data.OrderID)
            .input('prodId', sql.Int, data.ProductID)
            .input('quantity', sql.Int, data.Quantity)
            .execute('insertOrderItem');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.2 Update
async function editOrderItemINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderItemId', sql.Int, data.orderItemId)
            .input('orderId', sql.Int, data.OrderID)
            .input('prodId', sql.Int, data.ProductID)
            .input('quantity', sql.Int, data.Quantity)
            .input('subTotal', sql.Decimal(12, 2), data.SubTotal)
            .execute('updateOrderItem');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.3 Delete
async function removeOrderItemINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('orderItemId', sql.Int, id)
            .execute('deleteOrderItem');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.4 Get
async function getOrderItemsINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    oi.OrderItemID,
                    oi.OrderID,
                    oi.ProductID,
                    p.Name as ProductName,
                    oi.Quantity,
                    p.Price as UnitPrice,
                    oi.SubTotal

                FROM Sale.OrderItem oi
                LEFT JOIN Product.Product p 
                    ON oi.ProductID = p.ProductID
                WHERE p.ProductID IS NOT NULL;
            `);
        return result.recordset;
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
    createOrderINDB, editOrderINDB, removeOrderINDB, getOrderINDB,
    createOrderHistoryINDB, editOrderHistoryINDB, removeOrderHistoryINDB, getOrderHistoryINDB,
    createOrderItemINDB, editOrderItemINDB, removeOrderItemINDB, getOrderItemsINDB,
    updateCartINDB
};