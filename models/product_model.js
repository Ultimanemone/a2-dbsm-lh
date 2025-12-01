const { sql, poolPromise } = require('../config/dbConfig');

// Lấy tất cả sản phẩm
async function getAllProducts() {
    const pool = await poolPromise;
    const query = `
        SELECT p.ProductID, p.CategoryID, c.Name, p.Name, p.Price, p.ImageURL, p.Status, p.Brand
        FROM Product p
        JOIN Category c ON p.CategoryID = c.CategoryID
        ORDER BY p.Name ASC;
    `;

    const result = await pool.query(query);
    return result.recordset; 
}

module.exports = {
    getAllProducts
};
