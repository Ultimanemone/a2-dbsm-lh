const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Shipper
// ============================================================

// 1.1 Insert
async function createShipperINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Name', sql.NVarChar(200), data.Name)
            .input('Phone', sql.NVarChar(20), data.Phone)
            .input('Email', sql.NVarChar(255), data.Email)
            .input('Address', sql.NVarChar(500), data.Address)
            .execute('insertShipper');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.2 Update
async function editShipperINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ShipperID', sql.Int, data.ShipperID)
            .input('Name', sql.NVarChar(200), data.Name)
            .input('Phone', sql.NVarChar(20), data.Phone)
            .input('Email', sql.NVarChar(255), data.Email)
            .input('Address', sql.NVarChar(500), data.Address)
            .execute('updateShipper');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.3 Deleting
async function removeShipperINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ShipperID', sql.Int, id)
            .execute('deleteShipper');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 2. Shipment
// ============================================================

// 2.1 Insert
async function createShipmentINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ShipperID', sql.Int, data.ShipperID)
            .input('OrderID', sql.Int, data.OrderID)
            .input('SellerAccountID', sql.Int, data.SellerAccountID)
            .input('DeliveryStartDate', sql.DateTime, data.DeliveryStartDate || new Date())
            .input('NumberOfProducts', sql.Int, data.NumberOfProducts)
            .input('EstimatedDeliveryTime', sql.DateTime, data.EstimatedDeliveryTime)
            .input('RealDeliveryTime', sql.DateTime, data.RealDeliveryTime || null)
            .execute('insertShipment');

        return { success: true };
    } catch (err) {
        // Lỗi từ Trigger (nếu Shipper quá tải) sẽ được throw tại đây
        throw err;
    }
}

// 2.2 Update
async function updateShipmentStatusINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ShipperID', sql.Int, data.ShipperID)
            .input('OrderID', sql.Int, data.OrderID)
            .input('RealDeliveryTime', sql.DateTime, data.RealDeliveryTime || new Date())
            .execute('updateShipment');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.3 Delete
async function removeShipmentINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ShipperID', sql.Int, data.ShipperID)
            .input('OrderID', sql.Int, data.OrderID)
            .execute('sp_DeleteShipment');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createShipperINDB, editShipperINDB, removeShipperINDB,
    createShipmentINDB, updateShipmentStatusINDB, removeShipmentINDB
};