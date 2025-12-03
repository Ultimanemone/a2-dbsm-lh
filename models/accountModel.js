const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Customer
// ============================================================

// 1.1 Insert
async function createCustomerINDB(data) {
    try {
        const pool = await poolPromise;
        
        const request = pool.request()
            .input('username', sql.NVarChar(100), data.Username)
            .input('emailMain', sql.NVarChar(255), data.EmailMain)
            .input('hashPass', sql.NVarChar(512), data.HashedPassword)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.Status)

            .input('loyaltyLev', sql.NVarChar(20), data.LoyaltyLevel)
            .input('rewardPoints', sql.Int, data.RewardPoints)
            
            .output('NewAccountID', sql.Int);
            
        const result = await request.execute('insertCustomer');

        const newAccountId = result.output.NewAccountID;

        if (Array.isArray(data.AccountEmail)) {
            for (const email of data.AccountEmail) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Email', sql.NVarChar(255), email)
                    .execute('insertAccountEmail');
            }
        }

        if (Array.isArray(data.AccountPhone)) {
            for (const phone of data.AccountPhone) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Phone', sql.NVarChar(20), phone)
                    .execute('insertAccountPhone');
            }
        }

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

//3.4 Get 
async function getCustomersINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    a.AccountID,
                    a.Username,
                    a.EmailMain,
                    a.HashedPassword,
                    a.CreatedAt,
                    a.Status,

                    at.LoyaltyLevel,
                    at.RewardPoints,

                    (
                        SELECT STRING_AGG(x.Email, ', ')
                        FROM (
                            SELECT DISTINCT Email
                            FROM [UserData].AccountEmail
                            WHERE AccountID = a.AccountID
                        ) x
                    ) AS AccountEmail,

                    (
                        SELECT STRING_AGG(y.Phone, ', ')
                        FROM (
                            SELECT DISTINCT Phone
                            FROM [UserData].AccountPhone
                            WHERE AccountID = a.AccountID
                        ) y
                    ) AS AccountPhone

                FROM [User].Account a
                LEFT JOIN [User].Customer at
                    ON a.AccountID = at.AccountID
                WHERE at.AccountID IS NOT NULL;
            `);
        return result.recordset;
    } catch (err) {
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
        
        const request = pool.request()
            .input('username', sql.NVarChar(100), data.Username)
            .input('emailMain', sql.NVarChar(255), data.EmailMain)
            .input('hashPass', sql.NVarChar(512), data.HashedPassword)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.Status)

            .input('shopName', sql.NVarChar(20), data.ShopName)
            .input('taxCode', sql.Int, data.TaxCode)
            .input('busLicenseNo', sql.NVarChar(50), data.BusinessLicenseNumber)
            .input('shopAddr', sql.NVarChar, data.ShopAddress)
            .input('rating', sql.Decimal(3,2), data.Rating)

            .output('NewAccountID', sql.Int);
            
        const result = await request.execute('insertSeller');

        const newAccountId = result.output.NewAccountID;

        if (Array.isArray(data.AccountEmail)) {
            for (const email of data.AccountEmail) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Email', sql.NVarChar(255), email)
                    .execute('insertAccountEmail');
            }
        }

        if (Array.isArray(data.AccountPhone)) {
            for (const phone of data.AccountPhone) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Phone', sql.NVarChar(20), phone)
                    .execute('insertAccountPhone');
            }
        }

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

//2.3 Delete
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

//2.4 Get 
async function getSellersINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    a.AccountID,
                    a.Username,
                    a.EmailMain,
                    a.HashedPassword,
                    a.CreatedAt,
                    a.Status,

                    at.ShopName,
                    at.ShopAddress,
                    at.Rating,
                    at.TaxCode,
                    at.BusinessLicenseNumber,

                    (
                        SELECT STRING_AGG(x.Email, ', ')
                        FROM (
                            SELECT DISTINCT Email
                            FROM [UserData].AccountEmail
                            WHERE AccountID = a.AccountID
                        ) x
                    ) AS AccountEmail,

                    (
                        SELECT STRING_AGG(y.Phone, ', ')
                        FROM (
                            SELECT DISTINCT Phone
                            FROM [UserData].AccountPhone
                            WHERE AccountID = a.AccountID
                        ) y
                    ) AS AccountPhone

                FROM [User].Account a
                LEFT JOIN [User].Seller at
                    ON a.AccountID = at.AccountID
                WHERE at.AccountID IS NOT NULL;
            `);
        return result.recordset;
    } catch (err) {
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
        
        const request = pool.request()
            .input('username', sql.NVarChar(100), data.username)
            .input('emailMain', sql.NVarChar(255), data.emailMain)
            .input('hashPass', sql.NVarChar(512), data.hashPass)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.status)

            .input('Role', sql.NVarChar(50), data.Role)
            .input('Department', sql.NVarChar(100), data.Department)
            
            .output('NewAccountID', sql.Int);
            
        const result = await request.execute('insertAdmin');

        const newAccountId = result.output.NewAccountID;

        if (Array.isArray(data.AccountEmail)) {
            for (const email of data.AccountEmail) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Email', sql.NVarChar(255), email)
                    .execute('insertAccountEmail');
            }
        }

        if (Array.isArray(data.AccountPhone)) {
            for (const phone of data.AccountPhone) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Phone', sql.NVarChar(20), phone)
                    .execute('insertAccountPhone');
            }
        }

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

//3.4 Get 
async function getAdminsINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    a.AccountID,
                    a.Username,
                    a.EmailMain,
                    a.HashedPassword,
                    a.CreatedAt,
                    a.Status,

                    at.Role,
                    at.Department,

                    (
                        SELECT STRING_AGG(x.Email, ', ')
                        FROM (
                            SELECT DISTINCT Email
                            FROM [UserData].AccountEmail
                            WHERE AccountID = a.AccountID
                        ) x
                    ) AS AccountEmail,

                    (
                        SELECT STRING_AGG(y.Phone, ', ')
                        FROM (
                            SELECT DISTINCT Phone
                            FROM [UserData].AccountPhone
                            WHERE AccountID = a.AccountID
                        ) y
                    ) AS AccountPhone

                FROM [User].Account a
                LEFT JOIN [User].Admin at
                    ON a.AccountID = at.AccountID
                WHERE at.AccountID IS NOT NULL;
            `);
        return result.recordset;
    } catch (err) {
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
        
        const request = pool.request()
            .input('username', sql.NVarChar(100), data.username)
            .input('emailMain', sql.NVarChar(255), data.emailMain)
            .input('hashPass', sql.NVarChar(512), data.hashPass)
            .input('createDate', sql.DateTime, new Date())
            .input('status', sql.NVarChar(20), data.status)

            .input('afCode', sql.NVarChar(50), data.afCode)
            .input('commissionRate', sql.Decimal(5, 2), data.commissionRate)
            .input('joinDate', sql.DateTime, new Date())
            .input('totalEarnings', sql.Decimal(12, 2), data.totalEarnings)
            
            .output('NewAccountID', sql.Int);
            
        const result = await request.execute('insertAffiliate');

        const newAccountId = result.output.NewAccountID;

        if (Array.isArray(data.AccountEmail)) {
            for (const email of data.AccountEmail) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Email', sql.NVarChar(255), email)
                    .execute('insertAccountEmail');
            }
        }

        if (Array.isArray(data.AccountPhone)) {
            for (const phone of data.AccountPhone) {
                await pool.request()
                    .input('AccountID', sql.Int, newAccountId)
                    .input('Phone', sql.NVarChar(20), phone)
                    .execute('insertAccountPhone');
            }
        }

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

//4.4 Get 
async function getAffiliatesINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    a.AccountID,
                    a.Username,
                    a.EmailMain,
                    a.HashedPassword,
                    a.CreatedAt,
                    a.Status,

                    at.AffiliateCode,
                    at.CommissionRate,
                    at.JoinDate,
                    at.TotalEarnings,

                    (
                        SELECT STRING_AGG(x.Email, ', ')
                        FROM (
                            SELECT DISTINCT Email
                            FROM [UserData].AccountEmail
                            WHERE AccountID = a.AccountID
                        ) x
                    ) AS AccountEmail,

                    (
                        SELECT STRING_AGG(y.Phone, ', ')
                        FROM (
                            SELECT DISTINCT Phone
                            FROM [UserData].AccountPhone
                            WHERE AccountID = a.AccountID
                        ) y
                    ) AS AccountPhone

                FROM [User].Account a
                LEFT JOIN [User].Affiliate at
                    ON a.AccountID = at.AccountID
                WHERE at.AccountID IS NOT NULL;
            `);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

//5 Get ALL Accounts
async function getAccountsINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    a.AccountID,
                    a.Username,
                    a.EmailMain,
                    a.HashedPassword,
                    a.CreatedAt,
                    a.Status,

                    a.AccountType,

                    (
                        SELECT STRING_AGG(x.Email, ', ')
                        FROM (
                            SELECT DISTINCT Email
                            FROM [UserData].AccountEmail
                            WHERE AccountID = a.AccountID
                        ) x
                    ) AS AccountEmail,

                    (
                        SELECT STRING_AGG(y.Phone, ', ')
                        FROM (
                            SELECT DISTINCT Phone
                            FROM [UserData].AccountPhone
                            WHERE AccountID = a.AccountID
                        ) y
                    ) AS AccountPhone

                FROM [User].Account a
            `);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createAdminINDB, editAdminINDB, removeAdminINDB, getCustomersINDB,
    createAffiliateINDB, editAffiliateINDB, removeAffiliateINDB, getAffiliatesINDB,
    createCustomerINDB, editCustomerINDB, removeCustomerINDB, getSellersINDB,
    createSellerINDB, editSellerINDB, removeSellerINDB, getAdminsINDB,

    getAccountsINDB
}
