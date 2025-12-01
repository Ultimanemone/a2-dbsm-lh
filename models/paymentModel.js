const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Cash
// ============================================================

// 1.1 Insert
async function createCashINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Method', sql.NVarChar(50), data.Method || 'Cash') // Mặc định là 'Cash'
            .input('ActualReceivedMoney', sql.Decimal(12, 2), data.ActualReceivedMoney)
            .input('MoneyBack', sql.Decimal(12, 2), data.MoneyBack)
            .input('ShipperID', sql.Int, data.ShipperID) // Có thể null nếu chưa có shipper
            .execute('insertCash');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.2 Update
async function editCashINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('PMID', sql.Int, data.PMID)
            .input('Method', sql.NVarChar(50), data.Method)
            .input('ActualReceivedMoney', sql.Decimal(12, 2), data.ActualReceivedMoney)
            .input('MoneyBack', sql.Decimal(12, 2), data.MoneyBack)
            .execute('updateCash');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.3 Delete
async function removeCashINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('PMID', sql.Int, id)
            .execute('deleteCash');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 2. Bank Account
// ============================================================

// 2.1 Insert
async function createBankAccountINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Method', sql.NVarChar(50), data.Method || 'BankAccount')
            .input('AccountID', sql.Int, data.AccountID)
            .input('BankName', sql.NVarChar(200), data.BankName)
            .input('CardType', sql.NVarChar(50), data.CardType)
            .input('CardNumber', sql.NVarChar(50), data.CardNumber)
            .input('ExpirationDate', sql.Date, data.ExpirationDate) 
            .execute('insertBankAccount');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.2 Update
async function editBankAccountINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('PMID', sql.Int, data.PMID)
            .input('Method', sql.NVarChar(50), data.Method)
            .input('BankName', sql.NVarChar(200), data.BankName)
            .input('CardType', sql.NVarChar(50), data.CardType)
            .input('CardNumber', sql.NVarChar(50), data.CardNumber)
            .input('ExpirationDate', sql.Date, data.ExpirationDate)
            .execute('updateBankAccount');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.3 Delete
async function removeBankAccountINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('PMID', sql.Int, id)
            .execute('deleteBankAccount');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createCashINDB, editCashINDB, removeCashINDB,
    createBankAccountINDB, editBankAccountINDB, removeBankAccountINDB
};