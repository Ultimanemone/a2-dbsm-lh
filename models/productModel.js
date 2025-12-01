const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Product
// ============================================================

// 1.1 Inserting
async function createProductINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('categoryId', sql.Int, data.categoryId)
            .input('name', sql.NVarChar(300), data.name)
            .input('price', sql.Decimal(12, 2), data.price)
            .input('imageUrl', sql.NVarChar(1000), data.imageUrl)
            .input('status', sql.NVarChar(20), data.status)
            .input('stockAmount', sql.Int, data.stockAmount)
            .input('brand', sql.NVarChar(200), data.brand)
            .execute('insertProduct');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.2 Updating
async function editProductINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('productId', sql.Int, data.productId)
            .input('categoryId', sql.Int, data.categoryId)
            .input('name', sql.NVarChar(300), data.name)
            .input('price', sql.Decimal(12, 2), data.price)
            .input('imageUrl', sql.NVarChar(1000), data.imageUrl)
            .input('status', sql.NVarChar(20), data.status)
            .input('stockAmount', sql.Int, data.stockAmount)
            .input('brand', sql.NVarChar(200), data.brand)
            .execute('updateProduct');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 1.3 Deleting
async function removeProductINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('productId', sql.Int, id)
            .execute('deleteProduct');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 2. Product Review
// ============================================================

// 2.1 Inserting
async function createReviewINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('productId', sql.Int, data.productId)
            .input('customerId', sql.Int, data.customerId)
            .input('rating', sql.Decimal(2, 1), data.rating)
            .input('reviewDate', sql.DateTime, data.reviewDate || null)
            .input('comment', sql.NVarChar(2000), data.comment)
            .input('moderated', sql.Bit, data.moderated || 0)
            .execute('insertProductReview');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.2 Update
async function editReviewINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('productId', sql.Int, data.productId)
            .input('customerId', sql.Int, data.customerId)
            .input('rating', sql.Decimal(2, 1), data.rating)
            .input('reviewDate', sql.DateTime, data.reviewDate || new Date())
            .input('comment', sql.NVarChar(2000), data.comment)
            .input('moderated', sql.Bit, data.moderated)
            .execute('updateProductReview');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// 2.3 Delete
async function removeReviewINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('productId', sql.Int, data.productId)
            .input('customerId', sql.Int, data.customerId)
            .execute('deleteProductReview');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

// ============================================================
// 3. Category (TRANSACTION HANDLING)
// ============================================================

// 3.1 Insert
async function createCategoryINDB(data) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        // 1. Bắt đầu giao dịch
        await transaction.begin();

        // 2. Insert Category cha
        const requestCat = new sql.Request(transaction);
        const resultCat = await requestCat
            .input('Name', sql.NVarChar(200), data.Name)
            .input('Description', sql.NVarChar(1000), data.Description)
            .execute('insertCategory');

        const newCategoryID = resultCat.recordset[0].NewCategoryID;

        // 3. Helper function để insert các mảng con (tránh lặp code)
        const insertChild = async (procedure, paramName, items) => {
            if (items && items.length > 0) {
                for (const item of items) {
                    const reqChild = new sql.Request(transaction);
                    await reqChild
                        .input('CategoryID', sql.Int, newCategoryID)
                        .input(paramName, sql.NVarChar(100), item)
                        .execute(procedure);
                }
            }
        };

        // 4. Gọi helper cho từng mảng
        await insertChild('insertCategoryBrand', 'ABrand', data.Brands);
        await insertChild('insertCategoryColor', 'ColorName', data.Colors);
        await insertChild('insertCategoryProtableSpeakerFeature', 'AFeature', data.Features);
        await insertChild('insertCategoryShippedFrom', 'ALocation', data.Locations);
        await insertChild('insertCategoryWooferSize', 'ASize', data.Sizes);

        // 5. Commit
        await transaction.commit();
        
        return { success: true, newCategoryID };

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

// 3.2 Update
async function updateCategoryINDB(data) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Update Parent Info
        const reqParent = new sql.Request(transaction);
        await reqParent
            .input('CategoryID', sql.Int, data.CategoryID)
            .input('Name', sql.NVarChar(200), data.Name)
            .input('Description', sql.NVarChar(1000), data.Description)
            .execute('updateCategoryInfo');

        // Helper function (giống create, nhưng dùng data.CategoryID)
        const insertChild = async (procedure, paramName, items) => {
            if (items && items.length > 0) {
                for (const item of items) {
                    const reqChild = new sql.Request(transaction);
                    await reqChild
                        .input('CategoryID', sql.Int, data.CategoryID)
                        .input(paramName, sql.NVarChar(100), item)
                        .execute(procedure);
                }
            }
        };

        await insertChild('insertCategoryBrand', 'ABrand', data.Brands);
        await insertChild('insertCategoryColor', 'ColorName', data.Colors);
        await insertChild('insertCategoryProtableSpeakerFeature', 'AFeature', data.Features);
        await insertChild('insertCategoryShippedFrom', 'ALocation', data.Locations);
        await insertChild('insertCategoryWooferSize', 'ASize', data.Sizes);

        await transaction.commit();
        return { success: true };

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

// 3.3 Delete
async function removeCategoryINDB(id) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CategoryID', sql.Int, id)
            .execute('deleteCategory');

        return { success: true };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createProductINDB, editProductINDB, removeProductINDB,
    createReviewINDB, editReviewINDB, removeReviewINDB,
    createCategoryINDB, updateCategoryINDB, removeCategoryINDB
};