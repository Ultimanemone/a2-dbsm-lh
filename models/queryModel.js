const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Query Statistics
// ============================================================

async function getTopShippersINDB() {
    try {
        const pool = await poolPromise;
        // Gọi Stored Procedure
        const result = await pool.request().execute('StatisticTopShipper');
        
        // Trả về dữ liệu thô (mảng các dòng tìm được)
        return result.recordset; 
    } 
    catch (err) {
        throw err;
    }
}

async function getTopShipper(filters) {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('ShipperID', sql.Int, filters.ShipperID || null)
            .input('ShipperName', sql.NVarChar, filters.ShipperName || null)
            .input('Phone', sql.NVarChar, filters.Phone || null)
            .input('SuccessfulDeliveries', sql.Int, filters.SuccessfulDeliveries || null)
            .execute("StatisticTopShipper");

        return result.recordset;
    } catch (err) {
        throw err;
    }
}

async function editTopShipper(data) {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('ShipperID', sql.Int, data.ShipperID)
            .input('ShipperName', sql.NVarChar, data.ShipperName)
            .input('Phone', sql.NVarChar, data.Phone)
            .execute('topShipperUpdate');
        return { success: true };
    } catch (err) {
        throw err;
    }
}

async function deleteTopShipper(data) {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('ShipperID', sql.Int, data.ShipperID)
            .execute('topShipperDelete');
        return { success: true };
    } catch (err) {
        throw err;
    }
}

async function getCustomerLTVINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('CustomerLifetimeValue');

        // Trả về dữ liệu thô
        return result.recordset;
    } 
    catch (err) {
        throw err;
    }
}

module.exports = {
    getTopShippersINDB,
    getTopShipper, editTopShipper, deleteTopShipper,
    getCustomerLTVINDB
}