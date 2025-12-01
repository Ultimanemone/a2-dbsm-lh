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
    getCustomerLTVINDB
}