const { sql, poolPromise } = require('../config/dbConfig');
const { get } = require('../routes/login');

// ============================================================
// 1. Product
// ============================================================

// 1.1 Inserting
async function createProductINDB(data) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('categoryId', sql.Int, data.CategoryID)
            .input('name', sql.NVarChar(300), data.Name)
            .input('price', sql.Decimal(12, 2), data.Price)
            .input('imageUrl', sql.NVarChar(1000), data.ImageURL)
            .input('status', sql.NVarChar(20), data.Status)
            .input('stockAmount', sql.Int, data.Stock)
            .input('brand', sql.NVarChar(200), data.Brand)
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

// 1.4 Get
async function getProductsINDB() {
    try {
        const pool = await poolPromise;
        const query = `
            SELECT p.ProductID, p.CategoryID, c.Name AS CategoryName, p.Name, p.Price, p.ImageURL, p.Status, p.Stock, p.Brand
            FROM Product.Product p
            JOIN Product.Category c ON p.CategoryID = c.CategoryID
            ORDER BY p.Name ASC;
        `;

        const result = await pool.query(query);
        return result.recordset; 
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
            .input('reviewDate', sql.DateTime, data.reviewDate || new Date())
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

// 2.4 Get
async function getReviewsINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Product.ProductReview;');
        return result.recordset;
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
        await insertChild('insertCategoryBrand', 'ABrand', data.Brand);
        await insertChild('insertCategoryColor', 'ColorName', data.Color);
        await insertChild('insertCategoryProtableSpeakerFeature', 'AFeature', data.PortableSpeakerFeature);
        await insertChild('insertCategoryShippedFrom', 'ALocation', data.ShippedFrom);
        await insertChild('insertCategoryWooferSize', 'ASize', data.WooferSize);

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

        await insertChild('insertCategoryBrand', 'ABrand', data.Brand);
        await insertChild('insertCategoryColor', 'ColorName', data.Color);
        await insertChild('insertCategoryProtableSpeakerFeature', 'AFeature', data.Feature);
        await insertChild('insertCategoryShippedFrom', 'ALocation', data.Location);
        await insertChild('insertCategoryWooferSize', 'ASize', data.Size);

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

// 3.4 Get
async function getCategoryINDB() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    c.CategoryID,
                    c.Name,
                    c.Description,

                    (
                        SELECT STRING_AGG(x.ABrand, ', ')
                        FROM (
                            SELECT DISTINCT ABrand
                            FROM ProductCategory.Brand
                            WHERE CategoryID = c.CategoryID
                        ) x
                    ) AS Brand,

                    (
                        SELECT STRING_AGG(y.AColor, ', ')
                        FROM (
                            SELECT DISTINCT AColor
                            FROM ProductCategory.Color
                            WHERE CategoryID = c.CategoryID
                        ) y
                    ) AS Color,

                    (
                        SELECT STRING_AGG(z.AFeature, ', ')
                        FROM (
                            SELECT DISTINCT AFeature
                            FROM ProductCategory.PortableSpeakerFeature
                            WHERE CategoryID = c.CategoryID
                        ) z
                    ) AS PortableSpeakerFeature,

                    (
                        SELECT STRING_AGG(t.ALocation, ', ')
                        FROM (
                            SELECT DISTINCT ALocation
                            FROM ProductCategory.ShippedFrom
                            WHERE CategoryID = c.CategoryID
                        ) t
                    ) AS ShippedFrom,

                    (
                        SELECT STRING_AGG(w.Size, ', ')
                        FROM (
                            SELECT DISTINCT Size
                            FROM ProductCategory.WooferSize
                            WHERE CategoryID = c.CategoryID
                        ) w
                    ) AS WooferSize

                FROM Product.Category c;
            `);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createProductINDB, editProductINDB, removeProductINDB, getProductsINDB,
    createReviewINDB, editReviewINDB, removeReviewINDB, getReviewsINDB,
    createCategoryINDB, updateCategoryINDB, removeCategoryINDB, getCategoryINDB
};