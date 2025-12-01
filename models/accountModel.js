const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Customer
// ============================================================

// 1.1 Insert
async function createCustomerINDB(data) {
    try {
        const pool = await poolPromise;
        
        await pool.request()
            .input('loyaltyLev', sql.NVarChar(20), data.loyaltyLev)
            .input('rewardPoints', sql.Int, data.rewardPoints)
            .input('hashPass', sql.NVarChar(512), data.hashPass)
            .input('username', sql.NVarChar(100), data.username)
            .input('emailMain', sql.NVarChar(255), data.emailMain)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.status)

           .execute('insertCustomer'); 

        return {success: true};
    }
    catch (err) {
       throw err;
    }
}

//1.2 Update
async function editCustomerINDB(data) {
    try {
        const pool = await poolPromise;

        await pool.request()
            .input('cusId', sql.Int, data.cusId)
            .input('loyaltyLevel', sql.NVarChar(20), data.loyaltyLevel)
            .input('rewardPoints', sql.Int, data.rewardPoints)
            .execute('updateCustomer');

        return {success: true};
    } 
    catch (err) {
       throw err;
    }
}

//1.3 Delete
async function removeCustomerINDB(data) {
    try {
        const pool = await poolPromise;

        await pool.request()
            .input('cusId', sql.Int, data.id)
            .execute('deleteCustomer');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

// ============================================================
// 2. Seller
// ============================================================

// 2.1 Insert
async function createSellerINDB(data) {
    try {
        const pool = await poolPromise;

        await pool.request()
            .input('shopName', sql.NVarChar(200), data.shopName)
            .input('taxCode', sql.NVarChar(20), data.taxCode)
            .input('busLicenseNo', sql.NVarChar(50), data.busLicenseNo)
            .input('shopAddr', sql.NVarChar(300), data.shopAddr)
            .input('rating', sql.Decimal(3, 2), data.rating)
            .input('hashPass', sql.NVarChar(512), data.hashPass)
            .input('username', sql.NVarChar(100), data.username)
            .input('emailMain', sql.NVarChar(255), data.emailMain)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.status)
            .execute('insertSeller');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

//2.2 Update
async function editSellerINDB(data) {
    try {
        const pool = await poolPromise;

        await pool.request()
            .input('sellerID', sql.Int, data.sellerID)
            .input('shopName', sql.NVarChar(20), data.shopName)
            .input('taxCode', sql.Int, data.taxCode)
            .input('busLicenseNo', sql.NVarChar(50), data.busLicenseNo)
            .input('shopAddr', sql.NVarChar, data.shopAddr)
            .input('rating', sql.Decimal(3,2), data.rating)
            .execute('updateSeller');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

//3.3 Delete
async function removeSellerINDB(data) {
    try {
        const pool = await poolPromise;

        await pool.request()
            .input('sellerID', sql.Int, data.id)
            .execute('deleteSeller');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}


// ============================================================
// 3. Admin
// ============================================================

// 3.1 Insert
async function createAdminINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            // Info Admin
            .input('Role', sql.NVarChar(50), data.Role)
            .input('Department', sql.NVarChar(100), data.Department)
            // Info Account
            .input('hashPass', sql.NVarChar(512), data.hashPass)
            .input('username', sql.NVarChar(100), data.username)
            .input('emailMain', sql.NVarChar(255), data.emailMain)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.status)
            .execute('insertAdmin');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

// 3.2 Update
async function editAdminINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('admId', sql.Int, data.admId)
            .input('role', sql.NVarChar(50), data.role)
            .input('department', sql.NVarChar(100), data.department)
            .execute('updateAdmin');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

// 3.3 Delete
async function removeAdminINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('admId', sql.Int, data.id)
            .execute('deleteAdmin');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

// ============================================================
// 4. Affiliate
// ============================================================

// 4.1 Insert
async function createAffiliateINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            // Info Affiliate
            .input('afCode', sql.NVarChar(50), data.afCode)
            .input('commissionRate', sql.Decimal(5, 2), data.commissionRate)
            .input('joinDate', sql.DateTime, new Date())
            .input('totalEarnings', sql.Decimal(12, 2), data.totalEarnings)
            // Info Account
            .input('hashPass', sql.NVarChar(512), data.hashPass)
            .input('username', sql.NVarChar(100), data.username)
            .input('emailMain', sql.NVarChar(255), data.emailMain)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.status)
            .execute('insertAffiliate');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

// 4.2 Update
async function editAffiliateINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('afId', sql.Int, data.afId)
            .input('afCode', sql.NVarChar(50), data.afCode)
            .input('commissionRate', sql.Decimal(5, 2), data.commissionRate)
            .input('joinDate', sql.DateTime, data.joinDate || new Date()) // Nếu không gửi ngày, lấy ngày hiện tại
            .input('totalEarnings', sql.Decimal(12, 2), data.totalEarnings)
            .execute('updateAffiliate');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

// 4.3 Delete
async function removeAffiliateINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('afId', sql.Int, data.id)
            .execute('deleteAffiliate');

        return {success: true};
    } 
    catch (err) {
        throw err;
    }
}

module.exports = {
    createAdminINDB, editAdminINDB, removeAdminINDB,
    createAffiliateINDB, editAffiliateINDB, removeAffiliateINDB,
    createCustomerINDB, editCustomerINDB, removeCustomerINDB,
    createSellerINDB, editSellerINDB, removeSellerINDB
}
