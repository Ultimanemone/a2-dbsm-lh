const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Advertisement
// ============================================================

// 1.1 Insert
async function createAdvertisementINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('AffiliateAccountID', sql.Int, data.AffiliateAccountID)
            .input('ProductID', sql.Int, data.ProductID)
            .input('ImageURL', sql.NVarChar(1000), data.ImageURL)
            .input('Budget', sql.Decimal(14,2), data.Budget)
            .input('Content', sql.NVarChar(2000), data.Content)
            .execute('insertAdvertisement');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.2 Update
async function updateAdvertisementINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('AdID', sql.Int, data.AdID)
            .input('ImageURL', sql.NVarChar(1000), data.ImageURL)
            .input('Budget', sql.Decimal(14,2), data.Budget)
            .input('Content', sql.NVarChar(2000), data.Content)
            .execute('updateAdvertisement');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.3 Delete
async function deleteAdvertisementINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('AdID', sql.Int, id)
            .execute('deleteAdvertisement');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.4 Get
async function getAdvertisementINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM App.Advertisement');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 2. Product Advertisement (Junction Table)
// ============================================================

// 2.1 Insert
async function addProductToAdvertisementINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('AdID', sql.Int, data.AdID)
            .input('ProductID', sql.Int, data.ProductID)
            .input('SellerAccountID', sql.Int, data.SellerAccountID)
            .execute('insertProductToAdvertisement');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.2 Delete
async function removeProductFromAdvertisementINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('AdID', sql.Int, data.AdID)
            .input('ProductID', sql.Int, data.ProductID)
            .execute('sp_RemoveProductFromAdvertisement');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 3. Wishlist
// ============================================================

// 3.1 Insert
async function createWishListINDB(data) {
    try {
        const pool = await poolPromise;
        const request = pool.request()
            .input('AccountID', sql.Int, data.AccountID)
            .input('Name', sql.NVarChar(200), data.Name)
            .output('NewWishlistID', sql.Int);

        const result = await request.execute('createWishList');

        const NewWishlistID = result.output.NewWishlistID;
        
        if (Array.isArray(data.ProductID)) {
            for (const id of data.ProductID) {
                await pool.request()
                    .input('WishlistID', sql.Int, NewWishlistID)
                    .input('ProductID', sql.NVarChar(255), id)
                    .execute('insertWishlistContainProducts');
            }
        }

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 3.2 Update
async function updateWishListINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('WishlistID', sql.Int, data.WishlistID)
            .input('Name', sql.NVarChar(200), data.Name)
            .execute('updateWishList');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 3.3 Delete
async function deleteWishListINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('WishlistID', sql.Int, id)
            .execute('deleteWishList');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 3.4 Get
async function getWishListINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    wl.WishlistID,
                    wl.AccountID,
                    wl.Name,
                    wl.CreatedDate,
                    
                    (
                        SELECT STRING_AGG(x.ProductID, ', ')
                        FROM (
                            SELECT DISTINCT ProductID
                            FROM Product.WishlistItem
                            WHERE WishlistID = wl.WishlistID
                        ) x
                    ) AS ProductID,
                    
                    (
                        SELECT STRING_AGG(p.Name, ', ')
                        FROM Product.WishlistItem wi
                        INNER JOIN Product.Product p
                            ON wi.ProductID = p.ProductID
                        WHERE wi.WishlistID = wl.WishlistID
                    ) AS ProductName

                FROM UserData.Wishlist wl
            `);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 4. Wishlist Contain Product (Junction Table)
// ============================================================

// 4.1 Insert
async function addProductToWishlistINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('WishlistID', sql.Int, data.WishlistID)
            .input('ProductID', sql.Int, data.ProductID)
            .execute('insertWishlistContainProducts');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 4.2 Delete
async function removeProductFromWishlistINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('WishlistID', sql.Int, data.WishlistID)
            .input('ProductID', sql.Int, data.ProductID)
            .execute('sp_RemoveProductFromWishlist');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 5. Coupon
// ============================================================

// 5.1 Insert
async function createCouponINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Code', sql.NVarChar(100), data.Code)
            .input('Type', sql.NVarChar(50), data.Type)
            .input('DiscountPercent', sql.Decimal(5, 2), data.DiscountPercent)
            .input('StartDate', sql.DateTime, data.StartDate || new Date())
            .input('EndDate', sql.DateTime, data.EndDate)
            .execute('insertCoupon');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 5.2 Update
async function updateCouponINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CouponID', sql.Int, data.CouponID)
            .input('Type', sql.NVarChar(50), data.Type)
            .input('DiscountPercent', sql.Decimal(5, 2), data.DiscountPercent)
            .execute('updateCoupon');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 5.3 Delete
async function deleteCouponINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CouponID', sql.Int, id)
            .execute('deleteCoupon');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 5.4 Get
async function getCouponINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM App.Coupon');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 6, 7, 8. Coupon Relationships Helper
// ============================================================

async function manageCouponRelation(spName, params) {
    try {
        const pool = await poolPromise;
        const req = pool.request();
        
        for (const [key, value] of Object.entries(params)) {
            req.input(key, sql.Int, value);
        }
        
        await req.execute(spName);
        
        return { success: true };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createAdvertisementINDB, updateAdvertisementINDB, deleteAdvertisementINDB, getAdvertisementINDB,
    addProductToAdvertisementINDB, removeProductFromAdvertisementINDB,
    createWishListINDB, updateWishListINDB, deleteWishListINDB, getWishListINDB,
    addProductToWishlistINDB, removeProductFromWishlistINDB,
    createCouponINDB, updateCouponINDB, deleteCouponINDB, getCouponINDB,
    manageCouponRelation
};